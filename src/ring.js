// The Ring: a paper-cutout mandala built as stacked SVG layers, one per band.
// Each band is its own layer so it can turn on its own; neighbouring bands turn in opposite directions.
// Drawn in a 1000×1000 box centred on 0,0. Outer edge reaches r≈497.
// Colours come from the palette's CSS custom properties. The Ring looks the same in every Scene (SPEC.md).

import gsap from 'gsap';
import { createDetents } from './spin-sfx.js';

const DEG_PER_PX = 0.12; // how far a speed-1 band turns per pixel scrolled

// ---------- geometry helpers ----------

const f = (n) => Math.round(n * 100) / 100;

// Point at `angle` degrees clockwise from straight up, at radius r.
function polar(angle, r) {
  const a = (angle * Math.PI) / 180;
  return [f(r * Math.sin(a)), f(-r * Math.cos(a))];
}

const paint = (fill) => `style="fill:var(--${fill})"`;

function disc(r, fill) {
  return `<circle r="${r}" ${paint(fill)}/>`;
}

// `count` copies of a motif around the circle at radius r. The motif is drawn pointing up (-y = outward).
function around(count, r, motif, { offset = 0 } = {}) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const angle = offset + (i * 360) / count;
    out += `<g transform="rotate(${f(angle)}) translate(0 ${-r})">${motif}</g>`;
  }
  return out;
}

// ---------- motifs (local coords, tip points up = outward) ----------

const M = {
  // Half-ellipse bump: the scalloped outer edge.
  arch: (w, h) => `M${f(-w / 2)} 0 A${f(w / 2)} ${h} 0 0 1 ${f(w / 2)} 0Z`,
  // Teardrop, round end at the bottom, point at the top.
  drop: (s) =>
    `M0 ${f(-s)} C${f(s * 0.7)} ${f(-s * 0.3)} ${f(s * 0.62)} ${f(s * 0.6)} 0 ${f(s * 0.62)} C${f(-s * 0.62)} ${f(s * 0.6)} ${f(-s * 0.7)} ${f(-s * 0.3)} 0 ${f(-s)}Z`,
  // Flame / feather petal with its tip swept slightly sideways.
  flame: (w, h, lean = 0.25) =>
    `M${-w} 0 C${-w} ${f(-h * 0.45)} ${f(-w * 0.35)} ${f(-h * 0.75)} ${f(w * lean)} ${-h} C${f(w * 0.45)} ${f(-h * 0.7)} ${w} ${f(-h * 0.45)} ${w} 0Z`,
  // Pointed oval petal, base at 0.
  petal: (w, h) =>
    `M0 0 C${f(-w)} ${f(-h * 0.25)} ${f(-w * 0.8)} ${f(-h * 0.75)} 0 ${-h} C${f(w * 0.8)} ${f(-h * 0.75)} ${w} ${f(-h * 0.25)} 0 0Z`,
  // Fan leaf with a notched top (the big green leaves in the reference).
  fan: (w, h) =>
    `M0 0 C${f(-w * 0.25)} ${f(-h * 0.3)} ${-w} ${f(-h * 0.45)} ${-w} ${f(-h * 0.82)} Q${f(-w * 0.55)} ${f(-h * 1.08)} 0 ${f(-h * 0.8)} Q${f(w * 0.55)} ${f(-h * 1.08)} ${w} ${f(-h * 0.82)} C${w} ${f(-h * 0.45)} ${f(w * 0.25)} ${f(-h * 0.3)} 0 0Z`,
  diamond: (w, h) => `M0 ${-h} L${w} 0 L0 ${h} L${-w} 0Z`,
};

const path = (d, fill) => `<path d="${d}" ${paint(fill)}/>`;
const dot = (r, fill, cy = 0) => `<circle cy="${cy}" r="${r}" ${paint(fill)}/>`;

// Dots hanging in a sagging garland between two angles.
function swag(a0, a1, r, sag, n, size, fill) {
  let out = '';
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const [x, y] = polar(a0 + t * (a1 - a0), r - sag * Math.sin(Math.PI * t));
    out += `<circle cx="${x}" cy="${y}" r="${size}" ${paint(fill)}/>`;
  }
  return out;
}

// ---------- bands, outermost first (each later band is a paper layer on top) ----------

const BANDS = [
  {
    name: 'peacock-arches',
    speed: 0.35,
    draw: () =>
      disc(442, 'plum') +
      around(32, 440, path(M.arch(87, 40), 'plum')) +
      around(32, 488, path(M.drop(9), 'plum'), { offset: 5.625 }) +
      around(32, 452, path(M.drop(17), 'rani') + path(M.drop(11), 'gold') + dot(5.5, 'paithani', 4) + dot(2.2, 'plum', 5)) +
      around(32, 432, dot(3.5, 'gold'), { offset: 5.625 }),
  },
  {
    name: 'feather-petals',
    speed: -0.6,
    draw: () =>
      disc(372, 'plum') +
      around(32, 368, path(M.flame(34, 62), 'pink-soft')) +
      around(32, 368, path(M.flame(20, 44, 0.35), 'rani') + `<g transform="translate(0 -24)">${path(M.diamond(5, 9), 'paper')}</g>`) +
      around(32, 418, dot(4, 'gold') + dot(2.6, 'gold', -11) + dot(2.6, 'gold', 11), { offset: 5.625 }),
  },
  {
    name: 'bead-ring',
    speed: 0.9,
    draw: () => disc(360, 'plum') + around(60, 346, dot(7.5, 'gold')) + around(60, 346, dot(2.5, 'magenta')),
  },
  {
    name: 'leaf-fans',
    speed: -0.45,
    draw: () => {
      let swags = '';
      for (let i = 0; i < 12; i++) {
        const a = i * 30;
        swags += swag(a + 4, a + 26, 302, 22, 8, 3, 'gold');
        const [x, y] = polar(a + 15, 268);
        swags += `<g transform="translate(${x} ${y}) rotate(${a + 15 + 180})">${path(M.drop(8), 'rani')}</g>`;
      }
      return (
        disc(334, 'paithani-deep') +
        swags +
        around(12, 248, path(M.fan(40, 82), 'paithani') + path(M.fan(26, 58), 'paithani-deep') + path(M.fan(14, 36), 'gold') + `<g transform="translate(0 -46)">${path(M.diamond(5, 10), 'paper')}</g>`) +
        around(12, 318, dot(5, 'gold') + dot(3, 'gold', -13), { offset: 15 })
      );
    },
  },
  {
    name: 'stripe-ring',
    speed: 0.8,
    draw: () =>
      disc(252, 'pink-soft') +
      around(72, 238, `<rect x="-1.6" y="-11" width="3.2" height="22" rx="1.6" ${paint('rani')}/>`) +
      `<circle r="224" style="fill:none;stroke:var(--rani);stroke-width:3"/>`,
  },
  {
    name: 'rosette',
    speed: -0.9,
    draw: () =>
      disc(214, 'pink-pale') +
      around(16, 120, path(M.petal(30, 92), 'pink-soft'), { offset: 11.25 }) +
      around(16, 120, path(M.petal(26, 80), 'paper') + path(M.petal(12, 46), 'pink-pale')),
  },
  {
    name: 'dot-core',
    speed: 0.3,
    draw: () =>
      disc(122, 'paper') +
      around(36, 104, dot(4, 'pink-soft')) +
      around(24, 82, dot(4, 'gold')) +
      around(16, 60, dot(4.5, 'rani')) +
      around(10, 38, dot(4.5, 'pink-soft')) +
      disc(20, 'gold') +
      disc(8, 'rani'),
  },
];

// ---------- DOM ----------

const SVG_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
  <filter id="ring-paper" x="-10%" y="-10%" width="120%" height="120%">
    <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#4a1530" flood-opacity=".45"/>
  </filter>
</defs></svg>`;

// Build the Ring. Returns a decorative element; size and place it with CSS.
export function createRing({ className = '' } = {}) {
  const ring = document.createElement('div');
  ring.className = `ring ${className}`.trim();
  ring.setAttribute('aria-hidden', 'true');
  // The shared filter is added to the page once, however many Rings are made.
  if (!document.getElementById('ring-paper')) document.body.insertAdjacentHTML('afterbegin', SVG_DEFS);
  ring.innerHTML =
    BANDS.map(
      (band) =>
        `<div class="ring-band" data-band="${band.name}" data-speed="${band.speed}"><svg viewBox="-500 -500 1000 1000" focusable="false"><g filter="url(#ring-paper)">${band.draw()}</g></svg></div>`,
    ).join('');
  return ring;
}

// Turn each band with scroll at its own speed and direction. Off when the visitor prefers reduced motion.
export function spinRingOnScroll(ring) {
  const turner = (el) => gsap.quickTo(el, 'rotation', { duration: 0.8, ease: 'power3.out' });
  const bands = [...ring.querySelectorAll('.ring-band')].map((el) => ({ el, speed: Number(el.dataset.speed), to: turner(el) }));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  function update() {
    if (reduced.matches) return;
    for (const band of bands) band.to(scrollY * DEG_PER_PX * band.speed);
  }
  function onMotionPreference() {
    if (!reduced.matches) return update();
    for (const band of bands) {
      // Stop any turn still easing toward the old angle, then start a fresh turner for later.
      gsap.killTweensOf(band.el);
      gsap.set(band.el, { clearProps: 'rotation' }); // back to no inline turn, as on a fresh load
      band.to = turner(band.el);
    }
  }

  // Detent clicks follow the bead band's real (eased) angle, one per bead.
  const beads = ring.querySelector('[data-band="bead-ring"]');
  const detents = createDetents({ step: 6, fast: 260 });
  detents.reset(gsap.getProperty(beads, 'rotation'));
  gsap.ticker.add(() => detents.update(gsap.getProperty(beads, 'rotation')));

  addEventListener('scroll', update, { passive: true });
  reduced.addEventListener('change', onMotionPreference);
  update();
}
