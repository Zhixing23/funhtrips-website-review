// 概念 01・田野筆記 Field Notes
// 編輯風旅行筆記本：牛皮紙桌面上攤開的老師田野筆記。所有內容皆為靜態 HTML 文字。
export default function render(ctx) {
  const { c, esc, img, sdg } = ctx;
  const s = c.site, ct = s.contact;

  // 拍立得：膠帶 + 輕微旋轉（rotate 由 --r 控制）
  const polaroid = (file, alt, cap, { r = -2, w = 1600, h = 1200, lazy = true, cls = '' } = {}) => `
    <figure class="polaroid ${cls}" style="--r:${r}deg">
      <span class="tape" aria-hidden="true"></span>
      <img src="${img(file)}" alt="${esc(alt)}" width="${w}" height="${h}"${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}>
      ${cap ? `<figcaption>${esc(cap)}</figcaption>` : ''}
    </figure>`;

  // SDG 郵戳：官方色 + 編號 + 名稱
  const stamp = (n, i = 0) => {
    const g = sdg(n);
    const r = [-8, 5, -3, 9, -6][i % 5];
    return `<li class="stamp" style="--sdg:${g.color};--r:${r}deg">
      <span class="stamp-n">SDG ${g.n}</span>
      <span class="stamp-zh">${esc(g.zh)}</span>
      <span class="stamp-en" lang="en">${esc(g.en)}</span>
    </li>`;
  };
  const stamps = (list, label) => `<ul class="stamps" aria-label="${esc(label)}">${list.map(stamp).join('')}</ul>`;

  const cta = (type, zh = '索取客製提案', en = 'Request a proposal', cls = '') =>
    `<a class="btn ${cls}" href="#letter" data-prefill-type="${type}"><span>${zh}</span> <span class="btn-en" lang="en">${en}</span></a>`;

  const dims = {
    'cas-sunset-hikers.jpg': [1600, 1067], 'taoyuan-coast-algal-reef.jpg': [1600, 1069],
    'culture-tainan-lanterns.jpg': [1200, 1600], 'steam-tech-cube-workshop.jpg': [1600, 1064],
    'academic-jingmei-courtroom.jpg': [1600, 1200], 'steam-kids-workshop.jpg': [1477, 1108],
    'chiayi-alishan-tea-farm.jpg': [1440, 1080], 'meinong-oil-paper-umbrellas.jpg': [1600, 1200],
  };
  const wh = f => { const d = dims[f] || [1600, 1200]; return { w: d[0], h: d[1] }; };

  // ---------- Services: 目錄頁 ----------
  const serviceRot = [-2.5, 1.8, -1.2, 2.4, -1.8, 1.2];
  const services = c.services.map((sv, i) => `
    <li class="toc-item">
      ${polaroid(sv.image, sv.zh + '（' + sv.en + '）', '', { r: serviceRot[i], ...wh(sv.image), cls: 'polaroid-sm' })}
      <div class="toc-text">
        <h3><span class="zh">${esc(sv.zh)}</span> <span class="en" lang="en">${esc(sv.en)}</span></h3>
        <p>${esc(sv.summary_zh)}</p>
        <p class="en-body" lang="en">${esc(sv.summary_en)}</p>
        <a class="link-ask" href="#letter" data-prefill-type="${sv.id}">索取${esc(sv.zh)}提案</a>
      </div>
    </li>`).join('');

  // ---------- CAS routes: 筆記本跨頁 ----------
  const casCol = (key, letter, zh, en, items) => `
    <div class="cas-col cas-${key}">
      <h4><span class="cas-letter" aria-hidden="true">${letter}</span><span class="zh">${zh}</span> <span class="en" lang="en">${en}</span></h4>
      <ul>${items.map(([z, e]) => `<li><span class="zh">${esc(z)}</span><span class="en" lang="en">${esc(e)}</span></li>`).join('')}</ul>
    </div>`;
  const routeNotes = { taoyuan: '石滬是祖先的海洋智慧，學生親手疊石！', chiayi: '清晨採茶，記得帶薄外套', kaohsiung: '油紙傘可以帶回家當紀念' };
  const routes = c.cas_routes.map((rt, i) => `
    <article class="spread route" id="route-${rt.id}" aria-labelledby="route-${rt.id}-h">
      <div class="page page-left">
        <p class="page-no" aria-hidden="true">p.${12 + i * 2}</p>
        ${polaroid(rt.image, rt.image_alt_zh, rt.place_zh + '，' + rt.place_en, { r: [-3, 2.5, -1.5][i], ...wh(rt.image) })}
        <dl class="route-meta">
          <div><dt>地區 <span lang="en">Region</span></dt><dd>${esc(rt.region_zh)} <span class="en" lang="en">${esc(rt.region_en)}</span></dd></div>
          <div><dt>地點 <span lang="en">Place</span></dt><dd>${esc(rt.place_zh)} <span class="en" lang="en">${esc(rt.place_en)}</span></dd></div>
          <div><dt>天數 <span lang="en">Days</span></dt><dd><strong class="days">${esc(rt.days)}</strong> 天 <span class="en" lang="en">days</span></dd></div>
        </dl>
        <p class="margin-note" aria-hidden="true">${routeNotes[rt.id] || ''}</p>
      </div>
      <div class="page page-right">
        <p class="page-no" aria-hidden="true">p.${13 + i * 2}</p>
        <h3 id="route-${rt.id}-h" class="route-title"><span class="zh">${esc(rt.region_zh)}・${esc(rt.place_zh)}</span> <span class="en" lang="en">${esc(rt.region_en)} — ${esc(rt.place_en)}</span></h3>
        <ul class="themes" aria-label="行程主題 Themes">
          ${rt.themes_zh.map((t, k) => `<li>${esc(t)} <span class="en" lang="en">${esc(rt.themes_en[k])}</span></li>`).join('')}
        </ul>
        <div class="cas-grid">
          ${casCol('c', 'C', '創意', 'Creativity', rt.creativity)}
          ${casCol('a', 'A', '活動', 'Activity', rt.activity)}
          ${casCol('s', 'S', '服務', 'Service', rt.service)}
        </div>
        ${rt.note_zh ? `<p class="route-note">${esc(rt.note_zh)} <span class="en" lang="en">${esc(rt.note_en)}</span></p>` : ''}
        <div class="route-foot">
          ${stamps(rt.sdgs, rt.place_zh + ' 路線對應的 SDGs')}
          ${cta('cas', '索取這條路線的提案', 'Request this route', 'btn-small')}
        </div>
      </div>
    </article>`).join('');

  // ---------- Language ----------
  const L = c.language;
  const compareRows = L.compare.map(r => `
        <tr>
          <th scope="row">${esc(r.row_zh)}<span class="en" lang="en">${esc(r.row_en)}</span></th>
          <td>${esc(r.A_zh)}<span class="en" lang="en">${esc(r.A_en)}</span></td>
          <td>${esc(r.B_zh)}<span class="en" lang="en">${esc(r.B_en)}</span></td>
        </tr>`).join('');

  // ---------- Subject trips ----------
  const subjRows = c.subject_trips.map(t => `
        <tr>
          <th scope="row"><span class="trip-name">${esc(t.name_zh)}</span><span class="en" lang="en">${esc(t.name_en)}</span></th>
          <td data-label="地點 Where">${esc(t.dest_zh)}<span class="en" lang="en">${esc(t.dest_en)}</span></td>
          <td data-label="科目 Subjects">${esc(t.subjects_zh)}<span class="en" lang="en">${esc(t.subjects_en)}</span></td>
          <td data-label="考察重點 Highlights">${esc(t.highlights_zh)}<span class="en" lang="en">${esc(t.highlights_en)}</span></td>
          <td data-label="適合年級 Grades">${esc(t.grade_zh)}<span class="en" lang="en">${esc(t.grade_en)}</span></td>
          <td data-label="天數 Days" class="num">${esc(t.days)}</td>
        </tr>`).join('');
  const CE = c.circular_economy;
  const ceSteps = CE.steps.map(([z, e]) => `<li><span class="zh">${esc(z)}</span><span class="en" lang="en">${esc(e)}</span></li>`).join('');

  // ---------- Academic ----------
  const A = c.academic, S = A.sample;
  const acBlocks = S.blocks.map(b => `
      <div class="ac-block">
        <h4><span class="zh">${esc(b.zh)}</span> <span class="en" lang="en">${esc(b.en)}</span></h4>
        <ul>${b.items.map(([z, e]) => `<li>${esc(z)}<span class="en" lang="en">${esc(e)}</span></li>`).join('')}</ul>
      </div>`).join('');

  // ---------- Stats / about ----------
  const stats = c.stats.map(st => `<li><strong>${esc(st.num)}</strong><span>${esc(st.zh)}</span><span class="en" lang="en">${esc(st.en)}</span></li>`).join('');

  // ---------- Inquiry (填空信) ----------
  const I = c.inquiry;
  const sizeChips = I.group_sizes.map((g, i) => `<label class="chip"><input type="radio" name="group_size" value="${esc(g.value)}"${i === 0 ? ' required' : ''}><span>${esc(g.zh)}</span></label>`).join('');
  const typeOpts = I.types.map(t => `<option value="${esc(t.value)}">${esc(t.zh)}（${esc(t.en)}）</option>`).join('');

  // gallery strip for culture
  const gal = c.images.gallery.slice(0, 4);
  const galRot = [-4, 3, -2, 4];
  const galDims = { 'culture-tainan-lanterns.jpg': [1200, 1600], 'culture-dadaocheng-market.jpg': [1200, 1600] };

  return `<!doctype html>
<html lang="zh-Hant-TW" data-concept="${esc(ctx.concept)}">
<head>
${ctx.head()}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Fraunces:ital,opsz,wght,SOFT@0,9..144,400..700,50;1,9..144,400..600,50&family=Noto+Serif+TC:wght@400;600;800&display=swap">
<link rel="stylesheet" href="style.css">
</head>
<body>
<a class="skip" href="#main">跳到主要內容</a>
<p class="concept-tag"><a href="../../index.html">← 設計概念總覽</a><span>概念 01・田野筆記 Field Notes</span></p>

<header class="site-head">
  <a class="brand" href="#top" aria-label="${esc(s.name_zh)} ${esc(s.name_en)} 首頁">
    <img src="${img('logo-zhixing.png')}" alt="" width="40" height="40">
    <span class="brand-zh">${esc(s.name_zh)}</span>
    <span class="brand-en" lang="en">${esc(s.name_en)}</span>
  </a>
  <nav aria-label="主選單">
    <ul>
      <li><a href="#services">服務</a></li>
      <li><a href="#cas">CAS 路線</a></li>
      <li><a href="#language">華語文化</a></li>
      <li><a href="#subject">科目考察</a></li>
      <li><a href="#academic">學術參訪</a></li>
      <li><a href="#about">關於我們</a></li>
      <li><a class="nav-ask" href="#letter" data-prefill-type="unsure">索取提案</a></li>
    </ul>
  </nav>
</header>

<main id="main">

<!-- HERO：筆記本封面跨頁 -->
<section class="spread hero" id="top" aria-labelledby="hero-h">
  <div class="page page-left hero-text">
    <p class="hand hero-date" aria-hidden="true">田野筆記・Taiwan</p>
    <h1 id="hero-h">
      <span class="h1-zh">${esc(s.name_zh)}</span>
      <span class="h1-en" lang="en">${esc(s.name_en)}</span>
    </h1>
    <p class="hero-lede">帶學生走進台灣的海岸、茶園與社區，把課本上的議題變成親手做過的事。我們由老師創立，為國際學校與一般學校規劃 IB CAS、服務學習、華語文化與學科考察行程。</p>
    <p class="hero-lede-en" lang="en">Teacher-designed educational trips in Taiwan — IB CAS, service learning, Chinese language and subject trips, each built around at least two UN SDGs.</p>
    <p class="hero-tagline">${esc(s.tagline_zh)}</p>
    <div class="hero-cta">
      ${cta('unsure')}
      <a class="link-quiet" href="#cas">先看 3 條 CAS 路線</a>
    </div>
  </div>
  <div class="page page-right hero-photo">
    ${polaroid(c.images.hero.file, c.images.hero.alt_zh, '南湖大山日出', { r: 2.5, lazy: false, cls: 'polaroid-lg' })}
    <p class="margin-note note-hero" aria-hidden="true">每趟行程至少 2 項 SDGs</p>
    <ul class="hero-facts" aria-label="重點">
      <li><strong>10+</strong> 年國際學校與 NPO 經驗</li>
      <li><strong>5–7</strong> 天北中南路線，可客製</li>
    </ul>
  </div>
</section>

<!-- 服務：目錄頁 -->
<section class="sheet" id="services" aria-labelledby="services-h">
  <header class="sheet-head">
    <h2 id="services-h"><span class="zh">我們能帶你去哪裡</span> <span class="en" lang="en">What we plan</span></h2>
    <p class="sheet-intro">${esc(c.intro.zh)}</p>
    <p class="en-body" lang="en">${esc(c.intro.en)}</p>
  </header>
  <ul class="toc">${services}</ul>
</section>

<!-- CAS 路線 -->
<section class="chapter" id="cas" aria-labelledby="cas-h">
  <header class="chapter-head">
    <h2 id="cas-h"><span class="zh">三條 IB CAS 路線</span> <span class="en" lang="en">Three CAS routes, north to south</span></h2>
    <p>每條路線 5–7 天，創意（C）、活動（A）、服務（S）都有實際安排，並對應至少兩項聯合國永續發展目標。路線可依學校需求調整。</p>
    <p class="en-body" lang="en">Each route runs 5–7 days with real Creativity, Activity and Service components, mapped to UN SDGs and adjustable to your school.</p>
  </header>
  ${routes}
</section>

<!-- 語言與文化 -->
<section class="sheet sheet-grid" id="language" aria-labelledby="language-h">
  <header class="sheet-head">
    <h2 id="language-h"><span class="zh">華語與文化營</span> <span class="en" lang="en">Chinese language &amp; culture</span></h2>
  </header>
  <div class="lang-intro">
    <div>
      <h3 class="h3-plain">華語課程 <span class="en" lang="en">Chinese learning</span></h3>
      <p>${esc(L.learning_zh)}</p>
      <p class="en-body" lang="en">${esc(L.learning_en)}</p>
      <dl class="ticket">
        <div><dt>地點 <span lang="en">Where</span></dt><dd>${esc(L.learning_where)}</dd></div>
        <div><dt>天數 <span lang="en">Days</span></dt><dd>${esc(L.learning_days)} 天</dd></div>
      </dl>
    </div>
    <div>
      <h3 class="h3-plain">文化體驗 <span class="en" lang="en">Culture</span></h3>
      <p>${esc(L.culture_zh)}</p>
      <p class="en-body" lang="en">${esc(L.culture_en)}</p>
    </div>
  </div>
  <div class="gallery-strip" aria-label="文化體驗照片">
    ${gal.map((g, i) => { const d = galDims[g.file] || [1600, 1200]; return polaroid(g.file, g.alt_zh, g.alt_zh, { r: galRot[i], w: d[0], h: d[1], cls: 'polaroid-xs' }); }).join('')}
  </div>
  <div class="table-wrap">
    <table class="compare">
      <caption>方案 A／B 比較 <span class="en" lang="en">Program A vs. B</span></caption>
      <thead>
        <tr>
          <th scope="col"><span class="sr">項目</span></th>
          ${L.plans.map(p => `<th scope="col">${esc(p.zh)}<span class="en" lang="en">${esc(p.en)}</span></th>`).join('')}
        </tr>
      </thead>
      <tbody>${compareRows}
      </tbody>
    </table>
  </div>
  <div class="lang-extra">
    <div>
      <h3 class="h3-plain">其他可安排的活動 <span class="en" lang="en">Also available</span></h3>
      <p>${esc(L.other_zh)}</p>
      <p class="en-body" lang="en">${esc(L.other_en)}</p>
    </div>
    <div class="included">
      <h3 class="h3-plain">方案包含 <span class="en" lang="en">Included</span></h3>
      <p>${esc(L.included_zh)}</p>
      <p class="en-body" lang="en">${esc(L.included_en)}</p>
    </div>
  </div>
  <p class="sheet-cta">${cta('language', '索取華語營提案', 'Request a language camp proposal')}</p>
</section>

<!-- 科目考察 -->
<section class="sheet sheet-ledger" id="subject" aria-labelledby="subject-h">
  <header class="sheet-head">
    <h2 id="subject-h"><span class="zh">科目考察與 STEAM</span> <span class="en" lang="en">Subject &amp; STEAM trips</span></h2>
    <p class="sheet-intro">八條可直接套用的行程範本，依學科標準或跨學科專題（PBL）調整。</p>
    <p class="en-body" lang="en">Eight ready-made templates, adjusted to your subject criteria or PBL projects.</p>
  </header>
  <div class="table-wrap">
    <table class="ledger">
      <caption class="sr">科目考察行程一覽 Subject trip templates</caption>
      <thead>
        <tr>
          <th scope="col">行程 <span class="en" lang="en">Trip</span></th>
          <th scope="col">地點 <span class="en" lang="en">Where</span></th>
          <th scope="col">科目 <span class="en" lang="en">Subjects</span></th>
          <th scope="col">考察重點 <span class="en" lang="en">Highlights</span></th>
          <th scope="col">年級 <span class="en" lang="en">Grades</span></th>
          <th scope="col" class="num">天數 <span class="en" lang="en">Days</span></th>
        </tr>
      </thead>
      <tbody>${subjRows}
      </tbody>
    </table>
  </div>

  <div class="loop">
    <h3 class="h3-plain">${esc(CE.title_zh)} <span class="en" lang="en">${esc(CE.title_en)}</span></h3>
    <p class="hand loop-note" aria-hidden="true">桃園科學考察會走完這一圈</p>
    <ol class="loop-steps">${ceSteps}</ol>
    <ul class="loop-facts">
      ${CE.facts_zh.map((f, i) => `<li>${esc(f)}<span class="en" lang="en">${esc(CE.facts_en[i])}</span></li>`).join('')}
    </ul>
  </div>
  <p class="sheet-cta">${cta('subject', '索取科目考察提案', 'Request a subject trip proposal')}</p>
</section>

<!-- 學術參訪 -->
<section class="spread academic" id="academic" aria-labelledby="academic-h">
  <div class="page page-left">
    <h2 id="academic-h"><span class="zh">學術參訪</span> <span class="en" lang="en">Academic visits</span></h2>
    <p>${esc(A.intro_zh)}</p>
    <p class="en-body" lang="en">${esc(A.intro_en)}</p>
    ${polaroid(S.image, S.image_alt_zh, '景美人權文化園區', { r: -2, ...wh(S.image) })}
  </div>
  <div class="page page-right">
    <p class="hand sample-tag" aria-hidden="true">範例團</p>
    <h3 class="route-title"><span class="zh">${esc(S.name_zh)}</span> <span class="en" lang="en">${esc(S.name_en)}</span></h3>
    <dl class="route-meta route-meta-inline">
      <div><dt>地點 <span lang="en">Where</span></dt><dd>${esc(S.where_zh)} <span class="en" lang="en">${esc(S.where_en)}</span></dd></div>
      <div><dt>天數 <span lang="en">Days</span></dt><dd><strong class="days">${esc(S.days)}</strong> 天</dd></div>
    </dl>
    <div class="ac-grid">${acBlocks}</div>
    <div class="route-foot">
      ${stamps(S.sdgs, '學術參訪範例團對應的 SDGs')}
      ${cta('academic', '索取學術參訪提案', 'Request an academic visit', 'btn-small')}
    </div>
  </div>
</section>

<!-- 關於我們 -->
<section class="sheet about" id="about" aria-labelledby="about-h">
  <header class="sheet-head">
    <h2 id="about-h"><span class="zh">寫這本筆記的人</span> <span class="en" lang="en">Who we are</span></h2>
  </header>
  <div class="about-grid">
    <div class="about-text">
      <p class="about-who">${esc(c.about.who_zh)}</p>
      <p class="en-body" lang="en">${esc(c.about.who_en)}</p>
      <h3 class="h3-plain">願景 <span class="en" lang="en">Vision</span></h3>
      <p>${esc(c.about.vision_zh)}</p>
      <p class="en-body" lang="en">${esc(c.about.vision_en)}</p>
      <h3 class="h3-plain">使命 <span class="en" lang="en">Mission</span></h3>
      <p>${esc(c.about.mission_zh)}</p>
      <p class="en-body" lang="en">${esc(c.about.mission_en)}</p>
      <p class="partners"><span>合作網絡：</span>${c.about.partners.map(p => `<span class="partner">${esc(p)}</span>`).join('')}</p>
    </div>
    <aside class="about-side" aria-label="數字與推薦">
      <ul class="stats">${stats}</ul>
      <div class="placeholder" role="note">
        <span class="tape" aria-hidden="true"></span>
        <p><strong>待補：合作學校 logo／老師推薦</strong></p>
        <p class="en-body" lang="en">Placeholder — partner school logos and teacher testimonials to be added.</p>
      </div>
    </aside>
  </div>
</section>

<!-- CTA：填空信 -->
<section class="letter-wrap" id="letter" aria-labelledby="letter-h">
  <div class="letter">
    <header class="letter-head">
      <h2 id="letter-h"><span class="zh">寫一封信給我們</span> <span class="en" lang="en">Request a proposal</span></h2>
      <p>把空格填好就是一封完整的詢問信。我們會在 2 個工作天內回信，附上初步的行程方向。</p>
      <p class="en-body" lang="en">Fill in the blanks and it becomes your enquiry letter. We reply within 2 working days with a first draft direction.</p>
    </header>
    <form class="fill-letter" data-inquiry>
      <p class="salute">知行學旅 您好：</p>
      <p class="letter-body">
        我們是
        <label class="blank"><span class="sr">學校或單位名稱</span><input name="school" type="text" autocomplete="organization" placeholder="學校／單位名稱" size="12"></label>
        的
        <label class="blank"><span class="sr">您的姓名</span><input name="name" type="text" autocomplete="name" placeholder="姓名與職稱" size="9"></label>，
        計畫帶一團
        <span class="chips" role="radiogroup" aria-label="人數（必填）" aria-required="true">${sizeChips}</span>
        的
        <label class="blank"><span class="sr">學生年級（可選）</span><input name="grade" type="text" placeholder="年級，如 G11" size="9"></label>
        學生，預計在
        <label class="blank"><span class="sr">預計月份（可選）</span><input name="month" type="month"></label>
        進行一趟
        <label class="blank blank-select"><span class="sr">行程類型（必填）</span>
          <select name="type" required>
            <option value="" disabled selected>選一種行程類型</option>
            ${typeOpts}
          </select>
        </label>
        行程。
      </p>
      <p class="letter-body">
        <label class="blank blank-area"><span class="sr">想補充的事（可選）</span><textarea name="message" rows="3" placeholder="我們特別想了解……（可選，例如課程目標、預算、想去的地區）"></textarea></label>
      </p>
      <p class="letter-body">
        請回信到
        <label class="blank"><span class="sr">Email（必填）</span><input name="email" type="email" required autocomplete="email" placeholder="your@school.edu" size="18"></label>
        ，謝謝！
      </p>
      <p class="letter-hint" lang="en">Dear Fun Horizon — we are [school], planning a trip for [group size] [grade] students in [month]. Please reply to [email].</p>
      <div class="letter-send">
        <button type="submit" class="btn">寄出這封信 <span class="btn-en" lang="en">Send request</span></button>
        <p class="letter-alt">也可以直接寫信到 <a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a> 或來電 <a href="${esc(ct.phone_href)}">${esc(ct.phone)}</a></p>
      </div>
      <div data-inquiry-result hidden></div>
    </form>
  </div>
</section>

</main>

<footer class="site-foot">
  <div class="foot-inner">
    <div class="foot-brand">
      <p class="foot-name">${esc(s.legal_zh)}<span lang="en">${esc(s.legal_en)}</span></p>
      <p class="foot-tag">${esc(s.tagline_zh)}</p>
    </div>
    <address class="foot-contact">
      <p>${esc(ct.address_zh)}<span class="en" lang="en">${esc(ct.address_en)}</span></p>
      <p>電話 <a href="${esc(ct.phone_href)}">${esc(ct.phone)}</a></p>
      <p>Email <a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a></p>
      <p><a href="${esc(ct.linkedin)}" rel="noopener" target="_blank">LinkedIn</a></p>
    </address>
    <p class="foot-legal">統一編號 ${esc(ct.tax_id)}<br>© 2026 ${esc(s.legal_zh)} ${esc(s.legal_en)}</p>
  </div>
</footer>
${ctx.inquiryScript}
</body>
</html>`;
}
