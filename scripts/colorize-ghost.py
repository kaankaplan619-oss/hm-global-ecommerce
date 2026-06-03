#!/usr/bin/env python3
"""
colorize-ghost.py
─────────────────────────────────────────────────────────────────────────────
Colorise un template ghost Printful (PNG transparent) avec une couleur cible.
Compose : fond couleur garment + ghost overlay.

Usage:
  python3 scripts/colorize-ghost.py <input.png> <hex_color> <output.png>

Exemple:
  python3 scripts/colorize-ghost.py public/mockups/gildan-18500/blanc-front.png "#0b0b0b" public/mockups/gildan-18500/noir-front.png
"""
import sys
from PIL import Image

def colorize(input_path, hex_color, output_path):
    # Parse hex
    h = hex_color.lstrip('#')
    rgb = tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

    # Load ghost with alpha
    ghost = Image.open(input_path).convert('RGBA')
    w, h = ghost.size

    # Create solid color background
    bg = Image.new('RGBA', (w, h), rgb + (255,))

    # Composite ghost over color bg
    out = Image.alpha_composite(bg, ghost)

    # Now find white outer background (sticker bg) and restore it to white
    # The ghost has true white bg AND semi-transparent garment body
    # Without masking, the white bg becomes the color too
    # We need a different approach: mask out the white background

    # Better approach: use the original PNG as alpha mask
    # Pixels that were opaque white in source = background → keep white
    # Pixels with low alpha = garment body → fill with color
    # Pixels that were dark = details → keep dark

    # Use luminance + alpha to build a garment mask
    px = ghost.load()
    out_px = out.load()
    final = Image.new('RGB', (w, h), (255, 255, 255))
    fp = final.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 255 and r >= 250 and g >= 250 and b >= 250:
                # Outer background → white
                fp[x, y] = (255, 255, 255)
            else:
                # Garment area (semi-transparent or dark) → composite with color
                fp[x, y] = out_px[x, y][:3]

    final.save(output_path, 'PNG', optimize=True)
    print(f"  ✅ {output_path}  ({rgb})")

if __name__ == '__main__':
    if len(sys.argv) != 4:
        print("Usage: colorize-ghost.py <input.png> <hex_color> <output.png>")
        sys.exit(1)
    colorize(sys.argv[1], sys.argv[2], sys.argv[3])
