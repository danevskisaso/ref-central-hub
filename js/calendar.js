/* ============================================================
   REF CENTRAL HUB — Calendar page
   ============================================================ */

var calViewDate = new Date();
calViewDate.setDate(1);
var calSelectedDate = null;

function pad2(n) { return n < 10 ? '0' + n : '' + n; }
function ymd(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }

document.addEventListener('DOMContentLoaded', function () {
  populateFilters();
  renderLegend();
  renderCalendar();

  document.getElementById('prevMonth').addEventListener('click', function () {
    calViewDate.setMonth(calViewDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById('nextMonth').addEventListener('click', function () {
    calViewDate.setMonth(calViewDate.getMonth() + 1);
    renderCalendar();
  });
  document.getElementById('todayBtn').addEventListener('click', function () {
    calViewDate = new Date();
    calViewDate.setDate(1);
    calSelectedDate = ymd(new Date());
    renderCalendar();
  });
  document.getElementById('clearDaySelect').addEventListener('click', function (e) {
    e.preventDefault();
    calSelectedDate = null;
    renderCalendar();
  });

  document.getElementById('filterRefCal').addEventListener('change', renderCalendar);
  document.getElementById('filterTypeCal').addEventListener('change', renderCalendar);

  document.getElementById('openAddEvent').addEventListener('click', function () {
    document.getElementById('addEventForm').reset();
    document.getElementById('evDate').value = calSelectedDate || ymd(new Date());
    updateTopicField();
    openModal('addEventModal');
  });

  document.getElementById('evType').addEventListener('change', updateTopicField);

  document.getElementById('submitAddEvent').addEventListener('click', function () {
    var refereeId = document.getElementById('evReferee').value;
    var type = document.getElementById('evType').value;
    var date = document.getElementById('evDate').value;
    if (!refereeId || !type || !date) {
      showToast('Please complete referee, type and date.');
      return;
    }
    var typeDef = refchEventTypeById(type);
    var topic = typeDef.topicMode === 'text'
      ? document.getElementById('evTopicText').value.trim()
      : document.getElementById('evTopicSelect').value;
    if (!topic) {
      showToast('Please provide a topic.');
      return;
    }
    refchAddEvent({
      refereeId: refereeId,
      type: type,
      topic: topic,
      date: date,
      time: document.getElementById('evTime').value,
      location: document.getElementById('evLocation').value.trim(),
      notes: document.getElementById('evNotes').value.trim()
    });
    closeModal('addEventModal');
    showToast('Event added.');
    renderCalendar();
  });
});

function populateFilters() {
  var refSel = document.getElementById('filterRefCal');
  refchState.referees.forEach(function (r) {
    var opt = document.createElement('option');
    opt.value = r.id; opt.textContent = r.name;
    refSel.appendChild(opt);
  });

  var typeSel = document.getElementById('filterTypeCal');
  EVENT_TYPES.forEach(function (t) {
    var opt = document.createElement('option');
    opt.value = t.id; opt.textContent = t.label;
    typeSel.appendChild(opt);
  });

  var evRef = document.getElementById('evReferee');
  evRef.innerHTML = refchState.referees.map(function (r) { return '<option value="' + r.id + '">' + r.name + '</option>'; }).join('');

  var evType = document.getElementById('evType');
  evType.innerHTML = EVENT_TYPES.map(function (t) { return '<option value="' + t.id + '">' + t.label + '</option>'; }).join('');
}

function updateTopicField() {
  var typeDef = refchEventTypeById(document.getElementById('evType').value);
  var select = document.getElementById('evTopicSelect');
  var text = document.getElementById('evTopicText');

  if (typeDef.topicMode === 'text') {
    select.style.display = 'none';
    text.style.display = 'block';
    return;
  }

  select.style.display = 'block';
  text.style.display = 'none';

  var options = typeDef.topicMode === 'training' ? TRAINING_TOPICS
    : typeDef.topicMode === 'fitness' ? FITNESS_PROTOCOLS.map(function (p) { return p.name; })
    : typeDef.topicMode === 'screening' ? SCREENING_SYSTEMS
    : [];

  select.innerHTML = options.map(function (o) { return '<option value="' + o + '">' + o + '</option>'; }).join('');
}

function renderLegend() {
  document.getElementById('calLegend').innerHTML = EVENT_TYPES.map(function (t) {
    return '<span class="cal-legend-item"><i style="background:' + t.color + '"></i>' + t.label + '</span>';
  }).join('');
}

function filteredEvents() {
  var refFilter = document.getElementById('filterRefCal').value;
  var typeFilter = document.getElementById('filterTypeCal').value;
  return refchEventsFor({ refereeId: refFilter, type: typeFilter });
}

function renderCalendar() {
  renderKpis();
  renderGrid();
  renderAgenda();
}

function renderKpis() {
  var monthStr = calViewDate.getFullYear() + '-' + pad2(calViewDate.getMonth() + 1);
  var monthEvents = refchEventsFor({ month: monthStr });
  var matches = monthEvents.filter(function (e) { return e.type === 'match'; }).length;
  var training = monthEvents.filter(function (e) { return e.type === 'training'; }).length;
  var assessments = monthEvents.filter(function (e) { return e.type === 'fitness_test' || e.type === 'screening'; }).length;

  var kpis = [
    { label: 'Events This Month', value: monthEvents.length },
    { label: 'Matches', value: matches },
    { label: 'Training Sessions', value: training },
    { label: 'Fitness Assessments', value: assessments }
  ];
  document.getElementById('calKpis').innerHTML = kpis.map(function (k) {
    return '<div class="kpi-card"><div class="kpi-value tabular">' + k.value + '</div><div class="kpi-label">' + k.label + '</div></div>';
  }).join('');
}

function renderGrid() {
  document.getElementById('calMonthLabel').textContent = calViewDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  var year = calViewDate.getFullYear(), month = calViewDate.getMonth();
  var firstOfMonth = new Date(year, month, 1);
  var startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  var gridStart = new Date(year, month, 1 - startOffset);

  var todayStr = ymd(new Date());
  var events = filteredEvents();
  var eventsByDate = {};
  events.forEach(function (e) {
    (eventsByDate[e.date] = eventsByDate[e.date] || []).push(e);
  });

  var cells = '';
  for (var i = 0; i < 42; i++) {
    var d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    var dStr = ymd(d);
    var outside = d.getMonth() !== month;
    var classes = ['cal-day'];
    if (outside) classes.push('outside');
    if (dStr === todayStr) classes.push('today');
    if (dStr === calSelectedDate) classes.push('selected');

    var dayEvents = eventsByDate[dStr] || [];
    var chips = dayEvents.slice(0, 2).map(function (e) {
      var typeDef = refchEventTypeById(e.type);
      var ref = refchRefereeById(e.refereeId);
      return '<span class="cal-day-chip" style="background:' + typeDef.color + '">' + (ref ? ref.name.split(' ')[0] + ' — ' : '') + e.topic + '</span>';
    }).join('');
    var more = dayEvents.length > 2 ? '<span class="cal-day-more">+' + (dayEvents.length - 2) + ' more</span>' : '';

    cells += '<div class="' + classes.join(' ') + '" data-date="' + dStr + '">' +
      '<div class="cal-day-num">' + d.getDate() + '</div>' +
      chips + more +
    '</div>';
  }

  var grid = document.getElementById('calGrid');
  grid.innerHTML = cells;
  grid.querySelectorAll('.cal-day').forEach(function (cell) {
    cell.addEventListener('click', function () {
      calSelectedDate = cell.getAttribute('data-date');
      renderGrid();
      renderAgenda();
    });
  });
}

function renderAgenda() {
  var title = document.getElementById('agendaTitle');
  var list = document.getElementById('agendaList');

  var events;
  if (calSelectedDate) {
    var refFilter = document.getElementById('filterRefCal').value;
    var typeFilter = document.getElementById('filterTypeCal').value;
    events = refchEventsFor({ date: calSelectedDate, refereeId: refFilter, type: typeFilter });
    var dObj = new Date(calSelectedDate + 'T00:00:00');
    title.textContent = dObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  } else {
    var monthStr = calViewDate.getFullYear() + '-' + pad2(calViewDate.getMonth() + 1);
    var refFilter2 = document.getElementById('filterRefCal').value;
    var typeFilter2 = document.getElementById('filterTypeCal').value;
    events = refchEventsFor({ month: monthStr, refereeId: refFilter2, type: typeFilter2 });
    title.textContent = 'All events — ' + calViewDate.toLocaleDateString('en-GB', { month: 'long' });
  }

  if (events.length === 0) {
    list.innerHTML = '<div class="empty-state"><div class="title">No events</div><div class="sub">Nothing scheduled here yet.</div></div>';
    return;
  }

  list.innerHTML = events.map(function (e) {
    var typeDef = refchEventTypeById(e.type);
    var ref = refchRefereeById(e.refereeId);
    var metaParts = [typeDef.label];
    if (!calSelectedDate) metaParts.push(new Date(e.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
    if (e.location) metaParts.push(e.location);
    return '<div class="agenda-row">' +
      '<span class="agenda-type-dot" style="background:' + typeDef.color + '"></span>' +
      '<span class="agenda-time tabular">' + (e.time || '—') + '</span>' +
      '<span class="avatar avatar-xs" style="background:' + (ref ? ref.color : '#97A5B3') + '">' + (ref ? refchInitials(ref.name) : '?') + '</span>' +
      '<div class="agenda-info">' +
        '<div class="agenda-topic">' + e.topic + (ref ? ' — ' + ref.name : '') + '</div>' +
        '<div class="agenda-meta">' + metaParts.join(' · ') + '</div>' +
      '</div>' +
      '<button class="agenda-remove" data-id="' + e.id + '" title="Remove">×</button>' +
    '</div>';
  }).join('');

  list.querySelectorAll('.agenda-remove').forEach(function (btn) {
    btn.addEventListener('click', function () {
      refchRemoveEvent(btn.getAttribute('data-id'));
      showToast('Event removed.');
      renderCalendar();
    });
  });
}
