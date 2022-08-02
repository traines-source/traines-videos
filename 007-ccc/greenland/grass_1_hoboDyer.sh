#!/bin/bash
set -e

g.region $(r.proj input=ccc_countries output=ccc_countries location=wgs84 mapset=PERMANENT method=nearest -g)
g.region nsres=26528 ewres=26528 # 1200x

#g.region -p -l -e -b


echo "Reprojecting metadata..."
r.proj input=ccc_countries output=ccc_countries location=wgs84 mapset=PERMANENT method=nearest --overwrite

r.mapcalc "ccc_grown_greenland = (ccc_countries == 304 ? 13.9521385577 : 1)" --overwrite

r.out.gdal in=ccc_grown_greenland output=${SCRIPT_DIR}/working/grown_greenland.tiff type=Float32 --overwrite -f -c
r.out.png -t --overwrite input=ccc_grown_greenland output=${SCRIPT_DIR}/working/grown_greenland.png
    