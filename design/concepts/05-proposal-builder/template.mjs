// 概念 05・提案精靈 Proposal Builder
// 首頁本身就是「組一趟學習旅行」的配置器：hero 右側是一步一步的詢價表單，左側是即時更新的提案草稿。
// 所有內容都輸出為 HTML 文字；script.js 只做漸進增強（分步、進度條、草稿摘要、高亮符合行程）。
export default function render({ c, esc, img, head, inquiryScript, sdg }) {
  const s = c.site, ct = s.contact, inq = c.inquiry;
  const en = t => `<span class="en" lang="en">${esc(t)}</span>`;

  // 每個詢價類型 → 下方對應的內容（用於高亮與草稿卡）
  const svcMatch = { cas: 'cas', service: 'service', language: 'language', subject: 'subject', academic: 'academic', pd: 'pd' };

  const sdgTags = list => `<ul class="sdgs" aria-label="對應的聯合國永續發展目標 SDGs">${list.map(n => {
    const g = sdg(n);
    return `<li class="sdg" style="--sdg:${g.color}"><b>SDG ${g.n}</b><span>${esc(g.zh)}</span>${en(g.en)}</li>`;
  }).join('')}</ul>`;

  const cta = (type, label = '用這個開始') =>
    `<a class="btn btn-soft" href="#proposal" data-prefill-type="${type}">${esc(label)}<span class="en" lang="en">Start with this</span></a>`;

  // ---------- 表單 ----------
  const typeHints = {
    cas: '符合 IB 要求，北中南 3 條路線',
    service: '非 IB 學校也能加入服務元素',
    language: '華語課程＋文化體驗，5–30 天',
    subject: '8 條學科／STEAM 行程',
    academic: '大學與企業的專業主題參訪',
    pd: '在台灣的教師研習與講座',
    unsure: '告訴我們想法，我們幫您配',
  };
  const typeCards = inq.types.map(t => `
          <label class="pick">
            <input type="radio" name="type" value="${t.value}" required data-label="${esc(t.zh)}">
            <span class="pick-body">
              <span class="pick-title">${esc(t.zh)}</span>
              ${en(t.en)}
              <span class="pick-hint">${esc(typeHints[t.value] || '')}</span>
            </span>
          </label>`).join('');
  const sizeChips = inq.group_sizes.map(g => `
          <label class="chip">
            <input type="radio" name="group_size" value="${g.value}" required data-label="${esc(g.zh)}">
            <span>${esc(g.zh)}${en(g.en)}</span>
          </label>`).join('');

  const form = `
      <form class="builder" id="proposal" data-inquiry aria-labelledby="builder-title">
        <div class="builder-head">
          <h2 id="builder-title">組一份您的行程提案<span class="en" lang="en">Build your trip proposal</span></h2>
          <p class="builder-sub">四個步驟，約 1 分鐘。我們會在 2 個工作天內回覆提案方向。</p>
        </div>

        <div class="progress" data-progress hidden>
          <div class="progress-track"><span class="progress-fill" data-progress-fill></span></div>
          <ol class="progress-steps">
            <li data-progress-step="1">類型</li>
            <li data-progress-step="2">人數</li>
            <li data-progress-step="3">時間</li>
            <li data-progress-step="4">聯絡</li>
          </ol>
        </div>

        <fieldset class="step" data-step="1">
          <legend><span class="step-n">步驟 1／4</span>想帶學生做哪一種旅行？${en('What kind of trip?')}</legend>
          <div class="picks">${typeCards}
          </div>
        </fieldset>

        <fieldset class="step" data-step="2">
          <legend><span class="step-n">步驟 2／4</span>大約幾位同行？${en('Group size & grade')}</legend>
          <div class="chips">${sizeChips}
          </div>
          <div class="field">
            <label for="f-grade">學生年級 <small>選填</small>${en('Grade / year level')}</label>
            <input id="f-grade" name="grade" type="text" placeholder="例：G10–G11、高一、大學部" autocomplete="off">
          </div>
        </fieldset>

        <fieldset class="step" data-step="3">
          <legend><span class="step-n">步驟 3／4</span>什麼時候出發？哪所學校？${en('When & who')}</legend>
          <div class="field-row">
            <div class="field">
              <label for="f-month">預計出發月份 <small>選填</small>${en('Preferred month')}</label>
              <input id="f-month" name="month" type="month">
            </div>
            <div class="field">
              <label for="f-school">學校／單位 <small>選填</small>${en('School or organisation')}</label>
              <input id="f-school" name="school" type="text" autocomplete="organization" placeholder="例：台北某國際學校">
            </div>
          </div>
        </fieldset>

        <fieldset class="step" data-step="4">
          <legend><span class="step-n">步驟 4／4</span>提案要寄給誰？${en('Where should we send it?')}</legend>
          <div class="field-row">
            <div class="field">
              <label for="f-name">您的稱呼 <small>選填</small>${en('Name')}</label>
              <input id="f-name" name="name" type="text" autocomplete="name">
            </div>
            <div class="field">
              <label for="f-email">Email <small class="req">必填</small>${en('Email (required)')}</label>
              <input id="f-email" name="email" type="email" required autocomplete="email" placeholder="you@school.edu">
            </div>
          </div>
          <div class="field">
            <label for="f-message">想補充的需求 <small>選填</small>${en('Anything else? Curriculum goals, budget, SDGs…')}</label>
            <textarea id="f-message" name="message" rows="3" placeholder="例：希望結合 SDG 14、需要 CAS 反思紀錄、預算範圍…"></textarea>
          </div>
        </fieldset>

        <div class="builder-foot">
          <div class="step-nav" data-step-nav hidden>
            <button type="button" class="btn btn-ghost" data-prev>上一步</button>
            <button type="button" class="btn btn-primary" data-next>下一步</button>
          </div>
          <button type="submit" class="btn btn-primary btn-submit">索取客製提案<span class="en" lang="en">Request a proposal</span></button>
        </div>
        <div data-inquiry-result hidden></div>
      </form>`;

  // ---------- 提案草稿（JS 才顯示；連結都指向頁面上已存在的內容） ----------
  const matchItems = [
    ...c.cas_routes.map(r => ({ for: 'cas service', href: '#route-' + r.id, zh: `${r.region_zh}・${r.place_zh} CAS 路線`, meta: r.days + ' 天' })),
    ...c.language.plans.map(p => ({ for: 'language', href: '#language-compare', zh: p.zh, meta: '5–30 天' })),
    ...c.subject_trips.map((t, i) => ({ for: 'subject', href: '#subject-' + i, zh: t.name_zh, meta: t.days + ' 天' })),
    { for: 'academic', href: '#academic', zh: c.academic.sample.name_zh, meta: c.academic.sample.days + ' 天' },
    { for: 'pd', href: '#svc-pd', zh: '研習・演講・工作坊', meta: '台灣企業與學校' },
    { for: 'unsure', href: '#services', zh: '先看 6 項服務', meta: '' },
    { for: 'unsure', href: '#faq', zh: '常見問題', meta: '' },
  ];
  const draft = `
      <aside class="draft" data-draft hidden aria-live="polite" aria-labelledby="draft-title">
        <div class="draft-top">
          <h2 id="draft-title">您的提案草稿<span class="en" lang="en">Your draft</span></h2>
          <span class="draft-pct" data-draft-pct>0%</span>
        </div>
        <dl class="draft-list">
          <div><dt>類型</dt><dd data-draft="type">尚未選擇</dd></div>
          <div><dt>人數</dt><dd data-draft="group_size">尚未選擇</dd></div>
          <div><dt>年級</dt><dd data-draft="grade">—</dd></div>
          <div><dt>月份</dt><dd data-draft="month">—</dd></div>
          <div><dt>學校</dt><dd data-draft="school">—</dd></div>
        </dl>
        <div class="draft-match">
          <h3>符合的行程</h3>
          <p class="draft-empty" data-draft-empty>選擇類型後，這裡會列出可直接參考的行程。</p>
          <ul>${matchItems.map(m => `<li data-for="${m.for}" hidden><a href="${m.href}">${esc(m.zh)}</a>${m.meta ? `<small>${esc(m.meta)}</small>` : ''}</li>`).join('')}</ul>
        </div>
      </aside>`;

  // ---------- 服務 ----------
  const services = c.services.map(v => `
        <article class="svc" id="svc-${v.id}" data-match="${svcMatch[v.id]}">
          <img src="${img(v.image)}" alt="${esc(v.zh)}：${esc(v.summary_zh.split('。')[0])}" width="1600" height="1067" loading="lazy">
          <div class="svc-body">
            <h3>${esc(v.zh)}${en(v.en)}</h3>
            <p>${esc(v.summary_zh)}</p>
            <p class="en-p" lang="en">${esc(v.summary_en)}</p>
            ${cta(v.id)}
          </div>
        </article>`).join('');

  // ---------- CAS 路線 ----------
  const casBlock = (key, zh, enl, items) => `
              <details>
                <summary><b class="cas-letter cas-${key}">${key.toUpperCase()}</b>${zh}<span class="en" lang="en">${enl}</span><small>${items.length} 項</small></summary>
                <ul>${items.map(([z, e]) => `<li>${esc(z)}${en(e)}</li>`).join('')}</ul>
              </details>`;
  const routes = c.cas_routes.map(r => `
        <article class="route" id="route-${r.id}" data-match="cas service">
          <img src="${img(r.image)}" alt="${esc(r.image_alt_zh)}" width="1600" height="1067" loading="lazy">
          <div class="route-body">
            <p class="route-meta"><span>${esc(r.region_zh)}</span><span class="pill">${esc(r.days)} 天</span></p>
            <h3>${esc(r.place_zh)}${en(r.region_en + ' — ' + r.place_en + ', ' + r.days + ' days')}</h3>
            <h4>主題 Themes</h4>
            <ul class="themes">${r.themes_zh.map((t, i) => `<li>${esc(t)}${en(r.themes_en[i])}</li>`).join('')}</ul>
            <div class="cas">
              ${casBlock('c', '創意', 'Creativity', r.creativity)}
              ${casBlock('a', '活動', 'Activity', r.activity)}
              ${casBlock('s', '服務', 'Service', r.service)}
            </div>
            ${r.note_zh ? `<p class="note">${esc(r.note_zh)}<span class="en" lang="en">${esc(r.note_en)}</span></p>` : ''}
            ${sdgTags(r.sdgs)}
            ${cta('cas', '用這條路線開始')}
          </div>
        </article>`).join('');

  // ---------- 語言 ----------
  const L = c.language;
  const compare = `
          <div class="table-wrap" id="language-compare" data-match="language">
            <table class="compare">
              <caption>華語方案 A／B 比較 <span class="en" lang="en">Program A vs. Program B</span></caption>
              <thead>
                <tr><th scope="col">項目</th>${L.plans.map(p => `<th scope="col">${esc(p.zh)}${en(p.en)}</th>`).join('')}</tr>
              </thead>
              <tbody>${L.compare.map(r => `
                <tr><th scope="row">${esc(r.row_zh)}${en(r.row_en)}</th><td>${esc(r.A_zh)}${en(r.A_en)}</td><td>${esc(r.B_zh)}${en(r.B_en)}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>`;

  // ---------- 科目考察 ----------
  const subjRows = c.subject_trips.map((t, i) => `
              <tr id="subject-${i}" data-match="subject">
                <th scope="row" data-label="行程">${esc(t.name_zh)}${en(t.name_en)}</th>
                <td data-label="地點">${esc(t.dest_zh)}${en(t.dest_en)}</td>
                <td data-label="科目">${esc(t.subjects_zh)}${en(t.subjects_en)}</td>
                <td data-label="亮點">${esc(t.highlights_zh)}${en(t.highlights_en)}</td>
                <td data-label="年級">${esc(t.grade_zh)}${en(t.grade_en)}</td>
                <td data-label="天數" class="num">${esc(t.days)} 天</td>
              </tr>`).join('');
  const ce = c.circular_economy;

  // ---------- 學術參訪 ----------
  const A = c.academic, sm = A.sample;

  // ---------- FAQ（答案只根據 content.json；不確定處標「待確認」） ----------
  const faq = [
    ['行程可以客製嗎？', 'Can the trip be customised?',
      `可以。我們依學校課程或交流目的設計行程，並協同旅行社執行。頁面上的 CAS 路線、華語方案與科目考察都是起點範本，主題、地點與天數都能調整。`],
    ['最少幾人成團？', 'Is there a minimum group size?',
      `<span class="tbc">待確認</span> 目前尚無公開的最低人數。表單提供「15 人以下」到「60 人以上」的選項，填寫人數後我們會在提案中說明。`],
    ['費用如何計算？', 'How is pricing calculated?',
      `依行程與活動內容由知行學旅計費。華語方案 A 的語言課依語言中心標準計費，其餘行程由知行學旅計費。具體報價 <span class="tbc">待確認</span>，會隨提案提供。`],
    ['包含食宿與交通嗎？', 'Are meals, accommodation and transport included?',
      `華語與文化方案皆含台灣在地食宿與交通安排，並有專業人員隨團帶領。其他類型行程的包含項目 <span class="tbc">待確認</span>，會在提案中列出。`],
    ['每趟行程都會結合 SDGs 嗎？', 'Does every trip include SDGs?',
      `是的，每趟行程至少融入 2 項聯合國永續發展目標（SDGs）。例如桃園路線對應 SDG 11、12、13、14。`],
    ['我們不是 IB 學校，也能安排服務學習嗎？', 'We are not an IB school — can we still do service learning?',
      `可以。我們會先分析需求，挑選合適的台灣在地組織，共同規劃服務學習行程。`],
  ];

  return `<!doctype html>
<html lang="zh-Hant-TW" data-concept="05-proposal-builder">
<head>
${head()}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
<a class="skip" href="#main">跳到主要內容</a>

<section class="hero" aria-label="知行學旅首頁開場與提案表單">
  <img class="hero-bg" src="${img(c.images.hero.file)}" alt="${esc(c.images.hero.alt_zh)}" width="1600" height="1200" fetchpriority="high">

  <header class="topbar">
    <a class="concept-tag" href="../../index.html">← 設計概念總覽<span>概念 05・提案精靈</span></a>
    <div class="topbar-row">
      <a class="brand" href="#main" aria-label="${esc(s.name_zh)} ${esc(s.name_en)}">
        <img src="${img('logo-zhixing.png')}" alt="${esc(s.name_zh)} 標誌" width="40" height="42">
        <span><b>${esc(s.name_zh)}</b>${en(s.name_en)}</span>
      </a>
      <nav aria-label="主選單">
        <ul>
          <li><a href="#services">服務</a></li>
          <li><a href="#cas">CAS 路線</a></li>
          <li><a href="#language">華語與文化</a></li>
          <li><a href="#subject">科目考察</a></li>
          <li><a href="#academic">學術參訪</a></li>
          <li><a href="#about">關於我們</a></li>
          <li><a href="#faq">常見問題</a></li>
        </ul>
      </nav>
      <a class="btn btn-sun btn-sm" href="#proposal">索取提案</a>
    </div>
  </header>

  <div class="hero-grid" id="main">
    <div class="hero-copy">
      <p class="brand-line">${esc(s.name_zh)}　${esc(s.name_en)}</p>
      <h1>四個步驟，<br>組一趟屬於您學生的台灣學習旅行</h1>
      <p class="lede">${esc(s.tagline_zh)}。我們為國際學校、一般學校、大學與企業規劃 IB CAS 服務學習、華語營、科目考察與學術參訪，每趟融入至少 2 項 SDGs。</p>
      <p class="lede en-p" lang="en">${esc(s.tagline_en)}</p>
      <a class="btn btn-sun hero-jump" href="#proposal">索取客製提案<span class="en" lang="en">Request a proposal</span></a>
    </div>
    <div class="hero-form">${form}
    </div>
    <div class="hero-draft">${draft}
    </div>
  </div>
</section>

<main>
  <section class="band" id="intro" aria-labelledby="intro-title">
    <div class="wrap intro">
      <h2 id="intro-title" class="sr-only">知行學旅簡介</h2>
      <p class="intro-zh">${esc(c.intro.zh)}</p>
      <p class="en-p" lang="en">${esc(c.intro.en)}</p>
      <ul class="audiences" aria-label="我們服務的對象">
        ${c.audiences.map(a => `<li><a href="#proposal" data-prefill-type="${a.service}">${esc(a.zh)}${en(a.en)}</a></li>`).join('')}
      </ul>
    </div>
  </section>

  <section class="band" id="services" aria-labelledby="services-title">
    <div class="wrap">
      <div class="sec-head">
        <h2 id="services-title">六種行程，從一個開始<span class="en" lang="en">Six ways to travel and learn</span></h2>
        <p>每一項都可以直接帶入上方表單，作為提案的起點。</p>
      </div>
      <div class="svc-grid">${services}
      </div>
    </div>
  </section>

  <section class="band band-sky" id="cas" aria-labelledby="cas-title">
    <div class="wrap">
      <div class="sec-head">
        <h2 id="cas-title">IB CAS 北中南三條路線<span class="en" lang="en">Three CAS routes across Taiwan</span></h2>
        <p>創意（C）、活動（A）、服務（S）是 IB 國際文憑課程的核心。每條路線 5–7 天，點開 C／A／S 看完整活動清單。</p>
      </div>
      <div class="routes">${routes}
      </div>
    </div>
  </section>

  <section class="band" id="language" aria-labelledby="language-title">
    <div class="wrap">
      <div class="sec-head">
        <h2 id="language-title">華語與文化營<span class="en" lang="en">Chinese language &amp; culture</span></h2>
      </div>
      <div class="lang-grid">
        <div class="lang-info">
          <h3>華語課程${en('Chinese learning')}</h3>
          <p>${esc(L.learning_zh)}</p>
          <p class="en-p" lang="en">${esc(L.learning_en)}</p>
          <dl class="facts">
            <div><dt>上課地點</dt><dd>${esc(L.learning_where)}</dd></div>
            <div><dt>課程天數</dt><dd>${esc(L.learning_days)} 天</dd></div>
          </dl>
          <h3>文化體驗${en('Culture')}</h3>
          <p>${esc(L.culture_zh)}</p>
          <p class="en-p" lang="en">${esc(L.culture_en)}</p>
          <figure class="lang-photo">
            <img src="${img('culture-temple-lanterns.jpg')}" alt="${esc(c.images.gallery.find(g => g.file === 'culture-temple-lanterns.jpg').alt_zh)}" width="1600" height="1067" loading="lazy">
          </figure>
        </div>
        <div class="lang-plans">
          ${compare}
          <div class="lang-extra">
            <div>
              <h3>其他可安排的活動${en('Also available')}</h3>
              <p>${esc(L.other_zh)}</p>
              <p class="en-p" lang="en">${esc(L.other_en)}</p>
            </div>
            <div class="included">
              <h3>方案包含${en('Included')}</h3>
              <p>${esc(L.included_zh)}</p>
              <p class="en-p" lang="en">${esc(L.included_en)}</p>
            </div>
          </div>
          ${cta('language')}
        </div>
      </div>
    </div>
  </section>

  <section class="band band-sky" id="subject" aria-labelledby="subject-title">
    <div class="wrap">
      <div class="sec-head">
        <h2 id="subject-title">科目考察與 STEAM：8 條行程範本<span class="en" lang="en">Subject &amp; STEAM trips</span></h2>
        <p>依學科標準、課程目標或跨學科專題（PBL）設計。每條都能依年級與天數調整。</p>
      </div>
      <div class="table-wrap table-subject">
        <table class="subject">
          <caption class="sr-only">科目考察行程一覽</caption>
          <thead>
            <tr><th scope="col">行程</th><th scope="col">地點</th><th scope="col">科目</th><th scope="col">亮點</th><th scope="col">年級</th><th scope="col">天數</th></tr>
          </thead>
          <tbody>${subjRows}
          </tbody>
        </table>
      </div>

      <div class="circular" id="circular">
        <div class="circular-head">
          <h3>${esc(ce.title_zh)}${en(ce.title_en)}</h3>
          <p>桃園科學與地理考察、桃園 CAS 路線都會走完這條流程。</p>
        </div>
        <ol class="flow">
          ${ce.steps.map(([z, e]) => `<li>${esc(z)}${en(e)}</li>`).join('')}
        </ol>
        <ul class="ce-facts">
          ${ce.facts_zh.map((f, i) => `<li>${esc(f)}${en(ce.facts_en[i])}</li>`).join('')}
        </ul>
      </div>
      <div class="sec-cta">${cta('subject')}</div>
    </div>
  </section>

  <section class="band" id="academic" aria-labelledby="academic-title">
    <div class="wrap">
      <div class="sec-head">
        <h2 id="academic-title">學術參訪<span class="en" lang="en">Academic visits</span></h2>
        <p>${esc(A.intro_zh)}</p>
        <p class="en-p" lang="en">${esc(A.intro_en)}</p>
      </div>
      <article class="sample" data-match="academic">
        <img src="${img(sm.image)}" alt="${esc(sm.image_alt_zh)}" width="1600" height="1067" loading="lazy">
        <div class="sample-body">
          <p class="route-meta"><span>範例團</span><span class="pill">${esc(sm.days)} 天</span></p>
          <h3>${esc(sm.name_zh)}${en(sm.name_en)}</h3>
          <p class="where">地點：${esc(sm.where_zh)}<span class="en" lang="en">${esc(sm.where_en)}</span></p>
          <div class="blocks">
            ${sm.blocks.map(b => `<div class="block"><h4>${esc(b.zh)}${en(b.en)}</h4><ul>${b.items.map(([z, e]) => `<li>${esc(z)}${en(e)}</li>`).join('')}</ul></div>`).join('')}
          </div>
          ${sdgTags(sm.sdgs)}
          ${cta('academic')}
        </div>
      </article>
    </div>
  </section>

  <section class="band band-ink" id="about" aria-labelledby="about-title">
    <div class="wrap">
      <div class="about-grid">
        <div>
          <h2 id="about-title">關於知行學旅<span class="en" lang="en">About us</span></h2>
          <p>${esc(c.about.who_zh)}</p>
          <p class="en-p" lang="en">${esc(c.about.who_en)}</p>
        </div>
        <div class="vm">
          <div><h3>願景${en('Vision')}</h3><p>${esc(c.about.vision_zh)}</p><p class="en-p" lang="en">${esc(c.about.vision_en)}</p></div>
          <div><h3>使命${en('Mission')}</h3><p>${esc(c.about.mission_zh)}</p><p class="en-p" lang="en">${esc(c.about.mission_en)}</p></div>
        </div>
      </div>
      <ul class="stats">
        ${c.stats.map(x => `<li><b>${esc(x.num)}</b><span>${esc(x.zh)}</span>${en(x.en)}</li>`).join('')}
      </ul>
      <div class="partners">
        <h3>我們連結的夥伴</h3>
        <ul>${c.about.partners.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
      </div>
    </div>
  </section>

  <section class="band" id="voices" aria-labelledby="voices-title">
    <div class="wrap">
      <div class="placeholder">
        <h2 id="voices-title">合作學校與老師推薦<span class="en" lang="en">Schools we have worked with</span></h2>
        <p><strong>待補：</strong>合作學校 logo／老師推薦。客戶提供素材後放在這裡（建議 3 則推薦語＋ 6–8 個學校 logo）。</p>
        <ul class="ph-logos" aria-hidden="true"><li></li><li></li><li></li><li></li><li></li><li></li></ul>
      </div>
    </div>
  </section>

  <section class="band band-sky" id="faq" aria-labelledby="faq-title">
    <div class="wrap faq-wrap">
      <div class="sec-head">
        <h2 id="faq-title">常見問題<span class="en" lang="en">FAQ</span></h2>
        <p>標示「待確認」的部分，正式上線前請客戶確認。</p>
      </div>
      <div class="faq">
        ${faq.map(([q, qe, a]) => `<details><summary>${esc(q)}${en(qe)}</summary><p>${a}</p></details>`).join('')}
      </div>
    </div>
  </section>

  <section class="band closing" aria-labelledby="closing-title">
    <div class="wrap closing-inner">
      <h2 id="closing-title">看完了？回到上方，用四個步驟組您的提案<span class="en" lang="en">Ready? Build your proposal in four steps.</span></h2>
      <a class="btn btn-sun" href="#proposal">索取客製提案<span class="en" lang="en">Request a proposal</span></a>
    </div>
  </section>
</main>

<footer class="footer">
  <div class="wrap footer-grid">
    <div>
      <p class="f-brand"><b>${esc(s.legal_zh)}</b>${en(s.legal_en)}</p>
      <p>${esc(s.tagline_zh)}</p>
    </div>
    <address>
      <p>${esc(ct.address_zh)}<span class="en" lang="en">${esc(ct.address_en)}</span></p>
      <p>電話 <a href="${ct.phone_href}">${esc(ct.phone)}</a></p>
      <p>Email <a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a></p>
      <p><a href="${esc(ct.linkedin)}" rel="noopener" target="_blank">LinkedIn</a></p>
    </address>
    <div class="f-legal">
      <p>統一編號 ${esc(ct.tax_id)}</p>
      <p>© 2026 ${esc(s.legal_zh)}</p>
    </div>
  </div>
</footer>

${inquiryScript}
<script src="script.js" defer></script>
</body>
</html>`;
}
