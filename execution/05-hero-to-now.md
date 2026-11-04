# 05 Hero → Now

## Goal

The scroll moment from Hero to Now, and the Now scene itself, on desktop.

## Do

1. Build the Now layout per SPEC.md and `wayfinder/assets/now-sketch-v1.png`: Ring and Portrait in the bottom-right corner, cropped by the edges, with the overview text on the left from `content.js`.
2. Build the transition with GSAP ScrollTrigger: the Ring travels to the corner, the Portrait drops out of the bottom, the pose swaps (use a mirrored or rotated placeholder until the Corner pose art exists), and it pops up from the right.
3. Make it scrub cleanly both ways, scrolling down and back up.

## Done when

Scrolling Hero → Now → back to Hero plays smoothly with no jumps, and the user approves the feel.

## Outcome

**Done, built 2026-11-01 to 11-02, feel approved by the user 2026-11-04.** Built in `src/stage.js`:
- `scrubbedMove()` is a ScrollTrigger timeline on the Hero (`start: 'top top'`, `end: 'bottom 40%'`, `scrub: 0.6`, `invalidateOnRefresh`), so everything has settled before the Now text reaches the figure. The Ring moves sideways with `power2.out` and moves vertically and resizes with `power2.inOut`. The Hero pose drops out of the bottom in the first 30%. At 50% the Corner pose (the real `corner` art) pops up from the bottom-right with `back.out(1.4)`. The two poses are never visible together, and scrolling back up reverses everything.
- Corner layout: when `STACKED` (`(width < 700px), (max-aspect-ratio: 4/5)`: phones and portrait tablets) the figure sits bottom-centre with Ring radius `min(16.7vh, 45vw)`. Otherwise it sits bottom-right with radius `min(50vh, 40vw)`, its centre R·0.5 in from the right edge and R·0.8 up from the bottom. `measure()` sets `--figure-right` / `--figure-bottom`, which pad the later Scenes clear of the figure.
- Stacked pop-in: the Corner pose rises straight up from below at its final x (`geo.cornerFromX`, re-evaluated on refresh); on wide screens it still enters from past the right edge.
- Stacked layering and fade overlay: on stacked screens (`(width < 700px), (max-aspect-ratio: 4/5)`, matching `STACKED` in `src/stage.js`), `.stage` sits above the Scenes (`z-index: 3`). A decorative fixed overlay element (`.stage-fade`, `z-index: 2`, `aria-hidden="true"`, `pointer-events: none`, created in `src/main.js` and styled in `src/style.css`) covers the viewport with `var(--blush)` and the paper-grain noise SVG, masked to fade from 100% opaque at the bottom edge to transparent at 50% viewport height. Text in `.scene` (`z-index: 1`) scrolling up stays behind the character and the fade, fading in at mid-screen and resting in the top half above the character. Wide screens stay unchanged (`.stage` `z-index: 0`, `.stage-fade` `display: none`).
- Reduced motion (`gsap.matchMedia`): `crossfade()` replaces the travel. Halfway through the Hero the figure fades out and fades back in at the corner. The Ring is moved by a callback at the invisible moment (placed for the direction of travel, `tl.reversed()`), not by a tween, so a resize or a reload while scrolled can't restore a stale position. `onRefresh` parks the timeline at the matching end and sets the positions by hand.
- Layout is re-measured on every ScrollTrigger refresh and after `document.fonts.ready`; the stage stays hidden (`.is-ready`) until then, or for 2s at most (`FONT_WAIT`), and re-measures if the fonts land later.
- Dev-only `window.__settleStage()` jumps the scrub to the current scroll so headless screenshots are exact (in reduced motion, where there is no scrub, it only refreshes). It is stripped from production builds.
- Switching the motion preference while the page is open rebuilds the move through `gsap.matchMedia`. That rebuild's ScrollTrigger refresh jumps to the top, so `playStage()` stores the scroll position in the matchMedia cleanup (`keepY`) and restores it in a `'refresh'` listener that acts once per rebuild. It then calls the static `ScrollTrigger.update()` (an instance update would read the stale cached scroll) and snaps the scrub, so the figure never flashes the Hero layout. Later steps get the scroll restore and the update for free, but a scrub they add must be snapped the same way (`getTween()?.progress(1)`) in that listener, and they shouldn't add a second restore.
