// 概念 03・島嶼路線圖 Island Map
// 以手繪台灣本島航海圖為主角：pins 標出 CAS 三路線與科目考察目的地，下方依北／中／南／東組織所有行程。
// 所有內容皆為 HTML 文字；script.js 只負責 pin 切換面板與表單預填地區。

/* ---------- 地圖幾何：經緯度 → SVG 座標（viewBox -40 -10 460 700） ---------- */
const P = (lon, lat) => [Math.round((lon - 119.9) * 170), Math.round((25.4 - lat) * 190)];

// 本島海岸線（順時針，自富貴角起），大致形狀即可
const COAST = [
  [121.54, 25.30], [121.74, 25.15], [121.92, 25.08], [122.00, 25.01], [121.83, 24.85],
  [121.87, 24.60], [121.70, 24.25], [121.62, 24.00], [121.50, 23.50], [121.37, 23.15],
  [121.15, 22.75], [120.90, 22.35], [120.86, 21.90], [120.72, 21.93], [120.70, 22.15],
  [120.60, 22.36], [120.45, 22.47], [120.27, 22.62], [120.17, 22.80], [120.10, 23.00],
  [120.13, 23.40], [120.15, 23.70], [120.30, 24.00], [120.52, 24.30], [120.72, 24.58],
  [120.92, 24.82], [121.08, 25.05], [121.40, 25.18]
].map(([a, b]) => P(a, b));

function smooth(pts) {
  const n = pts.length, f = v => v.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}
const scaleAround = (pts, k, cx, cy) => pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
const ISLAND = smooth(COAST);
const RELIEF = [[0.78, 215, 335], [0.56, 220, 330], [0.36, 214, 340], [0.17, 205, 352]].map(([k, x, y]) => smooth(scaleAround(COAST, k, x, y)));
const DEPTH = [[1.07, 200, 340], [1.16, 205, 340], [1.3, 215, 340]].map(([k, x, y]) => smooth(scaleAround(COAST, k, x, y)));

/* ---------- 地點 pins ---------- */
const PINS = [
  { id: 'taoyuan', kind: 'cas', at: P(121.10, 25.00), zh: '桃園', en: 'Taoyuan', side: 'l', href: '#route-taoyuan' },
  { id: 'chiayi', kind: 'cas', at: P(120.80, 23.51), zh: '嘉義・阿里山', en: 'Alishan', side: 'l', href: '#route-chiayi' },
  { id: 'kaohsiung', kind: 'cas', at: P(120.53, 22.90), zh: '高雄・美濃', en: 'Meinong', side: 'r', href: '#route-kaohsiung' },
  { id: 'nec', kind: 'sub', at: P(121.85, 25.10), zh: '東北海岸', en: 'NE Coast', side: 'r', href: '#trip-1', trips: [0] },
  { id: 'hsinchu', kind: 'sub', at: P(121.00, 24.78), zh: '新竹', en: 'Hsinchu', side: 'l', href: '#trip-3', trips: [2, 4] },
  { id: 'hualien', kind: 'sub', at: P(121.58, 23.98), zh: '花蓮', en: 'Hualien', side: 'r', href: '#trip-2', trips: [1] },
  { id: 'sml', kind: 'sub', at: P(120.91, 23.86), zh: '日月潭', en: 'Sun Moon Lake', side: 'r', href: '#trip-6', trips: [5] },
  { id: 'tainan', kind: 'sub', at: P(120.20, 23.00), zh: '台南', en: 'Tainan', side: 'l', href: '#trip-6', trips: [5], academic: true },
  { id: 'pingtung', kind: 'sub', at: P(120.49, 22.67), zh: '屏東', en: 'Pingtung', side: 'r', href: '#trip-7', trips: [6] },
  { id: 'taipei', kind: 'city', at: P(121.52, 25.04), zh: '台北', en: 'Taipei', side: 'b', href: '#language', trips: [7], language: true, academic: true },
  { id: 'khcity', kind: 'city', at: P(120.30, 22.63), zh: '高雄', en: 'Kaohsiung', side: 'l', href: '#language', trips: [7], language: true }
];

const REGIONS = [
  { id: 'north', zh: '北台灣', en: 'Northern Taiwan', glyph: '北', lat: '24.6°N – 25.3°N', cas: 'taoyuan', trips: [0, 2, 3, 4], clip: [-40, -10, 460, 150] },
  { id: 'central', zh: '中台灣', en: 'Central Taiwan', glyph: '中', lat: '23.4°N – 24.6°N', cas: 'chiayi', trips: [5], clip: [-40, 140, 285, 240] },
  { id: 'south', zh: '南台灣', en: 'Southern Taiwan', glyph: '南', lat: '21.9°N – 23.4°N', cas: 'kaohsiung', trips: [6, 7], clip: [-40, 380, 240, 320] },
  { id: 'east', zh: '東台灣', en: 'Eastern Taiwan', glyph: '東', lat: '22.7°N – 24.6°N', cas: null, trips: [1], clip: [240, 140, 200, 420] }
];
const TRIP_REGION = { 0: 'north', 1: 'east', 2: 'north', 3: 'north', 4: 'north', 5: 'central', 6: 'south', 7: 'south' };

/* ---------- 服務 / 表單類型 icons（24×24 線條） ---------- */
const ICON = {
  cas: '<path d="M3 19 9.5 8l4 6.5L16 11l5 8Z"/><circle cx="17" cy="5.5" r="2"/>',
  service: '<path d="M12 20s-7-4.3-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.5C19 15.7 12 20 12 20Z"/>',
  language: '<path d="M4 5h16v10H10l-4 4v-4H4Z"/><path d="M9 9h6M12 7.5v5"/>',
  subject: '<path d="M9 3h6M10 3v6L5 18a1.5 1.5 0 0 0 1.3 2.2h11.4A1.5 1.5 0 0 0 19 18l-5-9V3"/><path d="M7.5 14h9"/>',
  academic: '<path d="M3 9 12 4l9 5Z"/><path d="M5 9v8M9.5 9v8M14.5 9v8M19 9v8M3 20h18"/>',
  pd: '<rect x="4" y="4" width="16" height="11" rx="1"/><path d="M12 15v5M8 20h8M8 9h5"/>',
  unsure: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5Z"/>'
};
const icon = (k, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">${ICON[k] || ''}</svg>`;

export default function render(ctx) {
  const { c, esc, img } = ctx;
  const s = c.site, ct = s.contact;
  const T = c.subject_trips;
  const route = id => c.cas_routes.find(r => r.id === id);
  const en = t => `<span class="en" lang="en">${esc(t)}</span>`;
  const sdgs = list => `<ul class="sdgs" aria-label="聯合國永續發展目標 SDGs">${list.map(n => {
    const g = ctx.sdg(n);
    return `<li class="sdg" style="--sdg:${g.color}"><b>SDG ${g.n}</b><span>${esc(g.zh)}</span>${en(g.en)}</li>`;
  }).join('')}</ul>`;
  const askBtn = (type, label = '以這條路線索取提案', region = '', extra = '') =>
    `<a class="btn btn-ask" href="#plan" data-prefill-type="${type}"${region ? ` data-prefill-region="${region}"` : ''}${extra}>${esc(label)}</a>`;

  /* ---------- hero 地圖 ---------- */
  const pinSvg = p => {
    const [x, y] = p.at;
    const lx = p.side === 'l' ? x - 11 : p.side === 'r' ? x + 11 : x + 4;
    const ly = p.side === 'b' ? y + 20 : y + 5;
    const anchor = p.side === 'l' ? 'end' : 'start';
    const mark = p.kind === 'cas'
      ? `<circle class="pin-halo" cx="${x}" cy="${y}" r="15"/><path class="pin-drop" d="M${x} ${y + 1}c-6-7-9-11-9-15a9 9 0 0 1 18 0c0 4-3 8-9 15Z" transform="translate(0 -2)"/><circle class="pin-eye" cx="${x}" cy="${y - 16}" r="3.2"/>`
      : p.kind === 'sub'
        ? `<circle class="pin-halo" cx="${x}" cy="${y}" r="12"/><circle class="pin-dot" cx="${x}" cy="${y}" r="5.5"/>`
        : `<circle class="pin-halo" cx="${x}" cy="${y}" r="12"/><rect class="pin-sq" x="${x - 5}" y="${y - 5}" width="10" height="10"/>`;
    const lyFix = p.kind === 'cas' ? ly - 12 : ly;
    return `<a class="pin pin-${p.kind}" href="${p.href}" data-pin="${p.id}" aria-controls="panel-${p.id}">
      <title>${esc(p.zh)} ${esc(p.en)}</title>${mark}
      <text class="pin-label" x="${lx}" y="${lyFix}" text-anchor="${anchor}">${esc(p.zh)}</text>
    </a>`;
  };
  const casPts = ['taoyuan', 'chiayi', 'kaohsiung'].map(id => PINS.find(p => p.id === id).at);
  const routeLine = `M${casPts[0][0]} ${casPts[0][1]} C 120 160, 200 260, ${casPts[1][0]} ${casPts[1][1]} S 70 420, ${casPts[2][0]} ${casPts[2][1]}`;
  const grat = [25, 24, 23, 22].map(l => { const y = P(120, l)[1]; return `<line x1="-40" x2="420" y1="${y}" y2="${y}"/><text x="-36" y="${y - 5}">${l}°N</text>`; }).join('')
    + [120, 121, 122].map(l => { const x = P(l, 25)[0]; return `<line y1="-10" y2="690" x1="${x}" x2="${x}"/><text x="${x + 4}" y="4">${l}°E</text>`; }).join('');

  const mapSvg = `<svg class="chart" viewBox="-40 -10 460 700" role="img" aria-labelledby="map-title map-desc">
    <title id="map-title">知行學旅台灣路線圖</title>
    <desc id="map-desc">台灣本島簡化地圖。珊瑚色標記為 IB CAS 三條路線：桃園、嘉義阿里山、高雄美濃；青色圓點為科目考察目的地：東北海岸、新竹、花蓮、日月潭、台南、屏東；方形為華語與學術參訪據點：台北、高雄。</desc>
    <defs>
      <symbol id="tw-island" viewBox="-40 -10 460 700"><path d="${ISLAND}"/></symbol>
    </defs>
    <g class="grat">${grat}</g>
    <g class="depth">${DEPTH.map(d => `<path d="${d}"/>`).join('')}</g>
    <path class="island" d="${ISLAND}"/>
    <g class="relief">${RELIEF.map(d => `<path d="${d}"/>`).join('')}</g>
    <ellipse class="islet" cx="${P(121.49, 22.66)[0]}" cy="${P(121.49, 22.66)[1]}" rx="4" ry="5"/>
    <ellipse class="islet" cx="${P(121.55, 22.05)[0]}" cy="${P(121.55, 22.05)[1]}" rx="5" ry="6"/>
    <path class="route-line" d="${routeLine}" pathLength="100"/>
    <g class="compass" transform="translate(370 610)"><circle r="22"/><path d="M0-30 6 0 0 6-6 0Z"/><text y="-36" text-anchor="middle">N</text></g>
    <g class="scale" transform="translate(-24 668)"><path d="M0 0h85M0-5v5M42.5-3v3M85-5v5"/><text x="0" y="14">0</text><text x="85" y="14" text-anchor="middle">50 km</text></g>
    <g class="pins">${PINS.map(pinSvg).join('')}</g>
  </svg>`;

  const tripLink = i => `<li><a href="#trip-${i + 1}">${esc(T[i].name_zh)}</a> ${en(T[i].name_en)}<small>${esc(T[i].subjects_zh)}｜${esc(T[i].days)} 天</small></li>`;
  const panelFor = p => {
    if (p.kind === 'cas') {
      const r = route(p.id);
      const near = p.id === 'taoyuan' ? `<p class="panel-near">同區科目考察：${[3, 4].map(i => `<a href="#trip-${i + 1}">${esc(T[i].name_zh)}</a>`).join('、')}</p>` : '';
      return `<article class="panel panel-cas" id="panel-${p.id}" data-panel="${p.id}">
        <p class="panel-kind"><span class="key key-cas"></span>IB CAS 路線｜${esc(r.region_zh)}</p>
        <h3>${esc(r.place_zh)} ${en(r.place_en)}</h3>
        <p class="panel-meta"><b>${esc(r.days)}</b> 天 days</p>
        <ul class="themes">${r.themes_zh.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        ${sdgs(r.sdgs)}
        ${near}
        <div class="panel-actions"><a class="btn btn-ghost" href="#route-${r.id}">看完整 C／A／S 行程</a>${askBtn('cas', '以這條路線索取提案', REGIONS.find(g => g.cas === r.id).id)}</div>
      </article>`;
    }
    const extras = [];
    if (p.language) extras.push(`<li><a href="#language">華語與文化營</a> ${en('Chinese language camp')}<small>${esc(c.language.learning_where)}｜${esc(c.language.learning_days)} 天</small></li>`);
    if (p.academic) extras.push(`<li><a href="#academic">${esc(c.academic.sample.name_zh)}</a> ${en('Academic visit')}<small>${esc(c.academic.sample.where_zh)}｜${esc(c.academic.sample.days)} 天</small></li>`);
    const region = p.trips && p.trips.length ? TRIP_REGION[p.trips[0]] : '';
    return `<article class="panel panel-${p.kind}" id="panel-${p.id}" data-panel="${p.id}">
      <p class="panel-kind"><span class="key key-${p.kind}"></span>${p.kind === 'sub' ? '科目考察目的地' : '華語・學術據點'}</p>
      <h3>${esc(p.zh)} ${en(p.en)}</h3>
      <ul class="panel-trips">${(p.trips || []).map(tripLink).join('')}${extras.join('')}</ul>
      <div class="panel-actions">${askBtn(p.kind === 'sub' ? 'subject' : p.language ? 'language' : 'academic', '以這裡索取提案', region)}</div>
    </article>`;
  };
  const introPanel = `<article class="panel panel-intro is-active" id="panel-intro" data-panel="intro">
    <p class="panel-kind">圖例 Legend</p>
    <h3>選一個地點，看看那裡的行程 ${en('Pick a place on the map')}</h3>
    <ul class="legend">
      <li><span class="key key-cas"></span>IB CAS 服務學習路線（北・中・南）</li>
      <li><span class="key key-sub"></span>科目考察・STEAM 目的地</li>
      <li><span class="key key-city"></span>華語營與學術參訪據點</li>
    </ul>
    <p class="legend-jump">或直接看：${REGIONS.map(g => `<a href="#region-${g.id}">${esc(g.zh)}</a>`).join('')}</p>
  </article>`;

  /* ---------- 區域段落 ---------- */
  const inset = g => {
    const [x, y, w, h] = g.clip;
    return `<svg class="inset" viewBox="-40 -10 460 700" aria-hidden="true">
      <defs><clipPath id="clip-${g.id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs>
      <path class="inset-base" d="${ISLAND}"/>
      <path class="inset-hi" d="${ISLAND}" clip-path="url(#clip-${g.id})"/>
    </svg>`;
  };
  const casList = (label, labelEn, key, items) => `<div class="cas-col cas-${key}">
      <h4><span class="cas-letter" aria-hidden="true">${key.toUpperCase()}</span>${esc(label)} ${en(labelEn)}</h4>
      <ul>${items.map(([z, e]) => `<li>${esc(z)}${en(e)}</li>`).join('')}</ul>
    </div>`;
  const casRoute = r => `<article class="route" id="route-${r.id}">
      <div class="route-head">
        <figure class="route-fig"><img src="${img(r.image)}" alt="${esc(r.image_alt_zh)}" width="1600" height="1200" loading="lazy"></figure>
        <div class="route-intro">
          <p class="route-kind"><span class="key key-cas"></span>IB CAS 服務學習路線</p>
          <h3>${esc(r.place_zh)} ${en(r.place_en)}</h3>
          <p class="route-meta"><b>${esc(r.days)}</b> 天 days ｜ ${esc(r.region_zh)} ${en(r.region_en)}</p>
          <h4 class="sr-only">主題 Themes</h4>
          <ul class="themes themes-lg">${r.themes_zh.map((t, i) => `<li>${esc(t)}${en(r.themes_en[i])}</li>`).join('')}</ul>
          ${sdgs(r.sdgs)}
        </div>
      </div>
      <div class="cas-grid">
        ${casList('創意', 'Creativity', 'c', r.creativity)}
        ${casList('活動', 'Activity', 'a', r.activity)}
        ${casList('服務', 'Service', 's', r.service)}
      </div>
      ${r.note_zh ? `<p class="route-note">${esc(r.note_zh)}${en(r.note_en)}</p>` : ''}
      <div class="route-actions">${askBtn('cas', '以這條路線索取提案', REGIONS.find(g => g.cas === r.id).id)}</div>
    </article>`;
  const tripRow = i => {
    const t = T[i];
    return `<li class="trip" id="trip-${i + 1}">
      <div class="trip-main">
        <h4>${esc(t.name_zh)} ${en(t.name_en)}</h4>
        <p class="trip-dest"><span class="key key-sub"></span>${esc(t.dest_zh)} ${en(t.dest_en)}</p>
        <p class="trip-hl">${esc(t.highlights_zh)}${en(t.highlights_en)}</p>
      </div>
      <dl class="trip-facts">
        <div><dt>科目</dt><dd>${esc(t.subjects_zh)}</dd></div>
        <div><dt>年級</dt><dd>${esc(t.grade_zh)}</dd></div>
        <div><dt>天數</dt><dd>${esc(t.days)} 天</dd></div>
      </dl>
      ${askBtn('subject', '以這個行程索取提案', TRIP_REGION[i])}
    </li>`;
  };
  const ce = c.circular_economy;
  const circular = `<aside class="circular" aria-labelledby="ce-title">
      <h4 id="ce-title">${esc(ce.title_zh)} ${en(ce.title_en)}</h4>
      <p class="circular-lead">桃園路線與「科學與地理考察」都會走完這條流程。</p>
      <ol class="flow">${ce.steps.map(([z, e]) => `<li>${esc(z)}${en(e)}</li>`).join('')}</ol>
      <ul class="facts">${ce.facts_zh.map((f, i) => `<li>${esc(f)}${en(ce.facts_en[i])}</li>`).join('')}</ul>
    </aside>`;
  const regionSection = g => `<section class="region" id="region-${g.id}" aria-labelledby="rg-${g.id}">
      <header class="region-head">
        ${inset(g)}
        <div>
          <p class="region-lat">${esc(g.lat)}</p>
          <h2 id="rg-${g.id}">${esc(g.zh)} ${en(g.en)}</h2>
          <p class="region-count">${g.cas ? '1 條 CAS 路線、' : ''}${g.trips.length} 條科目考察</p>
        </div>
      </header>
      ${g.cas ? casRoute(route(g.cas)) : ''}
      ${g.id === 'north' ? circular : ''}
      <div class="region-trips">
        <h3 class="trips-title"><span class="key key-sub"></span>這一區的科目考察 ${en('Subject trips in this region')}</h3>
        <ul class="trip-list">${g.trips.map(tripRow).join('')}</ul>
      </div>
    </section>`;

  /* ---------- 服務（圖例） ---------- */
  const svcLink = { cas: '#region-north', service: '#region-north', language: '#language', subject: '#subjects', academic: '#academic', pd: '#plan' };
  const services = `<section class="services" id="services" aria-labelledby="svc-title">
    <div class="wrap">
      <div class="sec-head">
        <h2 id="svc-title">六種旅行方式 ${en('Six ways to learn in Taiwan')}</h2>
        <p>${esc(c.intro.zh)}</p>
      </div>
      <ul class="svc-list">${c.services.map(v => `<li class="svc" id="svc-${v.id}">
        ${icon(v.id, 'svc-ico')}
        <div>
          <h3><a href="${svcLink[v.id]}">${esc(v.zh)}</a> ${en(v.en)}</h3>
          <p>${esc(v.summary_zh)}</p>
          <p class="en-p" lang="en">${esc(v.summary_en)}</p>
          <a class="btn-text" href="#plan" data-prefill-type="${v.id}">索取${esc(v.zh)}提案</a>
        </div>
      </li>`).join('')}</ul>
    </div>
  </section>`;

  /* ---------- 科目考察總表 ---------- */
  const regionName = id => REGIONS.find(g => g.id === id).zh;
  const subjectTable = `<section class="subjects" id="subjects" aria-labelledby="sub-title">
    <div class="wrap">
      <div class="sec-head">
        <h2 id="sub-title">科目考察總表 ${en('All subject & STEAM trips')}</h2>
        <p>依學科標準、課程目標或跨學科專題（PBL）設計，每條都可依年級與天數調整。${en('Built around subject criteria, curriculum goals or PBL projects.')}</p>
      </div>
      <div class="table-wrap">
      <table class="tbl tbl-sub">
        <caption class="sr-only">8 條科目考察行程：地區、目的地、科目、重點、年級、天數</caption>
        <thead><tr><th scope="col">行程 Trip</th><th scope="col">地區</th><th scope="col">目的地 Destination</th><th scope="col">科目 Subjects</th><th scope="col">考察重點 Highlights</th><th scope="col">年級</th><th scope="col">天數</th></tr></thead>
        <tbody>${T.map((t, i) => `<tr>
          <th scope="row"><a href="#trip-${i + 1}">${esc(t.name_zh)}</a>${en(t.name_en)}</th>
          <td data-label="地區">${esc(regionName(TRIP_REGION[i]))}</td>
          <td data-label="目的地">${esc(t.dest_zh)}${en(t.dest_en)}</td>
          <td data-label="科目">${esc(t.subjects_zh)}${en(t.subjects_en)}</td>
          <td data-label="重點">${esc(t.highlights_zh)}</td>
          <td data-label="年級">${esc(t.grade_zh)}${en(t.grade_en)}</td>
          <td data-label="天數">${esc(t.days)} 天</td>
        </tr>`).join('')}</tbody>
      </table>
      </div>
      <p class="sec-cta">${askBtn('subject', '索取科目考察提案')}</p>
    </div>
  </section>`;

  /* ---------- 語言與文化 ---------- */
  const L = c.language;
  const gallery = c.images.gallery.slice(0, 4);
  const language = `<section class="language" id="language" aria-labelledby="lang-title">
    <div class="wrap">
      <div class="sec-head">
        <h2 id="lang-title">語言與文化 ${en('Language & Culture')}</h2>
        <p>${esc(L.culture_zh)}</p>
      </div>
      <div class="lang-grid">
        <div class="lang-info">
          <h3>短期華語課程 ${en('Short-term Chinese programmes')}</h3>
          <p>${esc(L.learning_zh)}</p>
          <p class="en-p" lang="en">${esc(L.learning_en)}</p>
          <dl class="lang-facts">
            <div><dt>地點 Where</dt><dd>${esc(L.learning_where)}</dd></div>
            <div><dt>天數 Days</dt><dd><b>${esc(L.learning_days)}</b> 天</dd></div>
          </dl>
        </div>
        <ul class="lang-gallery">${gallery.map(g => `<li><img src="${img(g.file)}" alt="${esc(g.alt_zh)}" loading="lazy" width="400" height="400"></li>`).join('')}</ul>
      </div>
      <div class="table-wrap">
      <table class="tbl tbl-ab">
        <caption>方案 A／B 比較 ${en('Program A vs. Program B')}</caption>
        <thead><tr><th scope="col"><span class="sr-only">項目</span></th>${L.plans.map(p => `<th scope="col"><span class="plan-id">${p.id}</span>${esc(p.zh.replace(/^方案 [AB]：/, ''))}${en(p.en.replace(/^Program [AB]: /, ''))}</th>`).join('')}</tr></thead>
        <tbody>${L.compare.map(r => `<tr>
          <th scope="row">${esc(r.row_zh)}${en(r.row_en)}</th>
          <td data-label="方案 A">${esc(r.A_zh)}${en(r.A_en)}</td>
          <td data-label="方案 B">${esc(r.B_zh)}${en(r.B_en)}</td>
        </tr>`).join('')}</tbody>
      </table>
      </div>
      <div class="lang-more">
        <div><h3>其他可安排的活動 ${en('Also available')}</h3><p>${esc(L.other_zh)}</p><p class="en-p" lang="en">${esc(L.other_en)}</p></div>
        <div><h3>方案皆包含 ${en("What's included")}</h3><p>${esc(L.included_zh)}</p><p class="en-p" lang="en">${esc(L.included_en)}</p></div>
      </div>
      <p class="sec-cta">${askBtn('language', '索取華語與文化營提案')}</p>
    </div>
  </section>`;

  /* ---------- 學術參訪 ---------- */
  const A = c.academic, S = A.sample;
  const academic = `<section class="academic" id="academic" aria-labelledby="ac-title">
    <div class="wrap">
      <div class="sec-head">
        <h2 id="ac-title">學術參訪 ${en('Academic Visits')}</h2>
        <p>${esc(A.intro_zh)}</p>
        <p class="en-p" lang="en">${esc(A.intro_en)}</p>
      </div>
      <article class="sample">
        <figure class="sample-fig"><img src="${img(S.image)}" alt="${esc(S.image_alt_zh)}" width="1600" height="1200" loading="lazy"></figure>
        <div class="sample-body">
          <p class="route-kind"><span class="key key-city"></span>範例團 Sample programme</p>
          <h3>${esc(S.name_zh)} ${en(S.name_en)}</h3>
          <p class="route-meta"><b>${esc(S.days)}</b> 天 days ｜ ${esc(S.where_zh)} ${en(S.where_en)}</p>
          ${sdgs(S.sdgs)}
          <div class="blocks">${S.blocks.map(b => `<div class="block"><h4>${esc(b.zh)} ${en(b.en)}</h4><ul>${b.items.map(([z, e]) => `<li>${esc(z)}${en(e)}</li>`).join('')}</ul></div>`).join('')}</div>
          ${askBtn('academic', '以這個範例團索取提案')}
        </div>
      </article>
    </div>
  </section>`;

  /* ---------- 關於 ---------- */
  const ab = c.about;
  const about = `<section class="about" id="about" aria-labelledby="ab-title">
    <div class="wrap">
      <div class="sec-head">
        <h2 id="ab-title">關於知行學旅 ${en('About us')}</h2>
        <p>${esc(ab.who_zh)}</p>
        <p class="en-p" lang="en">${esc(ab.who_en)}</p>
      </div>
      <ul class="soundings">${c.stats.map(x => `<li><b>${esc(x.num)}</b><span>${esc(x.zh)}</span>${en(x.en)}</li>`).join('')}</ul>
      <div class="vm">
        <div><h3>願景 ${en('Vision')}</h3><p>${esc(ab.vision_zh)}</p><p class="en-p" lang="en">${esc(ab.vision_en)}</p></div>
        <div><h3>使命 ${en('Mission')}</h3><p>${esc(ab.mission_zh)}</p><p class="en-p" lang="en">${esc(ab.mission_en)}</p></div>
      </div>
      <div class="partners"><h3>我們串連的夥伴 ${en('Who we connect')}</h3><ul>${ab.partners.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>
      <div class="placeholder" role="note">
        <p><b>待補：合作學校 logo／老師推薦</b></p>
        <p>此區預留給合作學校標誌與帶隊老師的推薦語（目前尚無素材）。${en('Placeholder: partner school logos & teacher testimonials.')}</p>
      </div>
    </div>
  </section>`;

  /* ---------- 表單 ---------- */
  const inq = c.inquiry;
  const form = `<section class="plan" id="plan" aria-labelledby="plan-title">
    <div class="wrap plan-wrap">
      <div class="plan-intro">
        <h2 id="plan-title">規劃你的路線 ${en('Plan your route')}</h2>
        <p>告訴我們學生人數、想去的地區與學習目標，我們會在 2 個工作天內回覆一份客製提案方向。</p>
        <p class="en-p" lang="en">Tell us about your group and goals — we reply with a tailored proposal within 2 working days.</p>
        <p class="plan-direct">也可以直接聯絡：<a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a><br><a href="${esc(ct.phone_href)}">${esc(ct.phone)}</a></p>
      </div>
      <form class="inq" data-inquiry novalidate>
        <fieldset class="f-type">
          <legend>想規劃哪一種旅行？ ${en('Trip type')} <span class="req">必填</span></legend>
          <div class="type-cards">${inq.types.map((t, i) => `<label class="type-card">
            <input type="radio" name="type" value="${t.value}" required${i === 0 ? '' : ''}>
            <span class="type-face">${icon(t.value)}<span class="type-zh">${esc(t.zh)}</span>${en(t.en)}</span>
          </label>`).join('')}</div>
        </fieldset>
        <fieldset class="f-size">
          <legend>人數 ${en('Group size')} <span class="req">必填</span></legend>
          <div class="chips">${inq.group_sizes.map(g => `<label class="chip"><input type="radio" name="group_size" value="${g.value}" required><span>${esc(g.zh)}</span></label>`).join('')}</div>
        </fieldset>
        <fieldset class="f-regions">
          <legend>想去的地區 ${en('Regions')} <span class="opt">可複選</span></legend>
          <div class="chips">${REGIONS.map(g => `<label class="chip chip-region"><input type="checkbox" name="regions" value="${g.id}"><span>${esc(g.zh)}</span></label>`).join('')}</div>
        </fieldset>
        <div class="f-row">
          <label class="field"><span>年級 ${en('Grade')}</span><input type="text" name="grade" placeholder="例：G10–G11、高一"></label>
          <label class="field"><span>預計月份 ${en('Month')}</span><input type="month" name="month"></label>
        </div>
        <div class="f-row">
          <label class="field"><span>學校／單位 ${en('School')}</span><input type="text" name="school" autocomplete="organization"></label>
          <label class="field"><span>聯絡人 ${en('Name')}</span><input type="text" name="name" autocomplete="name"></label>
        </div>
        <label class="field"><span>Email <span class="req">必填</span></span><input type="email" name="email" required autocomplete="email"></label>
        <label class="field"><span>想達成的學習目標或其他需求 ${en('Message')}</span><textarea name="message" rows="4" placeholder="例：想結合 SDG 14 與淨灘服務，需要 CAS 反思時段"></textarea></label>
        <button type="submit" class="btn btn-submit">送出，索取客製提案</button>
        <div data-inquiry-result hidden></div>
      </form>
    </div>
  </section>`;

  const navItems = [['#map', '路線圖'], ...REGIONS.map(g => ['#region-' + g.id, g.glyph]), ['#subjects', '科目'], ['#language', '華語'], ['#academic', '學術'], ['#about', '關於']];

  return `<!doctype html>
<html lang="zh-Hant-TW" data-concept="03-island-map">
<head>
${ctx.head()}
<script>document.documentElement.classList.add('js')</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Alegreya+Sans:wght@400;500;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
<a class="skip" href="#main">跳到主要內容</a>
<p class="concept-tag"><a href="${ctx.base}index.html">← 設計概念總覽</a><span>概念 03・島嶼路線圖 Island Map</span></p>
<header class="site-head">
  <div class="wrap head-row">
    <a class="brand" href="#top"><img src="${img('logo-zhixing.png')}" alt="知行學旅標誌" width="36" height="36"><span><b>${esc(s.name_zh)}</b>${en(s.name_en)}</span></a>
    <nav aria-label="主選單"><ul>${navItems.map(([h, t]) => `<li><a href="${h}">${esc(t)}</a></li>`).join('')}</ul></nav>
    <a class="btn btn-head" href="#plan">索取客製提案</a>
  </div>
</header>
<main id="main">
  <section class="hero" id="top" aria-labelledby="hero-title">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <h1 id="hero-title"><span class="h1-zh">${esc(s.name_zh)}</span><span class="h1-en" lang="en">${esc(s.name_en)}</span></h1>
        <p class="hero-tag">${esc(s.tagline_zh)}</p>
        <p class="hero-lead">把課程帶到台灣的真實現場：桃園海岸、阿里山茶園、美濃客家庄。我們為國際學校與一般學校規劃 IB CAS、服務學習、華語營與學科考察，每趟融入至少 2 項 SDGs。</p>
        <p class="hero-lead en-p" lang="en">IB CAS, service learning, language and subject trips across Taiwan — every route covers at least 2 UN SDGs.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#plan">索取客製提案 <span lang="en">Request a proposal</span></a>
          <a class="btn btn-ghost" href="#region-north">從北台灣開始看</a>
        </div>
      </div>
      <div class="hero-map" id="map">
        ${mapSvg}
      </div>
      <div class="hero-panel" aria-live="polite">
        ${introPanel}
        ${PINS.map(panelFor).join('')}
      </div>
    </div>
  </section>
  ${services}
  <div class="regions" id="regions">
    <div class="wrap">
      <div class="sec-head regions-head">
        <h2 class="sr-only">依地區探索行程 Trips by region</h2>
        <p class="regions-lead">由北往南，再到東海岸。每一區列出 CAS 路線的完整創意・活動・服務內容，以及同區的科目考察。</p>
      </div>
      ${REGIONS.map(regionSection).join('')}
    </div>
  </div>
  ${subjectTable}
  ${language}
  ${academic}
  ${about}
  ${form}
</main>
<footer class="site-foot">
  <div class="wrap foot-grid">
    <div>
      <p class="foot-brand"><b>${esc(s.legal_zh)}</b>${en(s.legal_en)}</p>
      <p>統一編號 ${esc(ct.tax_id)}</p>
    </div>
    <address>
      <p>${esc(ct.address_zh)}${en(ct.address_en)}</p>
      <p><a href="${esc(ct.phone_href)}">${esc(ct.phone)}</a>｜<a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a>｜<a href="${esc(ct.linkedin)}" rel="noopener">LinkedIn</a></p>
    </address>
    <p class="copy">© 2026 ${esc(s.name_zh)} ${esc(s.name_en)}</p>
  </div>
</footer>
<script src="script.js" defer></script>
${ctx.inquiryScript}
</body>
</html>`;
}
