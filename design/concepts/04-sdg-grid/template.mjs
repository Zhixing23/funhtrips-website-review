// 概念 04・永續色塊 SDG Grid
// 瑞士國際主義／模組化網格：黑白基底，SDG 官方色是唯一的色彩系統。
export default function render(ctx) {
  const { c, esc, img, sdg } = ctx;
  const S = c.site;

  // 文字顏色：依 SDG 色的亮度選黑或白，確保對比
  const ink = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => {
      v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    const L = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
    return (1.05 / (L + 0.05)) >= 4.5 ? '#fff' : '#000';
  };
  const col = (n) => sdg(n).color;
  const cv = (n) => `--c:${col(n)};--ink:${ink(col(n))}`;

  // 每個服務類型對應一個 SDG 色（識別用）
  const TYPE_SDG = { cas: 15, service: 14, language: 11, subject: 12, academic: 16, pd: 10 };
  const typeVars = (id) => TYPE_SDG[id] ? cv(TYPE_SDG[id]) : '--c:#000;--ink:#fff';

  const sdgTag = (n) => {
    const s = sdg(n);
    return `<li class="sdg-tag" style="${cv(n)}"><span class="sdg-tag__n">${s.n}</span><span class="sdg-tag__t">${esc(s.zh)}<span lang="en">${esc(s.en)}</span></span></li>`;
  };
  const sdgTags = (arr) => `<ul class="sdg-tags" aria-label="對應 SDGs">${arr.map(sdgTag).join('')}</ul>`;
  const stripe = (arr) => `<div class="stripe" aria-hidden="true">${arr.map(n => `<span style="background:${col(n)}"></span>`).join('')}</div>`;
  const pairList = (items) => `<ul class="pairs">${items.map(([zh, en]) => `<li>${esc(zh)}<span lang="en">${esc(en)}</span></li>`).join('')}</ul>`;

  const secHead = ({ id, num, unit, zh, en, color, lede }) => `
    <header class="sec-head">
      <div class="sec-num" style="${color}"><span class="sec-num__v">${esc(num)}</span><span class="sec-num__u">${esc(unit)}</span></div>
      <div class="sec-title">
        <h2 id="${id}-h">${esc(zh)}<span lang="en">${esc(en)}</span></h2>
        ${lede ? `<p class="lede">${lede}</p>` : ''}
      </div>
    </header>`;

  // ---------- Hero 色塊牆 ----------
  const sdgNums = Object.keys(c.sdgs).map(Number).sort((a, b) => a - b);
  const g = c.images.gallery;
  const photoTile = (file, alt, extra = '', eager = false) =>
    `<figure class="wall__ph ${extra}"><img src="${img(file)}" alt="${esc(alt)}" width="600" height="600"${eager === 'hi' ? ' fetchpriority="high"' : eager ? '' : ' loading="lazy"'}></figure>`;
  const sdgTile = (n) => { const s = sdg(n); return `<div class="wall__sdg" style="${cv(n)}"><span class="wall__n">${s.n}</span><span class="wall__t">${esc(s.zh)}</span></div>`; };
  const wall = [
    photoTile(c.images.hero.file, c.images.hero.alt_zh, 'wall__ph--big', 'hi'),
    sdgTile(14), sdgTile(11),
    sdgTile(3), photoTile(g[2].file, g[2].alt_zh, 'duo', true),
    photoTile(c.services[0].image, '登山健行的學生剪影', 'duo duo--g', true), sdgTile(15), sdgTile(12), sdgTile(10),
    sdgTile(13), photoTile(c.cas_routes[2].image, c.cas_routes[2].image_alt_zh, 'duo duo--m', true), sdgTile(16), photoTile(g[8].file, g[8].alt_zh, 'duo duo--b', true),
  ].join('');

  // ---------- 服務 ----------
  const services = c.services.map(s => `
    <article class="svc" style="${typeVars(s.id)}">
      <div class="svc__bar" aria-hidden="true"></div>
      <figure class="svc__ph"><img src="${img(s.image)}" alt="${esc(s.zh)}行程照片" width="600" height="400" loading="lazy"></figure>
      <div class="svc__body">
        <h3>${esc(s.zh)}<span lang="en">${esc(s.en)}</span></h3>
        <p>${esc(s.summary_zh)}</p>
        <p class="en" lang="en">${esc(s.summary_en)}</p>
        <a class="ask" href="#plan" data-prefill-type="${s.id}">詢問此方案 →</a>
      </div>
    </article>`).join('');

  // ---------- CAS ----------
  const routes = c.cas_routes.map(r => `
    <article class="route" id="route-${r.id}" aria-labelledby="route-${r.id}-h">
      ${stripe(r.sdgs)}
      <div class="route__top">
        <p class="route__region">${esc(r.region_zh)}<span lang="en">${esc(r.region_en)}</span></p>
        <h3 id="route-${r.id}-h">${esc(r.place_zh)}<span lang="en">${esc(r.place_en)}</span></h3>
        <p class="route__days"><span class="big">${esc(r.days)}</span> 天<span lang="en">days</span></p>
      </div>
      <figure class="route__ph duo" style="--c:${col(r.sdgs[0])}"><img src="${img(r.image)}" alt="${esc(r.image_alt_zh)}" width="800" height="500" loading="lazy"></figure>
      <div class="route__themes">
        <h4>主題 <span lang="en">Themes</span></h4>
        <ul>${r.themes_zh.map((t, i) => `<li>${esc(t)}<span lang="en">${esc(r.themes_en[i] || '')}</span></li>`).join('')}</ul>
      </div>
      <div class="cas3">
        <div class="cas3__col"><h4><b>C</b>創意<span lang="en">Creativity</span></h4>${pairList(r.creativity)}</div>
        <div class="cas3__col"><h4><b>A</b>活動<span lang="en">Activity</span></h4>${pairList(r.activity)}</div>
        <div class="cas3__col"><h4><b>S</b>服務<span lang="en">Service</span></h4>${pairList(r.service)}</div>
      </div>
      ${r.note_zh ? `<p class="route__note">${esc(r.note_zh)}<span lang="en">${esc(r.note_en)}</span></p>` : ''}
      ${sdgTags(r.sdgs)}
      <a class="ask" href="#plan" data-prefill-type="cas">詢問此路線 →</a>
    </article>`).join('');

  // ---------- 語言 ----------
  const L = c.language;
  const [pA, pB] = L.plans;
  const compareRows = L.compare.map(r => `
        <tr>
          <th scope="row">${esc(r.row_zh)}<span lang="en">${esc(r.row_en)}</span></th>
          <td class="a">${esc(r.A_zh)}<span lang="en">${esc(r.A_en)}</span></td>
          <td class="b">${esc(r.B_zh)}<span lang="en">${esc(r.B_en)}</span></td>
        </tr>`).join('');

  // ---------- 科目考察 ----------
  const trips = c.subject_trips.map(t => `
        <tr>
          <th scope="row">${esc(t.name_zh)}<span lang="en">${esc(t.name_en)}</span></th>
          <td>${esc(t.dest_zh)}<span lang="en">${esc(t.dest_en)}</span></td>
          <td>${esc(t.subjects_zh)}<span lang="en">${esc(t.subjects_en)}</span></td>
          <td>${esc(t.highlights_zh)}<span lang="en">${esc(t.highlights_en)}</span></td>
          <td>${esc(t.grade_zh)}<span lang="en">${esc(t.grade_en)}</span></td>
          <td class="num">${esc(t.days)}</td>
        </tr>`).join('');
  const ce = c.circular_economy;
  const ceColors = [14, 12, 11, 13, 15];
  const ceSteps = ce.steps.map(([zh, en], i) => `<li style="${cv(ceColors[i])}"><span class="ce__i">${i + 1}</span>${esc(zh)}<span lang="en">${esc(en)}</span></li>`).join('');

  // ---------- 學術 ----------
  const A = c.academic, AS = A.sample;
  const blocks = AS.blocks.map(b => `
        <div class="ablock">
          <h4>${esc(b.zh)}<span lang="en">${esc(b.en)}</span></h4>
          ${pairList(b.items)}
        </div>`).join('');

  // ---------- Stats ----------
  const statSdg = [16, 15, 12, 10];
  const stats = c.stats.map((s, i) => `
      <div class="stat" style="${cv(statSdg[i])}">
        <dt class="stat__n">${esc(s.num)}</dt>
        <dd>${esc(s.zh)}<span lang="en">${esc(s.en)}</span></dd>
      </div>`).join('');

  // ---------- 表單 ----------
  const I = c.inquiry;
  const typeTiles = I.types.map((t, i) => `
          <label class="tile" style="${typeVars(t.value)}">
            <input type="radio" name="type" value="${t.value}" required>
            <span class="tile__box"><span class="tile__zh">${esc(t.zh)}</span><span class="tile__en" lang="en">${esc(t.en)}</span></span>
          </label>`).join('');
  const sizeRanges = JSON.stringify(I.group_sizes.map(s => ({ v: s.value, zh: s.zh })));

  return `<!doctype html>
<html lang="zh-Hant-TW" data-concept="${ctx.concept}">
<head>
${ctx.head()}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Noto+Sans+TC:wght@400;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
<a class="skip" href="#main">跳到主要內容</a>
<p class="concept-tag"><a href="${ctx.base}index.html">← 設計概念總覽</a><span>概念 04・永續色塊 SDG Grid</span></p>

<header class="site-head">
  <a class="brand" href="#top" aria-label="${esc(S.name_zh)} ${esc(S.name_en)}">
    <span class="brand__mark" aria-hidden="true">${sdgNums.slice(0, 4).map(n => `<i style="background:${col(n)}"></i>`).join('')}</span>
    <span class="brand__zh">${esc(S.name_zh)}</span><span class="brand__en" lang="en">${esc(S.name_en)}</span>
  </a>
  <nav aria-label="主選單">
    <ul>
      <li><a href="#services">服務</a></li>
      <li><a href="#cas">CAS 路線</a></li>
      <li><a href="#language">語言文化</a></li>
      <li><a href="#subject">科目考察</a></li>
      <li><a href="#academic">學術參訪</a></li>
      <li><a href="#about">關於</a></li>
      <li><a class="nav-cta" href="#plan">開始規劃</a></li>
    </ul>
  </nav>
</header>

<main id="main">

<section class="hero" id="top" aria-labelledby="hero-h">
  <div class="hero__text">
    <p class="hero__brand">${esc(S.name_zh)}<span lang="en">${esc(S.name_en)}</span></p>
    <h1 id="hero-h"><span class="h1-a">每趟旅行，</span><span class="h1-b">至少兩項 <b>SDGs</b></span></h1>
    <p class="hero__tag">${esc(S.tagline_zh)}<span lang="en">${esc(S.tagline_en)}</span></p>
    <p class="hero__lede">${esc(S.seo.description_zh)}</p>
    <div class="hero__cta">
      <a class="btn" href="#plan">索取客製提案<span lang="en">Request a proposal</span></a>
      <a class="btn btn--ghost" href="#cas">看 3 條 CAS 路線</a>
    </div>
  </div>
  <div class="wall" aria-label="本公司行程涵蓋的 SDGs 與現場照片">${wall}</div>
</section>

<section class="stats" aria-label="知行學旅數字">
  <dl>${stats}</dl>
</section>

<section class="sec" id="services" aria-labelledby="services-h">
  ${secHead({ id: 'services', num: '6', unit: '項服務', zh: '我們做的事', en: 'What we do', color: '--c:#000;--ink:#fff',
    lede: esc(c.intro.zh) + `<span lang="en">${esc(c.intro.en)}</span>` })}
  <div class="aud">
    <p class="aud__h">適合對象</p>
    <ul>${c.audiences.map(a => `<li style="${typeVars(a.service)}"><a href="#plan" data-prefill-type="${a.service}">${esc(a.zh)}<span lang="en">${esc(a.en)}</span></a></li>`).join('')}</ul>
  </div>
  <div class="svc-grid">${services}</div>
</section>

<section class="sec" id="cas" aria-labelledby="cas-h">
  ${secHead({ id: 'cas', num: '3', unit: '條路線', zh: 'IB CAS 北・中・南路線', en: 'IB CAS routes: north, central, south', color: cv(15),
    lede: '每條路線 5–7 天，創意（C）、活動（A）、服務（S）三軌並行，至少涵蓋兩項聯合國永續發展目標。頂端色條即該路線的 SDGs。<span lang="en">Each route runs 5–7 days with Creativity, Activity and Service strands; the colour bar shows its SDGs.</span>' })}
  <div class="routes">${routes}</div>
</section>

<section class="sec" id="language" aria-labelledby="language-h">
  ${secHead({ id: 'language', num: L.learning_days, unit: '天華語課程', zh: '語言與文化', en: 'Language & Culture', color: cv(11),
    lede: esc(L.culture_zh) + `<span lang="en">${esc(L.culture_en)}</span>` })}
  <div class="lang-info">
    <div class="lang-info__cell">
      <h3>華語課程<span lang="en">Chinese learning</span></h3>
      <p>${esc(L.learning_zh)}</p><p class="en" lang="en">${esc(L.learning_en)}</p>
    </div>
    <dl class="lang-info__facts">
      <div><dt>地點 <span lang="en">Where</span></dt><dd>${esc(L.learning_where)}</dd></div>
      <div><dt>天數 <span lang="en">Days</span></dt><dd><span class="big">${esc(L.learning_days)}</span> 天</dd></div>
    </dl>
  </div>
  <div class="tbl-wrap">
    <table class="ab">
      <caption>方案 A／B 比較 <span lang="en">Program A vs. B</span></caption>
      <thead>
        <tr>
          <td></td>
          <th scope="col" class="a"><span class="ab__k">A</span>${esc(pA.zh.replace(/^方案 A：/, ''))}<span lang="en">${esc(pA.en.replace(/^Program A: /, ''))}</span></th>
          <th scope="col" class="b"><span class="ab__k">B</span>${esc(pB.zh.replace(/^方案 B：/, ''))}<span lang="en">${esc(pB.en.replace(/^Program B: /, ''))}</span></th>
        </tr>
      </thead>
      <tbody>${compareRows}
      </tbody>
    </table>
  </div>
  <div class="lang-more">
    <div><h3>其他可安排活動<span lang="en">Also available</span></h3><p>${esc(L.other_zh)}</p><p class="en" lang="en">${esc(L.other_en)}</p></div>
    <div><h3>方案包含<span lang="en">Included</span></h3><p>${esc(L.included_zh)}</p><p class="en" lang="en">${esc(L.included_en)}</p></div>
    <a class="ask ask--block" href="#plan" data-prefill-type="language" style="${cv(11)}">詢問華語與文化營 →</a>
  </div>
</section>

<section class="sec" id="subject" aria-labelledby="subject-h">
  ${secHead({ id: 'subject', num: String(c.subject_trips.length), unit: '條科目考察', zh: '科目考察・STEAM', en: 'Subject & STEAM trips', color: cv(12),
    lede: '依學科標準、課程目標或跨學科專題（PBL）設計；以下行程皆可調整天數與重點。<span lang="en">Built around subject criteria or PBL projects; every template can be adjusted.</span>' })}
  <div class="tbl-wrap">
    <table class="trips">
      <caption>科目考察行程一覽 <span lang="en">Subject trip templates</span></caption>
      <thead><tr>
        <th scope="col">行程<span lang="en">Trip</span></th>
        <th scope="col">地點<span lang="en">Where</span></th>
        <th scope="col">科目<span lang="en">Subjects</span></th>
        <th scope="col">重點<span lang="en">Highlights</span></th>
        <th scope="col">年級<span lang="en">Grades</span></th>
        <th scope="col" class="num">天數<span lang="en">Days</span></th>
      </tr></thead>
      <tbody>${trips}
      </tbody>
    </table>
  </div>
  <div class="ce">
    <div class="ce__head">
      <h3>${esc(ce.title_zh)}<span lang="en">${esc(ce.title_en)}</span></h3>
      <p>桃園科學與地理考察、CAS 桃園路線的核心體驗：學生走完塑膠從廢棄物到產品的完整流程。</p>
    </div>
    <ol class="ce__steps">${ceSteps}</ol>
    <ul class="ce__facts">${ce.facts_zh.map((f, i) => `<li>${esc(f)}<span lang="en">${esc(ce.facts_en[i] || '')}</span></li>`).join('')}</ul>
    <a class="ask" href="#plan" data-prefill-type="subject">詢問科目考察 →</a>
  </div>
</section>

<section class="sec" id="academic" aria-labelledby="academic-h">
  ${secHead({ id: 'academic', num: AS.days, unit: '天範例團', zh: '學術參訪', en: 'Academic visits', color: cv(16),
    lede: esc(A.intro_zh) + `<span lang="en">${esc(A.intro_en)}</span>` })}
  <article class="sample">
    ${stripe(AS.sdgs)}
    <div class="sample__grid">
      <div class="sample__meta">
        <h3>${esc(AS.name_zh)}<span lang="en">${esc(AS.name_en)}</span></h3>
        <dl>
          <div><dt>地點 <span lang="en">Where</span></dt><dd>${esc(AS.where_zh)}<span lang="en">${esc(AS.where_en)}</span></dd></div>
          <div><dt>天數 <span lang="en">Days</span></dt><dd><span class="big">${esc(AS.days)}</span> 天</dd></div>
        </dl>
        ${sdgTags(AS.sdgs)}
      </div>
      <figure class="sample__ph duo" style="--c:${col(16)}"><img src="${img(AS.image)}" alt="${esc(AS.image_alt_zh)}" width="800" height="600" loading="lazy"></figure>
      <div class="ablocks">${blocks}</div>
    </div>
    <a class="ask" href="#plan" data-prefill-type="academic">詢問學術參訪 →</a>
  </article>
</section>

<section class="sec" id="about" aria-labelledby="about-h">
  ${secHead({ id: 'about', num: '10+', unit: '年經驗', zh: '關於知行學旅', en: 'About us', color: cv(13), lede: '' })}
  <div class="about">
    <div class="about__cell about__who"><h3>我們是誰<span lang="en">Who we are</span></h3><p>${esc(c.about.who_zh)}</p><p class="en" lang="en">${esc(c.about.who_en)}</p></div>
    <div class="about__cell"><h3>願景<span lang="en">Vision</span></h3><p>${esc(c.about.vision_zh)}</p><p class="en" lang="en">${esc(c.about.vision_en)}</p></div>
    <div class="about__cell"><h3>使命<span lang="en">Mission</span></h3><p>${esc(c.about.mission_zh)}</p><p class="en" lang="en">${esc(c.about.mission_en)}</p></div>
    <div class="about__cell about__partners"><h3>我們連結的夥伴<span lang="en">Who we connect</span></h3>
      <ul>${c.about.partners.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>
  </div>
  <div class="placeholder" role="note">
    <p><strong>待補：合作學校 logo／老師推薦</strong></p>
    <p>此區預留 4–6 個合作學校標誌與 1–2 則 CAS 協調員推薦語，素材到位後補上。</p>
    <div class="placeholder__grid" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></div>
  </div>
</section>

<section class="plan" id="plan" aria-labelledby="plan-h">
  <div class="plan__block">
    <h2 id="plan-h">開始規劃<span lang="en">Request a proposal</span></h2>
    <p>告訴我們類型、人數與月份，2 個工作天內回覆提案方向與 SDGs 對應建議。</p>
    <p class="en" lang="en">Tell us the trip type, group size and month — we reply within 2 working days.</p>
    <p class="plan__direct">也可以直接聯絡<br><a href="mailto:${esc(S.contact.email)}">${esc(S.contact.email)}</a><br><a href="${S.contact.phone_href}">${esc(S.contact.phone)}</a></p>
  </div>
  <form class="plan__form" data-inquiry>
    <fieldset class="f-type">
      <legend>行程類型 <span lang="en">Trip type</span> <em>必填</em></legend>
      <div class="tiles">${typeTiles}
      </div>
    </fieldset>

    <fieldset class="f-size">
      <legend>人數 <span lang="en">Group size</span> <em>必填</em></legend>
      <div class="stepper" data-stepper data-ranges='${esc(sizeRanges)}'>
        <button type="button" class="stepper__btn" data-step="-1" aria-label="減少人數">−</button>
        <label class="stepper__val"><span class="sr">人數（學生與帶隊老師）</span>
          <input type="number" name="group_size" value="24" min="1" max="500" inputmode="numeric" required>
        </label>
        <button type="button" class="stepper__btn" data-step="1" aria-label="增加人數">+</button>
        <p class="stepper__range" aria-live="polite">人<span data-range-label></span></p>
      </div>
    </fieldset>

    <div class="fields">
      <label class="fld"><span>年級 <span lang="en">Grade</span></span><input name="grade" type="text" placeholder="例：G11–G12"></label>
      <label class="fld"><span>預計月份 <span lang="en">Month</span></span><input name="month" type="month"></label>
      <label class="fld"><span>學校／單位 <span lang="en">School</span></span><input name="school" type="text" autocomplete="organization"></label>
      <label class="fld"><span>聯絡人 <span lang="en">Name</span></span><input name="name" type="text" autocomplete="name"></label>
      <label class="fld fld--wide"><span>Email <em>必填</em></span><input name="email" type="email" autocomplete="email" required></label>
      <label class="fld fld--wide"><span>想達成的學習目標或其他需求 <span lang="en">Message</span></span><textarea name="message" rows="3"></textarea></label>
    </div>
    <button type="submit" class="submit">送出，索取客製提案<span lang="en">Request a proposal</span></button>
    <div data-inquiry-result hidden></div>
  </form>
</section>

</main>

<footer class="site-foot">
  <div class="foot__brand">
    ${stripe(sdgNums)}
    <p class="foot__name">${esc(S.legal_zh)}<span lang="en">${esc(S.legal_en)}</span></p>
  </div>
  <address class="foot__contact">
    <p>${esc(S.contact.address_zh)}<span lang="en">${esc(S.contact.address_en)}</span></p>
    <p><a href="${S.contact.phone_href}">${esc(S.contact.phone)}</a></p>
    <p><a href="mailto:${esc(S.contact.email)}">${esc(S.contact.email)}</a></p>
    <p><a href="${esc(S.contact.linkedin)}" rel="noopener">LinkedIn</a></p>
  </address>
  <p class="foot__legal">統一編號 ${esc(S.contact.tax_id)}<br>© 2026 ${esc(S.name_zh)} ${esc(S.name_en)}</p>
</footer>

<script src="script.js" defer></script>
${ctx.inquiryScript}
</body>
</html>`;
}
