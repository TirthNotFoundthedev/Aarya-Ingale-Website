# 03 Portrait art

## Goal

Both Portrait poses (Hero ¾ pose and the left-facing Corner pose), recognisably Aarya, as one flat image each with the background removed, exported to `public/art/`.

**Scope change (2026-11-01):** the layer rig (moving eyes, blink, earring swing, parallax) moved to after Nov 3, because cutting it by hand cost too much effort. Launch uses `hero-master.png` and `corner-master.png` as-is. The rig instructions below are kept as **Deferred rig** for later.

The human does the generating in Gemini. This session drives: prompts, likeness checks, layer instructions and export checks. Expect it to span several sittings; resume in the same chat if possible.

## Do

1. Read `wayfinder/research/ai-art-pipeline.md` (it covers privacy settings, the "do not beautify" wording and quota tips).
2. Write the Gemini prompts for the Hero pose: style (light, flat paper cutout, palette and portrait details from SPEC.md), 3–5 reference photos, and an iteration plan. Iterate with the user until friends would recognise her.
3. Repeat for the Corner pose, using the approved Hero image as the style anchor so the two match.
4. ~~Cut the rig layers~~ (deferred, see below).
5. The user puts the two upscaled masters in `art-src/` as `hero-master.png` and `corner-master.png`. A script removes the flat blue background (keeping the soft paper shadows as semi-transparent shadow), removes the Gemini sparkle, and writes `public/art/{pose}-{1600|1200}.{avif|webp}`. Check the result over the blush background, then write `## Outcome`.

## Done when

`public/art/` holds `hero-1600`, `hero-1200`, `corner-1600` and `corner-1200`, each as AVIF and WebP with a transparent background, and the user approves the likeness.

## Deferred rig (after Nov 3)

Everything below was the plan for the layer rig. Sections 0–2 are done. Pick up at section 3 when the rig comes back.

**Status (2026-10-31):** both masters picked. The first generation (near side profile) became the Corner pose, and a second turn toward the viewer became the Hero pose, which shows **both eyes** (SPEC.md updated).

Working material for the sittings. Work through it top to bottom, and report back at each **Checkpoint**.

### 0. Before you open Gemini

- [ ] Gemini → Settings → Activity → **turn Keep Activity off.** These are a friend's photos.
- [ ] Pick **3–5 photos** of Aarya: well lit, no sunglasses, no beauty filters, hair in her usual bob.
  - 2 photos near **¾ profile** (one eye just visible, face turned toward the *left* of the frame). If a good photo faces right, mirror it before uploading.
  - 1 clear **front** photo for her features.
  - Optional: 1 photo showing the ear with hair tucked behind it.
- [ ] Write down **3–4 things friends would name** when describing her face (e.g. "round cheeks, thick straight eyebrows, small nose with a rounded tip, dimple on the left"). Paste them over `[FEATURES]` below. This line does more for likeness than anything else in the prompt.

Fixed choices (SPEC.md, plus the prototype's variant A/D portrait colours):

| Thing | Value |
|---|---|
| Hair | short bob, tucked behind the ear nearest the viewer |
| Top | Paithani green `#17563f`, thin gold zari border `#e9c46a` at the neckline |
| Earring | one gold `#e9c46a` jhumka-style drop, hanging free of hair and neck |
| Background | flat solid **`#CFE3F0` pale blue**: it contrasts with skin, hair, green and gold, so background removal is clean |
| Framing | **4:5 portrait**, head and shoulders, shoulders cut by the bottom edge, top of head ~10% below the top edge |

No dupatta: SPEC.md's rig has no dupatta layer, and it would hide the neckline.

### 1. Hero pose (¾ profile)

Attach the photos, then send **Prompt H1** as one message:

> The attached photos are all of the same young woman. Use them **only as the identity reference**: photos 1 and 2 show her at a three-quarter angle, photo 3 shows her face from the front.
>
> Make a new illustration of her in the style of **Indian layered paper-cutout art**: every area is a flat piece of cut coloured paper with crisp clean edges, a very faint paper grain, and a soft drop shadow where one paper layer sits on another. No outlines, no gradients, no painterly shading, no photo texture. Light and cheerful.
>
> Pose: **three-quarter profile, face turned toward the left of the frame**, only her near eye visible, the far eye hidden behind the bridge of the nose. Head and shoulders only, shoulders cut off by the bottom edge. Soft closed-mouth smile. Eye open, looking straight ahead.
>
> Hair: a **short bob, tucked behind the ear facing the viewer**, so that ear is fully visible.
> Earring: **one gold jhumka drop earring** hanging from that ear, clear of the hair and neck.
> Clothing: a simple **deep green (#17563f) top** with a thin **gold (#e9c46a) border** along the neckline.
>
> Keep her exact face shape, nose shape, eyebrows, lip shape, jawline, hairline and skin tone from the photos. **Do not beautify, slim or lighten her.** Her distinctive features: [FEATURES].
>
> Background: one flat solid colour, #CFE3F0, nothing else. No props, no text, no border, no frame. Portrait, 4:5 aspect ratio.

**Iteration plan** (stay in the same chat):

1. If style or pose is wrong, re-roll H1 up to 3 times before editing. A good base beats many edits.
2. Then fix **one thing per message**, always ending with *"Keep everything else identical. Do not beautify."* Useful edits:
   - Likeness: "Make her nose [shorter / wider at the tip / straighter], matching photo 3."
   - Style drift: "Flatter. Every area is one solid colour of cut paper, no shading inside a shape."
   - Two eyes showing: "Turn her face slightly further left so only one eye shows."
   - Earring lost in hair: "Move the hair a little further behind the ear so the whole earring hangs free."
3. If it gets worse 3 turns in a row, re-attach the best image so far and say "Start from this image."
4. **Likeness test:** send the best 1–2 candidates to 2–3 mutual friends with no context ("who is this?"). Pass = they name her.
5. Download the winner at full resolution as `hero-master.png`. Every later Hero edit starts from this file.

**Checkpoint H:** share `hero-master.png` (or say what's off) before moving on.

### 2. Corner pose (facing left)

Same chat. Attach `hero-master.png` plus 1–2 reference photos:

> Image 1 is the approved illustration. Images 2–3 are photos of the same woman. Make a **second illustration that matches image 1 exactly in style, colours, paper texture, clothing, hair and earring**, but with **her head turned further toward the left of the frame**, close to a full side profile, as if she is looking at something on the left side of the page. Only her near eye visible. Head and shoulders, shoulders cut off by the bottom edge. Same soft smile. Same hair tucked behind the ear with the gold jhumka hanging free.
>
> Keep her exact face shape, nose, lips, jawline and skin tone. Do not beautify, slim or lighten her. Same flat #CFE3F0 background, 4:5 aspect ratio, no text.

Iterate the same way, checking side by side against `hero-master.png`: same skin colour, same green, same bob length. Save the winner as `corner-master.png`.

**Checkpoint C:** share `corner-master.png`.

### 2b. Upscale (do this after section 3, before section 4)

Gemini's output is 825×1024; the build needs 1600px wide. Make the section 3 edits on the original 825px masters, then upscale **every** image for a pose (master and all under-layers from section 3) the same way, so they still line up:

- [Upscayl](https://upscayl.org) (free desktop app), model **"Digital Art"**, scale ×2. That gives 1650×2048. Then in Photopea, Image → Image Size → width **1600** (height follows, ~1986).
- Clean up the small Gemini sparkle watermark in the bottom-right corner on the masters with the Spot Healing brush; it sits on the top layer, so only `top` needs it clean.

### 3. Under-layers (paint in what's hidden)

For each master, attach it and send each edit separately:

| Prompt | Save as |
|---|---|
| "Same image, same style. **Remove her hair completely** and show the full head shape, forehead, ear and neck underneath as flat paper. Keep everything else identical." | `{pose}-nohair.png` |
| "Same image, same style. **Remove the earring** and show the plain earlobe and the neck behind it. Keep everything else identical." | `{pose}-noearring.png` |
| "Same image, same style. **Her eyes are gently closed**, as in a blink: a curved lash line, eyelids the same colour as the skin. Keep everything else identical." | `{pose}-blink.png` |

These must line up with the master wherever nothing changed. Check by stacking each over the master in Photopea at 50% opacity; if Gemini shifted the face, re-roll.

### 4. Cut the layers

Rig layers per pose, back to front. These names are final; the build uses them.

| # | Layer | Cut from | Notes |
|---|---|---|---|
| 1 | `back-hair` | master | Hair behind the head and neck |
| 2 | `neck` | `nohair` | Neck, plus any shoulder the top doesn't cover |
| 3 | `top` | master | Green top with gold border |
| 4 | `face` | `nohair` + `noearring` | Head, ear and features. Fill the eye opening with skin colour; the eye pieces sit on top |
| 5 | `eye-white` | master | The eye opening, filled flat with the eye-white colour, iris painted out. Hero: both eyes in one piece |
| 6 | `iris` | master | Iris + pupil + highlight as one complete circle (paint in the part the lid covered). Hero: both irises in one piece, at their exact spacing |
| 7 | `eyelid` | `blink` | Closed lid covering the eye opening; shown only during a blink. Hero: both lids in one piece |
| 8 | `hair` | master | Front hair, fringe and the part tucked behind the ear |
| 9 | `earring` | master | Jhumka with its hook. **Swing point = top of the hook** |

1. Try the [Qwen-Image-Layered Space](https://huggingface.co/spaces/Qwen/Qwen-Image-Layered) on the master with 5–6 layers. Output is 640px, so use it only as a guide or mask.
2. Open the master in [Photopea](https://www.photopea.com), and open the under-layer PNGs as extra layers in the same document so everything shares one canvas. Select → Remove BG on a copy (the flat blue makes this clean). Cut each piece onto its own layer with Magic Wand (tolerance 10–20 works well on flat paper colours) or Select → Magic Cut.
3. Check for holes: move `hair` and `earring` 30px; no blue or empty gaps should show behind them.
4. Save the Photopea file as `{pose}-rig.psd` and keep it.

### 5. Export

You export plain PNGs; a script does the rest.

- Export every layer as a **full-canvas 1600px PNG with transparency** (hide all other layers → File → Export As → PNG) to `art-src/{pose}/{layer}.png`, e.g. `art-src/hero/hair.png`. `art-src/` stays out of the build.
- The next session writes a script that, per pose: crops `eye-white`, `iris`, `eyelid`, `earring` tight and records offsets (iris centre = its bounding-box centre; earring pivot = top-centre of its bounding box) in `public/art/{pose}/rig.json`; and writes every layer at 1600px and 1200px wide as AVIF + WebP to `public/art/{pose}/{layer}-{width}.{avif|webp}`.

`rig.json` shape (1600px-canvas pixels; the 1200px set scales by 0.75):

```json
{
  "canvas": [1600, 1986],
  "pieces": {
    "eye-white": { "x": 0, "y": 0 },
    "iris":      { "x": 0, "y": 0, "cx": 0, "cy": 0 },
    "eyelid":    { "x": 0, "y": 0 },
    "earring":   { "x": 0, "y": 0, "pivotX": 0, "pivotY": 0 }
  }
}
```

**Checkpoint E:** say when `art-src/` holds all 18 PNGs; the script runs and the export gets checked (sizes, transparency, names), then the Outcome is written.

## Outcome

Done 2026-11-01. The user approved the likeness of both masters.

**Built**
- Source art: `art-src/hero-master.png` (¾ view, both eyes, looking at the viewer) and `art-src/corner-master.png` (near side profile, facing left), Gemini output upscaled to 1611×2000. Same hair, top, jhumka and framing in both, so the drop-and-pop swap in step 05 lines up.
- `tools/export-portraits.py` (Python, needs Pillow with AVIF + opencv-python) turns them into the site files. Re-run it if a master changes. It:
  - inpaints the Gemini sparkle watermark (bottom-right, hard-coded position);
  - removes the flat blue background, including the gaps enclosed by hair strands, and keeps the soft paper drop shadows as semi-transparent black;
  - writes premultiplied-resized AVIF (q60) and WebP (q82).
- Output in `public/art/`:

| File | Size | KB |
|---|---|---|
| `hero-1600.avif` / `.webp` | 1600×1986 | 86 / 160 |
| `hero-1200.avif` / `.webp` | 1200×1490 | 59 / 110 |
| `corner-1600.avif` / `.webp` | 1600×1986 | 85 / 159 |
| `corner-1200.avif` / `.webp` | 1200×1490 | 58 / 109 |

**For later steps**
- No layer rig: each pose is one image. Eye follow, blink, earring swing and parallax are deferred (SPEC.md → After Nov 3); the cutting guide is the "Deferred rig" section above.
- Both images share the same canvas and framing: the shoulders run off the bottom edge, and the transparent margin is about 13% on the left, 5% on the right and 7% at the top (Hero; Corner is close). Position the `<picture>` so its bottom edge sits on the screen edge.
- Earring position, for the tap sparkle (as a fraction of the image): Hero and Corner both about (0.63, 0.62), the centre of the jhumka dome.
- The Corner pose faces left already; don't mirror it.

