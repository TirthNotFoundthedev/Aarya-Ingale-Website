// Every piece of visible text, link and photo on the site lives here.
// To change the site: edit this file, then redeploy.
// Any value starting with "TODO" is a placeholder still waiting for a real fact.

export const content = {
  meta: {
    title: 'Aarya Ingale',
    description: 'Hi! I’m Aarya Ingale.',
  },

  name: 'Aarya Ingale',

  hero: {
    greeting: 'Hi! I’m',
  },

  // Speech bubble shown when you tap the Portrait.
  bubble: 'Hi!',

  portrait: {
    // Files are public/art/{pose}-{1600|1200}.{avif|webp}; this is the path without the size and extension.
    hero: { src: '/art/hero', alt: 'Paper-cutout portrait of Aarya, smiling at you' },
    corner: { src: '/art/corner', alt: 'Paper-cutout portrait of Aarya, looking left' },
  },

  now: {
    title: 'What I’m upto right now',
    facts: [
      { label: 'College', value: 'SPCE, Mumbai' },
      { label: 'Branch', value: 'Mechanical Engineering' },
      { label: 'Year', value: '1st year' },
    ],
    // A few short lines about what she's doing these days.
    lines: [
      'TODO what she’s up to, line 1',
      'TODO what she’s up to, line 2',
    ],
  },

  interestsSkills: {
    title: 'Interests & Skills',
    overview: 'TODO a line or two introducing her interests and skills',
    // label is shown on the Arc list; detail is an optional one-liner (use '' for none).
    interests: [
      { label: 'Good food', detail: '' },
      { label: 'Books', detail: '' },
      { label: 'Art n craft', detail: '' },
      { label: 'Travelling', detail: '' },
    ],
    skills: [
      { label: 'TODO skill 1', detail: 'TODO one-line detail' },
      { label: 'TODO skill 2', detail: 'TODO one-line detail' },
      { label: 'TODO skill 3', detail: 'TODO one-line detail' },
    ],
  },

  socials: {
    title: 'Socials',
    // icon is a key the icon set will look up: instagram, linkedin, github, email, ...
    links: [
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/aaryaingale', icon: 'linkedin' },
      { label: 'Instagram', url: 'https://www.instagram.com/aaryaaingale/', icon: 'instagram' },
      { label: 'Email', url: 'mailto:aaryaiscool@gmail.com', icon: 'email' },
    ],
  },

  // Photo gallery comes after Nov 3. Items will be { src, alt, caption }.
  gallery: [],
};
