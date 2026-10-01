/* ============================================================
   REF CENTRAL HUB — App interactions
   ============================================================ */

/* ---------- Shared IndexedDB blob storage (documents, referee photos) ---------- */
var IDB_NAME = 'refch_files_db';
var IDB_STORE = 'files';

function idbOpen() {
  return new Promise(function (resolve, reject) {
    var req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = function (e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = function (e) { resolve(e.target.result); };
    req.onerror = function (e) { reject(e.target.error); };
  });
}

function idbPutFile(id, blob) {
  return idbOpen().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(blob, id);
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function (e) { reject(e.target.error); };
    });
  });
}

function idbGetFile(id) {
  return idbOpen().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(IDB_STORE, 'readonly');
      var req = tx.objectStore(IDB_STORE).get(id);
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function (e) { reject(e.target.error); };
    });
  });
}

function idbDeleteFile(id) {
  return idbOpen().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(id);
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function (e) { reject(e.target.error); };
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Sidebar collapse (desktop) ---------- */
  var sidebar = document.getElementById('sidebar');
  var toggle = document.getElementById('sidebarToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('collapsed');
    });
  }

  /* ---------- Mobile nav toggle ---------- */
  var mobileToggle = document.getElementById('mobileNavToggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', function () {
      sidebar.classList.toggle('mobile-open');
    });
  }

  /* ---------- Filter chips (visual only) ---------- */
  document.querySelectorAll('.filter-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.filter-chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
    });
  });

  var segBtns = document.querySelectorAll('.seg-btn');
  segBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      segBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  /* ---------- Training Load Trend chart ---------- */
  var chartEl = document.getElementById('loadChart');
  if (chartEl) renderLoadChart(chartEl);

  /* ---------- Modal close wiring (shared) ---------- */
  document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal(overlay.id);
    });
    overlay.querySelectorAll('[data-close-modal]').forEach(function (btn) {
      btn.addEventListener('click', function () { closeModal(overlay.id); });
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(function (m) { closeModal(m.id); });
    }
  });
});

/* ---------- Shared modal / toast helpers ---------- */
function openModal(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  var el = document.getElementById(id);
  if (el) el.classList.remove('open');
}
function showToast(message) {
  var el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(function () { el.classList.remove('show'); }, 2600);
}

function renderLoadChart(container) {
  var labels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
  var internal = [420, 460, 510, 380, 540, 590, 470, 610];
  var external = [360, 390, 430, 300, 460, 500, 400, 520];

  var W = 1000, H = 280;
  var pad = { top: 16, right: 16, bottom: 30, left: 40 };
  var plotW = W - pad.left - pad.right;
  var plotH = H - pad.top - pad.bottom;

  var maxVal = Math.ceil(Math.max.apply(null, internal.concat(external)) / 100) * 100;
  var steps = 4;

  function x(i) { return pad.left + (plotW * i) / (labels.length - 1); }
  function y(v) { return pad.top + plotH - (plotH * v) / maxVal; }

  function pathFor(arr) {
    return arr.map(function (v, i) { return (i === 0 ? 'M' : 'L') + x(i).toFixed(1) + ',' + y(v).toFixed(1); }).join(' ');
  }
  function areaFor(arr) {
    var line = pathFor(arr);
    return line + ' L' + x(arr.length - 1).toFixed(1) + ',' + (pad.top + plotH) +
      ' L' + x(0).toFixed(1) + ',' + (pad.top + plotH) + ' Z';
  }

  var gridLines = '';
  var yLabels = '';
  for (var s = 0; s <= steps; s++) {
    var val = (maxVal / steps) * s;
    var yy = y(val);
    gridLines += '<line x1="' + pad.left + '" y1="' + yy + '" x2="' + (W - pad.right) + '" y2="' + yy + '" class="grid-line"/>';
    yLabels += '<text x="' + (pad.left - 10) + '" y="' + (yy + 4) + '" class="axis-label" text-anchor="end">' + val + '</text>';
  }

  var xLabels = labels.map(function (l, i) {
    return '<text x="' + x(i) + '" y="' + (H - 8) + '" class="axis-label" text-anchor="middle">' + l + '</text>';
  }).join('');

  var dots1 = internal.map(function (v, i) {
    return '<circle class="pt pt-1" cx="' + x(i) + '" cy="' + y(v) + '" r="4"/>';
  }).join('');
  var dots2 = external.map(function (v, i) {
    return '<circle class="pt pt-2" cx="' + x(i) + '" cy="' + y(v) + '" r="4"/>';
  }).join('');

  var hitCols = labels.map(function (l, i) {
    var cw = plotW / labels.length;
    var cx0 = pad.left + cw * i;
    return '<rect class="hit-col" data-i="' + i + '" x="' + cx0 + '" y="' + pad.top + '" width="' + cw + '" height="' + plotH + '" fill="transparent"/>';
  }).join('');

  var svg = '' +
    '<svg viewBox="0 0 ' + W + ' ' + H + '" class="load-chart-svg" preserveAspectRatio="none">' +
      '<defs>' +
        '<linearGradient id="areaFill1" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="var(--series-1)" stop-opacity="0.16"/>' +
          '<stop offset="100%" stop-color="var(--series-1)" stop-opacity="0"/>' +
        '</linearGradient>' +
      '</defs>' +
      gridLines + yLabels + xLabels +
      '<path d="' + areaFor(internal) + '" fill="url(#areaFill1)" stroke="none"/>' +
      '<path d="' + pathFor(internal) + '" fill="none" class="line line-1"/>' +
      '<path d="' + pathFor(external) + '" fill="none" class="line line-2"/>' +
      dots1 + dots2 +
      '<line class="crosshair" x1="0" y1="' + pad.top + '" x2="0" y2="' + (pad.top + plotH) + '" opacity="0"/>' +
      hitCols +
    '</svg>' +
    '<div class="chart-legend">' +
      '<span class="legend-item"><i style="background:var(--series-1)"></i>Internal Load (session-RPE)</span>' +
      '<span class="legend-item"><i style="background:var(--series-2)"></i>External Load (distance-based)</span>' +
    '</div>' +
    '<div class="chart-tooltip" style="display:none"></div>';

  container.innerHTML = svg;

  var svgEl = container.querySelector('.load-chart-svg');
  var crosshair = container.querySelector('.crosshair');
  var tooltip = container.querySelector('.chart-tooltip');
  var hitCells = container.querySelectorAll('.hit-col');

  hitCells.forEach(function (cell) {
    cell.addEventListener('mouseenter', function () { crosshair.setAttribute('opacity', '1'); tooltip.style.display = 'block'; });
    cell.addEventListener('mouseleave', function () { crosshair.setAttribute('opacity', '0'); tooltip.style.display = 'none'; });
    cell.addEventListener('mousemove', function () {
      var i = parseInt(cell.getAttribute('data-i'), 10);
      var cxVal = x(i);
      crosshair.setAttribute('x1', cxVal);
      crosshair.setAttribute('x2', cxVal);

      var rect = svgEl.getBoundingClientRect();
      var px = (cxVal / W) * rect.width;
      var py = (y(internal[i]) / H) * rect.height;

      tooltip.style.left = Math.min(px + 14, rect.width - 190) + 'px';
      tooltip.style.top = Math.max(py - 54, 0) + 'px';
      tooltip.innerHTML =
        '<div class="tt-head">' + labels[i] + '</div>' +
        '<div class="tt-row"><i style="background:var(--series-1)"></i>Internal <b class="tabular">' + internal[i] + ' AU</b></div>' +
        '<div class="tt-row"><i style="background:var(--series-2)"></i>External <b class="tabular">' + external[i] + ' AU</b></div>';
    });
  });
}
