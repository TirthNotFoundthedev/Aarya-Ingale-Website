"""Makes public/share.png (1200x630 social card) and public/favicon.png from the Hero art."""
from PIL import Image

BLUSH = (247, 228, 231, 255)
art = Image.open('public/art/hero-1200.webp').convert('RGBA')

card = Image.new('RGBA', (1200, 630), BLUSH)
h = 600
fig = art.resize((round(art.width * h / art.height), h), Image.LANCZOS)
card.alpha_composite(fig, ((1200 - fig.width) // 2, 630 - h + 40))
card.convert('RGB').save('public/share.png', optimize=True)

# head crop: head centre (0.532, 0.385) of the art
w = art.width
box = (int(w * 0.532 - w * 0.3), int(art.height * 0.385 - w * 0.3), int(w * 0.532 + w * 0.3), int(art.height * 0.385 + w * 0.3))
icon = Image.new('RGBA', (box[2] - box[0],) * 2, BLUSH)
icon.alpha_composite(art.crop(box))
icon.resize((128, 128), Image.LANCZOS).save('public/favicon.png')
