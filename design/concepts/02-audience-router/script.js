// 概念 02・三秒分流 — 漸進增強（內容皆已在 HTML 中；此檔只控制顯示與預選）
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var TYPE_LABEL = { cas: 'IB CAS 行程', subject: '科目考察', academic: '學術參訪', language: '華語與文化營' };

  // ---------- 表單類型：所有表單同步 ----------
  function setTypeAll(value) {
    $$('form[data-inquiry] input[name="type"]').forEach(function (el) { el.checked = el.value === value; });
  }
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'type' && t.closest('form[data-inquiry]') && t.checked) {
      $$('form[data-inquiry] input[name="type"]').forEach(function (el) { if (el.value === t.value) el.checked = true; });
    }
  });
  // 共用 inquiry.js 只預選第一個表單；這裡補上同步其餘表單
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-prefill-type]');
    if (t) setTypeAll(t.getAttribute('data-prefill-type'));
  });

  // ---------- Tabs ----------
  var tablist = $('.tablist');
  var tabs = tablist ? $$('[role="tab"]', tablist) : [];
  function selectTab(id, focus) {
    tabs.forEach(function (b) {
      var on = b.id === 'tab-' + id;
      b.setAttribute('aria-selected', on);
      b.tabIndex = on ? 0 : -1;
      var p = document.getElementById(b.getAttribute('aria-controls'));
      if (p) p.hidden = !on;
      if (on && focus) b.focus();
    });
  }
  if (tabs.length) {
    tablist.hidden = false;
    tabs.forEach(function (b, i) {
      var p = document.getElementById(b.getAttribute('aria-controls'));
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', b.id);
      p.tabIndex = -1;
      b.addEventListener('click', function () { selectTab(b.id.slice(4)); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        selectTab(tabs[(i + d + tabs.length) % tabs.length].id.slice(4), true);
      });
    });
    selectTab(tabs[0].id.slice(4));
    // 錨點連到 tab 面板（nav、分流連結）時先切換
    function openFromHash(hash) {
      var p = hash && document.getElementById(hash.slice(1));
      if (p && p.dataset.tab) selectTab(p.dataset.tab);
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#prog-"]');
      if (a) openFromHash(a.getAttribute('href'));
    });
    openFromHash(location.hash);
  }

  // ---------- 科目篩選 ----------
  var filter = $('[data-filter]');
  if (filter) {
    filter.hidden = false;
    var rows = $$('.trips tbody tr');
    var count = $('.filter-count', filter);
    var btns = $$('button[data-subj]', filter);
    function apply(subj) {
      var n = 0;
      rows.forEach(function (r) {
        var show = !subj || r.getAttribute('data-subjects').split('|').indexOf(subj) > -1;
        r.hidden = !show; if (show) n++;
      });
      btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-subj') === subj); });
      count.textContent = subj ? '顯示 ' + n + ' / ' + rows.length + ' 條行程' : '共 ' + rows.length + ' 條行程';
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-subj')); }); });
    apply('');
  }

  // ---------- 三秒分流 ----------
  var cards = $$('.aud[data-aud]');
  var stickyLabel = $('[data-sticky-label]');
  var TAB_OF = { ib: null, school: 'subject', higher: 'academic', language: 'language' };
  function route(aud, type) {
    document.body.setAttribute('data-aud', aud);
    cards.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-aud') === aud); });
    $$('.route').forEach(function (r) { r.hidden = r.getAttribute('data-route') !== aud; });
    $$('[data-for]').forEach(function (el) {
      el.classList.toggle('is-match', (' ' + el.getAttribute('data-for') + ' ').indexOf(' ' + aud + ' ') > -1);
    });
    if (TAB_OF[aud] && tabs.length) selectTab(TAB_OF[aud]);
    setTypeAll(type);
    if (stickyLabel) stickyLabel.textContent = '索取' + (TYPE_LABEL[type] || '客製') + '提案';
  }
  cards.forEach(function (c) {
    c.setAttribute('role', 'button');
    c.setAttribute('aria-pressed', 'false');
    c.addEventListener('click', function (e) {
      e.preventDefault();
      route(c.getAttribute('data-aud'), c.getAttribute('data-type'));
    });
    c.addEventListener('keydown', function (e) {
      if (e.key === ' ') { e.preventDefault(); c.click(); }
    });
  });

  // ---------- Sticky 底部列：表單在畫面中時收起 ----------
  var sticky = $('[data-sticky]');
  var formSecs = $$('.form-sec');
  if (sticky && 'IntersectionObserver' in window && formSecs.length) {
    var visible = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target); });
      sticky.classList.toggle('is-hidden', visible.size > 0);
    }, { threshold: 0.15 });
    formSecs.forEach(function (s) { io.observe(s); });
  }
})();
