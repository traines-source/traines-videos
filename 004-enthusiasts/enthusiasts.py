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

DURATION = 16
FADE_DURATION = 0.5

VIDEO_W=1920
VIDEO_H=1080
TEXT_BAR_H=VIDEO_H*0.2
VIDEO_DIR="/app/res/high/"
FONT = "Roboto-Condensed-Bold"

scenes = [
    TScene(
        TClip("sreet_racing.mp4", 23, 1, "Real tokyo street scene - Street racing in Ja[...]. charlie fisherman. CC-BY 3.0."),
        TClip("shinkansen.mp4", 0, 1, "My Best Shinkansen shots. DenshaVid. CC-BY 3.0."),
        "Because some love speed,\nwhile others love danger."
    ),
    TScene(
        TClip("alloy_wheels.mp4", 31, 1, "What Is An Alloy Wheel? SD Wheel. CC-BY 3.0."),
        TClip("bogie.mp4", 64, 1, "Principle of Bogies - Railway Engineering: Tr[...]. TU Delft Online Learning. CC-BY 3.0."),
        "Because some like steel,\nwhile others prefer aluminium."
    ),
    TScene(
        TClip("car_combustion.mp4", 8, 1, "Honda Civic Type R FK8 x Fi Exhaust - Sound C[...]. FiExhaust. CC-BY 3.0."),
        TClip("steam_loco.mp4", 335, 1, "Cuba Steam in Paradise 1999 part 5. blackthorne57. CC-BY 3.0."),
        "Because some think, combustion engines are still the best,\nwhile others don't."
    ),
    TScene(
        TClip("f1.mp4", 47, 1, "Wird der Circuit Paul Ricard 2020 u[...]. Maik's F1 Channel. CC-BY 3.0"),
        TClip("gpe.mp4", 120, 1, "Grand Paris Express | Demystified. RMTransit. CC-BY 3.0."),
        "Because some have things built so that they can talk about it,\nwhile others talk about things that are built."
    ),
    TScene(
        TClip("audi.mp4", 193, 1, "2019 Audi S4: Review. Gold Pony. CC-BY 3.0."),
        TClip("loco_models.mp4", 552, 1, "[GL][T-232] EMD vs GE: Who Makes The Better Locomotive? | Trains 21. Trains21. CC-BY 3.0."),
        "Because some talk about things that are not really useful to know,\nwhile others talk about important details."
    ),
    TScene(
        TClip("drift.mp4", 0, 1, "Tesla drift, model s drift, model s[...]. Jürgen Zimmermann. CC-BY 3.0."),
        TClip("drehscheibe.mp4", 118, 1, "Fitnessfahrt mit Ce 6/8 II 14253 au[...]. cmn0train. CC-BY 3.0."),
        "Because some are going round in circles,\nwhile others just turn around."
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
finished_scenes.append(TextClip(text="Why are car enthusiasts cool and train enthusiasts nerdy?", color='white', font=FONT, align="center", font_size=100, method="caption", size=(VIDEO_W*2,VIDEO_H*2)).with_position(('center', 0)).resize(0.5).with_duration(6).fadein(FADE_DURATION).fadeout(FADE_DURATION))
for scene in scenes:
    long_fade_duration = DURATION/4*3
    clip_l = createSideClip(scene.left).audio_fadein(FADE_DURATION).audio_fadeout(long_fade_duration).with_position(('left', 'bottom'))
    clip_r = createSideClip(scene.right).audio_fadein(long_fade_duration).audio_fadeout(FADE_DURATION).with_position(('right', 'bottom'))
    credits_l = TextClip(text=scene.left.credits, color='white', font=FONT, font_size=40).with_position(('left', VIDEO_H-20)).resize(0.5).with_duration(DURATION).fadein(FADE_DURATION).fadeout(FADE_DURATION)
    credits_r = TextClip(text=scene.right.credits, color='white', font=FONT, font_size=40).with_position(('right', VIDEO_H-20)).resize(0.5).with_duration(DURATION).fadein(FADE_DURATION).fadeout(FADE_DURATION)
    title = TextClip(text=scene.text, color='white', font=FONT, align="center", font_size=100, method="caption", size=(VIDEO_W*2,TEXT_BAR_H*2)).with_position(('center', 0)).resize(0.5).with_duration(DURATION).fadein(FADE_DURATION).fadeout(FADE_DURATION)

    new_scene = CompositeVideoClip([clip_l,clip_r,credits_l,credits_r,title], size = (VIDEO_W,VIDEO_H))
    finished_scenes.append(new_scene)

finished_scenes.append(TextClip(text="That is, because...", color='white', font=FONT, align="center", font_size=100, method="caption", size=(VIDEO_W*2,VIDEO_H*2)).with_position(('center', 0)).resize(0.5).with_duration(6).fadein(FADE_DURATION).fadeout(FADE_DURATION))
final_clip = concatenate_videoclips(finished_scenes)
final_clip.write_videofile(VIDEO_DIR + "out1.mp4", fps=25)