# 02 Ring mandala

## Goal

The real Ring: a detailed mandala built procedurally as SVG from separate concentric bands, in the spec palette, with neighbouring bands turning in opposite directions on scroll.

## Do

1. Ask the user for their reference mandala. If there isn't one yet, build from the prototype's band system (`buildMandala` in `prototypes/visual-language.prototype.html`) and come back to this step later.
2. Break the reference down into concentric bands: list each band's motif, count and radius, and confirm the breakdown with the user.
3. Build it as a module that renders the Ring into an SVG. Bands are grouped by rotation direction and speed.
4. Show the user, adjust, and settle whether each Scene recolours or rearranges the Ring or keeps it the same.

## Done when

The user has approved the Ring rendered in the real project, turning on scroll, and the per-Scene behaviour is written in `## Outcome`.

## Outcome

Done 2026-11-01. The user approved the Ring as rendered in the Hero.

**Reference:** three images from the user: a black-ink half mandala (drops, spirals, radial stripes), a black-ink sunflower mandala (dark centre, radial lines, pointed petals) and a painted dot mandala (rainbow, peacock arches, flame petals, bead ring, green fans with garlands, dot centre). The painted one sets the band order; the ink ones lend the drops and stripes. Recoloured into the SPEC palette.

**Bands** (outer → inner; radius ≈ where the band's motifs sit (each band also has a solid disc underneath), in the 1000×1000 box centred on 0,0; speed sign = direction):

| # | Band | Motif | Radius | Speed |
|---|---|---|---|---|
| 1 | peacock-arches | 32 plum scallops with peacock eyes (rani/gold/green), 32 hanging drops, gold dots between arches | 428–497 | +0.35 |
| 2 | feather-petals | 32 soft-pink flames with rani inner flame and white mirror diamond, gold dots between | 368–432 | −0.6 |
| 3 | bead-ring | 60 gold beads on plum | 339–360 | +0.9 |
| 4 | leaf-fans | 12 Paithani fans, gold dot garlands, rani drops, on deep green | 248–334 | −0.45 |
| 5 | stripe-ring | 72 rani stripes on soft pink | 224–252 | +0.8 |
| 6 | rosette | 16 soft-pink petals behind 16 paper-white petals with pale-pink centres | 120–214 | −0.9 |
| 7 | dot-core | rings of 36/24/16/10 dots, gold centre | 0–122 | +0.3 |

The centre is kept pale on purpose so her dark hair and face read against it; bands 6–7 sit mostly behind her head.

**Built**
- `src/ring.js`: `BANDS` (data above), `createRing({ className })` returns a decorative `div.ring` (aria-hidden, no pointer events) holding one `div.ring-band > svg` per band, outermost first. `spinRingOnScroll(ring)` turns each band by `scrollY × 0.12° × speed` through `gsap.quickTo` (0.8 s ease). With `prefers-reduced-motion: reduce` the bands stay at 0° (switching it on mid-scroll kills the running tweens and resets to 0°).
- Paper look: each band layer has a zero-offset soft shadow (`#ring-paper` filter, added to the page once by `createRing`), so the shadow doesn't swing as the band turns. A grain overlay (`.ring::after`) sits inside the scalloped edge. Each band is its own composited layer (`will-change: transform`), so turning doesn't re-rasterise the SVG.
- Colours are CSS custom properties (`style="fill:var(--…)"`). Two tints were added to `:root`: `--pink-pale #fbd3df`, `--paper #fff6ef`.
- `src/main.js` creates the Ring and starts the spin. Its size and position are set by `src/stage.js` (added later in steps 04/05; see those Outcomes).

**Per-Scene behaviour (decided):** the Ring stays the same in every Scene: no recolouring, no rearranging. Only its position and size change (Hero → corner in step 05), and it keeps turning.

**For later steps**
- Done since: the Ring now lives on the fixed stage in `src/stage.js`, so the name no longer overlaps it and it stays on screen in every Scene (see steps 04 and 05).
