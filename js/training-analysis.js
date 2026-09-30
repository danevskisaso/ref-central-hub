/* ============================================================
   REF CENTRAL HUB — Training Analysis page
   ============================================================ */

var METRIC_ORDER = ['consistency', 'frequency', 'load', 'balance', 'distribution', 'hiExposure', 'recovery', 'hrEval', 'duration', 'distanceVol', 'variety'];

document.addEventListener('DOMContentLoaded', function () {
  populateRefereeSelects();
  document.getElementById('taMonth').value = new Date().toISOString().slice(0, 7);
  populateCategorySelect();

  document.getElementById('taReferee').addEventListener('change', renderAll);
  document.getElementById('taMonth').addEventListener('change', renderAll);

  document.getElementById('openLogSession').addEventListener('click', function () {
    document.getElementById('logSessionForm').reset();
    document.getElementById('lsReferee').value = document.getElementById('taReferee').value;
    document.getElementById('lsDate').value = new Date().toISOString().slice(0, 10);
    openModal('logSessionModal');
  });

  document.getElementById('submitLogSession').addEventListener('click', function () {
    var refereeId = document.getElementById('lsReferee').value;
    var date = document.getElementById('lsDate').value;
    var category = document.getElementById('lsCategory').value;
    var duration = parseFloat(document.getElementById('lsDuration').value);
    var load = parseFloat(document.getElementById('lsLoad').value);
    var avgHR = parseFloat(document.getElementById('lsAvgHR').value);
    var maxHR = parseFloat(document.getElementById('lsMaxHR').value);

    if (!refereeId || !date || !category || isNaN(duration) || isNaN(load) || isNaN(avgHR) || isNaN(maxHR)) {
      showToast('Please complete all required fields.');
      return;
    }

    refchAddTrainingSession({
      refereeId: refereeId,
      date: date,
      category: category,
      durationMin: duration,
      distanceKm: parseFloat(document.getElementById('lsDistance').value) || 0,
      trainingLoad: load,
      avgHR: avgHR,
      maxHR: maxHR,
      zones: {
        z1: parseFloat(document.getElementById('lsZ1').value) || 0,
        z2: parseFloat(document.getElementById('lsZ2').value) || 0,
        z3: parseFloat(document.getElementById('lsZ3').value) || 0,
        z4: parseFloat(document.getElementById('lsZ4').value) || 0,
        z5: parseFloat(document.getElementById('lsZ5').value) || 0
      }
    });

    closeModal('logSessionModal');
    showToast('Training session logged.');
    document.getElementById('taReferee').value = refereeId;
    if (date.slice(0, 7) !== document.getElementById('taMonth').value) document.getElementById('taMonth').value = date.slice(0, 7);
    renderAll();
  });

  renderAll();
});

function populateRefereeSelects() {
  var options = refchState.referees.map(function (r) { return '<option value="' + r.id + '">' + r.name + '</option>'; }).join('');
  document.getElementById('taReferee').innerHTML = options;
  document.getElementById('lsReferee').innerHTML = options;
}

function populateCategorySelect() {
  document.getElementById('lsCategory').innerHTML = TRAINING_TOPICS.map(function (t) { return '<option value="' + t + '">' + t + '</option>'; }).join('');
}

function renderAll() {
  var refereeId = document.getElementById('taReferee').value;
  var monthStr = document.getElementById('taMonth').value;
  var analysis = refchTrainingAnalysis(refereeId, monthStr);

  renderKpis(analysis);
  renderMetricCards(analysis);
  renderSessionsTable(refereeId, monthStr, analysis.hrMax);
}

function renderKpis(analysis) {
  var m = analysis.metrics;
  var kpis = [
    { label: 'Sessions This Month', value: analysis.sessionCount },
    { label: 'Total Load (AU)', value: m.load.value.toLocaleString() },
    { label: 'Total Duration', value: (m.duration.value / 60).toFixed(1) + ' hrs' },
    { label: 'Total Distance', value: m.distanceVol.value + ' km' }
  ];
  document.getElementById('taKpis').innerHTML = kpis.map(function (k) {
    return '<div class="kpi-card"><div class="kpi-value tabular">' + k.value + '</div><div class="kpi-label">' + k.label + '</div></div>';
  }).join('');
  document.getElementById('taSessionCount').textContent = analysis.sessionCount + ' session' + (analysis.sessionCount === 1 ? '' : 's') + ' analysed';
}

function tierBadge(tier) {
  if (!tier) return '';
  var color = refchEvalColor(tier);
  return '<span class="metric-tier" style="background:' + color + '22;color:' + color + '"><span class="dot" style="background:' + color + '"></span>' + tier + '</span>';
}

function renderMetricCards(analysis) {
  var m = analysis.metrics;
  var html = METRIC_ORDER.map(function (key) {
    var metric = m[key];
    return '<div class="metric-card">' +
      '<div class="metric-card-head"><div class="metric-title">' + metric.title + '</div>' + tierBadge(metric.tier) + '</div>' +
      '<div class="metric-detail">' + metric.detail + '</div>' +
      '<div class="metric-visual">' + renderVisual(key, metric) + '</div>' +
    '</div>';
  }).join('');
  document.getElementById('metricGrid').innerHTML = html;
}

function renderVisual(key, metric) {
  if (key === 'distribution') {
    return zoneBar('Z1-Z2', metric.pct12, 'var(--blue-600)') +
      zoneBar('Z3', metric.pct3, 'var(--cyan-500)') +
      zoneBar('Z4-Z5', metric.pct45, 'var(--red-600)');
  }
  if (key === 'balance') {
    var max = Math.max.apply(null, metric.weekLoads.concat([1]));
    return '<div class="week-bar-row">' + metric.weekLoads.map(function (v, i) {
      var h = Math.round((v / max) * 60) + 4;
      return '<div class="week-bar-col"><div class="week-bar" style="height:' + h + 'px"></div><div class="week-bar-lbl">W' + (i + 1) + '</div></div>';
    }).join('') + '</div>';
  }
  if (key === 'variety') {
    return '<div class="variety-list">' + metric.buckets.map(function (b) {
      var color = b.met ? '#18A558' : '#E63946';
      var icon = b.met ? '✓' : '✕';
      return '<div class="variety-row"><span class="check" style="background:' + color + '">' + icon + '</span>' + b.bucket.label + '<span class="count tabular">' + b.count + '/' + b.bucket.min + '</span></div>';
    }).join('') + '</div>';
  }
  if (key === 'hrEval') {
    if (!metric.sessionLabels.length) return '';
    return '<div class="session-label-list">' + metric.sessionLabels.slice().reverse().map(function (sl) {
      return '<div class="session-label-row"><span>' + sl.session.date + ' — ' + sl.label + '</span><span class="tabular">' + sl.avgPct + '%</span></div>';
    }).join('') + '</div>';
  }
  return '';
}

function zoneBar(label, pct, color) {
  return '<div class="zone-bar-row">' +
    '<span class="zone-bar-label">' + label + '</span>' +
    '<span class="zone-bar-track"><span class="zone-bar-fill" style="width:' + Math.min(100, Math.round(pct)) + '%;background:' + color + '"></span></span>' +
    '<span class="zone-bar-pct tabular">' + Math.round(pct) + '%</span>' +
  '</div>';
}

function renderSessionsTable(refereeId, monthStr, hrMax) {
  var sessions = refchTrainingSessionsFor(refereeId, monthStr);
  var body = document.getElementById('sessionsBody');

  if (sessions.length === 0) {
    body.innerHTML = '<tr><td colspan="9"><div class="empty-state"><div class="title">No sessions logged</div><div class="sub">Log a training session to populate this month\'s analysis.</div></div></td></tr>';
    return;
  }

  body.innerHTML = sessions.map(function (s) {
    return '<tr>' +
      '<td class="tabular">' + s.date + '</td>' +
      '<td>' + s.category + '</td>' +
      '<td class="tabular">' + s.durationMin + ' min</td>' +
      '<td class="tabular">' + (s.distanceKm || 0) + ' km</td>' +
      '<td class="tabular">' + s.trainingLoad + '</td>' +
      '<td class="tabular">' + s.avgHR + '</td>' +
      '<td class="tabular">' + s.maxHR + '</td>' +
      '<td>' + refchSessionLabel(s, hrMax) + '</td>' +
      '<td style="text-align:right;"><button class="btn btn-ghost session-remove" data-id="' + s.id + '" style="padding:5px 10px;font-size:11.5px;">Remove</button></td>' +
    '</tr>';
  }).join('');

  body.querySelectorAll('.session-remove').forEach(function (btn) {
    btn.addEventListener('click', function () {
      refchRemoveTrainingSession(btn.getAttribute('data-id'));
      showToast('Session removed.');
      renderAll();
    });
  });
}
