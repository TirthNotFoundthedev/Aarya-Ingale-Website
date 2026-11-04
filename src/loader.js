// The page-load Scene: a wrapped gift with a confirmation gate. The click satisfies the autoplay policy,
// then the paper is cut away, the Ring unfurls band by band and the name draws in (SPEC.md → Loader).
// The real page is already built underneath (inert until the loader is gone), so the handoff is a fade.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { content } from './content.js';
import { createRing } from './ring.js';
import { chime, click, pop, rememberedSound, setSoundEnabled, silence, unlockAudio, whoosh } from './loader-sfx.js';
import { setSoundEnabled as setSpinSound, unlockAudio as unlockSpinAudio } from './spin-sfx.js';

const REDUCED = '(prefers-reduced-motion: reduce)';
const ANIMATION_S = 4.2; // click → handoff done, full animation
const LOAD_CAP_MS = 6000; // a slow asset never keeps her out longer than this
const HARD_CAP_MS = 12000; // this long after the animation starts the loader is gone, whatever happens
const GATE_FONT_WAIT_MS = 1200; // the gate shows after this even if the fonts are still loading
const TEETH = 14; // zigzag teeth on the cut edge of the wrapping paper
const TOOTH = 14; // px depth of a tooth

function make(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
}

// Resolve when `promise` does, fails, or after `ms`, whichever comes first.
function withCap(promise, ms = LOAD_CAP_MS) {
  return Promise.race([Promise.resolve(promise).catch(() => {}), new Promise((resolve) => setTimeout(resolve, ms))]);
}

// A cut-paper zigzag clip along one vertical edge: the right edge of the left sheet, or the left edge of the right one.
function zigzag(side) {
  const teeth = Array.from({ length: TEETH + 1 }, (_, i) => ({ y: (i / TEETH) * 100, deep: i % 2 === 1 }));
  if (side === 'right') {
    return `polygon(0 0, 100% 0, ${teeth.map((p) => `${p.deep ? `calc(100% - ${TOOTH}px)` : '100%'} ${p.y}%`).join(', ')}, 0 100%)`;
  }
  return `polygon(100% 0, 100% 100%, ${teeth.reverse().map((p) => `${p.deep ? `${TOOTH}px` : '0'} ${p.y}%`).join(', ')})`;
}

const BOW = `<svg viewBox="0 0 120 70" aria-hidden="true" focusable="false">
  <path d="M60 46 C38 70 6 66 4 40 C2 16 34 6 60 40 Z" fill="#e9c46a"/>
  <path d="M60 46 C82 70 114 66 116 40 C118 16 86 6 60 40 Z" fill="#e9c46a"/>
  <path d="M58 44 C42 58 20 56 17 41 C16 28 36 22 58 42 Z" fill="#d9a93a"/>
  <path d="M62 44 C78 58 100 56 103 41 C104 28 84 22 62 42 Z" fill="#d9a93a"/>
  <circle cx="60" cy="40" r="11" fill="#e9c46a" stroke="#c9972a" stroke-width="2"/>
</svg>`;

function build() {
  const t = content.loader;
  const root = make('div', 'loader', { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'loader-title', 'aria-describedby': 'loader-eyebrow' });

  // Behind the paper: the Ring and the name.
  const ring = createRing({ className: 'loader-ring' });
  const name = make('p', 'loader-name', { 'aria-hidden': 'true' });
  name.textContent = content.name;
  const sparkles = make('div', 'loader-sparkles', { 'aria-hidden': 'true' });
  for (let i = 0; i < 12; i++) sparkles.append(make('i'));
  const reveal = make('div', 'loader-reveal');
  reveal.append(ring, sparkles, name);

  // The wrapped gift.
  const wrap = make('div', 'loader-wrap', { 'aria-hidden': 'true' });
  const left = make('div', 'loader-paper loader-paper--left');
  const right = make('div', 'loader-paper loader-paper--right');
  left.style.clipPath = zigzag('right');
  right.style.clipPath = zigzag('left');
  const ribbonV = make('div', 'loader-ribbon loader-ribbon--v');
  const ribbonH = make('div', 'loader-ribbon loader-ribbon--h');
  wrap.append(left, right, ribbonV, ribbonH);

  // The tag with the gate buttons.
  const card = make('div', 'loader-card');
  const bow = make('div', 'loader-bow', { 'aria-hidden': 'true' });
  bow.innerHTML = BOW;
  const eyebrow = make('p', 'loader-eyebrow', { id: 'loader-eyebrow' });
  eyebrow.textContent = t.eyebrow;
  const title = make('h1', 'loader-title', { id: 'loader-title' });
  title.textContent = t.title;
  const sound = make('button', 'loader-button loader-button--primary', { type: 'button' });
  sound.textContent = t.withSound;
  const quiet = make('button', 'loader-button', { type: 'button' });
  quiet.textContent = t.withoutSound;
  const buttons = make('div', 'loader-buttons');
  buttons.append(sound, quiet);
  const fill = make('i');
  const bar = make('div', 'loader-progress', { 'aria-hidden': 'true' });
  bar.append(fill);
  const status = make('p', 'loader-status');
  status.textContent = t.loading;
  card.append(bow, eyebrow, title, buttons, bar, status);

  root.append(reveal, wrap, card);
  return { root, reveal, ring, name, sparkles, wrap, left, right, ribbonV, ribbonH, card, bow, sound, quiet, fill, status };
}

// Real progress: the fonts and the Hero and Corner art. Each task is capped so a stalled one can't hold things up.
function trackLoading(images, onProgress) {
  const fonts = Promise.all(['1em Allura', '1em "Yatra One"', '1em "Rozha One"', '1em Lora', '1em Kalam'].map((face) => document.fonts.load(face))).then(
    () => document.fonts.ready,
  );
  const tasks = [fonts, ...images.map((img) => (img.decode ? img.decode() : Promise.resolve()))].map((task) => withCap(task));
  let done = 0;
  for (const task of tasks) task.then(() => onProgress(++done / tasks.length));
  return Promise.all(tasks);
}

export function playLoader({ app, images = [] }) {
  const t = content.loader;
  const html = document.documentElement;
  const ui = build();
  const live = make('p', 'sr-only', { 'aria-live': 'polite', role: 'status' });
  let finished = false;
  let started = false;
  let tl = null;
  const keys = new AbortController(); // removes the Escape listener when the loader ends

  // Lock scroll and the page underneath until the loader is gone.
  html.classList.add('is-loading');
  app.inert = true;
  history.scrollRestoration = 'manual'; // a reload must land on the Hero, not where she was
  scrollTo(0, 0);
  document.body.append(ui.root, live);

  const finish = () => {
    if (finished) return;
    finished = true;
    tl?.kill();
    gsap.killTweensOf([ui.root, ui.card, ui.bow, ui.fill]);
    ui.root.remove();
    html.classList.remove('is-loading');
    app.inert = false;
    keys.abort();
    scrollTo(0, 0);
    ScrollTrigger.refresh(); // the scrollbar is back; remeasure the Stage
    live.textContent = t.welcome;
    setTimeout(() => live.remove(), 4000);
    // Leave focus at the top of the page, not on a button that no longer exists.
    app.setAttribute('tabindex', '-1');
    app.focus({ preventScroll: true });
    app.addEventListener('blur', () => app.removeAttribute('tabindex'), { once: true });
  };

  gsap.set(ui.fill, { scaleX: 0 });
  const loading = trackLoading(images, (value) => gsap.to(ui.fill, { scaleX: value, duration: 0.4, ease: 'power2.out' }));
  loading.then(() => {
    ui.status.textContent = t.ready;
    ui.card.classList.add('is-ready');
  });

  // The gate appears once the fonts are in (or after a moment), so its text never swaps fonts under the visitor.
  const showGate = () => {
    if (ui.root.classList.contains('is-gated') || finished || started) return;
    ui.root.classList.add('is-gated');
    if (!matchMedia(REDUCED).matches) {
      gsap.fromTo(ui.card, { y: -40, rotation: -3, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.5)', clearProps: 'rotation' });
      gsap.fromTo(ui.bow, { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.5, delay: 0.35, ease: 'back.out(2.5)' });
    }
    (rememberedSound() === false ? ui.quiet : ui.sound).focus({ preventScroll: true });
  };
  withCap(document.fonts.ready, GATE_FONT_WAIT_MS).then(showGate);

  async function begin(withSound) {
    if (started) return;
    started = true;
    setSoundEnabled(withSound);
    setSpinSound(withSound); // the dial clicks follow the gate's choice
    if (withSound) {
      unlockAudio(); // inside the click: this is what the autoplay policy needs
      unlockSpinAudio();
    }
    ui.sound.disabled = ui.quiet.disabled = true;
    gsap.killTweensOf([ui.card, ui.bow]); // a quick Enter must not fight the gate's own entrance
    // Normally already loaded behind the gate; otherwise wait, but never past the cap.
    await withCap(loading, LOAD_CAP_MS);
    if (finished) return;
    setTimeout(finish, HARD_CAP_MS);
    try {
      tl = matchMedia(REDUCED).matches ? calmReveal(ui, finish) : unwrap(ui, finish);
    } catch {
      finish();
      return;
    }
    // A click, tap or Escape while it plays skips ahead to the Hero.
    const skip = () => {
      silence();
      tl?.timeScale(6);
    };
    ui.root.addEventListener('pointerdown', skip, { once: true });
    addEventListener('keydown', (event) => event.key === 'Escape' && skip(), { signal: keys.signal });
  }

  ui.sound.addEventListener('click', () => begin(true));
  ui.quiet.addEventListener('click', () => begin(false));
  ui.root.addEventListener('keydown', (event) => event.key === 'Escape' && !started && begin(false));
}

// Reduced motion: the card and paper fade away to the Hero, with the chime if sound is on. No movement.
function calmReveal(ui, done) {
  const tl = gsap.timeline({ onComplete: done });
  tl.call(chime, [], 0.1)
    .to(ui.card, { opacity: 0, duration: 0.4 }, 0)
    .to(ui.root, { opacity: 0, duration: 0.6, ease: 'power1.inOut' }, 0.5);
  return tl;
}

function unwrap(ui, done) {
  const bands = [...ui.ring.querySelectorAll('.ring-band')].reverse(); // inside out
  const stars = [...ui.sparkles.children];
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: done });

  gsap.set(bands, { scale: 0, opacity: 0 });
  gsap.set(ui.name, { clipPath: 'inset(-30% 100% -30% -5%)' });
  gsap.set(stars, { scale: 0, opacity: 0 });

  // 1. The tag drops away, the bow pops, the ribbons slip off.
  tl.call(click, [], 0)
    .to(ui.bow, { scale: 1.25, duration: 0.14, ease: 'power2.out' }, 0)
    .to(ui.bow, { scale: 0, rotation: 25, duration: 0.22, ease: 'power2.in' }, 0.14)
    .to(ui.card, { y: 180, rotation: 7, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0.05)
    .call(whoosh, [{ duration: 0.55, from: 700, to: 3000, level: 0.35 }], 0.25)
    .to(ui.ribbonV, { yPercent: -105, duration: 0.55, ease: 'power3.in' }, 0.28)
    .to(ui.ribbonH, { xPercent: 105, duration: 0.55, ease: 'power3.in' }, 0.34)
    // 2. The paper parts along its cut edge.
    .call(whoosh, [{ duration: 0.9, from: 300, to: 2200, level: 0.55 }], 0.8)
    .to(ui.left, { xPercent: -102, rotation: -2, duration: 0.95, ease: 'power3.inOut' }, 0.8)
    .to(ui.right, { xPercent: 102, rotation: 2, duration: 0.95, ease: 'power3.inOut' }, 0.8);

  // 3. The Ring unfurls band by band, a pop for each, then keeps turning gently.
  const ringAt = 1.45;
  bands.forEach((band, i) => {
    const at = ringAt + i * 0.13;
    tl.to(band, { scale: 1, opacity: 1, duration: 0.75, ease: 'back.out(1.5)' }, at)
      .fromTo(band, { rotation: i % 2 ? 100 : -100 }, { rotation: 0, duration: 0.95, ease: 'power3.out' }, at)
      .call(pop, [i], at + 0.1);
  });
  tl.to(bands, { rotation: (i) => (i % 2 ? -14 : 14), duration: 1.8, ease: 'sine.inOut' }, ringAt + 0.9);

  // 4. The name draws in left to right, sparkles burst, the chime lands.
  const nameAt = 2.45;
  tl.call(whoosh, [{ duration: 0.8, from: 900, to: 4200, level: 0.15 }], nameAt)
    .to(ui.name, { clipPath: 'inset(-30% -5% -30% -5%)', duration: 0.95, ease: 'power2.inOut' }, nameAt)
    .call(chime, [], nameAt + 0.8);
  stars.forEach((star, i) => {
    const angle = (i / stars.length) * Math.PI * 2 + 0.3;
    const dist = 30 + (i % 3) * 9; // vmin
    tl.fromTo(
      star,
      { x: 0, y: 0, scale: 0, opacity: 1, rotation: 0 },
      { x: `${Math.cos(angle) * dist}vmin`, y: `${Math.sin(angle) * dist}vmin`, scale: 0.7 + (i % 3) * 0.35, opacity: 0, rotation: 90, duration: 0.9, ease: 'power2.out' },
      nameAt + 0.8,
    );
  });

  // 5. Handoff: the veil lifts onto the Hero.
  tl.to(ui.ring, { scale: 1.06, duration: 0.8, ease: 'power1.inOut' }, ANIMATION_S - 0.8)
    .to(ui.root, { opacity: 0, duration: 0.65, ease: 'power1.inOut' }, ANIMATION_S - 0.65);
  return tl;
}
