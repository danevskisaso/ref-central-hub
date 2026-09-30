/* ============================================================
   REF CENTRAL HUB — Fitness Tests page
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  renderKpis();
  renderProtocolGrid();
  populateFilterSelects();
  populateAddResultForm();
  renderResultsTable();

  document.getElementById('filterRefFt').addEventListener('change', renderResultsTable);
  document.getElementById('filterProtocol').addEventListener('change', renderResultsTable);

  document.getElementById('openAddResult').addEventListener('click', function () {
    document.getElementById('addResultForm').reset();
    document.getElementById('arDate').value = new Date().toISOString().slice(0, 10);
    updateUnitLabel();
    openModal('addResultModal');
  });

  document.getElementById('arProtocol').addEventListener('change', updateUnitLabel);

  document.getElementById('submitAddResult').addEventListener('click', function () {
    var refereeId = document.getElementById('arReferee').value;
    var protocolId = document.getElementById('arProtocol').value;
    var date = document.getElementById('arDate').value;
    var value = parseFloat(document.getElementById('arValue').value);
    if (!refereeId || !protocolId || !date || isNaN(value)) {
      showToast('Please complete all required fields.');
      return;
    }
    refchAddFitnessResult({
      refereeId: refereeId,
      protocolId: protocolId,
      date: date,
      value: value,
      notes: document.getElementById('arNotes').value.trim()
    });
    closeModal('addResultModal');
    showToast('Result saved.');
    renderKpis();
    renderResultsTable();
  });
});

function updateUnitLabel() {
  var protocol = refchProtocolById(document.getElementById('arProtocol').value);
  document.getElementById('arUnitLabel').textContent = protocol && protocol.unit ? '(' + protocol.unit + ')' : '';
}

function renderKpis() {
  var results = refchState.fitnessResults;
  var testedRefIds = new Set(results.map(function (r) { return r.refereeId; }));
  var withBenchmark = results.filter(function (r) {
    var p = refchProtocolById(r.protocolId);
    return p && p.benchmark != null;
  });
  var passed = withBenchmark.filter(function (r) { return refchPassFail(refchProtocolById(r.protocolId), r.value); });
  var passRate = withBenchmark.length ? Math.round((passed.length / withBenchmark.length) * 100) : 0;

  var kpis = [
    { label: 'Tests Recorded', value: results.length, color: 'blue' },
    { label: 'Referees Tested', value: testedRefIds.size, color: 'cyan' },
    { label: 'Pass Rate', value: passRate + '%', color: 'green' },
    { label: 'Protocols Tracked', value: FITNESS_PROTOCOLS.length, color: 'yellow' }
  ];

  document.getElementById('ftKpis').innerHTML = kpis.map(function (k) {
    return '<div class="kpi-card"><div class="kpi-value tabular">' + k.value + '</div><div class="kpi-label">' + k.label + '</div></div>';
  }).join('');
}

function renderProtocolGrid() {
  var groups = {};
  FITNESS_PROTOCOLS.forEach(function (p) {
    groups[p.group] = groups[p.group] || [];
    groups[p.group].push(p);
  });

  var html = '';
  Object.keys(groups).forEach(function (g) {
    groups[g].forEach(function (p) {
      var bm = p.benchmark != null ? p.benchmark + ' ' + p.unit + ' target' : 'No fixed benchmark';
      html += '<div class="protocol-card">' +
        '<span class="pgroup">' + p.group + '</span>' +
        '<div class="pname">' + p.name + '</div>' +
        '<div class="pmeta">' + bm + '</div>' +
      '</div>';
    });
  });
  document.getElementById('protocolGrid').innerHTML = html;
}

function populateFilterSelects() {
  var refSel = document.getElementById('filterRefFt');
  refchState.referees.forEach(function (r) {
    var opt = document.createElement('option');
    opt.value = r.id; opt.textContent = r.name;
    refSel.appendChild(opt);
  });

  var protoSel = document.getElementById('filterProtocol');
  FITNESS_PROTOCOLS.forEach(function (p) {
    var opt = document.createElement('option');
    opt.value = p.id; opt.textContent = p.name;
    protoSel.appendChild(opt);
  });
}

function populateAddResultForm() {
  var refSel = document.getElementById('arReferee');
  refSel.innerHTML = refchState.referees.map(function (r) { return '<option value="' + r.id + '">' + r.name + '</option>'; }).join('');

  var protoSel = document.getElementById('arProtocol');
  protoSel.innerHTML = FITNESS_PROTOCOLS.map(function (p) { return '<option value="' + p.id + '">' + p.name + '</option>'; }).join('');
}

function renderResultsTable() {
  var refFilter = document.getElementById('filterRefFt').value;
  var protoFilter = document.getElementById('filterProtocol').value;

  var list = refchState.fitnessResults
    .filter(function (r) { return !refFilter || r.refereeId === refFilter; })
    .filter(function (r) { return !protoFilter || r.protocolId === protoFilter; })
    .sort(function (a, b) { return a.date < b.date ? 1 : -1; });

  document.getElementById('ftCount').textContent = list.length + ' result' + (list.length === 1 ? '' : 's');

  var body = document.getElementById('resultsBody');
  if (list.length === 0) {
    body.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="title">No results yet</div><div class="sub">Add a fitness test result to get started.</div></div></td></tr>';
    return;
  }

  body.innerHTML = list.map(function (r) {
    var ref = refchRefereeById(r.refereeId);
    var protocol = refchProtocolById(r.protocolId);
    if (!ref || !protocol) return '';

    var prev = refchPreviousFitnessResult(r.refereeId, r.protocolId, r.id);
    var trendHtml = '<span class="trend flat">—</span>';
    if (prev) {
      var diff = r.value - prev.value;
      var better = protocol.dir === 'high' ? diff > 0 : protocol.dir === 'low' ? diff < 0 : null;
      var pct = prev.value !== 0 ? Math.abs((diff / prev.value) * 100).toFixed(1) : '0.0';
      if (better === true) trendHtml = '<span class="trend up">▲ ' + pct + '%</span>';
      else if (better === false) trendHtml = '<span class="trend down">▼ ' + pct + '%</span>';
      else trendHtml = '<span class="trend flat">' + (diff >= 0 ? '+' : '') + diff.toFixed(1) + '</span>';
    }

    var pass = refchPassFail(protocol, r.value);
    var statusHtml = pass === null
      ? '<span class="badge badge-neutral"><span class="badge-dot"></span>Logged</span>'
      : pass
        ? '<span class="badge badge-good"><span class="badge-dot"></span>Pass</span>'
        : '<span class="badge badge-critical"><span class="badge-dot"></span>Below target</span>';

    return '<tr>' +
      '<td class="cell-name"><span class="avatar avatar-xs" style="background:' + ref.color + '">' + refchInitials(ref.name) + '</span>' + ref.name + '</td>' +
      '<td>' + protocol.name + '</td>' +
      '<td class="tabular">' + r.date + '</td>' +
      '<td class="tabular">' + r.value + (protocol.unit ? ' ' + protocol.unit : '') + '</td>' +
      '<td class="tabular">' + (protocol.benchmark != null ? protocol.benchmark + ' ' + protocol.unit : '—') + '</td>' +
      '<td>' + trendHtml + '</td>' +
      '<td>' + statusHtml + '</td>' +
    '</tr>';
  }).join('');
}
