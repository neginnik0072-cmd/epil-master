import { defineConfig } from 'vite';

// `npm run build:preview` — версия для показа клиенту (GitHub Pages):
// поисковики её не индексируют.
const noindex = () => ({
  name: 'preview-noindex',
  transformIndexHtml: () => [
    { tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' },
  ],
});

export default defineConfig(({ mode }) => ({
  // relative paths: the site works both on a domain root and on a sub-path
  // like https://<user>.github.io/epil-master/
  base: './',
  plugins: mode === 'preview' ? [noindex()] : [],
}));
