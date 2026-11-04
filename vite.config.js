import { defineConfig } from 'vite';
import { content } from './src/content.js';

const escape = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Fill the page <title> and description from content.js, so no visible text lives in index.html.
export default defineConfig({
  plugins: [
    {
      name: 'content-meta',
      transformIndexHtml: (html) =>
        html
          .replaceAll('%TITLE%', escape(content.meta.title))
          .replaceAll('%DESCRIPTION%', escape(content.meta.description)),
    },
  ],
});
