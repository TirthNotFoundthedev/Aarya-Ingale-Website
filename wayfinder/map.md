---
labels: [wayfinder:map]
title: Aarya's paper-cutout website — design spec
---

## Destination

A build-ready **design spec** (mostly visual/interaction design) for Aarya Ingale's personal site in the Indian paper-cutout style (Idea 2): every scene's choreography on desktop and phone, the visual language, the art asset list with how each asset gets made, and the content-file shape. Building and deploying come after this map.

## Notes

- Hard dates: site live at `thecheriari.vercel.app` by **Nov 3, 2026** (latest Nov 5). Planning should close by **Oct 31** so Nov 1–3 go to art + build.
- It's a **surprise**. All text, links and gallery photos come from one content file so they're easy to edit later.
- Art is **AI-generated** and cleaned up into layers; nobody on the team draws. Plenty of reference photos are available.
- Phones are a **must**, not an afterthought.
- Stack is settled: Vite + vanilla JS + GSAP ScrollTrigger, SVG/PNG layers.
- Skeleton/brain concept (Idea 1) is dropped.
- Grilling tickets: consult the `grilling` + `domain-modeling` skills; terms live in `/GLOSSARY.md`.

## Decisions so far

- Concept: Idea 2 only. Paper-cutout ¾ portrait centred, saree-pattern Ring around her head, scroll moves her and the patterns.
- Sections: Hero → About (college, branch, year) → Interests & Skills → Contact, plus a possible photo gallery. No personal note.
- Hero text: "Aarya Ingale" in an artistic display font.
- Pattern family: Bandhani, pink-led. She's from Maharashtra.
- Interactions: the Ring rotates with scroll; layers shift with cursor/tilt; interest motifs open on tap.
- Phone: the Portrait stays pinned at the bottom of the screen and the patterns move.
- Content lives in one content file; no CMS.
- Hero layout (from [hero sketch v1](assets/hero-sketch-v1.png)): "Hi! I'm Aarya Ingale" centred at top with only the name in the artistic font; a huge Ring centred on her head and cropped by the bottom edge like a rising arch; a head-and-shoulders bust of her rising from the bottom edge (bob, hair tucked behind one ear, earring). Sketch colours and the sketch's Ring pattern are placeholders only.
- The Ring is a detailed mandala-style design, not the simple dot band in the sketch.
- Final art is either a clean illustrated style or paper cutout (not decided yet). The Portrait stays a ¾ profile.
- Her eye follows the mouse on desktop. On phones it looks around on its own every few seconds. She blinks now and then.
- Clicking or tapping her makes her say "Hi!" in a speech bubble, and her earrings swing and shine.
- "What I'm upto right now" scene ([sketch](assets/now-sketch-v1.png)): the Portrait and Ring move to the bottom-right corner, both cropped by the screen edges, and she faces left toward the content. Heading at top-left, then short text blocks on the left and a small arrow button.
- Socials scene ([sketch](assets/socials-sketch-v1.png)): same bottom-right Portrait and Ring. The social links sit on an outer arc around the Ring and rotate along it as you scroll.
- [AI art pipeline for a layered paper-cutout portrait](tickets/03-ai-art-pipeline.md): Gemini master portrait, cut into layers in Photopea, procedural SVG Ring, AVIF/WebP layers.

- [Scene choreography: desktop and phone](tickets/01-scene-choreography.md): Hero → Now → Interests & Skills (arc list) → Socials (arc list). Portrait drops out and pops up bottom-right in a second, left-facing pose. Phone sizes are 50–70% in the Hero and 30% elsewhere.

## Not yet specified

- Photo gallery: after the Nov 3 version.
- Her real voice saying "Hi!": wanted later, alongside the speech bubble.
- Floating motifs around the Portrait: wanted later, nothing chosen to put there yet.
- Performance budget on phones: image sizes/formats for big layered art, lazy loading, `prefers-reduced-motion` fallback. Sharpens once the asset list exists.
- Loading/intro moment: does the paper "assemble" on first load? Depends on the choreography and asset list.
- Whether `thecheriari` as a Vercel project name is free. Check before the build starts.

## Out of scope

- Idea 1 (character → skeleton → brain): dropped by the user.
- CMS/admin panel: the content file covers editing.
- Personal note/footer message: not wanted.
