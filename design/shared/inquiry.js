/*
 * 知行學旅 — 共用詢價表單 (CTA) 行為
 * ------------------------------------------------------------
 * 任何 <form data-inquiry> 都會被接管：
 *   - 欄位名稱統一：type, group_size, grade, month, school, name, email, message
 *   - 後端未定：若 form 有 data-endpoint（或 window.FH_INQUIRY_ENDPOINT），以 JSON POST 送出；
 *     否則只在頁面顯示「將送出的資料」+ mailto 備援，方便設計討論。
 *   - 任何 [data-prefill-type="cas"] 的連結/按鈕：點擊會預選表單類型並捲到表單。
 *   - 網址 ?type=cas 也會預選。
 *   - 送出後 dispatch `inquiry:submitted` 事件 (detail = payload)，可接 GA / Pixel。
 */
(function () {
  var MAIL = 'office@funhorizonedutrips.com';

  function toObject(form) {
    var fd = new FormData(form), out = {};
    fd.forEach(function (v, k) {
      if (out[k] === undefined) out[k] = v;
      else out[k] = [].concat(out[k], v);
    });
    out.page = location.pathname;
    out.concept = document.documentElement.getAttribute('data-concept') || '';
    out.submitted_at = new Date().toISOString();
    return out;
  }

  function setType(form, value) {
    var els = form.querySelectorAll('[name="type"]');
    els.forEach(function (el) {
      if (el.type === 'radio' || el.type === 'checkbox') el.checked = el.value === value;
      else el.value = value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function render(form, payload, state) {
    var box = form.querySelector('[data-inquiry-result]') ||
      (form.parentNode && form.parentNode.querySelector('[data-inquiry-result]'));
    if (!box) { box = document.createElement('div'); box.setAttribute('data-inquiry-result', ''); form.appendChild(box); }
    box.hidden = false;
    var body = Object.keys(payload).map(function (k) { return k + ': ' + payload[k]; }).join('\n');
    var mailto = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('客製行程提案詢問 Proposal request') +
      '&body=' + encodeURIComponent(body);
    if (state === 'sent') {
      box.innerHTML = '<p class="inq-ok"><strong>已收到！</strong>我們會在 2 個工作天內回覆提案方向。<br>Thanks — we’ll reply within 2 working days.</p>';
    } else if (state === 'error') {
      box.innerHTML = '<p class="inq-err">送出失敗，請改用 Email：<a href="' + mailto + '">' + MAIL + '</a></p>';
    } else {
      box.innerHTML = '<p class="inq-ok"><strong>（設計稿示意）表單已收集以下資料</strong>，後端接上後會直接送出；目前可先用 <a href="' + mailto + '">Email 寄出</a>。</p>' +
        '<pre class="inq-payload">' + body.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }) + '</pre>';
    }
  }

  function bind(form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var payload = toObject(form);
      var endpoint = form.getAttribute('data-endpoint') || window.FH_INQUIRY_ENDPOINT;
      form.dispatchEvent(new CustomEvent('inquiry:submitted', { bubbles: true, detail: payload }));
      if (!endpoint) { render(form, payload, 'preview'); return; }
      var btn = form.querySelector('[type="submit"]'); if (btn) btn.disabled = true;
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { render(form, payload, r.ok ? 'sent' : 'error'); })
        .catch(function () { render(form, payload, 'error'); })
        .finally(function () { if (btn) btn.disabled = false; });
    });
  }

  function init() {
    var forms = document.querySelectorAll('form[data-inquiry]');
    forms.forEach(bind);
    var q = new URLSearchParams(location.search).get('type');
    if (q) forms.forEach(function (f) { setType(f, q); });
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-prefill-type]');
      if (!t || !forms.length) return;
      var form = forms[0];
      setType(form, t.getAttribute('data-prefill-type'));
      if (t.tagName !== 'A' || (t.getAttribute('href') || '').charAt(0) !== '#') {
        e.preventDefault();
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
