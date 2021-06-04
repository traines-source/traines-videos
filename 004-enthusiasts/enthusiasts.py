from moviepy.editor import *
from dataclasses import dataclass

@dataclass
class TClip:
    file: str = None
    start: int = 0
    speed: int = 1
    credits: str = None

@dataclass
class TScene:
    left: TClip = None
    right: TClip = None
    text: str = None

DURATION = 12
FADE_DURATION = 0.5

VIDEO_W=1920
VIDEO_H=1080
TEXT_BAR_H=VIDEO_H*0.2
VIDEO_DIR="/app/res/high/"

scenes = [
    TScene(
        TClip("drift.mp4", 0, 1, "Tesla drift, model s drift, model s[...]. Jürgen Zimmermann. CC-BY 3.0"),
        TClip("drehscheibe.mp4", 118, 12, "Fitnessfahrt mit Ce 6/8 II 14253 au[...]. cmn0train. CC-BY 3.0"),
        "Because some are going round in circles,\nwhile others just turn around."
    ),
    TScene(
        TClip("f1.mp4", 51, 1, "Wird der Circuit Paul Ricard 2020 u[...]. Maik's F1 Channel. CC-BY 3.0"),
        TClip("drehscheibe.mp4", 118, 1, "Fitnessfahrt mit Ce 6/8 II 14253 au[...]. cmn0train. CC-BY 3.0"),
        "Because some have things built so that they can talk about it, while others talk about things that are built."
    )
]

def createSideClip(clip):
    vfc = VideoFileClip(VIDEO_DIR + clip.file).subclip(clip.start, clip.start+DURATION*clip.speed)
    if clip.speed != 1:
        vfc = vfc.multiply_speed(factor=clip.speed)
    vfc = vfc.resize(height=VIDEO_H-TEXT_BAR_H)
    vfc = vfc.crop(x_center=vfc.size[0]/2, y_center=vfc.size[1]/2, width=VIDEO_W/2, height=VIDEO_H-TEXT_BAR_H)
    vfc = vfc.fadein(FADE_DURATION).fadeout(FADE_DURATION)
    return vfc

finished_scenes = []
for scene in scenes:
    long_fade_duration = DURATION/2+FADE_DURATION
    clip_l = createSideClip(scene.left).audio_fadein(FADE_DURATION).audio_fadeout(long_fade_duration).with_position(('left', 'bottom'))
    clip_r = createSideClip(scene.right).audio_fadein(long_fade_duration).audio_fadeout(FADE_DURATION).with_position(('right', 'bottom'))
    font = "Roboto-Condensed-Bold"
    credits_l = TextClip(text=scene.left.credits, color='white', font=font, font_size=20).with_position(('left', VIDEO_H-20)).resize(0.5).with_duration(DURATION).fadein(FADE_DURATION).fadeout(FADE_DURATION)
    credits_r = TextClip(text=scene.right.credits, color='white', font=font, font_size=20).with_position(('right', VIDEO_H-20)).resize(0.5).with_duration(DURATION).fadein(FADE_DURATION).fadeout(FADE_DURATION)
    title = TextClip(text=scene.text, color='white', font=font, align="center", font_size=100, method="caption", size=(VIDEO_W*2,TEXT_BAR_H*2)).with_position(('center', 0)).resize(0.5).with_duration(DURATION).fadein(FADE_DURATION).fadeout(FADE_DURATION)

    new_scene = CompositeVideoClip([clip_l,clip_r,credits_l,credits_r,title], size = (VIDEO_W,VIDEO_H))
    finished_scenes.append(new_scene)

final_clip = concatenate_videoclips(finished_scenes)
final_clip.write_videofile(VIDEO_DIR + "out.mp4", fps=25)