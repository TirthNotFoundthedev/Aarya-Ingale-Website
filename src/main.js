import './style.css';
import { content } from './content.js';

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

function portrait(pose, { sizes }) {
  const { src, alt } = content.portrait[pose];
  const srcset = (ext) => `${src}-1200.${ext} 1200w, ${src}-1600.${ext} 1600w`;
  return el('picture', { className: `portrait portrait--${pose}` }, [
    el('source', { attrs: { type: 'image/avif', srcset: srcset('avif'), sizes } }),
    el('source', { attrs: { type: 'image/webp', srcset: srcset('webp'), sizes } }),
    el('img', { attrs: { src: `${src}-1200.webp`, alt, width: 1200, height: 1490, decoding: 'async' } }),
  ]);
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

const heroScene = scene('hero', [
  el('header', { className: 'hero-heading' }, [
    el('p', { className: 'hero-greeting', text: hero.greeting }),
    el('h1', { className: 'hero-name', text: content.name, attrs: { id: 'hero-title' } }),
  ]),
  portrait('hero', { sizes: '(min-width: 700px) 50vw, 90vw' }),
]);

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

document.querySelector('#app').append(heroScene, nowScene, interestsScene, socialsScene);
