// Loader sounds, synthesised with the Web Audio API (no audio files). Warm, soft and short.
// Nothing here makes a sound until unlockAudio() has run inside the gate's click.

// ---------- Shared audio state ----------
// Kept in this one block so it can later point at the spinner's shared context (src/spin-sfx.js):
// replace the block with `export { getAudioContext, unlockAudio, setSoundEnabled, isSoundEnabled } from './spin-sfx.js';`
// (the spinner module must export those four names; the rest of this file only uses getAudioContext()).
const STORAGE_KEY = 'aarya-sound';
let context = null;
let enabled = false;

export function getAudioContext() {
  return context;
}

export function isSoundEnabled() {
  return enabled;
}

export function setSoundEnabled(value) {
  enabled = Boolean(value);
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
  } catch {
    /* private mode or blocked storage: the choice just isn't remembered */
  }
}

// The choice made on an earlier visit, or null. Only used to pick which button gets focus first.
export function rememberedSound() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === null ? null : value === 'on';
  } catch {
    return null;
  }
}

// Call from a click or tap handler: creates (or resumes) the context, as the autoplay policy needs.
export function unlockAudio() {
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  try {
    context ??= new Ctor();
    if (context.state !== 'running') context.resume().catch(() => {});
    // iOS Safari only counts a sound started inside the gesture: play one silent sample now.
    const silent = context.createBufferSource();
    silent.buffer = context.createBuffer(1, 1, 22050);
    silent.connect(context.destination);
    silent.start(0);
  } catch {
    context = null;
  }
  return context;
}

// ---------- Sounds ----------

let bus = null; // master gain -> gentle compressor -> speakers
let noise = null; // one second of white noise, shared by every whoosh and tick

function out(ctx) {
  if (!bus || bus.ctx !== ctx) {
    const gain = ctx.createGain();
    gain.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    gain.connect(comp).connect(ctx.destination);
    bus = { ctx, gain };
    noise = null;
  }
  return bus.gain;
}

function noiseBuffer(ctx) {
  if (!noise) {
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noise;
}

// Run `play(ctx, destination, now)` only when sound is on and the context is live.
function voice(play) {
  const ctx = context;
  if (!enabled || !ctx || ctx.state === 'closed') return;
  try {
    play(ctx, out(ctx), ctx.currentTime + 0.01);
  } catch {
    /* a failed sound must never break the animation */
  }
}

function envelope(ctx, dest, now, { peak, attack, decay }) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);
  gain.connect(dest);
  return gain;
}

// Paper sliding: band-passed noise sweeping upwards.
export function whoosh({ duration = 0.7, from = 500, to = 2600, level = 0.5 } = {}) {
  voice((ctx, dest, now) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx);
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.9;
    filter.frequency.setValueAtTime(from, now);
    filter.frequency.exponentialRampToValueAtTime(to, now + duration);
    src.connect(filter).connect(envelope(ctx, dest, now, { peak: level, attack: duration * 0.4, decay: duration * 0.6 }));
    src.start(now);
    src.stop(now + duration + 0.05);
  });
}

// A soft wooden pop as a piece lands. `step` raises the pitch along a pentatonic scale.
const PENTATONIC = [0, 2, 4, 7, 9, 12, 14];
export function pop(step = 0) {
  voice((ctx, dest, now) => {
    const base = 330 * 2 ** (PENTATONIC[step % PENTATONIC.length] / 12);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base * 1.6, now);
    osc.frequency.exponentialRampToValueAtTime(base, now + 0.09);
    osc.connect(envelope(ctx, dest, now, { peak: 0.35, attack: 0.006, decay: 0.16 }));
    osc.start(now);
    osc.stop(now + 0.25);
    tick(ctx, dest, now, 0.12);
  });
}

function tick(ctx, dest, now, level) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2500;
  src.connect(filter).connect(envelope(ctx, dest, now, { peak: level, attack: 0.002, decay: 0.03 }));
  src.start(now);
  src.stop(now + 0.06);
}

// A paper-on-paper click, for the card and the ribbon.
export function click() {
  voice((ctx, dest, now) => tick(ctx, dest, now, 0.4));
}

// The reveal: a gentle bell arpeggio with a sparkle on top.
export function chime() {
  voice((ctx, dest, now) => {
    [1046.5, 1318.5, 1568, 2093].forEach((freq, i) => {
      const t = now + i * 0.11;
      for (const [mult, level] of [[1, 0.2], [2.76, 0.05]]) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq * mult;
        osc.connect(envelope(ctx, dest, t, { peak: level, attack: 0.008, decay: 1.3 }));
        osc.start(t);
        osc.stop(t + 1.4);
      }
    });
    for (let i = 0; i < 5; i++) {
      const t = now + 0.3 + i * 0.07;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = 3000 + Math.random() * 1800;
      osc.connect(envelope(ctx, dest, t, { peak: 0.04, attack: 0.004, decay: 0.25 }));
      osc.start(t);
      osc.stop(t + 0.3);
    }
  });
}

// Fade everything out fast (the visitor skipped the animation).
export function silence() {
  if (!bus || !context) return;
  try {
    bus.gain.gain.cancelScheduledValues(context.currentTime);
    bus.gain.gain.setTargetAtTime(0, context.currentTime, 0.04);
  } catch {
    /* ignore */
  }
}
