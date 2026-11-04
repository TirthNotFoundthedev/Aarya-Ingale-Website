# 04 Hero scene

## Goal

The Hero, fully alive on desktop: headline, Ring and Portrait (the Hero image from step 03) placed as in the hero sketch, with the tap interaction.

## Do

1. Lay out the Hero per SPEC.md → Scenes and `wayfinder/assets/hero-sketch-v1.png`.
2. Show the Portrait as a `<picture>` of `public/art/hero-{1600|1200}.{avif|webp}` (see SPEC.md → Portrait → Files).
3. Port tap → "Hi!" bubble plus earring sparkle from the prototype, and `prefers-reduced-motion`. No eye, blink, swing or parallax (deferred, see SPEC.md → After Nov 3).
4. Make scroll turn the Ring's bands.

## Done when

On desktop, every interaction in SPEC.md → Interactions works in the real project, and the user has seen it.

## Outcome

**Done, 2026-11-04, approved by the user.** The tap → "Hi!" bubble and earring sparkle were added last:
- Each pose is a `<button class="portrait portrait--{pose}">` (built by `portrait()` in `src/main.js`) wrapping the `<picture>`, a `.sparkle` (two `<i>` stars) and a `.bubble` (text from `content.bubble`). A click calls `poke()`, which adds `is-poked` and `is-talking` (the latter removed after `BUBBLE_MS` = 1800ms). Styles are in the "Portrait" section of `src/style.css`; the bubble and stars are sized in `cqw` (the button is a size container), so they scale with her. `stage.js` still sizes and moves the button as before.
- Bubble sits at the upper left of the head (`left: -2%; top: -1%`), sparkle at the earring (0.63, 0.62 of the art), the same in both poses. Step 08 re-tunes placement. The tap, bubble and sparkle were only checked on desktop (browser pane), not on a phone or a phone-width window; that is step 07's check.
- Reduced motion: the bubble fades without scaling; the sparkle fades without spinning.
- `.claude/launch.json` was added for the dev server preview.

Earlier, partial work (2026-11-01 to 11-02), done at the user's request together with step 05's move:
- The Hero layout lives in `src/stage.js` → `measure()`. Ring and both poses sit on a fixed `.stage` behind the Scenes (it comes last in `#app` so screen readers meet the name first). Every placement hangs from the stage's bottom edge (`top: 100%` plus negative y), so a phone's address bar can't open a gap under her.
- The Ring is centred on her head with radius 0.81 × the portrait width. `HEAD` holds the measured centre: the middle of the bounding box of the head silhouette (hair + face, down to the jaw where it narrows into the neck), taken from the alpha channel of `hero-1200.webp` and `corner-1200.webp`. Hero pose (0.532, 0.385), Corner pose (0.532, 0.389) as fractions of the art. The portrait is as big as fits under the name: its width is the smallest of 90% of the screen width (110% when stacked), 640px, and what keeps the Ring's top edge clear of the name's script tails (`NAME_TAILS`) plus a gap. When stacked, Ring + Portrait are also capped at 70% of the height (`HERO_MAX_SHARE`). Clearing the name always wins over size: the only floor is 1px (`MIN_HERO_W`), and if there's no room under the name at all (about 150px tall or less on wide screens, about 110px on phones; the cutoff varies with the gutter, 5vw at 20–64px, and the text size, since the name is already at its 2.5rem floor there) the Hero figure starts below the bottom edge instead. The bottom 10% of the bust is cropped (`HERO_CROP`).
- The Hero is sized for the smallest viewport height (`min(stage height, Hero Scene height)`, the Scene being 100svh), because the name is in svh. A phone's address bar collapsing or returning can't push the Ring into the name. The gutter is read from the Scene's computed padding, so it follows `--gutter` in `style.css`.
- The name (`clamp(2.5rem, min(11vw, 15svh), 7.5rem)`) and the greeting shrink on short screens, so the Ring keeps its room.
- The Hero pose `<img>` has `fetchpriority="high"`. Both `<picture>`s have `sizes` approximating the widths in `measure()`. They are built from `STACKED_CONDITION`, exported by `src/stage.js`, so the breakpoint lives in one place.
- The stage stays hidden until the fonts are ready, but waits at most 2s (`FONT_WAIT`); if the fonts arrive later it re-measures.
- For the tap: the Scenes sit above the stage (z-index 1) with `pointer-events: none` on each `.scene` and `auto` on its children, so empty parts of a Scene already let a tap through. Give the visible portrait `pointer-events: auto` (the stage itself has `none`).
