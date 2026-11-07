/* ERP UI Kit - графики на SVG без зависимостей.
   Разметка: <div class="chart" data-chart='{"type":"line","labels":[...],"series":[{"name":"...","data":[...]}]}'></div>
   Типы: line, area, bar, stacked, donut, spark, hbar. Из кода: Kit.chart(el, cfg). */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) { var n = document.createElementNS(NS, tag); for (var k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; }
  function fmt(v) { return (Math.round(v * 100) / 100).toLocaleString('ru-RU'); }
  function short(v) { var a = Math.abs(v); return a >= 1e9 ? fmt(v / 1e9) + ' млрд' : a >= 1e6 ? fmt(v / 1e6) + ' млн' : a >= 1e3 ? fmt(v / 1e3) + ' тыс' : fmt(v); }
  function nice(max) { if (max <= 0) return 1; var p = Math.pow(10, Math.floor(Math.log10(max))), f = max / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; }
  function color(i, s) { return (s && s.color) || (s && s.muted ? 'var(--text-4)' : 'var(--chart-' + (i % 6 + 1) + ')'); }
  function smooth(pts) { if (pts.length < 3) return 'M' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join('L');
    var d = 'M' + pts[0][0] + ',' + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2, t = .18;
      d += 'C' + (p1[0] + (p2[0] - p0[0]) * t) + ',' + (p1[1] + (p2[1] - p0[1]) * t) + ' ' + (p2[0] - (p3[0] - p1[0]) * t) + ',' + (p2[1] - (p3[1] - p1[1]) * t) + ' ' + p2[0] + ',' + p2[1]; }
    return d; }
  function poly(pts) { return 'M' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join('L'); }
  function legend(host, items) { var l = document.createElement('div'); l.className = 'chart__legend'; items.forEach(function (it) { var s = document.createElement('span'); s.innerHTML = '<i style="background:' + it.c + '"></i>' + it.n + (it.v !== undefined ? '<b>' + it.v + '</b>' : ''); l.appendChild(s); }); host.appendChild(l); }
  function tip(host) { var t = document.createElement('div'); t.className = 'chart__tip'; t.hidden = true; host.appendChild(t); return t; }

  function render(host, cfg) {
    cfg = cfg || JSON.parse(host.dataset.chart); host.__cfg = cfg; host.innerHTML = '';
    var type = cfg.type || 'line', series = cfg.series || [], labels = cfg.labels || [], W = Math.max(host.clientWidth, 120), H = cfg.height || (type === 'spark' ? 44 : 240);

    if (type === 'hbar') { var mx = Math.max.apply(null, series[0].data), tot = series[0].data.reduce(function (a, b) { return a + b; }, 0);
      labels.forEach(function (lb, i) { var v = series[0].data[i], r = document.createElement('div'); r.className = 'chart__row';
        r.innerHTML = '<span class="truncate">' + lb + '</span><span class="chart__track"><i style="width:' + (v / mx * 100) + '%;background:' + color(cfg.multicolor ? i : 0, series[0]) + '"></i></span><b class="num">' + short(v) + '</b><em>' + Math.round(v / tot * 100) + '%</em>'; host.appendChild(r); }); return; }

    if (type === 'donut') { var data = series[0].data, total = data.reduce(function (a, b) { return a + b; }, 0), S = Math.min(H, 200), R = S / 2 - 10, C = 2 * Math.PI * R, off = 0;
      host.classList.add('chart--donut'); var box = document.createElement('div'); box.className = 'chart__donut'; host.appendChild(box);
      var svg = el('svg', { viewBox: '0 0 ' + S + ' ' + S, width: S, height: S }, box);
      el('circle', { cx: S / 2, cy: S / 2, r: R, fill: 'none', stroke: 'var(--surface-3)', 'stroke-width': 12 }, svg);
      data.forEach(function (v, i) { var len = v / total * C, c = el('circle', { cx: S / 2, cy: S / 2, r: R, fill: 'none', stroke: color(i), 'stroke-width': 12, 'stroke-dasharray': Math.max(len - 2.5, 0) + ' ' + (C - Math.max(len - 2.5, 0)), 'stroke-dashoffset': -off, transform: 'rotate(-90 ' + S / 2 + ' ' + S / 2 + ')' }, svg);
        el('title', {}, c).textContent = labels[i] + ': ' + fmt(v); off += len; });
      var mid = document.createElement('div'); mid.className = 'chart__mid'; mid.innerHTML = '<b>' + short(total) + '</b><span>' + (cfg.unit || 'всего') + '</span>'; box.appendChild(mid);
      legend(host, labels.map(function (n, i) { return { n: n, c: color(i), v: short(data[i]) + ' · ' + Math.round(data[i] / total * 100) + '%' }; })); return; }

    var spark = type === 'spark', pad = spark ? { l: 2, r: 2, t: 4, b: 4 } : { l: cfg.axis === false ? 6 : 52, r: cfg.axis === false ? 6 : (type === 'line' || type === 'area') && cfg.values !== false ? 60 : 12, t: 22, b: 28 }, iw = W - pad.l - pad.r, ih = H - pad.t - pad.b, n = labels.length || series[0].data.length;
    var stacked = type === 'stacked', bars = type === 'bar' || stacked, max = 0, min = 0;
    for (var i = 0; i < n; i++) { var sum = 0; series.forEach(function (s) { var v = s.data[i] || 0; sum += v; if (!stacked) { max = Math.max(max, v); min = Math.min(min, v); } }); if (stacked) max = Math.max(max, sum); }
    if (spark) { min = Math.min.apply(null, series[0].data); max = Math.max.apply(null, series[0].data); if (max === min) max = min + 1; } else { max = nice(max); min = min < 0 ? -nice(-min) : 0; }
    var y = function (v) { return pad.t + ih - (v - min) / (max - min) * ih; }, step = bars ? iw / n : iw / Math.max(n - 1, 1), x = function (i) { return bars ? pad.l + step * (i + .5) : pad.l + step * i; };
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: H, role: 'img' }, host);
    if (!spark) { var G = 4; for (var g = 0; g <= G; g++) { var gv = min + (max - min) * g / G, gy = y(gv);
        el('line', { x1: pad.l, x2: W - pad.r, y1: gy, y2: gy, stroke: 'var(--line)', 'stroke-dasharray': cfg.axis === false && gv !== 0 ? '3 4' : '' }, svg);
        if (cfg.axis !== false) el('text', { x: pad.l - 8, y: gy + 4, 'text-anchor': 'end' }, svg).textContent = short(gv); }
      var every = Math.ceil(n / Math.max(Math.floor(iw / 64), 1));
      labels.forEach(function (lb, i) { if (cfg.xends) { if (i !== 0 && i !== n - 1) return; el('text', { x: i ? W - pad.r : pad.l, y: H - 6, 'text-anchor': i ? 'end' : 'start' }, svg).textContent = lb; return; } if (i % every) return; el('text', { x: x(i), y: H - 8, 'text-anchor': 'middle' }, svg).textContent = lb; });
      if (cfg.xends) el('line', { x1: pad.l, x2: W - pad.r, y1: pad.t + ih + 6, y2: pad.t + ih + 6, stroke: 'var(--line)' }, svg); }
    if (cfg.target && !spark) { var ty = y(cfg.target.value); el('line', { x1: pad.l, x2: W - pad.r, y1: ty, y2: ty, stroke: 'var(--text-3)', 'stroke-dasharray': '6 5', 'stroke-width': 1.25 }, svg); var tt = el('text', { x: pad.l + 6, y: ty - 6, class: 'chart__val' }, svg); tt.textContent = (cfg.target.label || 'Цель') + ' ' + short(cfg.target.value); }
    var defs = el('defs', {}, svg), uid = 'g' + Math.random().toString(36).slice(2, 8);
    if (bars) { var gw = step * (series.length > 1 && !stacked ? .7 : .56), bw = stacked ? gw : gw / series.length;
      for (var i = 0; i < n; i++) { var base = 0; series.forEach(function (s, si) { var v = s.data[i] || 0, y0 = stacked ? y(base) : y(0), y1 = stacked ? y(base + v) : y(v), bx = x(i) - gw / 2 + (stacked ? 0 : bw * si);
          el('rect', { x: bx + 1, y: Math.min(y0, y1), width: Math.max(bw - 2, 1), height: Math.max(Math.abs(y0 - y1), 1), rx: 2, fill: color(si, s), 'data-i': i }, svg); if (stacked) base += v; });
        if (cfg.values !== false && cfg.axis !== false && step >= 34) { var top = stacked ? base : Math.max.apply(null, series.map(function (s) { return s.data[i] || 0; })), shown = stacked ? base : series[series.length - 1].data[i]; el('text', { x: x(i), y: y(top) - 6, 'text-anchor': 'middle', class: 'chart__val' }, svg).textContent = short(shown).replace(' тыс', '').replace(' млн', 'м'); } }
    } else series.forEach(function (s, si) { var pts = s.data.map(function (v, i) { return [x(i), y(v)]; }), c = color(si, s);
        var curve = cfg.smooth ? smooth : poly;
        if (type === 'area' && si === 0) el('path', { d: curve(pts) + 'L' + pts[pts.length - 1][0] + ',' + (pad.t + ih) + 'L' + pts[0][0] + ',' + (pad.t + ih) + 'Z', fill: c, 'fill-opacity': .1 }, svg);
        el('path', { d: curve(pts), fill: 'none', stroke: c, 'stroke-width': spark ? 1.5 : s.muted ? 1.5 : cfg.bold ? 3 : 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': s.dashed ? '5 6' : '' }, svg);
        if (cfg.dots && !s.muted && !spark) pts.forEach(function (p) { el('circle', { cx: p[0], cy: p[1], r: 3, fill: c }, svg); });
        if (!spark && cfg.axis !== false && !s.muted && cfg.values !== false) { if (n <= 14 && !s.dashed) pts.forEach(function (p) { el('circle', { cx: p[0], cy: p[1], r: 2.5, fill: 'var(--surface)', stroke: c, 'stroke-width': 1.5 }, svg); });
          var lp = pts[n - 1], lt = el('text', { x: lp[0] + 8, y: lp[1] + 4, class: 'chart__val' }, svg); lt.textContent = short(s.data[n - 1]); lt.style.fill = c;
          if (si === 0) { var mn = s.data.indexOf(Math.min.apply(null, s.data)); if (mn !== n - 1 && mn !== 0) { el('text', { x: pts[mn][0], y: pts[mn][1] + 16, 'text-anchor': 'middle', class: 'chart__val' }, svg).textContent = 'мин ' + short(s.data[mn]); } } }
        if (spark) el('circle', { cx: pts[pts.length - 1][0], cy: pts[pts.length - 1][1], r: 3, fill: 'var(--chart-1)' }, svg); });
    if (spark) return;
    if (cfg.legend !== false && (series.length > 1 || cfg.legend)) legend(host, series.map(function (s, i) { return { n: s.name, c: color(i, s) }; }));
    var guide = el('line', { y1: pad.t, y2: pad.t + ih, stroke: 'var(--line-strong)', visibility: 'hidden' }, svg), dots = series.map(function (s, i) { return bars ? null : el('circle', { r: 4, fill: 'var(--surface)', stroke: color(i, s), 'stroke-width': 2.5, visibility: 'hidden' }, svg); }), t = tip(host);
    svg.addEventListener('mousemove', function (e) { var r = svg.getBoundingClientRect(), mx = (e.clientX - r.left) / r.width * W, i = Math.max(0, Math.min(n - 1, bars ? Math.floor((mx - pad.l) / step) : Math.round((mx - pad.l) / step)));
      guide.setAttribute('x1', x(i)); guide.setAttribute('x2', x(i)); guide.setAttribute('visibility', bars ? 'hidden' : 'visible');
      dots.forEach(function (d, si) { if (d) { d.setAttribute('cx', x(i)); d.setAttribute('cy', y(series[si].data[i])); d.setAttribute('visibility', 'visible'); } });
      [].forEach.call(svg.querySelectorAll('rect[data-i]'), function (b) { b.style.opacity = +b.dataset.i === i ? 1 : .45; });
      t.innerHTML = '<div class="chart__tip-h">' + (labels[i] || '') + '</div>' + series.map(function (s, si) { return '<div><i style="background:' + color(si, s) + '"></i>' + (s.name || '') + '<b>' + fmt(s.data[i]) + (cfg.unit ? ' ' + cfg.unit : '') + '</b></div>'; }).join('');
      t.hidden = false; var px = x(i) / W * r.width; t.style.left = Math.min(Math.max(px, 80), r.width - 80) + 'px'; t.style.top = '4px'; });
    svg.addEventListener('mouseleave', function () { t.hidden = true; guide.setAttribute('visibility', 'hidden'); dots.forEach(function (d) { d && d.setAttribute('visibility', 'hidden'); }); [].forEach.call(svg.querySelectorAll('rect[data-i]'), function (b) { b.style.opacity = 1; }); });
  }
  function init(root) { [].forEach.call((root || document).querySelectorAll('[data-chart]'), function (h) { render(h); if (window.ResizeObserver && !h.__ro) { var w = h.clientWidth; h.__ro = new ResizeObserver(function () { if (Math.abs(h.clientWidth - w) > 4) { w = h.clientWidth; render(h, h.__cfg); } }); h.__ro.observe(h); } }); }
  window.Kit = window.Kit || {}; window.Kit.chart = render; window.Kit.charts = init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); }); else init();
})();
