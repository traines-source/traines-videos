import math
import random
import imageio as iio
import numpy as np
import numpy.ma as ma
import cv2
import imageio as iio
import os
from shapely.geometry import Point
from shapely.geometry.polygon import Polygon
from shapely.ops import nearest_points
import sys

TARGET_RESOLUTION=(600,300)
thresh_dist = (TARGET_RESOLUTION[0]/64)**2
thresh_area = TARGET_RESOLUTION[0]/100
standard_display_resolution=1920
standard_triangle_area = ((8192/standard_display_resolution)**2)/2

def write_png(filename, im):
    iio.imwrite(filename, np.rint(im*255).astype(np.uint8))

def write_dat(filename, im):
    matrix = "\n".join([" ".join([str(cell) for cell in row]) for row in im])
    with open(filename, "w") as f:
        f.write(matrix)

def read_lines(filename):
    with open(filename, "r") as f:
        rows = f.readlines()
        return rows

def write_lines(filename, lines):
    with open(filename, "w") as f:
        f.write("".join(lines))

def resized_image(path):    
    img = iio.imread(path)
    if img is None or img.size == 0:
        raise FileNotFoundError()
    w = TARGET_RESOLUTION[0]
    h = int(w/float(img.shape[1])*img.shape[0])
    return cv2.resize(img, (w, h))[:TARGET_RESOLUTION[1], :TARGET_RESOLUTION[0]]


def index(p):
    return p[1]*(TARGET_RESOLUTION[0]+1)+p[0]

def delta(a, b):
    return (a[0]-b[0], a[1]-b[1])

def avg(a, b):
    return ((a[0]+b[0])/2, (a[1]+b[1])/2)

def add(a, b):
    return (a[0]+b[0], a[1]+b[1])

def normal(a, b):
    return a[0]*b[1]-a[1]*b[0]

def triangle_orientation(a, b, c):
    return normal(delta(b, a), delta(c, a))

def sdist(a, b):
    return (a[0]-b[0])**2+(a[1]-b[1])**2

def fix_anomalies(pts):
    oob = 0
    for y in range(1, TARGET_RESOLUTION[1]):
        for x in range(1, TARGET_RESOLUTION[0]):
            p = pts[index((x, y))]
            p1 = pts[index((x-1, y))]
            p2 = pts[index((x, y-1))]
            if sdist(p, p1) > thresh_dist or sdist(p, p2) > thresh_dist:
                triangles = [((x+1, y-1), (x, y-1)), ((x+1, y), (x+1, y-1)), ((x, y+1), (x+1, y)), ((x-1, y+1), (x, y+1)), ((x-1, y), (x-1, y+1)), ((x, y-1), (x-1, y))]
                misoriented_area_before = 0
                misoriented_area_after = 0
                correct_area_before = 0
                correct_area_after = 0
                new_p = add((x,y), avg(delta(p1, (x-1, y)), delta(p2, (x, y-1))))
                for triangle in triangles:
                    oriented_area_before = triangle_orientation(p, pts[index(triangle[0])], pts[index(triangle[1])])
                    if abs(oriented_area_before) > thresh_area:                    
                        correct_area_before += abs(min(0, oriented_area_before))
                        misoriented_area_before += max(0, oriented_area_before)
                    oriented_area_after = triangle_orientation(new_p, pts[index(triangle[0])], pts[index(triangle[1])])
                    if abs(oriented_area_after) > thresh_area:
                        correct_area_after += abs(min(0, oriented_area_after))
                        misoriented_area_after += max(0, oriented_area_after) 
                if misoriented_area_after < misoriented_area_before and correct_area_after < correct_area_before:                    
                    oob += 1
                    pts[index((x, y))] = new_p
    return oob

def write_permutation(filled_result, filename):    
    filename_densities = "working/"+filename+".densities"
    filename_distorted = "working/"+filename+".distorted"
    write_dat(filename_densities, filled_result)
    write_png("working/"+filename+"_norm.png", filled_result)        

    os.system("cart {} {} {} {}".format(TARGET_RESOLUTION[0], TARGET_RESOLUTION[1], filename_densities, filename_distorted))
    distorted = read_lines(filename_distorted)    
    pts = [[float(axis) for axis in entry.split(" ")] for entry in distorted]
            
    oob = fix_anomalies(pts)
    oob += fix_anomalies(pts)
    print(oob, "points out of bounds")
    
    output = [" ".join([str(round(axis, 1)) for axis in entry])+"\n" for entry in pts]
    write_lines("out/"+filename+".csv", output)

def write_grown_greenland():
    data = resized_image("working/grown_greenland.tiff")
    write_permutation(data, "grown_greenland")


write_grown_greenland()