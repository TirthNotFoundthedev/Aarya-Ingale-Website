# 01 Scaffold + first deploy

## Goal

An empty but real site, live at `thecheriari.vercel.app`, with the project skeleton every later step builds on.

## Do

1. Scaffold Vite (vanilla JS) and add GSAP. Load the fonts listed in SPEC.md → Visual language, and put the palette in CSS custom properties.
2. Create `src/content.js` with the shape in SPEC.md → Content file. Ask the user for every fact they know (college, branch, year, what she's up to, interests, skills, social links). Mark the rest `TODO`.
3. Build the page skeleton: four Scene sections (Hero, Now, Interests & Skills, Socials) rendered from `content.js`, with headings in the right fonts. No animation yet.
4. Create the Vercel project `thecheriari` and deploy. If the name is taken, stop and ask the user for an alternative.

## Done when

- `npm run dev` shows four Scenes filled from `content.js`.
- `thecheriari.vercel.app` (or the alternative the user agreed to) serves the same page.

## Outcome

Done 2026-11-01. Live at https://thecheriari.vercel.app (Vercel project `thecheriari`, account `tirthnotfoundthedevs-projects`).

**Built**
- Vite 8 (vanilla JS) + GSAP 3.15 (installed, not imported yet). `npm run dev` / `npm run build` → `dist/`.
- `index.html`: Google Fonts (Allura, Yatra One, Rozha One, Lora, Kalam). `<title>` and meta description are filled from `content.js` at build time by a small plugin in `vite.config.js`.
- `src/content.js`: every visible string, link and portrait path/alt. Shape: `meta`, `name`, `hero.greeting`, `bubble`, `portrait.{hero,corner}.{src,alt}`, `now.{title,facts[{label,value}],lines[]}`, `interestsSkills.{title,overview,interests[],skills[]}` (items `{label,detail}`), `socials.{title,links[{label,url,icon}]}`, `gallery[]`.
- `src/main.js`: builds the four Scenes as `<section class="scene scene--{hero|now|interests|socials}">`. Any string starting with `TODO` gets the `.todo` class (dashed magenta outline) so placeholders are obvious on the page. Social links with a TODO URL point to `#`.
- `src/style.css`: palette and font roles as custom properties (`--blush`, `--rani`, `--plum`, `--paithani`, `--font-name`, `--font-title`, ...), a faint SVG-noise paper grain on `body`, and a static layout. The Hero shows the Hero pose `<picture>` (AVIF/WebP, 1200/1600 srcset) at bottom centre. The other Scenes are plain left-aligned text; the lists are styled as paper pills until step 06 turns them into Arc lists.
- `vercel.json` pins framework `vite`, output `dist`. `.vercelignore` keeps `reference images/`, `art-src/`, `prototypes/`, `wayfinder/`, `tools/`, `execution/` and `.env*` out of the upload (checked: the private photos return 404 on the live site).

**For later steps**
- Filled in from the user: college (SPCE, Mumbai), branch (Mechanical Engineering), year (1st year), interests (Good food, Books, Art n craft, Travelling), and LinkedIn, Instagram and email links. Still `TODO`: the Now lines about what she's up to, the Interests & Skills overview, and the skills (the user said to leave skills for now). Before launch (step 08), search the page for `.todo`.
- Redeploy with `vercel deploy --prod` from the repo root (the folder is linked; `.vercel/` and `.env.local` are gitignored). No Git integration is connected.
- The Hero portrait size here (`min(90vw, 55svh, 40rem)`) is a placeholder; step 04 owns the real Hero layout and the Ring.
