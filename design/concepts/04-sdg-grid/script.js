// 概念 04 — 漸進增強：人數 stepper（− / +）與對應的人數區間提示。
// 沒有 JS 時，數字欄位仍可直接輸入並送出（group_size = 數字字串，例如 "24"）。
(function () {
  document.querySelectorAll('[data-stepper]').forEach(function (box) {
    var input = box.querySelector('input[name="group_size"]');
    var label = box.querySelector('[data-range-label]');
    var ranges = [];
    try { ranges = JSON.parse(box.getAttribute('data-ranges') || '[]'); } catch (e) {}

    function rangeFor(n) {
      // value 形如 "1-15"、"16-30"、"60+"
      for (var i = 0; i < ranges.length; i++) {
        var v = ranges[i].v, m = v.match(/^(\d+)-(\d+)$/);
        if (m && n >= +m[1] && n <= +m[2]) return ranges[i];
        if (/\+$/.test(v) && n >= parseInt(v, 10)) return ranges[i];
      }
      return null;
    }
    function update() {
      var n = parseInt(input.value, 10);
      var r = isNaN(n) ? null : rangeFor(n);
      if (label) label.textContent = r ? '・' + r.zh : '';
      if (r) input.setAttribute('data-range', r.v);
    }
    box.querySelectorAll('[data-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var step = +btn.getAttribute('data-step');
        var n = parseInt(input.value, 10) || 0;
        var min = +input.min || 1, max = +input.max || 999;
        input.value = Math.min(max, Math.max(min, n + step));
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
    input.addEventListener('input', update);
    update();
  });
})();
