# 07 Phone pass

## Goal

The whole site works properly on phones, per the Phone column in SPEC.md → Scenes.

## Do

1. Portrait + Ring at bottom centre: 50–70% of the screen height in the Hero, about 30% in the other scenes, with content above.
2. Arc lists curve over her head. Tap targets are at least 44px.
3. Tapping her still triggers "Hi!". Touch scrolling feels smooth (check ScrollTrigger pinning on iOS Safari and Android Chrome).
4. Check widths from 360px to 430px, plus a tablet width.

## Done when

The user has scrolled the deployed site on their own phone and approved it.

## Outcome

**Done, built 2026-11-04, approved by the user 2026-11-05.** The pane was hidden while testing, so its animation clock was stalled: live animation (the "Hi!" bubble's pop, Arc list rolls, scrubs) could not be judged there.

Checked statically in the browser pane at 360x640, 390x780, 430x380 (short), 768x1024 (portrait tablet): no horizontal overflow; Hero Ring clears the name and takes about 70% of the height; Now text clears the figure; a tap on the Hero portrait reaches the button and sets `is-poked` / `is-talking`.

Changed:
- `src/style.css`: Arc list pills and links are at least 44px tall (`min-height: 44px`, flex-centred; they were 34-37px). `touch-action: manipulation` and a transparent tap highlight on `.arc-item` and `.portrait`.
- `src/arc-list.js`: on stacked screens each pill's x is clamped to stay `EDGE_PX` (8px) inside the screen. Before, "TODO skill 2" clipped off the right edge at 390px. Checked at 360 and 390: no visible pill outside the screen at any dial position.

Not checked, for the user's phone (or step 08): the bubble's look and size on a real phone; iOS Safari / Android Chrome scroll feel and pinning (`.scene-pin` sticky, `overflow: clip`) and address-bar resize; reduced-motion crossfade (05) and reduced-motion Arc lists; the Socials arc is sparse with only 3 links. The bubble is positioned for desktop art; step 08 re-tunes it.
