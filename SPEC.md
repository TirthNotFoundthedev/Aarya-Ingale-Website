# Design spec: thecheriari.vercel.app

Personal site for **Aarya Ingale**, a surprise gift from a friend. It's one long page you scroll through, with Indian paper-cutout art: a ¾-profile Portrait of her in front of a huge mandala Ring that turns as you scroll. Terms are defined in [GLOSSARY.md](GLOSSARY.md). For the reasoning behind any decision, see [wayfinder/map.md](wayfinder/map.md).

**Deadline:** live by **Nov 3, 2026** (Nov 5 at the latest).

## Scenes

The order is **Hero → Now → Interests & Skills → Socials**. The Portrait and Ring stay on screen the whole time; the content changes around them. Reference sketches: [hero](wayfinder/assets/hero-sketch-v1.png), [now](wayfinder/assets/now-sketch-v1.png), [socials](wayfinder/assets/socials-sketch-v1.png).

| Scene | Desktop | Phone |
|---|---|---|
| **Hero** | "Hi! I'm" and **Aarya Ingale** centred at the top. A huge Ring centred on her head and cropped by the bottom edge like a rising arch. A head-and-shoulders bust of her rising from the bottom edge, bottom centre. | Same layout. Portrait + Ring take **50–70%** of the screen height. |
| **Now** ("What I'm upto right now") | Portrait + Ring sit in the **bottom-right corner**, cropped by the right and bottom edges, and she faces left toward the content. Title at top-left, short overview text on the left (college, branch, year, current stuff). | Portrait + Ring at **bottom centre**, about **30%** of the screen height, with the content above. |
| **Interests & Skills** | Same corner layout. Overview text on the left, and the skills and interests as an **Arc list** around the Ring. | Same as Now, with the Arc list curving over her head. |
| **Socials** | Same corner layout. The links as an **Arc list** around the Ring. | Same as Interests & Skills. |

**Arc list:** the items sit on an arc just outside the Ring and slide along it as you scroll, like a turning dial. Labels always stay upright. A suggestion still to try: highlight the item closest to the left end of the arc.

**Hero → Now transition:** the Ring travels to the bottom-right corner. The Portrait **drops out of the bottom of the screen and pops back up from the right**, already in the left-facing corner pose. This hides the swap between the two poses.

**Other transitions** (Now → Interests → Socials): the Portrait stays put, the Ring keeps turning, and the content swaps.

## Portrait

- Stylised but recognisable, not photoreal: a short bob with hair tucked behind one ear, an earring and a soft smile, head and shoulders.
- **Two poses:** the **Hero pose** (¾ view turned toward the viewer, both eyes visible, looking out at the visitor) and the **Corner pose** (facing left, toward the content).
- **One flat image per pose for launch:** `hero-master.png` and `corner-master.png` from Gemini, background removed. No layer rig: the moving eye, blink, earring swing and parallax move to "After Nov 3".
- How it was made: [wayfinder/research/ai-art-pipeline.md](wayfinder/research/ai-art-pipeline.md) and [execution/03-portrait-art.md](execution/03-portrait-art.md). One Gemini master image per pose.
- **Outfit:** Paithani green `#17563f` top with a thin gold `#e9c46a` zari border at the neckline, and one gold jhumka earring. No dupatta.
- **Files:** `public/art/{pose}-{width}.{avif|webp}`, with `{pose}` = `hero` or `corner` and `{width}` = `1600` (desktop) or `1200` (phone). Transparent background. AVIF with WebP fallback.

## Interactions

- **Ring:** made of concentric bands. Neighbouring bands turn in **opposite directions at different speeds**, driven by scroll.
- **Tap/click her:** a "Hi!" speech bubble pops out (white bubble, plum outline, Kalam font), and a sparkle flashes on her earring.
- `prefers-reduced-motion`: no scroll-linked rotation; the content still works.

The bubble and sparkle already work in the prototype. Copy the behaviour from there.

## Visual language

The look is **mostly variant A** (light blush background, pink-led, flat paper shapes) **with D's Paithani accents** (green, gold zari, peacock and paisley motifs). To see A and D, open the prototype with `?variant=A` and `?variant=D`. This starting palette can be adjusted during the build:

| Role | Colour |
|---|---|
| Background | `#f7e4e7` blush |
| Main pink | `#d6246e` rani |
| Soft pink | `#f28bb3` |
| Ink / text | `#4a1530` plum |
| Accent gold | `#e9c46a` |
| Accent green | `#17563f` Paithani green (deep `#0e3b2e`) |
| Accent magenta | `#c2185b` |

**Paper finish:** flat fills with soft drop shadows between layers and a faint paper texture.

**Fonts** (Google Fonts):

| Use | Font |
|---|---|
| The name "Aarya Ingale" | **Allura** |
| Section titles (Now, Interests & Skills, Socials) | **Yatra One** |
| Short labels (link names, skill names, "Hi! I'm") | **Rozha One** |
| Paragraphs | **Lora** |
| Speech bubble | **Kalam** |

**Ring mandala:** the design is still open. It gets decided in execution step 02, starting from a reference mandala the user is finding.

## Content file

All text, links and photos live in **one file**, `src/content.js`, so editing the site means editing that file and redeploying. It holds: name, hero line, the Now overview (college, branch, year, a few lines of what she's up to), the interests and skills (label plus an optional one-line detail), the social links (label, URL, icon key), and a gallery list (empty for now). Fields with no confirmed fact get an obvious `TODO` placeholder.

## Tech

- Vite + vanilla JS + GSAP ScrollTrigger. No framework.
- The Ring is procedural SVG built in code. The Portrait is one image per pose.
- Hosted on Vercel as the project **`thecheriari`** → `thecheriari.vercel.app`.

## After Nov 3 (not in this version)

Photo gallery, her real voice saying "Hi!", floating motifs around the Portrait, and a **layered Portrait rig**: eye that follows the mouse and looks around on phones, random blink every 2–5 s, earring that swings on tap, and mouse parallax between layers. The prototype already has all of these, and the cutting guide is in [execution/03-portrait-art.md](execution/03-portrait-art.md) → Deferred rig.
