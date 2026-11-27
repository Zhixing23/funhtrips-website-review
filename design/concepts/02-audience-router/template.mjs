// 概念 02・三秒分流 Audience Router
// Hero 先問「您是哪一種團體？」→ 分流到推薦服務／路線 → 低門檻三欄表單。
// 所有文字都在 HTML 內；script.js 只做漸進增強（分流高亮、tabs、篩選、表單預選）。

const DIMS = {
  'hero-nanhu-sunrise.jpg': [1600, 1200],
  'cas-sunset-hikers.jpg': [1600, 1067],
  'taoyuan-coast-algal-reef.jpg': [1600, 1069],
  'culture-tainan-lanterns.jpg': [1200, 1600],
  'steam-tech-cube-workshop.jpg': [1600, 1064],
  'academic-jingmei-courtroom.jpg': [1600, 1200],
  'steam-kids-workshop.jpg': [1477, 1108],
  'chiayi-alishan-tea-farm.jpg': [1440, 1080],
  'meinong-oil-paper-umbrellas.jpg': [1600, 1200],
  'culture-temple-lanterns.jpg': [1600, 1200],
  'culture-keelung-night-market.jpg': [1600, 1069],
  'subject-kenting-coast-aerial.jpg': [1600, 1200],
  'culture-dadaocheng-market.jpg': [1200, 1600],
  'steam-robot-kits.jpg': [1477, 1108],
};

// 各客群：推薦哪些服務、哪個 tab、哪個段落
const ROUTES = {
  ib: {
    services: ['cas', 'service'], tab: null, anchor: '#cas',
    lead_zh: '3 條北中南 CAS 路線，每條 5–7 天，C/A/S 活動與 SDGs 已對應好，可直接拿去跟 CAS 協調員討論。',
    links: [['#cas', '看 3 條 CAS 路線'], ['#svc-cas', 'IB CAS 行程說明'], ['#svc-service', '服務學習']],
  },
  school: {
    services: ['subject', 'service'], tab: 'subject', anchor: '#prog-subject',
    lead_zh: '8 條科目考察行程可依學科篩選，地理、歷史、科學、STEAM、文學與體育都有；也能加入服務學習。',
    links: [['#prog-subject', '依學科看 8 條行程'], ['#svc-subject', '科目考察・STEAM'], ['#svc-service', '服務學習']],
  },
  higher: {
    services: ['academic', 'pd'], tab: 'academic', anchor: '#prog-academic',
    lead_zh: '串連學術單位、NPO 與企業的專業主題參訪，附政治學與歷史範例團；在台灣的研習、演講與工作坊也可洽詢。',
    links: [['#prog-academic', '看學術參訪範例團'], ['#svc-academic', '學術參訪'], ['#svc-pd', '研習・演講・工作坊']],
  },
  language: {
    services: ['language'], tab: 'language', anchor: '#prog-language',
    lead_zh: '台北或高雄 7–21 天的短期華語課程，搭配文化體驗；方案 A／B 的差異整理成一張比較表。',
    links: [['#prog-language', '看方案 A／B 比較'], ['#svc-language', '語言與文化']],
  },
};

export default function render(ctx) {
  const { c, esc, img } = ctx;
  const s = c.site, ct = s.contact;

  // alt 對照：content.json 內所有 image + alt 組合
  const ALT = { [c.images.hero.file]: c.images.hero.alt_zh, [c.academic.sample.image]: c.academic.sample.image_alt_zh };
  c.cas_routes.forEach(r => { ALT[r.image] = r.image_alt_zh; });
  c.images.gallery.forEach(g => { ALT[g.file] = g.alt_zh; });

  const pic = (file, { alt, lazy = true, cls = '' } = {}) => {
    const [w, h] = DIMS[file] || [1600, 1200];
    return `<img src="${img(file)}" alt="${esc(alt ?? ALT[file] ?? '')}" width="${w}" height="${h}"${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}${cls ? ` class="${cls}"` : ''}>`;
  };

  const sdgTag = n => {
    const g = ctx.sdg(n);
    return `<li class="sdg" style="--sdg:${g.color}" title="SDG ${g.n} ${esc(g.en)}"><b>${g.n}</b><span>${esc(g.zh)}</span></li>`;
  };
  const sdgList = ns => `<ul class="sdgs" aria-label="對應聯合國永續發展目標 SDGs">${ns.map(sdgTag).join('')}</ul>`;

  // 哪些客群會推薦這項服務
  const audFor = svc => Object.entries(ROUTES).filter(([, r]) => r.services.includes(svc)).map(([k]) => k).join(' ');
  const typeName = v => c.inquiry.types.find(t => t.value === v);

  const bi = (zh, en, tag = 'span') => `<${tag} class="bi"><span class="zh">${esc(zh)}</span> <span class="en" lang="en">${esc(en)}</span></${tag}>`;

  // ---------- Header ----------
  const nav = [
    ['#services', '服務'], ['#cas', 'CAS 路線'], ['#prog-language', '華語營'],
    ['#prog-subject', '科目考察'], ['#prog-academic', '學術參訪'], ['#about', '關於我們'],
  ];
  const header = `
<a class="skip" href="#main">跳到主要內容</a>
<div class="concept-tag"><a href="${ctx.base}index.html">← 設計概念總覽</a><span>概念 02・三秒分流 Audience Router</span></div>
<header class="site-head">
  <div class="wrap head-row">
    <a class="logo" href="#top" aria-label="${esc(s.name_zh)} ${esc(s.name_en)} 首頁">
      <img src="${img('logo-zhixing.png')}" alt="" width="400" height="418">
      <span><strong>${esc(s.name_zh)}</strong><span lang="en">${esc(s.name_en)}</span></span>
    </a>
    <nav aria-label="主選單"><ul>${nav.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul></nav>
    <a class="btn btn-sm" href="#proposal">索取客製提案</a>
  </div>
</header>`;

  // ---------- Hero / router ----------
  const audCards = c.audiences.map(a => {
    const r = ROUTES[a.id];
    const t = typeName(a.service);
    return `<li><a class="aud" href="${r.anchor}" data-aud="${a.id}" data-type="${a.service}" aria-controls="route-${a.id}">
      <span class="aud-zh">${esc(a.zh)}</span>
      <span class="aud-en" lang="en">${esc(a.en)}</span>
      <span class="aud-rec">推薦：${esc(t.zh)}</span>
      <span class="aud-check" aria-hidden="true"></span>
    </a></li>`;
  }).join('');

  const routePanels = c.audiences.map(a => {
    const r = ROUTES[a.id];
    const t = typeName(a.service);
    return `<div class="route" id="route-${a.id}" data-route="${a.id}" hidden>
      <p class="route-lead"><strong>${esc(a.zh)}</strong>：${esc(r.lead_zh)}</p>
      <ul class="route-links">${r.links.map(([h, l]) => `<li><a href="${h}">${esc(l)}</a></li>`).join('')}</ul>
      <a class="btn btn-amber" href="#proposal" data-prefill-type="${a.service}">索取「${esc(t.zh)}」提案</a>
    </div>`;
  }).join('');

  const hero = `
<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="brand-line"><span>${esc(s.name_zh)}</span> <span lang="en">${esc(s.name_en)}</span></p>
      <h1 id="hero-title">台灣教育旅行，<br>依您的團體量身規劃</h1>
      <p class="tagline">${esc(s.tagline_zh)}<span lang="en">${esc(s.tagline_en)}</span></p>
      <p class="lead">${esc(c.intro.zh)}</p>
      <div class="hero-cta">
        <a class="btn" href="#proposal">索取客製提案 <span lang="en">Request a proposal</span></a>
        <p class="hero-note">2 個工作天內回覆提案方向</p>
      </div>
    </div>
    <div class="router" aria-labelledby="router-q">
      <h2 id="router-q" class="router-q">您是哪一種團體？</h2>
      <p class="router-sub">選一個，我們把最相關的服務、路線與表單類型直接帶到您面前。<span lang="en">Which group are you?</span></p>
      <ul class="aud-list">${audCards}</ul>
      <div class="route-box" aria-live="polite">${routePanels}</div>
    </div>
  </div>
  <figure class="hero-band">
    ${pic(c.images.hero.file, { lazy: false })}
    <figcaption>${esc(c.images.hero.alt_zh)}</figcaption>
  </figure>
</section>`;

  // ---------- Services ----------
  const services = `
<section class="sec" id="services" aria-labelledby="svc-title">
  <div class="wrap">
    <div class="sec-head">
      <h2 id="svc-title">六種服務 <span lang="en">What we design</span></h2>
      <p>每趟行程都從課程或交流目的出發設計，並融入至少 2 項聯合國 SDGs。</p>
    </div>
    <ul class="svc-grid">
      ${c.services.map(sv => `<li class="svc" id="svc-${sv.id}" data-for="${audFor(sv.id)}">
        <div class="svc-img">${pic(sv.image, { alt: ALT[sv.image] || `${sv.zh}活動照片` })}</div>
        <div class="svc-body">
          <span class="match-badge">為您推薦</span>
          <h3>${esc(sv.zh)} <span lang="en">${esc(sv.en)}</span></h3>
          <p>${esc(sv.summary_zh)}</p>
          <p class="en-sub" lang="en">${esc(sv.summary_en)}</p>
          <a class="link-cta" href="#proposal" data-prefill-type="${sv.id}">索取${esc(sv.zh)}提案</a>
        </div>
      </li>`).join('')}
    </ul>
  </div>
</section>`;

  // ---------- CAS routes ----------
  const casList = (label, en, items) => `<div class="cas-col">
      <h4><b>${label[0]}</b> ${esc(label)} <span lang="en">${en}</span></h4>
      <ul>${items.map(([zh, e]) => `<li>${esc(zh)}<span lang="en">${esc(e)}</span></li>`).join('')}</ul>
    </div>`;
  const cas = `
<section class="sec sec-tint" id="cas" aria-labelledby="cas-title" data-for="ib">
  <div class="wrap">
    <div class="sec-head">
      <span class="match-badge">為您推薦</span>
      <h2 id="cas-title">IB CAS 路線：北、中、南三條 <span lang="en">CAS routes across Taiwan</span></h2>
      <p>創意 Creativity、活動 Activity、服務 Service 三類活動都已排入，每條路線 5–7 天，可依學校需求增減。</p>
    </div>
    <ol class="cas-grid">
      ${c.cas_routes.map(r => `<li class="cas-card" id="cas-${r.id}">
        <div class="cas-img">${pic(r.image)}</div>
        <div class="cas-body">
          <p class="cas-region">${esc(r.region_zh)} <span lang="en">${esc(r.region_en)}</span></p>
          <h3>${esc(r.place_zh)} <span lang="en">${esc(r.place_en)}</span></h3>
          <p class="cas-days"><strong>${esc(r.days)}</strong> 天 <span lang="en">days</span></p>
          <h4 class="mini">主題 <span lang="en">Themes</span></h4>
          <ul class="themes">${r.themes_zh.map((t, i) => `<li>${esc(t)}<span lang="en">${esc(r.themes_en[i])}</span></li>`).join('')}</ul>
          ${sdgList(r.sdgs)}
          <details class="cas-more">
            <summary>展開 C／A／S 活動清單 <span lang="en">CAS activities</span></summary>
            <div class="cas-cols">
              ${casList('創意', 'Creativity', r.creativity)}
              ${casList('活動', 'Activity', r.activity)}
              ${casList('服務', 'Service', r.service)}
            </div>
            ${r.note_zh ? `<p class="cas-note">${esc(r.note_zh)}<span lang="en">${esc(r.note_en)}</span></p>` : ''}
          </details>
          <a class="link-cta" href="#proposal" data-prefill-type="cas">以${esc(r.place_zh)}路線索取提案</a>
        </div>
      </li>`).join('')}
    </ol>
  </div>
</section>`;

  // ---------- Form ----------
  const form = (id, title, sub) => `
<form class="inq" data-inquiry id="${id}-form" aria-labelledby="${id}-title">
  <div class="inq-head">
    <h2 id="${id}-title">${title}</h2>
    <p>${sub}</p>
  </div>
  <fieldset class="f-type">
    <legend>想規劃哪一類行程？ <span class="req">必填</span></legend>
    <div class="chips">
      ${c.inquiry.types.map((t, i) => `<label class="chip"><input type="radio" name="type" value="${t.value}"${i === 0 ? ' required' : ''}><span>${esc(t.zh)}</span></label>`).join('')}
    </div>
  </fieldset>
  <fieldset class="f-size">
    <legend>大約幾位學員？ <span class="req">必填</span></legend>
    <div class="seg">
      ${c.inquiry.group_sizes.map((g, i) => `<label><input type="radio" name="group_size" value="${g.value}"${i === 0 ? ' required' : ''}><span>${esc(g.zh)}</span></label>`).join('')}
    </div>
  </fieldset>
  <div class="f-email">
    <label for="${id}-email">回覆用 Email <span class="req">必填</span></label>
    <div class="email-row">
      <input id="${id}-email" type="email" name="email" required autocomplete="email" placeholder="name@school.edu">
      <button type="submit" class="btn">索取客製提案</button>
    </div>
  </div>
  <details class="f-more">
    <summary>補充資訊（選填）<span>年級、月份、學校、稱呼、需求說明</span></summary>
    <div class="more-grid">
      <div><label for="${id}-grade">年級</label><input id="${id}-grade" name="grade" placeholder="例：G10–G11"></div>
      <div><label for="${id}-month">預計出發月份</label><input id="${id}-month" type="month" name="month"></div>
      <div><label for="${id}-school">學校／單位</label><input id="${id}-school" name="school" autocomplete="organization"></div>
      <div><label for="${id}-name">您的稱呼</label><input id="${id}-name" name="name" autocomplete="name"></div>
      <div class="full"><label for="${id}-message">想先告訴我們的事</label><textarea id="${id}-message" name="message" rows="3" placeholder="例：希望加入海洋保育服務、預算範圍、需要的 CAS 證明文件"></textarea></div>
    </div>
  </details>
  <p class="inq-foot">只要三欄就能送出，其他細節我們回信時再一起確認。</p>
  <div data-inquiry-result hidden></div>
</form>`;

  const midForm = `
<section class="form-sec" id="proposal" aria-label="索取客製提案（簡短表單）">
  <div class="wrap form-wrap">
    <div class="form-aside">
      <p class="aside-big">2 個工作天</p>
      <p>內回覆提案方向。<span lang="en">We reply within 2 working days.</span></p>
      <ul class="aside-list">
        <li>由具 10 年以上國際學校經驗的團隊規劃</li>
        <li>行程對應課程目標與 SDGs</li>
        <li>協同旅行社執行，減少來回溝通</li>
      </ul>
    </div>
    ${form('mid', '索取客製提案 <span lang="en">Request a proposal</span>', '先告訴我們類型、人數與 Email 就好。')}
  </div>
</section>`;

  // ---------- Programs (tabs) ----------
  const L = c.language;
  const langPanel = `
<div class="panel" id="prog-language" data-for="language" data-tab="language">
  <span class="match-badge">為您推薦</span>
  <h3>語言與文化 <span lang="en">Language &amp; Culture</span></h3>
  <div class="facts">
    <div><span class="fact-k">地點</span><span class="fact-v">${esc(L.learning_where)}</span></div>
    <div><span class="fact-k">華語課程天數</span><span class="fact-v">${esc(L.learning_days)} 天</span></div>
  </div>
  <div class="two-col">
    <div>
      <h4>華語課程 <span lang="en">Chinese learning</span></h4>
      <p>${esc(L.learning_zh)}</p><p class="en-sub" lang="en">${esc(L.learning_en)}</p>
    </div>
    <div>
      <h4>文化體驗 <span lang="en">Culture</span></h4>
      <p>${esc(L.culture_zh)}</p><p class="en-sub" lang="en">${esc(L.culture_en)}</p>
    </div>
  </div>
  <h4>方案 A／B 比較 <span lang="en">Program A vs. B</span></h4>
  <div class="table-scroll" tabindex="0" role="region" aria-label="方案 A／B 比較表">
    <table class="compare">
      <caption class="sr">華語與文化營方案 A 與方案 B 比較</caption>
      <thead><tr><th scope="col">項目</th>${L.plans.map(p => `<th scope="col">${esc(p.zh)}<span lang="en">${esc(p.en)}</span></th>`).join('')}</tr></thead>
      <tbody>${L.compare.map(r => `<tr><th scope="row">${esc(r.row_zh)}<span lang="en">${esc(r.row_en)}</span></th><td>${esc(r.A_zh)}<span lang="en">${esc(r.A_en)}</span></td><td>${esc(r.B_zh)}<span lang="en">${esc(r.B_en)}</span></td></tr>`).join('')}</tbody>
    </table>
  </div>
  <div class="two-col">
    <div><h4>其他可安排活動 <span lang="en">Also available</span></h4><p>${esc(L.other_zh)}</p><p class="en-sub" lang="en">${esc(L.other_en)}</p></div>
    <div><h4>方案包含 <span lang="en">Included</span></h4><p>${esc(L.included_zh)}</p><p class="en-sub" lang="en">${esc(L.included_en)}</p></div>
  </div>
  <div class="photo-row">${['culture-temple-lanterns.jpg', 'culture-keelung-night-market.jpg', 'culture-dadaocheng-market.jpg'].map(f => `<figure>${pic(f)}</figure>`).join('')}</div>
  <a class="btn" href="#proposal" data-prefill-type="language">索取華語與文化營提案</a>
</div>`;

  const subjOf = t => t.subjects_zh.replace(/（.*?）/g, '').split('、').map(x => x.trim()).filter(Boolean);
  const allSubj = [...new Set(c.subject_trips.flatMap(subjOf))];
  const ce = c.circular_economy;
  const subjPanel = `
<div class="panel" id="prog-subject" data-for="school" data-tab="subject">
  <span class="match-badge">為您推薦</span>
  <h3>科目考察・STEAM <span lang="en">Subject &amp; STEAM trips</span></h3>
  <p>${c.subject_trips.length} 條行程依學科標準與課程目標設計，也可改為跨學科專題（PBL）。</p>
  <div class="filter" data-filter hidden>
    <span class="filter-label" id="filter-label">依學科篩選</span>
    <div class="filter-chips" role="group" aria-labelledby="filter-label">
      <button type="button" aria-pressed="true" data-subj="">全部</button>
      ${allSubj.map(x => `<button type="button" aria-pressed="false" data-subj="${esc(x)}">${esc(x)}</button>`).join('')}
    </div>
    <p class="filter-count" aria-live="polite"></p>
  </div>
  <div class="table-scroll" tabindex="0" role="region" aria-label="科目考察行程表">
    <table class="trips">
      <caption class="sr">科目考察行程一覽</caption>
      <thead><tr><th scope="col">行程</th><th scope="col">地點</th><th scope="col">學科</th><th scope="col">考察重點</th><th scope="col">年級</th><th scope="col">天數</th></tr></thead>
      <tbody>${c.subject_trips.map(t => `<tr data-subjects="${esc(subjOf(t).join('|'))}">
        <th scope="row">${esc(t.name_zh)}<span lang="en">${esc(t.name_en)}</span></th>
        <td data-label="地點">${esc(t.dest_zh)}<span lang="en">${esc(t.dest_en)}</span></td>
        <td data-label="學科">${esc(t.subjects_zh)}<span lang="en">${esc(t.subjects_en)}</span></td>
        <td data-label="考察重點">${esc(t.highlights_zh)}<span lang="en">${esc(t.highlights_en)}</span></td>
        <td data-label="年級">${esc(t.grade_zh)}<span lang="en">${esc(t.grade_en)}</span></td>
        <td data-label="天數">${esc(t.days)} 天</td>
      </tr>`).join('')}</tbody>
    </table>
  </div>
  <div class="circular">
    <h4>${esc(ce.title_zh)} <span lang="en">${esc(ce.title_en)}</span></h4>
    <p class="circ-intro">桃園科學與地理考察的核心：學生走完塑膠從廢棄物到產品的每一站。</p>
    <ol class="steps">${ce.steps.map(([zh, en]) => `<li>${esc(zh)}<span lang="en">${esc(en)}</span></li>`).join('')}</ol>
    <ul class="circ-facts">${ce.facts_zh.map((f, i) => `<li>${esc(f)}<span lang="en">${esc(ce.facts_en[i])}</span></li>`).join('')}</ul>
  </div>
  <a class="btn" href="#proposal" data-prefill-type="subject">索取科目考察提案</a>
</div>`;

  const A = c.academic, sm = A.sample;
  const acadPanel = `
<div class="panel" id="prog-academic" data-for="higher" data-tab="academic">
  <span class="match-badge">為您推薦</span>
  <h3>學術參訪 <span lang="en">Academic visits</span></h3>
  <p>${esc(A.intro_zh)}</p><p class="en-sub" lang="en">${esc(A.intro_en)}</p>
  <div class="sample">
    <div class="sample-img">${pic(sm.image)}</div>
    <div class="sample-body">
      <p class="sample-tag">範例團 <span lang="en">Sample programme</span></p>
      <h4>${esc(sm.name_zh)} <span lang="en">${esc(sm.name_en)}</span></h4>
      <div class="facts">
        <div><span class="fact-k">地點</span><span class="fact-v">${esc(sm.where_zh)}</span></div>
        <div><span class="fact-k">天數</span><span class="fact-v">${esc(sm.days)} 天</span></div>
      </div>
      ${sdgList(sm.sdgs)}
    </div>
  </div>
  <div class="blocks">${sm.blocks.map(b => `<div class="block"><h5>${esc(b.zh)} <span lang="en">${esc(b.en)}</span></h5><ul>${b.items.map(([zh, en]) => `<li>${esc(zh)}<span lang="en">${esc(en)}</span></li>`).join('')}</ul></div>`).join('')}</div>
  <a class="btn" href="#proposal" data-prefill-type="academic">索取學術參訪提案</a>
</div>`;

  const tabs = [['language', '語言與文化', 'Language'], ['subject', '科目考察・STEAM', 'Subject trips'], ['academic', '學術參訪', 'Academic']];
  const programs = `
<section class="sec" id="programs" aria-labelledby="prog-title">
  <div class="wrap">
    <div class="sec-head">
      <h2 id="prog-title">華語營、科目考察與學術參訪 <span lang="en">Programme details</span></h2>
      <p>原本放在圖片裡的行程細節，全部整理成可閱讀、可搜尋的文字。</p>
    </div>
    <div class="tablist" role="tablist" aria-label="行程類型" hidden>
      ${tabs.map(([id, zh, en], i) => `<button type="button" role="tab" id="tab-${id}" aria-controls="prog-${id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${zh}<span lang="en">${en}</span></button>`).join('')}
    </div>
    ${langPanel}
    ${subjPanel}
    ${acadPanel}
  </div>
</section>`;

  // ---------- Trust / about ----------
  const about = `
<section class="sec sec-tint" id="about" aria-labelledby="about-title">
  <div class="wrap">
    <ul class="stats">${c.stats.map(st => `<li><span class="stat-n">${esc(st.num)}</span><span class="stat-l">${esc(st.zh)}<span lang="en">${esc(st.en)}</span></span></li>`).join('')}</ul>
    <div class="about-grid">
      <div>
        <h2 id="about-title">關於知行學旅 <span lang="en">About us</span></h2>
        <p class="about-who">${esc(c.about.who_zh)}</p>
        <p class="en-sub" lang="en">${esc(c.about.who_en)}</p>
        <ul class="partners" aria-label="我們串連的夥伴">${c.about.partners.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
      </div>
      <dl class="vm">
        <div><dt>願景 <span lang="en">Vision</span></dt><dd>${esc(c.about.vision_zh)}<span lang="en">${esc(c.about.vision_en)}</span></dd></div>
        <div><dt>使命 <span lang="en">Mission</span></dt><dd>${esc(c.about.mission_zh)}<span lang="en">${esc(c.about.mission_en)}</span></dd></div>
      </dl>
    </div>
    <div class="placeholder" role="note">
      <h3>合作學校與老師推薦</h3>
      <p><strong>待補：合作學校 logo／老師推薦。</strong>這一區保留給 4–6 個合作學校 logo 與 1–2 則老師或 CAS 協調員的推薦語，取得授權後放入。</p>
      <ul class="logo-slots" aria-hidden="true">${'<li>Logo</li>'.repeat(6)}</ul>
    </div>
  </div>
</section>`;

  const endForm = `
<section class="form-sec form-end" id="inquiry" aria-label="索取客製提案（頁尾表單）">
  <div class="wrap form-wrap">
    <div class="form-aside">
      <p class="aside-big">還在比較？</p>
      <p>選「還不確定，想先聊聊」也可以，我們會依您的團體提出 1–2 個方向。</p>
      <p class="aside-contact">也可直接聯絡：<a href="${ct.phone_href}">${esc(ct.phone)}</a><br><a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a></p>
    </div>
    ${form('end', '告訴我們您的團體 <span lang="en">Tell us about your group</span>', '三欄即可送出，2 個工作天內回覆。')}
  </div>
</section>`;

  const footer = `
<footer class="site-foot">
  <div class="wrap foot-grid">
    <div>
      <p class="foot-brand"><strong>${esc(s.legal_zh)}</strong><span lang="en">${esc(s.legal_en)}</span></p>
      <p>${esc(s.tagline_zh)}</p>
    </div>
    <address>
      <p>${esc(ct.address_zh)}<span lang="en">${esc(ct.address_en)}</span></p>
      <p>電話 <a href="${ct.phone_href}">${esc(ct.phone)}</a></p>
      <p>Email <a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a></p>
      <p><a href="${ct.linkedin}" rel="noopener" target="_blank">LinkedIn</a></p>
    </address>
    <div class="foot-legal">
      <p>統一編號 ${esc(ct.tax_id)}</p>
      <p>© 2026 ${esc(s.name_zh)} ${esc(s.name_en)}</p>
    </div>
  </div>
</footer>`;

  const sticky = `
<div class="sticky-cta" data-sticky>
  <div class="wrap sticky-row">
    <p><strong data-sticky-label>索取客製提案</strong><span><i aria-hidden="true"> · </i>2 個工作天內回覆</span></p>
    <a class="btn btn-amber" href="#proposal">填寫 3 欄</a>
  </div>
</div>`;

  return `<!doctype html>
<html lang="zh-Hant-TW" data-concept="${ctx.concept}">
<head>
${ctx.head()}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+TC:wght@400;500;700;900&display=swap">
<link rel="stylesheet" href="style.css">
<script>document.documentElement.classList.add('js')</script>
</head>
<body>
${header}
<main id="main">
${hero}
${services}
${cas}
${midForm}
${programs}
${about}
${endForm}
</main>
${footer}
${sticky}
<script src="script.js" defer></script>
${ctx.inquiryScript}
</body>
</html>
`;
}
