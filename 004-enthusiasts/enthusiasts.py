from moviepy.editor import *
from dataclasses import dataclass
# https://gist.github.com/Zulko/e072d78dd5dbd2458f34d2166265e081
from lib.text_clip import text_clip

@dataclass
class TClip:
    file: str = None
    start: int = 0
    credits: str = None
    speed: int = 1
    crop: int = None

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
FONT = "Roboto Condensed"

scenes = [
    TScene(
        TClip("street_racing.mp4", 23, "Real tokyo street scene - Street racing in Ja[...]. charlie fisherman. CC-BY 3.0."),
        TClip("shinkansen.mp4", 0, "My Best Shinkansen shots. DenshaVid. CC-BY 3.0."),
        "Because some love speed,\nwhile others love danger."
    ),
    TScene(
        TClip("can.mp4", 240, "CAN Bus communication explained in 5 minutes. Saral Tayal. CC-BY 3.0."),
        TClip("moscow.mp4", 30, "How Moscow's metro grew in 82 years. RUSSIA BEYOND. CC-BY 3.0."),
        "Because some are interested in irrelevant details,\nwhile others care about important technicalities."
    ),
    TScene(
        TClip("car_combustion.mp4", 8, "Honda Civic Type R FK8 x Fi Exhaust - Sound C[...]. FiExhaust. CC-BY 3.0."),
        TClip("steam_loco.mp4", 335, "Cuba Steam in Paradise 1999 part 5. blackthorne57. CC-BY 3.0.", 1, VIDEO_H-TEXT_BAR_H+10),
        "Because some think combustion engines are still the best,\nwhile others do not."
    ),
    TScene(
        TClip("audi2.mp4", 95, "2020 Audi A3 Review | Buy Now or Wait for 202[...]. Gold Pony. CC-BY 3.0."),
        TClip("loco_models.mp4", 362, "[GL][T-232] EMD vs GE: Who Makes The Better L[...]. Trains21. CC-BY 3.0."),
        "Because some want more horsepower,\nwhile others need it."
    ),
    TScene(
        TClip("alloy_wheels.mp4", 31, "What Is An Alloy Wheel? SD Wheel. CC-BY 3.0."),
        TClip("bogie.mp4", 64, "Principle of Bogies - Railway Engineering: Tr[...]. TU Delft Online Learning. CC-BY 3.0."),
        "Because some like steel,\nwhile others are into aluminium."
    ),
    TScene(
        TClip("flying.mp4", 150, "Pal V Liberty \"World's first\" commercial fl[...]. Tech World. CC-BY 3.0.", 1, 720/(1280/21*9)*(VIDEO_H-TEXT_BAR_H)),
        TClip("maglev.mp4", 75, "L0 Series maglev train [FHD 60p]. ula. CC-BY 3.0."),
        "Because some aim at a livable future,\nwhile others prefer dreaming."
    ),
    TScene(
        TClip("f1.mp4", 47, "Wird der Circuit Paul Ricard 2020 u[...]. Maik's F1 Channel. CC-BY 3.0"),
        TClip("gpe.mp4", 217, "Grand Paris Express | Demystified. RMTransit. CC-BY 3.0."),
        "Because some have things built so that they can talk about it,\nwhile others talk about things that are being built."
    ),
    TScene(
        TClip("drift.mp4", 0, "Tesla drift, model s drift, model s[...]. Jürgen Zimmermann. CC-BY 3.0."),
        TClip("drehscheibe.mp4", 118, "Fitnessfahrt mit Ce 6/8 II 14253 au[...]. cmn0train. CC-BY 3.0."),
        "Because some are going round in circles,\nwhile others just turn around."
    )
]

def createTextSlide(text):
    clip = text_clip(text=text, fill_color=(255,255,255), bg_color=(0,0,0), font_family=FONT, font_weight="bold", align="center", font_height=50, stroke_width=0)
    clip = clip.with_position(('center', 'center')).with_duration(6).fadein(FADE_DURATION).fadeout(FADE_DURATION)
    return CompositeVideoClip([clip], size = (VIDEO_W,VIDEO_H))

def createSideClip(clip):
    vfc = VideoFileClip(VIDEO_DIR + clip.file).subclip(clip.start, clip.start+DURATION*clip.speed)
    if clip.speed != 1:
        vfc = vfc.multiply_speed(factor=clip.speed)
    vfc = vfc.resize(height=clip.crop if clip.crop is not None else VIDEO_H-TEXT_BAR_H)
    vfc = vfc.crop(x_center=vfc.size[0]/2, y_center=vfc.size[1]/2, width=VIDEO_W/2, height=VIDEO_H-TEXT_BAR_H)
    vfc = vfc.fadein(FADE_DURATION).fadeout(FADE_DURATION).audio_normalize()
    return vfc

def createCaption(text):
    clip = text_clip(text=text, fill_color=(255,255,255), font_family=FONT, font_weight="bold", align="center", font_height=48, stroke_width=3)
    return clip.resize(0.5).with_duration(DURATION).fadein(FADE_DURATION).fadeout(FADE_DURATION)

def createTitle(text):
    clip = text_clip(text=text, fill_color=(255,255,255), bg_color=(0,0,0), font_family=FONT, font_weight="bold", align="center", font_height=50, stroke_width=0)
    return clip.with_position(('center', 54)).with_duration(DURATION).fadein(FADE_DURATION).fadeout(FADE_DURATION)

finished_scenes = []
finished_scenes.append(createTextSlide("Why are car enthusiasts cool and train enthusiasts nerdy?"))
for scene in scenes:
    long_fade_duration = DURATION/4*3
    margin = 10
    clip_l = createSideClip(scene.left).audio_fadein(FADE_DURATION).audio_fadeout(long_fade_duration).with_position(('left', 'bottom'))
    clip_r = createSideClip(scene.right).audio_fadein(long_fade_duration).audio_fadeout(FADE_DURATION).with_position(('right', 'bottom'))
    credits_l = createCaption(scene.left.credits)
    credits_l = credits_l.with_position((margin, VIDEO_H-credits_l.h-margin))
    credits_r = createCaption(scene.right.credits)
    credits_r = credits_r.with_position((VIDEO_W-credits_r.w-margin, VIDEO_H-credits_r.h-margin))
    title = createTitle(scene.text)

    new_scene = CompositeVideoClip([clip_l,clip_r,credits_l,credits_r,title], size = (VIDEO_W,VIDEO_H))
    finished_scenes.append(new_scene)

#finished_scenes.append(createTextSlide("That is, because..."))
final_clip = concatenate_videoclips(finished_scenes)
final_clip.write_videofile(VIDEO_DIR + "out1.mp4", fps=30)