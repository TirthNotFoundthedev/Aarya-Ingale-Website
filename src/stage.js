// The stage: Ring and Portrait, fixed behind the scrolling Scenes.
// Hero: a big Ring centred on her head, the Hero pose rising from the bottom centre, both below the name.
// Scrolling out of the Hero, the Ring travels to the corner, the Hero pose drops out of the bottom and
// the Corner pose pops up from the right. From then on both stay in the corner.
// "Corner" is bottom-right on wide screens and bottom-centre on phones and portrait tablets (SPEC.md → Scenes).

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Screens that get the bottom-centre corner layout. Kept in sync with the stacked @media query in src/style.css.
// `STACKED` is a media query list for matchMedia; `STACKED_CONDITION` is the same test as a single media
// condition, which is what a `sizes` attribute needs (it can't take a comma list).
const STACKED_TERMS = ['(width < 700px)', '(max-aspect-ratio: 4/5)'];
const STACKED = STACKED_TERMS.join(', ');
export const STACKED_CONDITION = `(${STACKED_TERMS.join(' or ')})`;
const REDUCED = '(prefers-reduced-motion: reduce)';

// Portrait art is 1200×1490. The Ring is a halo round her whole head (hair + face), so its centre is the
// centre of the head silhouette's bounding box. Measured from the alpha channel of public/art/*-1200.webp:
// the opaque pixels from the top of the hair down to the jaw, where the silhouette narrows into the neck
// (row 1036 in the Hero pose, row 1048 in the Corner pose), as fractions of the image box.
const ART_ASPECT = 1490 / 1200;
const HEAD = { hero: { x: 0.532, y: 0.385 }, corner: { x: 0.532, y: 0.389 } };
const RING_PER_WIDTH = 0.81; // Ring radius as a fraction of the portrait width

// Hero
const HERO_CROP = 0.1; // share of the Hero portrait's height hidden below the bottom edge
const HERO_MAX_W = { wide: 0.9, stacked: 1.1 }; // portrait width cap, × screen width (phones crop her shoulders a little)
const HERO_MAX_PX = 640; // and never wider than this, in either layout
const HERO_MAX_SHARE = 0.7; // stacked: Ring + Portrait take at most 70% of the height (SPEC.md → Scenes, phone)
const NAME_TAILS = 0.25; // the name's script tails hang this far (× its font size) below its line box
const MIN_HERO_W = 1; // px; only stops the width reaching zero. Clearing the name always wins over size:
// if there is no room under the name at all, the Hero figure waits below the screen edge (see measure())

// Corner, as multiples of the corner Ring radius R
const CORNER_R = { wide: { vh: 0.5, vw: 0.4 }, stacked: { vh: 0.167, vw: 0.45 } }; // R = min(vh·a, vw·b)
const CORNER_IN_X = 0.5; // wide: Ring centre sits R·0.5 in from the right edge, so the right quarter of its width is cut off
const CORNER_UP_Y = 0.8; // Ring centre sits R·0.8 above the bottom edge

let geo; // measured layout, refreshed on every ScrollTrigger refresh

// All y values are relative to the stage's bottom edge (the stage's children hang from `top: 100%`),
// so a phone's address bar showing or hiding never leaves a gap under her.
function measure({ stage, ring, heroPortrait, cornerPortrait, heading, heroScene }) {
  const vw = stage.clientWidth;
  const vh = stage.clientHeight;
  // The name is sized in svh but the stage is as tall as the largest viewport (a phone's address bar collapsed).
  // The Hero Scene is at least 100svh tall, so this is the smallest height the Hero ever has to fit.
  const vhHero = Math.min(vh, heroScene.clientHeight);
  const stacked = matchMedia(STACKED).matches; // the media query sees the viewport width; `vw` excludes a scrollbar
  const gutter = parseFloat(getComputedStyle(heroScene).paddingLeft); // --gutter in style.css

  // Hero: the Ring's top edge clears the bottom of the name, tails included.
  const name = heading.querySelector('.hero-name');
  const nameBottom = name.getBoundingClientRect().bottom + scrollY + NAME_TAILS * parseFloat(getComputedStyle(name).fontSize);
  const gap = Math.max(12, vhHero * 0.03);
  const headToEdge = (1 - HEAD.hero.y - HERO_CROP) * ART_ASPECT; // head centre → bottom edge, × portrait width
  const room = vhHero - nameBottom - gap; // height between the name and the bottom edge
  const wHero = Math.max(
    MIN_HERO_W,
    Math.min(
      vw * (stacked ? HERO_MAX_W.stacked : HERO_MAX_W.wide),
      HERO_MAX_PX,
      (stacked ? Math.min(room, vhHero * HERO_MAX_SHARE) : room) / (headToEdge + RING_PER_WIDTH),
    ),
  );
  const rHero = wHero * RING_PER_WIDTH;
  const heroCx = vw / 2 + (HEAD.hero.x - 0.5) * wHero;
  // No room under the name (only on absurdly short screens): start the figure below the bottom edge so it
  // can't touch the name; it still rises into the corner as you scroll.
  const heroCy = room > 0 ? -headToEdge * wHero : BELOW + Math.max(rHero, HEAD.hero.y * wHero * ART_ASPECT);

  // Corner
  const c = stacked ? CORNER_R.stacked : CORNER_R.wide;
  const rCorner = Math.min(vh * c.vh, vw * c.vw);
  const wCorner = rCorner / RING_PER_WIDTH;
  const cornerCx = stacked ? vw / 2 : vw - rCorner * CORNER_IN_X;
  const cornerCy = -rCorner * CORNER_UP_Y;

  const rMax = Math.max(rHero, rCorner); // the Ring is drawn at its largest size and only ever scaled down
  ring.style.width = `${2 * rMax}px`;
  heroPortrait.style.width = `${wHero}px`;
  cornerPortrait.style.width = `${wCorner}px`;

  // Keep the later Scenes' text clear of the corner figure: beside it on wide screens, above it when stacked.
  const root = document.documentElement.style;
  root.setProperty('--figure-right', stacked ? '' : `${rCorner * (1 + CORNER_IN_X) + gutter}px`);
  root.setProperty('--figure-bottom', stacked ? `${rCorner * (1 + CORNER_UP_Y) + gutter}px` : '');

  const ringAt = (cx, cy, r) => ({ x: cx - rMax, y: cy - rMax, scale: r / rMax });
  const portraitAt = (pose, cx, cy, w) => ({ x: cx - HEAD[pose].x * w, y: cy - HEAD[pose].y * w * ART_ASPECT });
  geo = {
    ringHero: ringAt(heroCx, heroCy, rHero),
    ringCorner: ringAt(cornerCx, cornerCy, rCorner),
    heroPortrait: portraitAt('hero', heroCx, heroCy, wHero),
    cornerPortrait: portraitAt('corner', cornerCx, cornerCy, wCorner),
  };
  // Where the Corner pose pops in from: past the right edge on wide screens, straight up from below when stacked.
  geo.cornerFromX = geo.cornerPortrait.x + (stacked ? 0 : wCorner * 0.7);
}

const BELOW = 10; // px below the bottom edge: fully out of sight
const FONT_WAIT = 2000; // ms the stage waits for the fonts before it shows anyway

// Scrubbed with the scroll: the Ring glides over, the poses drop and pop.
function scrubbedMove({ ring, heroPortrait, cornerPortrait, heroScene }) {
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    // Ends when 60% of the Hero has scrolled away, so the figure has settled before the Now text reaches it.
    scrollTrigger: { trigger: heroScene, start: 'top top', end: 'bottom 40%', scrub: 0.6, invalidateOnRefresh: true },
  });

  // Ring: sideways early (power2.out) and up/down + resize evenly (power2.inOut), so on wide screens it
  // gets out of the left-hand text column quickly.
  tl.fromTo(ring, { x: () => geo.ringHero.x }, { x: () => geo.ringCorner.x, ease: 'power2.out', duration: 1 }, 0);
  tl.fromTo(
    ring,
    { y: () => geo.ringHero.y, scale: () => geo.ringHero.scale },
    { y: () => geo.ringCorner.y, scale: () => geo.ringCorner.scale, ease: 'power2.inOut', duration: 1 },
    0,
  );

  // Portrait: the Hero pose drops out of the bottom quickly, before the Now title scrolls up past her...
  tl.fromTo(
    heroPortrait,
    { x: () => geo.heroPortrait.x, y: () => geo.heroPortrait.y, autoAlpha: 1 },
    { y: BELOW, ease: 'power2.in', duration: 0.3 },
    0,
  );
  tl.set(heroPortrait, { autoAlpha: 0 }, 0.3);

  // ...and the Corner pose pops up from the right, already facing the content.
  tl.set(cornerPortrait, { autoAlpha: 1 }, 0.5);
  tl.fromTo(
    cornerPortrait,
    { x: () => geo.cornerFromX, y: BELOW },
    { x: () => geo.cornerPortrait.x, y: () => geo.cornerPortrait.y, ease: 'back.out(1.4)', duration: 0.5 },
    0.5,
  );
  return tl;
}

// Reduced motion: no travel. Halfway through the Hero the figure fades out and fades back in at the corner.
function crossfade({ ring, heroPortrait, cornerPortrait, heroScene }) {
  gsap.set(ring, { ...geo.ringHero, autoAlpha: 1 });
  gsap.set(heroPortrait, { ...geo.heroPortrait, autoAlpha: 1 });
  gsap.set(cornerPortrait, { ...geo.cornerPortrait });

  const tl = gsap.timeline({
    paused: true,
    scrollTrigger: {
      trigger: heroScene,
      start: 'center top',
      toggleActions: 'play none none reverse',
      invalidateOnRefresh: true,
      onRefresh: (self) => {
        // Re-place everything for the new size, in whichever state the visitor is in. The timeline only
        // touches opacity, so park it at the matching end and set the positions by hand.
        const atCorner = self.progress > 0;
        self.animation.progress(atCorner ? 1 : 0, true);
        gsap.set(ring, atCorner ? geo.ringCorner : geo.ringHero);
        gsap.set(heroPortrait, { ...geo.heroPortrait });
        gsap.set(cornerPortrait, { ...geo.cornerPortrait });
      },
    },
  });
  // The Ring is moved by a callback, not a tween: a tween would remember the position it started from and
  // restore it stale after a resize. While it is invisible, put it where the direction of travel is heading.
  tl.to([ring, heroPortrait], { autoAlpha: 0, duration: 0.2 })
    .add(() => gsap.set(ring, tl.reversed() ? geo.ringHero : geo.ringCorner), 0.2)
    .to([ring, cornerPortrait], { autoAlpha: 1, duration: 0.2 }, 0.2);
  return tl;
}

export function playStage({ stage, ring, heroPortrait, cornerPortrait, heading, heroScene }) {
  const parts = { stage, ring, heroPortrait, cornerPortrait, heading, heroScene };
  ScrollTrigger.addEventListener('refreshInit', () => measure(parts));
  measure(parts);

  // Build the move for the current motion preference; gsap.matchMedia rebuilds it if the preference changes.
  // A rebuild refreshes ScrollTrigger, which would jump the page to the top; keep the visitor where they were.
  let tl;
  let keepY = null;
  ScrollTrigger.addEventListener('refresh', () => {
    if (keepY === null) return;
    scrollTo(0, keepY);
    keepY = null;
    // The rebuilt timeline was measured at the top. The static update refreshes ScrollTrigger's cached scroll
    // (an instance update would still read 0), then the scrub is snapped so it doesn't glide over from the Hero.
    ScrollTrigger.update();
    const tween = tl.scrollTrigger?.getTween();
    if (tween) tween.progress(1);
  });
  gsap.matchMedia().add({ reduced: REDUCED, full: `not all and ${REDUCED}` }, ({ conditions }) => {
    gsap.set(cornerPortrait, { autoAlpha: 0 }); // hidden until it arrives
    tl = conditions.reduced ? crossfade(parts) : scrubbedMove(parts);
    return () => {
      keepY = scrollY; // runs when the preference flips, before the rebuild
    };
  });

  // The Hero layout depends on the name's real height, so show the stage once the fonts are in. On a slow
  // connection don't hide the art for long: after FONT_WAIT show it anyway, and re-measure when the fonts land.
  let shown = false;
  const show = () => {
    shown = true;
    ScrollTrigger.refresh();
    stage.classList.add('is-ready');
  };
  document.fonts.ready.then(() => (shown ? ScrollTrigger.refresh() : show()));
  setTimeout(() => shown || show(), FONT_WAIT);

  // Dev only: lets the external screenshot script (kept outside the repo, under the system temp folder)
  // jump the scrub to the current scroll. Stripped from production builds.
  if (import.meta.env.DEV) {
    window.__settleStage = async () => {
      await document.fonts.ready;
      gsap.ticker.lagSmoothing(0);
      ScrollTrigger.refresh();
      const tween = tl.scrollTrigger.getTween(); // 0 when there is no scrub (reduced motion)
      if (tween) tween.progress(1);
    };
  }
}
