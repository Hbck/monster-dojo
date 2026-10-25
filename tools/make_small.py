#!/usr/bin/env python3
"""Regenerate fast phone-size copies in art/sm/ from the full PNGs in art/.
Creatures -> 256x256, humans (kai, sensei-momo) -> 384px tall. Run after dropping new art in art/."""
import os
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__))
src, dst = os.path.join(here, 'art'), os.path.join(here, 'art', 'sm')
os.makedirs(dst, exist_ok=True)
for f in sorted(os.listdir(src)):
    if not f.lower().endswith('.png'): continue
    im = Image.open(os.path.join(src, f)).convert('RGBA')
    if f[:-4] in ('kai', 'sensei-momo'): h = 384; w = round(im.width * h / im.height)
    else: w = h = 256
    im.resize((w, h), Image.LANCZOS).save(os.path.join(dst, f), optimize=True)
    print('art/sm/' + f, (w, h))
