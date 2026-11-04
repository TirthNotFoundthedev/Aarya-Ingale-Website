import './style.css';
import { content } from './content.js';
import { createRing, spinRingOnScroll } from './ring.js';
import { playStage, STACKED_CONDITION } from './stage.js';
import { arcList } from './arc-list.js';
import { mountSoundToggle } from './spin-sfx.js';

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

// A Scene whose Arc list turns while it scrolls: tall, with its text pinned at the top (see .scene--arc).
// Each extra screenful of scrolling moves the dial by one item.
function arcScene(id, itemCount, children) {
  const node = scene(id, [el('div', { className: 'scene-pin' }, children)]);
  node.classList.add('scene--arc');
  node.style.setProperty('--arc-steps', itemCount - 1);
  return node;
}

// The Arc lists sit in one fixed layer above the stage, one list per Scene (src/arc-list.js moves them).
function arcListOf(id, items) {
  return el('ul', { className: 'arc-list', attrs: { 'aria-labelledby': `${id}-title` } }, items);
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

// Interests & Skills: one Arc list, interests first. An item with a detail is a button; tapping it shows the
// one-line detail under the overview.
const detailPanel = el('p', { className: 'arc-detail', attrs: { 'aria-live': 'polite' } });
function skillOrInterest(item, kind) {
  const li = el('li', { className: `arc-item arc-item--${kind}` });
  if (!item.detail) {
    li.append(el('span', { className: 'label', text: item.label }));
    return li;
  }
  const button = el('button', { className: 'label', text: item.label, attrs: { type: 'button' } });
  button.addEventListener('click', () => {
    detailPanel.replaceChildren(el('strong', { className: 'label', text: item.label }), el('span', { text: item.detail }));
    detailPanel.classList.remove('is-shown');
    void detailPanel.offsetWidth; // restart the unfold animation on every tap
    detailPanel.classList.add('is-shown');
  });
  li.append(button);
  return li;
}
const interestItems = [
  ...interestsSkills.interests.map((item) => skillOrInterest(item, 'interest')),
  ...interestsSkills.skills.map((item) => skillOrInterest(item, 'skill')),
];
const interestsList = arcListOf('interests', interestItems);
const interestsScene = arcScene('interests', interestItems.length, [
  sceneTitle('interests', interestsSkills.title),
  el('p', { className: 'body', text: interestsSkills.overview }),
  detailPanel,
]);

// Socials: each item is a link that opens its URL.
const socialItems = socials.links.map((link) =>
  el('li', { className: 'arc-item arc-item--social' }, [
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
);
const socialsList = arcListOf('socials', socialItems);
const socialsScene = arcScene('socials', socialItems.length, [sceneTitle('socials', socials.title)]);

const arcLayer = el('div', { className: 'arc-layer' }, [interestsList, socialsList]);

// The stage comes last so screen readers meet the name before the portrait; CSS puts it behind on desktop.
// On stacked screens, the stage-fade overlay sits between the Scenes and the stage.
document.querySelector('#app').append(heroScene, nowScene, interestsScene, socialsScene, stageFade, stage, arcLayer);
spinRingOnScroll(ring);
playStage({ stage, ring, heroPortrait, cornerPortrait, heading, heroScene });
arcList({ scene: interestsScene, list: interestsList });
arcList({ scene: socialsScene, list: socialsList });
mountSoundToggle();
