import './style.css';
import { content } from './content.js';
import { createRing, spinRingOnScroll } from './ring.js';
import { playStage, STACKED_CONDITION } from './stage.js';

const isTodo = (value) => typeof value === 'string' && value.startsWith('TODO');

// Make an element; text that is still a TODO placeholder gets the .todo class so it stands out.
function el(tag, { className, text, attrs } = {}, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) {
    node.textContent = text;
    if (isTodo(text)) node.classList.add('todo');
  }
  for (const [key, value] of Object.entries(attrs ?? {})) node.setAttribute(key, value);
  node.append(...children);
  return node;
}

function portrait(pose, { sizes, priority }) {
  const { src, alt } = content.portrait[pose];
  const srcset = (ext) => `${src}-1200.${ext} 1200w, ${src}-1600.${ext} 1600w`;
  // A button, so she can be tapped, clicked or reached by keyboard; the picture's alt text names it.
  const button = el('button', { className: `portrait portrait--${pose}`, attrs: { type: 'button' } }, [
    el('picture', {}, [
      el('source', { attrs: { type: 'image/avif', srcset: srcset('avif'), sizes } }),
      el('source', { attrs: { type: 'image/webp', srcset: srcset('webp'), sizes } }),
      el('img', { attrs: { src: `${src}-1200.webp`, alt, width: 1200, height: 1490, decoding: 'async', ...(priority && { fetchpriority: 'high' }) } }),
    ]),
    el('span', { className: 'sparkle', attrs: { 'aria-hidden': 'true' } }, [el('i'), el('i')]),
    el('span', { className: 'bubble', text: content.bubble, attrs: { 'aria-hidden': 'true' } }),
  ]);
  button.addEventListener('click', () => poke(button));
  return button;
}

// Tap her: a "Hi!" bubble pops out and a sparkle flashes on her earring.
const BUBBLE_MS = 1800;
function poke(button) {
  button.classList.remove('is-poked', 'is-talking');
  void button.offsetWidth; // restart the animations on a quick second tap
  button.classList.add('is-poked', 'is-talking');
  clearTimeout(button._talk);
  button._talk = setTimeout(() => button.classList.remove('is-talking'), BUBBLE_MS);
}

function scene(id, children) {
  return el('section', { className: `scene scene--${id}`, attrs: { id, 'aria-labelledby': `${id}-title` } }, children);
}

function sceneTitle(id, text) {
  return el('h2', { className: 'scene-title', text, attrs: { id: `${id}-title` } });
}

function itemList(className, items) {
  return el(
    'ul',
    { className },
    items.map((item) =>
      el('li', {}, [
        el('span', { className: 'label', text: item.label }),
        ...(item.detail ? [el('span', { className: 'detail', text: item.detail })] : []),
      ]),
    ),
  );
}

const { hero, now, interestsSkills, socials } = content;

const heading = el('header', { className: 'hero-heading' }, [
  el('p', { className: 'hero-greeting', text: hero.greeting }),
  el('h1', { className: 'hero-name', text: content.name, attrs: { id: 'hero-title' } }),
]);
const heroScene = scene('hero', [heading]);

// Ring and Portrait live on a fixed stage behind the Scenes; src/stage.js moves them as you scroll.
const ring = createRing();
// `sizes` follow the widths src/stage.js gives each pose, approximately: the Hero width also depends on the
// name's height (~46vh wide, 48vh stacked), and the Corner width is its Ring radius ÷ 0.81.
const heroPortrait = portrait('hero', { sizes: `${STACKED_CONDITION} min(110vw, 48vh, 640px), min(90vw, 46vh, 640px)`, priority: true });
const cornerPortrait = portrait('corner', { sizes: `${STACKED_CONDITION} min(56vw, 21vh), min(49vw, 62vh)` });
const stage = el('div', { className: 'stage' }, [ring, heroPortrait, cornerPortrait]);
// On stacked screens (phones and portrait tablets), a fixed gradient overlay hides text scrolling up
// behind the character so it fades in from the middle of the screen.
const stageFade = el('div', { className: 'stage-fade', attrs: { 'aria-hidden': 'true' } });

const nowScene = scene('now', [
  sceneTitle('now', now.title),
  el('dl', { className: 'now-facts' }, now.facts.flatMap((fact) => [
    el('dt', { text: fact.label }),
    el('dd', { text: fact.value }),
  ])),
  ...now.lines.map((line) => el('p', { className: 'body', text: line })),
]);

const interestsScene = scene('interests', [
  sceneTitle('interests', interestsSkills.title),
  el('p', { className: 'body', text: interestsSkills.overview }),
  itemList('arc-list arc-list--interests', interestsSkills.interests),
  itemList('arc-list arc-list--skills', interestsSkills.skills),
]);

const socialsScene = scene('socials', [
  sceneTitle('socials', socials.title),
  el(
    'ul',
    { className: 'arc-list arc-list--socials' },
    socials.links.map((link) =>
      el('li', {}, [
        el('a', {
          className: `label${isTodo(link.url) ? ' todo' : ''}`,
          text: link.label,
          attrs: {
            href: isTodo(link.url) ? '#' : link.url,
            'data-icon': link.icon,
            ...(link.url.startsWith('http') && { rel: 'noopener', target: '_blank' }),
          },
        }),
      ]),
    ),
  ),
]);

// The stage comes last so screen readers meet the name before the portrait; CSS puts it behind on desktop.
// On stacked screens, the stage-fade overlay sits between the Scenes and the stage.
document.querySelector('#app').append(heroScene, nowScene, interestsScene, socialsScene, stageFade, stage);
spinRingOnScroll(ring);
playStage({ stage, ring, heroPortrait, cornerPortrait, heading, heroScene });
