/*
 * 概念 05・提案精靈 — 漸進增強
 * 無 JS：表單是一張展開的長表單，所有內容都在 HTML 裡。
 * 有 JS：分成 4 步（進度條、上一步／下一步）、即時提案草稿、高亮下方符合的行程。
 * 送出由 shared/inquiry.js 處理。
 */
(function () {
  var form = document.querySelector('form[data-inquiry]');
  if (!form) return;
  var steps = [].slice.call(form.querySelectorAll('[data-step]'));
  var total = steps.length;
  var nav = form.querySelector('[data-step-nav]');
  var prev = form.querySelector('[data-prev]');
  var next = form.querySelector('[data-next]');
  var progress = form.querySelector('[data-progress]');
  var fill = form.querySelector('[data-progress-fill]');
  var draft = document.querySelector('[data-draft]');
  var at = 1;

  form.classList.add('is-wizard');
  nav.hidden = false;
  progress.hidden = false;
  if (draft) draft.hidden = false;

  function stepValid(n) {
    var fields = steps[n - 1].querySelectorAll('input, select, textarea');
    for (var i = 0; i < fields.length; i++) {
      if (!fields[i].checkValidity()) { fields[i].reportValidity(); return false; }
    }
    return true;
  }

  function goTo(n, focus) {
    at = Math.max(1, Math.min(total, n));
    steps.forEach(function (s, i) { s.hidden = i !== at - 1; });
    form.setAttribute('data-at', at);
    prev.hidden = at === 1;
    next.hidden = at === total;
    fill.style.width = (at / total * 100) + '%';
    form.querySelectorAll('[data-progress-step]').forEach(function (li) {
      var k = +li.getAttribute('data-progress-step');
      li.classList.toggle('is-done', k < at);
      li.classList.toggle('is-current', k === at);
      if (k === at) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    if (focus) {
      var first = steps[at - 1].querySelector('input:checked, input, textarea');
      if (first) first.focus({ preventScroll: true });
    }
  }

  next.addEventListener('click', function () { if (stepValid(at)) goTo(at + 1, true); });
  prev.addEventListener('click', function () { goTo(at - 1, true); });

  // 前幾步按 Enter 不送出，改成下一步
  form.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || at === total || e.target.tagName === 'TEXTAREA') return;
    if (e.target.tagName === 'INPUT') { e.preventDefault(); if (stepValid(at)) goTo(at + 1, true); }
  });

  // ---------- 草稿摘要 + 高亮 ----------
  function checkedLabel(name) {
    var el = form.querySelector('[name="' + name + '"]:checked');
    return el ? { value: el.value, label: el.getAttribute('data-label') } : null;
  }
  function setText(key, text, empty) {
    var dd = draft && draft.querySelector('[data-draft="' + key + '"]');
    if (!dd) return;
    dd.textContent = text || empty;
    dd.classList.toggle('is-empty', !text);
  }
  function fmtMonth(v) {
    var m = /^(\d{4})-(\d{2})$/.exec(v || '');
    return m ? m[1] + ' 年 ' + (+m[2]) + ' 月' : v;
  }

  function update() {
    var type = checkedLabel('type');
    var size = checkedLabel('group_size');
    var grade = form.elements.grade.value.trim();
    var month = form.elements.month.value;
    var school = form.elements.school.value.trim();
    setText('type', type && type.label, '尚未選擇');
    setText('group_size', size && size.label, '尚未選擇');
    setText('grade', grade, '—');
    setText('month', fmtMonth(month), '—');
    setText('school', school, '—');

    var filled = [type, size, form.elements.email.value && form.elements.email.checkValidity()].filter(Boolean).length;
    var optional = [grade, month, school, form.elements.name.value].filter(Boolean).length;
    if (draft) draft.querySelector('[data-draft-pct]').textContent = Math.round((filled * 25) + (optional * 6.25)) + '%';

    var t = type ? type.value : '';
    if (draft) {
      var any = false;
      draft.querySelectorAll('[data-for]').forEach(function (li) {
        var on = !!t && li.getAttribute('data-for').split(' ').indexOf(t) > -1;
        li.hidden = !on; if (on) any = true;
      });
      draft.querySelector('[data-draft-empty]').hidden = any;
    }
    document.querySelectorAll('main [data-match]').forEach(function (el) {
      el.classList.toggle('is-match', !!t && el.getAttribute('data-match').split(' ').indexOf(t) > -1);
    });
  }

  form.addEventListener('change', update);
  form.addEventListener('input', update);

  // 從下方「用這個開始」帶回來：類型已由 inquiry.js 選好，直接跳到步驟 2
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-prefill-type]')) return;
    setTimeout(function () { update(); goTo(2); }, 0);
  });

  goTo(form.querySelector('[name="type"]:checked') ? 2 : 1);
  update();
})();
