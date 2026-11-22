"""Generates the Android launcher icons and splash screens from ../icons.
Run from android-app/:  python3 scripts/make-icons.py   (needs Pillow: pip install pillow)
"""
import os
from PIL import Image, ImageDraw

here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, '..', '..')
res = os.path.join(here, '..', 'android', 'app', 'src', 'main', 'res')
mask = Image.open(os.path.join(root, 'icons', 'maskable-512.png')).convert('RGBA')
BG = (26, 14, 8, 255)

dens = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
for d, k in dens.items():
    out = os.path.join(res, 'mipmap-' + d)
    # adaptive-icon foreground (108dp canvas); the maskable art already carries its own background and safe zone
    fg = round(108 * k)
    mask.resize((fg, fg), Image.LANCZOS).save(os.path.join(out, 'ic_launcher_foreground.png'))
    # legacy launcher icons (48dp)
    s = round(48 * k)
    base = mask.resize((s, s), Image.LANCZOS)
    sq = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    m = Image.new('L', (s, s), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, s - 1, s - 1], radius=round(s * 0.22), fill=255)
    sq.paste(base, (0, 0), m)
    sq.save(os.path.join(out, 'ic_launcher.png'))
    rd = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    m = Image.new('L', (s, s), 0)
    ImageDraw.Draw(m).ellipse([0, 0, s - 1, s - 1], fill=255)
    rd.paste(base, (0, 0), m)
    rd.save(os.path.join(out, 'ic_launcher_round.png'))

# splash screens: dark background with the icon in the middle
def splash(path, w, h):
    im = Image.new('RGBA', (w, h), BG)
    s = round(min(w, h) * 0.34)
    ic = mask.resize((s, s), Image.LANCZOS)
    m = Image.new('L', (s, s), 0)
    ImageDraw.Draw(m).ellipse([0, 0, s - 1, s - 1], fill=255)
    im.paste(ic, ((w - s) // 2, (h - s) // 2), m)
    im.convert('RGB').save(path)

sizes = {'mdpi': (320, 480), 'hdpi': (480, 800), 'xhdpi': (720, 1280), 'xxhdpi': (960, 1600), 'xxxhdpi': (1280, 1920)}
for d, (w, h) in sizes.items():
    splash(os.path.join(res, 'drawable-port-' + d, 'splash.png'), w, h)
    splash(os.path.join(res, 'drawable-land-' + d, 'splash.png'), h, w)
splash(os.path.join(res, 'drawable', 'splash.png'), 480, 800)

with open(os.path.join(res, 'values', 'ic_launcher_background.xml'), 'w') as f:
    f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#1A0E08</color>\n</resources>\n')
print('Icons and splash screens written')
