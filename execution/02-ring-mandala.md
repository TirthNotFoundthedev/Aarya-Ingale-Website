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
