/* 概念 03・島嶼路線圖：漸進增強
   1) 點地圖 pin → 切換旁邊的路線面板（無 JS 時 pin 是錨點，直接跳到下方段落）
   2) [data-prefill-region] 按鈕 → 勾選表單「想去的地區」（類型預填由共用 inquiry.js 處理） */
(function () {
  var pins = document.querySelectorAll('.pin[data-pin]');
  var panels = document.querySelectorAll('.hero-panel [data-panel]');
  var holder = document.querySelector('.hero-panel');

  function show(id, focusPanel) {
    var target = null;
    panels.forEach(function (p) {
      var on = p.getAttribute('data-panel') === id;
      p.classList.toggle('is-active', on);
      if (on) target = p;
    });
    pins.forEach(function (a) {
      if (a.getAttribute('data-pin') === id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    if (!target) return;
    // 手機版面板在地圖下方：若不在視窗內就捲過去
    var r = target.getBoundingClientRect();
    if (focusPanel && (r.top > window.innerHeight - 80 || r.bottom < 0)) {
      target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
    }
  }

  pins.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      show(a.getAttribute('data-pin'), true);
    });
    a.addEventListener('keydown', function (e) {
      if (e.key === ' ') { e.preventDefault(); show(a.getAttribute('data-pin'), true); }
    });
  });

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-prefill-region]');
    if (!t) return;
    var v = t.getAttribute('data-prefill-region');
    var box = document.querySelector('form[data-inquiry] input[name="regions"][value="' + v + '"]');
    if (box) box.checked = true;
  });

  if (holder) holder.setAttribute('data-enhanced', '');
})();
