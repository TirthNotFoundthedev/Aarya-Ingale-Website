// Bye Scene: the last Scene. The Hero pose and the Ring return to the Hero layout (src/stage.js does the
// move) and a closing heading, the same size as the Hero's, arrives above them: "Thanks for stopping by, Bye!".
// The Scene itself is only scroll runway; its heading is fixed to the top of the screen so it sits exactly
// where the Hero's name did, however the phone's address bar has moved the page. SPEC.md → Scenes → Bye.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { content } from './content.js';

gsap.registerPlugin(ScrollTrigger);

const REDUCED = '(prefers-reduced-motion: reduce)';
const WAVE_DELAY = 0.35; // s after she arrives before she says goodbye on her own

export function createByeScene() {
  const { greeting, title } = content.bye;
  const make = (tag, className, text, attrs = {}) => {
    const node = Object.assign(document.createElement(tag), { className, textContent: text });
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    return node;
  };
  const heading = make('header', 'hero-heading bye-heading');
  heading.append(make('p', 'hero-greeting', greeting), make('h2', 'hero-name', title, { id: 'bye-title' }));
  const scene = make('section', 'scene scene--bye', '', { id: 'bye', 'aria-labelledby': 'bye-title' });
  scene.append(heading);
  return { scene, heading };
}

// She says her goodbye in the speech bubble when she lands (and when tapped while she is here), then goes
// back to "Hi!" once the visitor scrolls up. Under reduced motion the greeting waits for a tap.
export function playBye({ scene, heading, heroPortrait }) {
  const bubble = heroPortrait.querySelector('.bubble');
  const hello = bubble.textContent;
  const reduced = matchMedia(REDUCED);
  let wave;

  // The heading fades in and settles into place as the figure arrives, over the stage's own scrub range.
  gsap.matchMedia().add({ reduced: REDUCED, full: `not all and ${REDUCED}` }, ({ conditions }) => {
    gsap.set(heading, { autoAlpha: 0 });
    if (conditions.reduced) {
      const fade = gsap.to(heading, { autoAlpha: 1, duration: 0.3, paused: true, ease: 'none' });
      ScrollTrigger.create({
        trigger: scene,
        start: 'top 50%',
        onEnter: () => fade.play(),
        onLeaveBack: () => fade.reverse(),
        onRefresh: (self) => fade.progress(self.progress > 0 ? 1 : 0),
      });
      return;
    }
    gsap.fromTo(
      heading,
      { autoAlpha: 0, y: -24 },
      {
        autoAlpha: 1,
        y: 0,
        ease: 'power2.out',
        immediateRender: true,
        scrollTrigger: { trigger: scene, start: 'top 20%', end: 'top 0%', scrub: 0.6 },
      },
    );
  });

  ScrollTrigger.create({
    trigger: scene,
    start: 'top 40%', // reachable at the end of the page even when the Scene is only 100svh tall
    onEnter: () => {
      bubble.textContent = content.bye.bubble;
      if (reduced.matches) return;
      wave = gsap.delayedCall(WAVE_DELAY, () => heroPortrait.click());
    },
    onRefresh: (self) => {
      bubble.textContent = self.isActive ? content.bye.bubble : hello;
    },
    onLeaveBack: () => {
      wave?.kill();
      heroPortrait.classList.remove('is-talking');
      gsap.delayedCall(0.3, () => (bubble.textContent = hello)); // after the bubble has faded out
    },
  });
}
