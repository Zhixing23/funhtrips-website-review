// 共用 SEO：<head> meta + JSON-LD 結構化資料。所有設計概念都用同一套，確保 SEO 基礎一致。
export const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function seoHead(c, { concept, base = '../../', noindex = true } = {}) {
  const s = c.site, seo = s.seo;
  const ogImage = new URL('assets/img/' + c.images.hero.file, s.url).href;
  return `
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(seo.title_zh)}</title>
<meta name="description" content="${esc(seo.description_zh)}">
${noindex ? '<!-- 設計稿：避免與正式站搶索引。正式上線時移除 noindex 並改 canonical -->\n<meta name="robots" content="noindex, nofollow">' : ''}
<link rel="canonical" href="${s.url}">
<link rel="alternate" hreflang="zh-Hant-TW" href="${s.url}">
<link rel="alternate" hreflang="en" href="${s.url}en/">
<link rel="alternate" hreflang="x-default" href="${s.url}en/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(s.name_zh)} ${esc(s.name_en)}">
<meta property="og:title" content="${esc(seo.title_zh)}">
<meta property="og:description" content="${esc(seo.description_zh)}">
<meta property="og:image" content="${ogImage}">
<meta property="og:locale" content="zh_TW">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${base}assets/img/logo-zhixing.png">
<script type="application/ld+json">${JSON.stringify(jsonLd(c), null, 0)}</script>`;
}

export function jsonLd(c) {
  const s = c.site, ct = s.contact;
  const org = {
    '@type': ['EducationalOrganization', 'TravelAgency'],
    '@id': s.url + '#org',
    name: s.legal_zh,
    alternateName: [s.name_en, s.legal_en, s.name_zh],
    url: s.url,
    logo: s.url + 'assets/img/logo-zhixing.png',
    image: s.url + 'assets/img/' + c.images.hero.file,
    description: s.seo.description_en,
    email: ct.email,
    telephone: ct.phone,
    taxID: ct.tax_id,
    address: {
      '@type': 'PostalAddress', streetAddress: '3F, No. 341, Zhongpu 1st St.',
      addressLocality: 'Taoyuan District', addressRegion: 'Taoyuan City', postalCode: '330', addressCountry: 'TW'
    },
    areaServed: 'TW',
    sameAs: [ct.linkedin],
    knowsAbout: ['IB CAS', 'Service learning', 'UN SDGs', 'Educational travel', 'Chinese language learning', 'STEAM']
  };
  const trips = c.cas_routes.map(r => ({
    '@type': 'TouristTrip',
    name: `IB CAS & Service Learning — ${r.place_en} (${r.region_en})`,
    description: r.themes_en.join(', '),
    touristType: 'Students',
    provider: { '@id': s.url + '#org' },
    itinerary: { '@type': 'ItemList', itemListElement: [...r.creativity, ...r.activity, ...r.service].map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x[1] })) }
  }));
  return { '@context': 'https://schema.org', '@graph': [org, ...trips] };
}
