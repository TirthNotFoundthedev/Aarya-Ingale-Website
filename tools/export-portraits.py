"""Turn the Gemini Portrait masters into the site's art files.

    python tools/export-portraits.py

Reads  art-src/{hero,corner}-master.png  (flat pale-blue background, Gemini sparkle bottom-right)
Writes public/art/{pose}-{1600,1200}.{avif,webp}  (transparent background)

Background removal: a background pixel is the background colour scaled by a
brightness factor k (k < 1 where a paper shadow falls on it). Those pixels,
connected to the image border, become black at alpha (1 - k), so the soft
paper shadows survive as real shadows over any page colour.
"""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / "art-src", ROOT / "public" / "art"
WIDTHS = (1600, 1200)

# Gemini sparkle watermark, in master pixels (1611x2000): a 4-point star.
SPARKLE_CENTRE, SPARKLE_ARM = (1515, 1902), 48


def remove_sparkle(rgb):
    t = np.linspace(0, 2 * np.pi, 200)
    cx, cy = SPARKLE_CENTRE
    pts = np.stack([cx + SPARKLE_ARM * np.cos(t) ** 3, cy + SPARKLE_ARM * np.sin(t) ** 3], 1)
    mask = np.zeros(rgb.shape[:2], np.uint8)
    cv2.fillPoly(mask, [pts.astype(np.int32)], 255)
    mask = cv2.dilate(mask, np.ones((7, 7), np.uint8))
    return cv2.inpaint(rgb, mask, 9, cv2.INPAINT_TELEA)


def remove_background(rgb):
    p = rgb.astype(np.float32)
    h, w = p.shape[:2]
    border = np.concatenate([p[:8].reshape(-1, 3), p[-8:].reshape(-1, 3),
                             p[:, :8].reshape(-1, 3), p[:, -8:].reshape(-1, 3)])
    bg = np.median(border, 0)

    k = (p @ bg) / (bg @ bg)                      # brightness relative to background
    resid = np.linalg.norm(p - k[..., None] * bg, axis=2)
    bglike = ((resid < 16) & (k > 0.45) & (k < 1.1)).astype(np.uint8)

    # keep only background-like regions that touch the border
    n, labels = cv2.connectedComponents(bglike, connectivity=4)
    edge = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    keep = set(edge[edge != 0].tolist())
    # plus enclosed pockets (gaps between hair strands, often in shadow): blue for their
    # brightness (grey hair and warm eye whites are not) and bluer than green (the dress is not).
    blue = (p[..., 2] - p[..., 0]) / np.maximum(k, 0.05)
    bluer_than_green = p[..., 2] - p[..., 1]
    for i in range(1, n):
        if i in keep:
            continue
        m = labels == i
        if (m.sum() >= 30 and np.median(k[m]) > 0.5 and np.median(blue[m]) > 15
                and np.median(bluer_than_green[m]) > 0):
            keep.add(i)
    is_bg = np.isin(labels, list(keep))

    # eat the 1px blue fringe on the figure's edge, then soften the cut
    is_bg = cv2.dilate(is_bg.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    figure = cv2.GaussianBlur((~is_bg).astype(np.float32), (3, 3), 0)

    shadow = np.clip((1 - k - 0.03) / 0.97, 0, 1)  # ignore paper-grain noise
    alpha = figure + (1 - figure) * shadow * is_bg

    # colour: figure pixels keep their colour; pure shadow pixels are black
    colour = p * (figure / np.maximum(alpha, 1e-6))[..., None]
    rgba = np.dstack([np.clip(colour, 0, 255), alpha * 255]).astype(np.uint8)
    return rgba


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for pose in ("hero", "corner"):
        rgb = np.asarray(Image.open(SRC / f"{pose}-master.png").convert("RGB"))
        rgba = remove_background(remove_sparkle(rgb))
        im = Image.fromarray(rgba, "RGBA").convert("RGBa")  # premultiplied for clean resizing
        for width in WIDTHS:
            height = round(im.height * width / im.width)
            out = im.resize((width, height), Image.LANCZOS).convert("RGBA")
            out.save(OUT / f"{pose}-{width}.avif", quality=60)
            out.save(OUT / f"{pose}-{width}.webp", quality=82, method=6)
            for ext in ("avif", "webp"):
                f = OUT / f"{pose}-{width}.{ext}"
                print(f"{f.relative_to(ROOT)}  {width}x{height}  {f.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
