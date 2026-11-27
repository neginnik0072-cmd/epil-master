import { defineConfig, loadEnv } from 'vite';

const previewUrl = 'https://neginnik0072-cmd.github.io/epil-master/';
const locations = [
  {
    id: 'address-permyakova',
    streetAddress: 'ул. Пермякова, 7/1, офис 724',
    map: 'https://2gis.ru/tyumen/geo/70000001046761964',
  },
  {
    id: 'address-nekrasova',
    streetAddress: 'ул. Некрасова, 10, офис 618',
    map: 'https://2gis.ru/tyumen/geo/70000001119371877',
  },
];

function normalizeSiteUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('SITE_URL must be a public HTTPS URL without credentials, a query or a fragment.');
  }
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url.href;
}

function siteMetadata({ preview, siteUrl }) {
  const image = siteUrl ? new URL('og.jpg', siteUrl).href : './og.jpg';
  const metadata = (key, content, type = 'name') => ({ tag: 'meta', attrs: { [type]: key, content } });
  const schema = {
    '@context': 'https://schema.org',
    '@graph': locations.map(({ id, streetAddress, map }) => ({
      '@type': 'BeautySalon',
      ...(siteUrl && { '@id': `${siteUrl}#${id}`, url: `${siteUrl}#${id}`, image }),
      name: 'Epil_master — студия электроэпиляции',
      telephone: '+7 982 917-52-58',
      email: 'epilmaster@mail.ru',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'RU',
        addressLocality: 'Тюмень',
        streetAddress,
      },
      hasMap: map,
      sameAs: ['https://vk.ru/club211201525'],
      priceRange: '₽₽',
    })),
  };

  return {
    name: 'studio-site-metadata',
    transformIndexHtml() {
      const tags = [
        metadata('og:image', image, 'property'),
        metadata('og:image:width', '1200', 'property'),
        metadata('og:image:height', '630', 'property'),
        metadata('og:image:alt', 'Студия электроэпиляции Epil_master в Тюмени', 'property'),
        metadata('twitter:card', 'summary_large_image'),
        { tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify(schema, null, 2) },
      ];
      if (siteUrl) tags.push(metadata('og:url', siteUrl, 'property'));
      if (preview) tags.push(metadata('robots', 'noindex, nofollow'));
      else if (siteUrl) tags.push({ tag: 'link', attrs: { rel: 'canonical', href: siteUrl } });
      return tags.map((tag) => ({ ...tag, injectTo: 'head' }));
    },
    generateBundle() {
      if (preview || !siteUrl) return;
      const sitemapUrl = new URL('sitemap.xml', siteUrl).href;
      const xmlUrl = siteUrl.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
      this.emitFile({
        type: 'asset', fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${xmlUrl}</loc></url>\n</urlset>\n`,
      });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\nSitemap: ${sitemapUrl}\n` });
    },
  };
}

export default defineConfig(({ mode }) => {
  const preview = mode === 'preview';
  const configuredUrl = loadEnv(mode, process.cwd(), 'SITE_URL').SITE_URL;
  const siteUrl = preview ? previewUrl : configuredUrl ? normalizeSiteUrl(configuredUrl) : undefined;
  return { base: './', plugins: [siteMetadata({ preview, siteUrl })] };
});
