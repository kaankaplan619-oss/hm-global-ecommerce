"""
scripts/blender/generate_card_face.py
Génère la face imprimée de la carte de visite HM Global (Pillow)
Exécuter avec : python3 generate_card_face.py
Sortie : /tmp/hm_card_face_v9.png
"""

from PIL import Image, ImageDraw, ImageFont
import os

FW, FH = 1700, 1100   # ratio 85mm × 55mm @ 20x
OUTPUT = "/tmp/hm_card_face_v9.png"

img  = Image.new('RGB', (FW, FH), (250, 248, 253))
draw = ImageDraw.Draw(img)

# ── Bande rose gauche (12.5 % de la largeur) ────────────────────────────────
STRIPE_PX = int(FW * 0.125)
draw.rectangle([0, 0, STRIPE_PX, FH], fill=(178, 63, 116))
# Filet violet (2 px)
draw.rectangle([STRIPE_PX, 0, STRIPE_PX + 2, FH], fill=(63, 45, 88))

# ── Polices Helvetica Neue (système macOS) ────────────────────────────────────
HN = '/System/Library/Fonts/HelveticaNeue.ttc'
def fnt(size, bold=False):
    try:
        return ImageFont.truetype(HN, size, index=1 if bold else 0)
    except Exception:
        return ImageFont.load_default()

f_brand  = fnt(74,  bold=True)
f_agency = fnt(32,  bold=False)
f_name   = fnt(56,  bold=True)
f_title  = fnt(33,  bold=False)
f_small  = fnt(28,  bold=False)

PURPLE = (47, 30, 72)
ROSE   = (178, 63, 116)
GRAY   = (118, 98, 142)

X = STRIPE_PX + 65   # marge texte gauche

# ── Zone haute : marque ───────────────────────────────────────────────────────
draw.text((X, 72),  "HM GLOBAL",   fill=PURPLE, font=f_brand)
draw.text((X, 158), "AGENCE",      fill=ROSE,   font=f_agency)

# Ligne de séparation rose
draw.line([(X, 212), (FW - 65, 212)], fill=ROSE, width=2)

# ── Nom & titre ───────────────────────────────────────────────────────────────
draw.text((X, 232), "Kaan Kaplan",            fill=PURPLE, font=f_name)
draw.text((X, 302), "Direction  ·  Branding", fill=GRAY,   font=f_title)

# ── Zone basse : coordonnées ──────────────────────────────────────────────────
Y_BOT = FH - 195
draw.text((X, Y_BOT),       "contact@hmga.fr",  fill=GRAY, font=f_small)
draw.text((X, Y_BOT + 44),  "03 76 16 11 88",   fill=GRAY, font=f_small)
draw.text((X, Y_BOT + 88),  "www.hmglobal.fr",  fill=ROSE, font=f_small)

# ── Monogramme blanc dans la bande rose ─────────────────────────────────────
f_mono = fnt(50, bold=True)
draw.text((STRIPE_PX // 2 - 26, FH // 2 - 95),  "HM", fill=(255, 255, 255), font=f_mono)

img.save(OUTPUT, 'PNG')
print(f"✓ Card face saved → {OUTPUT}  ({FW}×{FH})")
