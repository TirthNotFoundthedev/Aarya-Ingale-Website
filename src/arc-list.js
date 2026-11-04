// Arc list: items on an arc just outside the corner Ring, slid along it by scroll like a turning dial.
// Labels stay upright (the items are placed, not rotated). The list lives in a fixed layer; its Scene is
// taller than the screen and its scroll progress turns the dial. The item at the left end of the arc leads.
// SPEC.md → Scenes → Arc list.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cornerRing } from './stage.js';
import { createDetents } from './spin-sfx.js';

const REDUCED = '(prefers-reduced-motion: reduce)';

// Angles are degrees round the Ring's centre, 0 = straight up, positive = towards the left.
// `lead` is the left end of the arc; items are visible between `min` and `max`, fading over `fade` degrees.
// `step` is the angle between neighbours. Wide: a quarter-circle down the left side of the Ring.
// Stacked: a rainbow over her head. `anchor` pins the pill's inner edge to the arc on the left side so it
// never overlaps the Ring; stacked keeps pills centred so they stay on screen.
const WIDE = { lead: 95, min: -35, max: 135, step: 26, fade: 14, gap: 1.1, anchor: true };
const STACKED = { lead: 48, min: -75, max: 62, step: 36, fade: 12, gap: 1.22, anchor: false };
const GAP_PX = 14; // extra clearance beyond the Ring's scalloped edge
const EDGE_PX = 8; // stacked pills stay this far from the screen's side edges
const LEAD_GROW = 0.1; // the lead item is this much bigger
const SWEEP = 200; // degrees an item is rolled off the arc: far enough that every item is out of sight
const ROLL_IN = { duration: 0.75, ease: 'power3.out', stagger: 0.06 }; // quicker than the scroll
const ROLL_OUT = { duration: 0.6, ease: 'power2.in', stagger: 0.04 };

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

export function arcList({ scene, list }) {
  const items = [...list.children];
  const reduced = matchMedia(REDUCED);
  const dial = { p: 0 }; // 0..1 through the Scene, eased
  // Each item's roll: -1 = waiting off the arc at the upper right, 0 = on the arc, 1 = rolled off past the left end.
  const rolls = items.map(() => ({ e: -1 }));
  // Detent clicks: a heavier click every half item as the dial turns, and a short ratchet as items roll in or out.
  const dialClick = createDetents({ step: 0.5, fast: 4, kind: 'arc' });
  const rollClick = createDetents({ step: 0.25, fast: 2.5, kind: 'arc' });

  function render() {
    const ring = cornerRing();
    if (!ring) return;
    const set = ring.stacked ? STACKED : WIDE;
    const n = items.length;
    const still = reduced.matches; // no scroll-linked motion: all items sit on the arc at once
    const step = still ? Math.min(set.step, (set.lead - set.min - 10) / Math.max(n - 1, 1)) : set.step;
    const shift = still ? 0 : dial.p * (n - 1) * step;
    const radius = ring.r * set.gap + GAP_PX;
    items.forEach((li, i) => {
      const angle = set.lead - i * step + shift + rolls[i].e * SWEEP;
      const rad = (angle * Math.PI) / 180;
      const near = clamp(1 - Math.abs(angle - set.lead) / step) * (rolls[i].e === 0);
      let x = ring.cx - radius * Math.sin(rad);
      if (!set.anchor) {
        const half = li.offsetWidth / 2 + EDGE_PX; // keep a centred pill fully on screen
        x = clamp(x, half, Math.max(half, document.documentElement.clientWidth - half));
      }
      gsap.set(li, {
        x,
        y: -(ring.up + radius * Math.cos(rad)), // items hang from the bottom edge, like the stage
        xPercent: set.anchor ? -(50 + 50 * Math.sin(rad)) : -50,
        yPercent: -50,
        scale: 1 + LEAD_GROW * near,
        autoAlpha: clamp((angle - set.min) / set.fade) * clamp((set.max - angle) / set.fade),
      });
      li.classList.toggle('is-lead', near > 0.5);
    });
  }

  const turnTo = (p) => {
    if (reduced.matches) p = 0;
    gsap.to(dial, {
      p,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: true,
      onUpdate: () => {
        render();
        dialClick.update(dial.p * (items.length - 1));
      },
    });
  };

  // The dial turns while the Scene fills the screen...
  ScrollTrigger.create({
    trigger: scene,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => turnTo(self.progress),
    onRefresh: (self) => {
      gsap.killTweensOf(dial);
      dial.p = reduced.matches ? 0 : self.progress;
      dialClick.reset(dial.p * (items.length - 1));
      render();
    },
  });
  // ...and the items roll along the arc when the Scene is half in view: in from the upper right, out past the
  // left end. Scrolling back reverses it. Much quicker than the scroll itself.
  const roll = (to, from) => {
    gsap.killTweensOf(rolls);
    if (reduced.matches) {
      rolls.forEach((r) => (r.e = to));
      return render();
    }
    rollClick.reset(from);
    gsap.fromTo(rolls, { e: from }, {
      e: to,
      ...(to === 0 ? ROLL_IN : ROLL_OUT),
      onUpdate: () => {
        render();
        rollClick.update(rolls[0].e); // the first item leads the roll
      },
    });
  };
  ScrollTrigger.create({
    trigger: scene,
    start: 'top 50%',
    end: 'bottom 50%',
    onEnter: () => roll(0, -1),
    onEnterBack: () => roll(0, 1),
    onLeave: () => roll(1, 0),
    onLeaveBack: () => roll(-1, 0),
    onRefresh: (self) => {
      gsap.killTweensOf(rolls);
      const e = self.isActive ? 0 : self.progress >= 1 ? 1 : -1;
      rolls.forEach((r) => (r.e = e));
      render();
    },
  });
  reduced.addEventListener('change', () => {
    dial.p = 0;
    dialClick.reset(0);
    render();
  });
}
