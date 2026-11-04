# 06 Arc lists: Interests & Skills, Socials

## Goal

The Interests & Skills and Socials scenes, each with its Arc list moving along the Ring as you scroll.

## Do

1. Build one Arc list component: items placed on an arc outside the Ring, moved along it by scroll progress, with labels always upright. Try highlighting the item at the left end of the arc and ask the user whether to keep it.
2. Interests & Skills: overview text on the left plus an Arc list of skills and interests from `content.js` (tap shows the one-line detail).
3. Socials: an Arc list of links from `content.js`, laid out per `wayfinder/assets/socials-sketch-v1.png`. Each item opens its URL.
4. Wire the Now → Interests → Socials transitions: the Portrait stays, the Ring keeps turning, the content swaps.

## Done when

Both scenes work on desktop with real `content.js` data, every link opens the right URL, and the user approves.

## Outcome

**Done, approved by the user 2026-11-04.** Interests & Skills and Socials work on desktop with real `content.js` data; every Socials href is right. Phone is functional but only lightly tuned: step 07 should refine it.
- `src/arc-list.js`: `arcList({ scene, list })`. Items are placed (never rotated, so labels stay upright) on an arc around the corner Ring at radius `r × gap + 14px`. Angles are degrees from straight up, positive towards the left. `WIDE` and `STACKED` parameter sets at the top of the file (lead angle, visible range, step, fade, gap, anchor) are the knobs for tuning. Scroll progress through the Scene turns the dial via a ScrollTrigger (`top top` → `bottom bottom`, eased 0.4s). A second trigger (`top 50%` → `bottom 50%`) rolls the items: in along the arc from the upper right (staggered, 0.75s), and out past the left end (0.6s) when you leave; scrolling back reverses it (`SWEEP`, `ROLL_IN`, `ROLL_OUT` in `arc-list.js`). No fade; it is time-based, so much faster than the scroll. With reduced motion it snaps. Interests → Socials is one list rolling out while the next rolls in. The item nearest the lead angle (left end of the arc) is highlighted: slightly larger, gold outline (kept by the user; recorded in SPEC.md).
- `src/stage.js`: `measure()` now records the corner Ring, exported as `cornerRing()` → `{ cx, up, r, stacked }` (centre x from the left, centre height above the bottom edge, radius).
- `src/main.js`: `arcScene()` builds a tall Scene (`.scene--arc`, height `100svh + --arc-steps × 30svh`) with its text in a sticky `.scene-pin` (title, overview, tap-detail panel). The Arc lists themselves live in a fixed `.arc-layer` (z-index 4, above the stage and the stacked blush fade) so they aren't covered on phones. Interests and skills share one list (skills in Paithani green); an item with a `detail` is a button that shows it in `.arc-detail`; Socials items are links (`target=_blank` for http URLs).
- `src/style.css`: `.scene--arc`, `.scene-pin`, `.arc-layer`, `.arc-list`, `.arc-item` styles. `overflow: clip` (not `hidden`) on arc Scenes so the pin sticks.
- Tap-detail card (`.arc-detail` in `style.css`, replay trigger in the click handler in `main.js`): paper card with a green border, inner gold zari line and two gold corner diamonds; it unfolds on each tap (name, then detail, rise in after it) and is hidden while empty. No animation under reduced motion.
- Reduced motion: scroll-linked turning is off; all items sit on the arc at once (compact step) and the Scene is one screen tall.
- `content.js`: the three TODO skills got a TODO `detail` so tap-to-show is visible; interests have no details so they aren't tappable. No icon set exists yet (`data-icon` is on each link, unused).
- For step 07: on phones the arc sits low over her head, pills are tight (`STACKED`: lead 48°, step 36°, gap 1.22, font 0.9rem). Socials has only 3 links, so its arc is sparse.
