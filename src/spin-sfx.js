// Spin SFX: a soft regulator-knob / ratchet click for everything that turns like a dial.
// Synthesised with the Web Audio API (a short filtered noise tick plus a tiny low "thock"), so no audio files
// ship. Silent until the visitor's first gesture has unlocked the AudioContext, and silent when sound is off.

const STORAGE_KEY = 'spin-sound';
const MAX_CLICKS_PER_SECOND = 22;
const MIN_GAP = 1 / MAX_CLICKS_PER_SECOND;
const MAX_VOICES = 4; // clicks still sounding; later ones are dropped rather than stacked
const MASTER_LEVEL = 0.5;
const REDUCED = '(prefers-reduced-motion: reduce)';

let ctx = null;
let master = null;
let noise = null;
let unlocked = false;
let voices = 0;
let lastClickAt = -Infinity;
let enabled = readStored();
const listeners = new Set();

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

function ensureContext() {
  if (ctx) return ctx;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  // A gentle limiter keeps a burst of clicks from ever getting loud.
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -18;
  limiter.ratio.value = 6;
  master = ctx.createGain();
  master.gain.value = MASTER_LEVEL;
  master.connect(limiter).connect(ctx.destination);
  // One short buffer of white noise, shared by every click.
  noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return ctx;
}

// Call from a user gesture (the loader's "tap to start" button calls this). Safe to call again and again.
export function unlockAudio() {
  const audio = ensureContext();
  if (!audio) return Promise.resolve(false);
  unlocked = true;
  if (audio.state === 'running' || document.hidden) return Promise.resolve(true);
  return audio.resume().then(
    () => true,
    () => false,
  );
}

export function setSoundEnabled(on) {
  enabled = Boolean(on);
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
  } catch {
    // storage blocked: the choice just lasts for this visit
  }
  listeners.forEach((fn) => fn(enabled));
}

export const isSoundEnabled = () => enabled;

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const jitter = (spread) => 1 + (Math.random() * 2 - 1) * spread;

// One detent click. speed 0..1 (how fast the dial is turning), direction ±1, kind 'ring' | 'arc'.
// Returns true when a click was actually scheduled.
export function playSpinClick({ speed = 0.3, direction = 1, kind = 'ring' } = {}) {
  if (!enabled || !unlocked || !ctx || ctx.state !== 'running' || document.hidden) return false;
  if (matchMedia(REDUCED).matches) return false;
  const now = ctx.currentTime;
  if (now - lastClickAt < MIN_GAP || voices >= MAX_VOICES) return false;
  lastClickAt = now;

  const s = clamp(speed);
  const heavy = kind === 'arc';
  // Faster turn: a little higher and a little crisper. Backwards turns sit slightly lower.
  const pitch = (heavy ? 1500 : 2400) * (1 + 0.55 * s) * (direction < 0 ? 0.88 : 1) * jitter(0.08);
  const level = (0.1 + 0.1 * s) * jitter(0.2) * (heavy ? 1.1 : 1);
  const length = 0.022 + 0.014 * (1 - s);

  // The tick: a noise burst through a band-pass.
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = pitch;
  band.Q.value = 2.2;
  const tick = ctx.createGain();
  tick.gain.setValueAtTime(0.0001, now);
  tick.gain.exponentialRampToValueAtTime(level, now + 0.002);
  tick.gain.exponentialRampToValueAtTime(0.0001, now + length);
  src.connect(band).connect(tick).connect(master);

  // The thock: a short low sine that gives the click some body.
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  const base = (heavy ? 150 : 210) * jitter(0.06);
  osc.frequency.setValueAtTime(base * 1.6, now);
  osc.frequency.exponentialRampToValueAtTime(base, now + 0.02);
  const thock = ctx.createGain();
  thock.gain.setValueAtTime(0.0001, now);
  thock.gain.exponentialRampToValueAtTime(level * 0.7, now + 0.003);
  thock.gain.exponentialRampToValueAtTime(0.0001, now + length + 0.02);
  osc.connect(thock).connect(master);

  voices += 1;
  let pending = 2;
  const done = () => {
    pending -= 1;
    if (pending === 0) voices -= 1;
  };
  src.onended = done;
  osc.onended = done;
  src.start(now);
  src.stop(now + length + 0.01);
  osc.start(now);
  osc.stop(now + length + 0.04);
  return true;
}

// Turns a stream of angles into detent clicks. Feed it the real rotation each time it changes; it clicks
// every `step` units travelled, and works out speed (units per second against `fast`) and direction itself.
// `reset(value)` re-bases it after a jump that should stay silent (a resize, a refresh).
export function createDetents({ step, fast, kind = 'ring' }) {
  let last = null;
  let lastTime = 0;
  let lastNotch = 0;
  let smooth = 0;
  return {
    reset(value) {
      last = value;
      lastTime = performance.now();
      lastNotch = Math.floor(value / step);
      smooth = 0;
    },
    update(value) {
      const t = performance.now();
      if (last === null) return this.reset(value);
      const dt = Math.max(t - lastTime, 1) / 1000;
      const velocity = (value - last) / dt;
      last = value;
      lastTime = t;
      smooth = smooth * 0.6 + Math.abs(velocity) * 0.4;
      const notch = Math.floor(value / step);
      if (notch === lastNotch) return;
      const direction = notch > lastNotch ? 1 : -1;
      lastNotch = notch;
      playSpinClick({ speed: smooth / fast, direction, kind });
    },
  };
}

// ---------- sound on/off button ----------

const ICON_ON =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9.5v5h3.5l4.5 3.8V5.7L7.5 9.5z" fill="currentColor"/><path d="M15.2 9a4.2 4.2 0 0 1 0 6M17.6 6.6a7.6 7.6 0 0 1 0 10.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const ICON_OFF =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9.5v5h3.5l4.5 3.8V5.7L7.5 9.5z" fill="currentColor"/><path d="M15.5 9.5l5 5M20.5 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

export function mountSoundToggle(parent = document.body) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'sound-toggle';
  button.setAttribute('aria-label', 'Sound effects');
  const paint = (on) => {
    button.setAttribute('aria-pressed', String(on));
    button.innerHTML = on ? ICON_ON : ICON_OFF;
  };
  paint(enabled);
  listeners.add(paint); // stays in step if the loader flips the choice
  button.addEventListener('click', async () => {
    const turningOn = !enabled;
    setSoundEnabled(turningOn);
    if (turningOn && (await unlockAudio())) playSpinClick({ speed: 0.4, kind: 'arc' }); // a sample click as feedback
  });
  parent.append(button);
  return button;
}

// ---------- housekeeping ----------

// Standalone unlock: the first real gesture wakes the AudioContext. (The loader's start button does the same
// by calling unlockAudio() itself.) Scrolling alone is not a gesture, so the dial is quiet until a tap or key.
function unlockOnGesture() {
  const events = ['pointerdown', 'keydown', 'touchend'];
  const handler = () => {
    unlockAudio().then((ok) => {
      if (!ok) return;
      events.forEach((name) => removeEventListener(name, handler, true));
    });
  };
  events.forEach((name) => addEventListener(name, handler, { capture: true, passive: true }));
}
unlockOnGesture();

// Nothing plays in a hidden tab; the context is paused there and woken when the tab returns.
document.addEventListener('visibilitychange', () => {
  if (!ctx || !unlocked) return;
  if (document.hidden) ctx.suspend().catch(() => {});
  else if (ctx.state !== 'running') ctx.resume().catch(() => {});
});
