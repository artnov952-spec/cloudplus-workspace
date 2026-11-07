/* ERP UI Kit - поведение компонентов. Без зависимостей. Подключать в конце body. */
(function () {
  var doc = document;
  function all(sel, root) { return [].slice.call((root || doc).querySelectorAll(sel)); }

  /* иконки: <svg class="i"><use href="#i-plus"/></svg>; спрайт подгружается один раз */
  var sprite = doc.currentScript && doc.currentScript.dataset.sprite;
  if (sprite) fetch(sprite).then(function (r) { return r.text(); }).then(function (t) {
    var d = doc.createElement('div'); d.innerHTML = t; doc.body.insertBefore(d.firstChild, doc.body.firstChild);
  });

  /* уведомления: Kit.toast('Текст') или атрибут data-toast="Текст" */
  function toast(text) {
    var host = doc.querySelector('.toasts');
    if (!host) { host = doc.createElement('div'); host.className = 'toasts'; doc.body.appendChild(host); }
    var el = doc.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = text;
    host.appendChild(el); setTimeout(function () { el.remove(); }, 2200);
  }

  /* окна: data-open-dialog="#id" открывает, data-close закрывает, Esc и клик по фону тоже */
  function openDialog(sel) { var o = doc.querySelector(sel); if (!o) return; o.setAttribute('data-open', ''); var f = o.querySelector('input,select,textarea,button'); if (f) f.focus(); }
  function closeDialog(o) { if (o) o.removeAttribute('data-open'); }
  function closeMenus(except) { all('.menu[data-open]').forEach(function (m) { if (m !== except) { m.removeAttribute('data-open'); var b = m.parentElement.querySelector('[aria-haspopup]'); if (b) b.setAttribute('aria-expanded', 'false'); } }); }

  /* тема: data-theme-set="light|dark" */
  function setTheme(t) { doc.documentElement.setAttribute('data-theme', t); try { localStorage.setItem('kit-theme', t); } catch (e) {} all('[data-theme-set]').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.themeSet === t); }); }
  try { var saved = localStorage.getItem('kit-theme'); if (saved) doc.documentElement.setAttribute('data-theme', saved); } catch (e) {}

  doc.addEventListener('click', function (e) {
    var t = e.target, el;

    if ((el = t.closest('[data-theme-set]'))) { setTheme(el.dataset.themeSet); return; }

    /* сегменты и вкладки: один выбранный в группе, панели по data-panel */
    if ((el = t.closest('.seg button, .tabs button'))) {
      var group = el.parentElement;
      all('button', group).forEach(function (b) { b.setAttribute('aria-selected', b === el); });
      if (el.dataset.tab) all('[data-panel]', group.parentElement).forEach(function (p) { p.hidden = p.dataset.panel !== el.dataset.tab; });
      return;
    }

    /* выпадающее меню: кнопка с aria-haspopup внутри .menu-host */
    if ((el = t.closest('[aria-haspopup]'))) {
      var menu = el.parentElement.querySelector('.menu'); if (!menu) return;
      var isOpen = menu.hasAttribute('data-open'); closeMenus();
      if (!isOpen) { menu.setAttribute('data-open', ''); el.setAttribute('aria-expanded', 'true'); }
      return;
    }
    if ((el = t.closest('.menu__item'))) {
      var m = el.closest('.menu'), host = m.parentElement, btn = host.querySelector('[aria-haspopup]');
      if (m.dataset.select !== undefined) {
        all('.menu__item', m).forEach(function (i) { i.setAttribute('aria-checked', i === el); });
        var lab = btn && btn.querySelector('[data-value]'); if (lab) lab.textContent = el.textContent.trim();
      }
      if (!m.classList.contains('menu--static')) closeMenus();
      if (el.dataset.toast) toast(el.dataset.toast);
      return;
    }
    if (!t.closest('.menu')) closeMenus();

    if ((el = t.closest('[data-open-dialog]'))) { openDialog(el.dataset.openDialog); return; }
    if ((el = t.closest('[data-close]'))) { closeDialog(el.closest('.overlay')); if (el.dataset.toast) toast(el.dataset.toast); return; }
    if (t.classList && t.classList.contains('overlay')) { closeDialog(t); return; }

    /* сайдбар: группы и сворачивание */
    if ((el = t.closest('.nav__group'))) {
      var open = el.getAttribute('aria-expanded') !== 'false'; el.setAttribute('aria-expanded', !open);
      var n = el.nextElementSibling; while (n && !n.classList.contains('nav__group')) { n.hidden = open; n = n.nextElementSibling; }
      return;
    }
    if ((el = t.closest('[data-side-toggle]'))) { var s = doc.querySelector('.side'); s.dataset.collapsed = s.dataset.collapsed !== 'true'; return; }
    if ((el = t.closest('.nav'))) {
      if (el.getAttribute('href') === '#') e.preventDefault();
      all('.nav', el.closest('.side') || doc).forEach(function (a) { a.removeAttribute('aria-current'); }); el.setAttribute('aria-current', 'page');
      return;
    }

    /* списки: кнопка удаления строки */
    if ((el = t.closest('[data-dismiss]'))) { var it = el.closest('.item, .task, tr, .toast'); if (it) it.remove(); return; }

    /* сортировка колонки таблицы */
    if ((el = t.closest('.th-btn'))) {
      var th = el.closest('th'), table = th.closest('table'), idx = [].indexOf.call(th.parentElement.children, th), dir = th.dataset.dir === 'asc' ? 'desc' : 'asc';
      all('th', table).forEach(function (h) { delete h.dataset.dir; }); th.dataset.dir = dir;
      var body = table.tBodies[0], rows = [].slice.call(body.rows);
      var val = function (r) { var x = r.cells[idx].textContent.trim(), nmb = parseFloat(x.replace(/\s/g, '').replace(',', '.')); return isNaN(nmb) ? x.toLowerCase() : nmb; };
      rows.sort(function (a, b) { var x = val(a), y = val(b); return (x > y ? 1 : x < y ? -1 : 0) * (dir === 'asc' ? 1 : -1); }).forEach(function (r) { body.appendChild(r); });
      return;
    }

    if ((el = t.closest('[data-toast]'))) { toast(el.dataset.toast); return; }
  });

  /* таблица: выбор строк чекбоксами, «выбрать все» в шапке */
  doc.addEventListener('change', function (e) {
    var c = e.target; if (!c.matches('.table input[type=checkbox]')) return;
    var table = c.closest('table');
    if (c.closest('thead')) all('tbody input[type=checkbox]', table).forEach(function (x) { x.checked = c.checked; x.closest('tr').setAttribute('aria-selected', c.checked); });
    else c.closest('tr').setAttribute('aria-selected', c.checked);
  });

  /* поиск по таблице: <input data-filter="#tableId"> */
  doc.addEventListener('input', function (e) {
    var i = e.target; if (!i.dataset || !i.dataset.filter) return;
    var q = i.value.toLowerCase(); all(i.dataset.filter + ' tbody tr').forEach(function (r) { r.hidden = r.textContent.toLowerCase().indexOf(q) < 0; });
  });

  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMenus(); closeDialog(doc.querySelector('.overlay[data-open]')); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { var s = doc.querySelector('.search .input'); if (s) { e.preventDefault(); s.focus(); } }
  });

  window.Kit = { toast: toast, openDialog: openDialog, setTheme: setTheme };
})();
