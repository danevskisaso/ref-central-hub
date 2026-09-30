/* ============================================================
   REF CENTRAL HUB — Screening page (anthropometrics, VALD, body map)
   ============================================================ */

var activeBodyMapRef = null;
var activeSystemFilter = '';

document.addEventListener('DOMContentLoaded', function () {
  renderAnthroGrid();
  populateBodyMapRefSelect();
  renderBodyMaps();
  renderSystemTabs();
  populateScreeningFilters();
  populateScreeningForm();
  renderScreeningTable();

  document.getElementById('bodyMapRefSelect').addEventListener('change', function () {
    activeBodyMapRef = this.value;
    renderBodyMaps();
  });

  document.getElementById('filterRefScreen').addEventListener('change', renderScreeningTable);

  document.getElementById('openAddScreening').addEventListener('click', function () {
    document.getElementById('addScreeningForm').reset();
    document.getElementById('asDate').value = new Date().toISOString().slice(0, 10);
    updateScreeningUnitLabel();
    openModal('addScreeningModal');
  });

  document.getElementById('asProtocol').addEventListener('change', updateScreeningUnitLabel);

  document.getElementById('submitAddScreening').addEventListener('click', function () {
    var refereeId = document.getElementById('asReferee').value;
    var protocolId = document.getElementById('asProtocol').value;
    var date = document.getElementById('asDate').value;
    var value = parseFloat(document.getElementById('asValue').value);
    if (!refereeId || !protocolId || !date || isNaN(value)) {
      showToast('Please complete all required fields.');
      return;
    }
    refchAddScreeningResult({
      refereeId: refereeId,
      protocolId: protocolId,
      date: date,
      value: value,
      notes: document.getElementById('asNotes').value.trim()
    });
    closeModal('addScreeningModal');
    showToast('Screening result saved.');
    renderScreeningTable();
  });
});

/* ---------------- Anthropometrics ---------------- */

function renderAnthroGrid() {
  var grid = document.getElementById('anthroGrid');
  grid.innerHTML = refchState.referees.map(function (r) {
    var a = r.anthro || {};
    var bmi = refchBmi(a);
    return '<div class="anthro-card" data-ref="' + r.id + '">' +
      '<div class="anthro-card-top">' +
        '<span class="avatar avatar-sm" style="background:' + r.color + '">' + refchInitials(r.name) + '</span>' +
        '<div><div class="anthro-card-name">' + r.name + '</div><div class="anthro-card-sub">' + r.country + '</div></div>' +
      '</div>' +
      '<div class="anthro-stats">' +
        '<div class="anthro-stat"><div class="num tabular">' + (bmi ? bmi.toFixed(1) : '—') + '</div><div class="lbl">BMI</div></div>' +
        '<div class="anthro-stat"><div class="num tabular">' + (a.bodyFat != null ? a.bodyFat + '%' : '—') + '</div><div class="lbl">Body Fat</div></div>' +
      '</div>' +
      '<div class="anthro-edit-row">' +
        '<input type="number" placeholder="Height cm" value="' + (a.height != null ? a.height : '') + '" data-field="height" data-ref="' + r.id + '">' +
        '<input type="number" placeholder="Weight kg" value="' + (a.weight != null ? a.weight : '') + '" data-field="weight" data-ref="' + r.id + '">' +
        '<input type="number" placeholder="Fat %" value="' + (a.bodyFat != null ? a.bodyFat : '') + '" data-field="bodyFat" data-ref="' + r.id + '">' +
      '</div>' +
    '</div>';
  }).join('');

  grid.querySelectorAll('input[data-field]').forEach(function (input) {
    input.addEventListener('change', function () {
      var refId = input.getAttribute('data-ref');
      var ref = refchRefereeById(refId);
      var field = input.getAttribute('data-field');
      var val = input.value === '' ? null : parseFloat(input.value);
      var anthro = Object.assign({ height: null, weight: null, bodyFat: null }, ref.anthro);
      anthro[field] = val;
      refchSetAnthro(refId, anthro);
      renderAnthroGrid();
      showToast('Anthropometrics updated.');
    });
  });
}

/* ---------------- Body map ---------------- */

function populateBodyMapRefSelect() {
  var sel = document.getElementById('bodyMapRefSelect');
  sel.innerHTML = refchState.referees.map(function (r) { return '<option value="' + r.id + '">' + r.name + '</option>'; }).join('');
  activeBodyMapRef = refchState.referees[0] ? refchState.referees[0].id : null;
  sel.value = activeBodyMapRef;
}

function renderBodyMaps() {
  var ref = refchRefereeById(activeBodyMapRef);
  if (!ref) return;
  renderBodyView('bodyFrontSvg', 'front', ref);
  renderBodyView('bodyBackSvg', 'back', ref);
  document.getElementById('bodyMapTooltip').textContent = '';
}

function renderBodyView(svgId, view, ref) {
  var svg = document.getElementById(svgId);
  var regions = BODY_REGIONS.filter(function (b) { return b.view === view; });

  var silhouette =
    '<ellipse cx="100" cy="24" rx="18" ry="20" fill="#E9EEF3"/>' +
    '<rect x="72" y="46" width="56" height="86" rx="20" fill="#E9EEF3"/>' +
    '<rect x="62" y="130" width="76" height="52" rx="16" fill="#E9EEF3"/>' +
    '<rect x="68" y="178" width="24" height="110" rx="11" fill="#E9EEF3"/>' +
    '<rect x="108" y="178" width="24" height="110" rx="11" fill="#E9EEF3"/>' +
    '<rect x="56" y="52" width="16" height="70" rx="8" fill="#E9EEF3"/>' +
    '<rect x="128" y="52" width="16" height="70" rx="8" fill="#E9EEF3"/>';

  var dots = regions.map(function (r) {
    var status = ref.bodyMap[r.id] || 'normal';
    var color = BODY_STATUS_COLORS[status];
    return '<circle class="body-region" data-region="' + r.id + '" cx="' + r.x + '" cy="' + r.y + '" r="8" fill="' + color + '" data-label="' + r.label + '"></circle>';
  }).join('');

  svg.innerHTML = silhouette + dots;

  svg.querySelectorAll('.body-region').forEach(function (dot) {
    dot.addEventListener('click', function () {
      var regionId = dot.getAttribute('data-region');
      var current = ref.bodyMap[regionId] || 'normal';
      var next = refchNextBodyStatus(current);
      refchSetBodyStatus(ref.id, regionId, next);
      renderBodyMaps();
      renderAnthroGrid();
    });
    dot.addEventListener('mouseenter', function () {
      var status = ref.bodyMap[dot.getAttribute('data-region')] || 'normal';
      document.getElementById('bodyMapTooltip').textContent = dot.getAttribute('data-label') + ' — ' + BODY_STATUS_LABELS[status];
    });
  });
}

/* ---------------- VALD screening results ---------------- */

function renderSystemTabs() {
  var tabs = ['All'].concat(SCREENING_SYSTEMS);
  var el = document.getElementById('systemTabs');
  el.innerHTML = tabs.map(function (t) {
    var active = (t === 'All' && activeSystemFilter === '') || t === activeSystemFilter;
    return '<button class="system-tab' + (active ? ' active' : '') + '" data-system="' + (t === 'All' ? '' : t) + '">' + t + '</button>';
  }).join('');

  el.querySelectorAll('.system-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeSystemFilter = btn.getAttribute('data-system');
      renderSystemTabs();
      renderScreeningTable();
    });
  });
}

function populateScreeningFilters() {
  var sel = document.getElementById('filterRefScreen');
  refchState.referees.forEach(function (r) {
    var opt = document.createElement('option');
    opt.value = r.id; opt.textContent = r.name;
    sel.appendChild(opt);
  });
}

function populateScreeningForm() {
  var refSel = document.getElementById('asReferee');
  refSel.innerHTML = refchState.referees.map(function (r) { return '<option value="' + r.id + '">' + r.name + '</option>'; }).join('');

  var protoSel = document.getElementById('asProtocol');
  protoSel.innerHTML = SCREENING_PROTOCOLS.map(function (p) { return '<option value="' + p.id + '">' + p.system + ' — ' + p.name + '</option>'; }).join('');
  updateScreeningUnitLabel();
}

function updateScreeningUnitLabel() {
  var protocol = refchScreeningProtocolById(document.getElementById('asProtocol').value);
  document.getElementById('asUnitLabel').textContent = protocol && protocol.unit ? '(' + protocol.unit + ')' : '';
}

function renderScreeningTable() {
  var refFilter = document.getElementById('filterRefScreen').value;

  var list = refchState.screeningResults
    .filter(function (r) { return !refFilter || r.refereeId === refFilter; })
    .filter(function (r) {
      if (!activeSystemFilter) return true;
      var p = refchScreeningProtocolById(r.protocolId);
      return p && p.system === activeSystemFilter;
    })
    .sort(function (a, b) { return a.date < b.date ? 1 : -1; });

  document.getElementById('screenCount').textContent = list.length + ' result' + (list.length === 1 ? '' : 's');

  var body = document.getElementById('screenResultsBody');
  if (list.length === 0) {
    body.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="title">No screening results yet</div><div class="sub">Add a ForceDecks, ForceFrame, NordBord, Dynamo or HumanTrak result.</div></div></td></tr>';
    return;
  }

  body.innerHTML = list.map(function (r) {
    var ref = refchRefereeById(r.refereeId);
    var protocol = refchScreeningProtocolById(r.protocolId);
    if (!ref || !protocol) return '';

    var pass = refchPassFail(protocol, r.value);
    var statusHtml = pass === null
      ? '<span class="badge badge-neutral"><span class="badge-dot"></span>Logged</span>'
      : pass
        ? '<span class="badge badge-good"><span class="badge-dot"></span>Within range</span>'
        : '<span class="badge badge-critical"><span class="badge-dot"></span>Flagged</span>';

    return '<tr>' +
      '<td class="cell-name"><span class="avatar avatar-xs" style="background:' + ref.color + '">' + refchInitials(ref.name) + '</span>' + ref.name + '</td>' +
      '<td>' + protocol.system + '</td>' +
      '<td>' + protocol.name + '</td>' +
      '<td class="tabular">' + r.date + '</td>' +
      '<td class="tabular">' + r.value + ' ' + protocol.unit + '</td>' +
      '<td class="tabular">' + (protocol.benchmark != null ? protocol.benchmark + ' ' + protocol.unit : '—') + '</td>' +
      '<td>' + statusHtml + '</td>' +
    '</tr>';
  }).join('');
}
