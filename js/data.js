/* ============================================================
   REF CENTRAL HUB — Data layer (localStorage-backed)
   No backend: all data lives in this browser only.
   ============================================================ */

var ROLES = [
  { id: 'super_admin',     label: 'Super Administrator',     group: 'Admin' },
  { id: 'org_admin',       label: 'Organization Administrator', group: 'Admin' },
  { id: 'refereeing_officer', label: 'Refereeing Officer',   group: 'Staff' },
  { id: 'fitness_coach',   label: 'Fitness Coach',           group: 'Staff' },
  { id: 'national_fitness_coach', label: 'National Fitness Coach', group: 'Staff' },
  { id: 'medical_team',    label: 'Medical Team',            group: 'Staff' },
  { id: 'performance_analyst', label: 'Performance Analyst', group: 'Staff' },
  { id: 'referee',         label: 'Referee',                 group: 'Officiating' },
  { id: 'assistant_referee', label: 'Assistant Referee',     group: 'Officiating' },
  { id: 'guest',           label: 'Guest / Observer',        group: 'Other' }
];

var ROLE_COLORS = {
  super_admin: '#E63946',
  org_admin: '#1473E6',
  refereeing_officer: '#00B8D9',
  fitness_coach: '#18A558',
  national_fitness_coach: '#0D7A3E',
  medical_team: '#E63946',
  performance_analyst: '#1C5CAB',
  referee: '#FFC928',
  assistant_referee: '#8A6400',
  guest: '#97A5B3'
};

var REFCH_KEY = 'refch_v1';

var CATEGORIES = ['Elite', 'International', 'National', 'Development'];
var STATUSES = ['Available', 'Match Assigned', 'Modified Training', 'Injured', 'Return to Train'];
var AVATAR_COLORS = ['#1473E6', '#00B8D9', '#18A558', '#1C5CAB', '#0D7A3E', '#E63946'];

/* ---------------- Fitness test protocols ----------------
   Benchmarks are indicative placeholders for demo purposes only —
   replace with your federation's official UEFA/FIFA standards. */
var FITNESS_PROTOCOLS = [
  { id: 'uefa20',    name: 'UEFA20',                    unit: 'm',          dir: 'high', benchmark: 2000,  group: 'Field' },
  { id: 'fifa_test', name: 'FIFA Fitness Test',          unit: 'pts',        dir: 'high', benchmark: 80,    group: 'Field' },
  { id: 'ariet',     name: 'ARIET',                      unit: 'level',      dir: 'high', benchmark: 18,    group: 'Field' },
  { id: 'yoyo_ir1',  name: 'Yo-Yo IR1',                  unit: 'm',          dir: 'high', benchmark: 2400,  group: 'Field' },
  { id: 'yoyo_ir2',  name: 'Yo-Yo IR2',                  unit: 'm',          dir: 'high', benchmark: 1600,  group: 'Field' },
  { id: 'sds',       name: 'SDS (Sprint + Distance)',    unit: 's',          dir: 'low',  benchmark: 6.20,  group: 'Speed' },
  { id: 'sprint40',  name: 'Sprint Test (40m)',          unit: 's',          dir: 'low',  benchmark: 5.80,  group: 'Speed' },
  { id: 'rsa',       name: 'Repeated Sprint Ability',    unit: 's (mean)',   dir: 'low',  benchmark: 6.50,  group: 'Speed' },
  { id: 'cod',       name: 'Change of Direction (COD)',  unit: 's',         dir: 'low',  benchmark: 8.20,  group: 'Speed' },
  { id: 'vo2max',    name: 'Aerobic Capacity (VO2max)',  unit: 'ml/kg/min',  dir: 'high', benchmark: 52,    group: 'Aerobic' },
  { id: 'lactate',   name: 'Lactate Threshold',          unit: 'km/h @4mmol', dir: 'high', benchmark: 13.5, group: 'Aerobic' },
  { id: 'maxhr',     name: 'Maximum HR Test',            unit: 'bpm',        dir: 'neutral', benchmark: null, group: 'Aerobic' },
  { id: 'vt2',       name: 'Ventilatory Threshold (VT2)', unit: 'km/h',      dir: 'high', benchmark: 14.0,  group: 'Aerobic' },
  { id: 'custom',    name: 'Custom Test',                unit: '',          dir: 'neutral', benchmark: null, group: 'Other' }
];

/* ---------------- VALD / screening systems ---------------- */
var SCREENING_PROTOCOLS = [
  { id: 'forcedecks_jh',  system: 'ForceDecks',  name: 'CMJ Jump Height',        unit: 'cm', dir: 'high', benchmark: 32 },
  { id: 'forcedecks_asym', system: 'ForceDecks', name: 'CMJ L/R Asymmetry',      unit: '%',  dir: 'low',  benchmark: 10 },
  { id: 'forceframe_str', system: 'ForceFrame',  name: 'Hip Add/Abd Strength',   unit: 'N',  dir: 'high', benchmark: 300 },
  { id: 'forceframe_asym', system: 'ForceFrame', name: 'Hip L/R Asymmetry',      unit: '%',  dir: 'low',  benchmark: 10 },
  { id: 'nordbord_force', system: 'NordBord',    name: 'Peak Hamstring Force',   unit: 'N',  dir: 'high', benchmark: 350 },
  { id: 'nordbord_asym',  system: 'NordBord',    name: 'Hamstring L/R Imbalance', unit: '%', dir: 'low',  benchmark: 10 },
  { id: 'dynamo_force',   system: 'Dynamo',      name: 'Peak Force (handheld)',  unit: 'N',  dir: 'high', benchmark: 280 },
  { id: 'humantrak_rom',  system: 'HumanTrak',   name: 'Shoulder/Hip ROM',       unit: '°',  dir: 'high', benchmark: 150 }
];
var SCREENING_SYSTEMS = ['ForceDecks', 'ForceFrame', 'NordBord', 'Dynamo', 'HumanTrak'];

/* ---------------- Body map regions ---------------- */
var BODY_REGIONS = [
  { id: 'neck', label: 'Neck', view: 'front', x: 100, y: 38 },
  { id: 'l_shoulder', label: 'L Shoulder', view: 'front', x: 72, y: 62 },
  { id: 'r_shoulder', label: 'R Shoulder', view: 'front', x: 128, y: 62 },
  { id: 'upper_back', label: 'Upper Back', view: 'back', x: 100, y: 62 },
  { id: 'lower_back', label: 'Lower Back', view: 'back', x: 100, y: 118 },
  { id: 'l_hip', label: 'L Hip', view: 'front', x: 84, y: 148 },
  { id: 'r_hip', label: 'R Hip', view: 'front', x: 116, y: 148 },
  { id: 'groin', label: 'Groin', view: 'front', x: 100, y: 160 },
  { id: 'l_quad', label: 'L Quadriceps', view: 'front', x: 84, y: 195 },
  { id: 'r_quad', label: 'R Quadriceps', view: 'front', x: 116, y: 195 },
  { id: 'l_hamstring', label: 'L Hamstring', view: 'back', x: 84, y: 195 },
  { id: 'r_hamstring', label: 'R Hamstring', view: 'back', x: 116, y: 195 },
  { id: 'l_knee', label: 'L Knee', view: 'front', x: 84, y: 235 },
  { id: 'r_knee', label: 'R Knee', view: 'front', x: 116, y: 235 },
  { id: 'l_calf', label: 'L Calf', view: 'back', x: 84, y: 270 },
  { id: 'r_calf', label: 'R Calf', view: 'back', x: 116, y: 270 },
  { id: 'l_achilles', label: 'L Achilles', view: 'back', x: 84, y: 305 },
  { id: 'r_achilles', label: 'R Achilles', view: 'back', x: 116, y: 305 },
  { id: 'l_ankle', label: 'L Ankle / Foot', view: 'front', x: 84, y: 320 },
  { id: 'r_ankle', label: 'R Ankle / Foot', view: 'front', x: 116, y: 320 }
];
var BODY_STATUS_CYCLE = ['normal', 'monitor', 'modified', 'injured'];
var BODY_STATUS_COLORS = { normal: '#18A558', monitor: '#FFC928', modified: '#FF8A28', injured: '#E63946' };
var BODY_STATUS_LABELS = { normal: 'Normal', monitor: 'Monitor', modified: 'Modified', injured: 'Injured' };

/* ---------------- Calendar ---------------- */

var EVENT_TYPES = [
  { id: 'match',        label: 'Match',         color: '#1473E6', topicMode: 'text' },
  { id: 'training',     label: 'Training',      color: '#18A558', topicMode: 'training' },
  { id: 'fitness_test', label: 'Fitness Test',  color: '#00B8D9', topicMode: 'fitness' },
  { id: 'screening',    label: 'Screening',     color: '#1C5CAB', topicMode: 'screening' },
  { id: 'course',       label: 'Course',        color: '#FFC928', topicMode: 'text' },
  { id: 'seminar',      label: 'Seminar',       color: '#FFC928', topicMode: 'text' },
  { id: 'meeting',      label: 'Meeting',       color: '#97A5B3', topicMode: 'text' },
  { id: 'travel',       label: 'Travel',        color: '#97A5B3', topicMode: 'text' },
  { id: 'medical',      label: 'Medical Appointment', color: '#E63946', topicMode: 'text' },
  { id: 'deadline',     label: 'Deadline',      color: '#E63946', topicMode: 'text' }
];

/* Training topics — covers interval running, repeated sprint ability,
   strength and every other session type from the spec's training module. */
var TRAINING_TOPICS = [
  'Recovery', 'Low Intensity', 'Medium Intensity', 'High Intensity',
  'Speed', 'Repeated Sprint Ability', 'Speed Endurance',
  'Aerobic Power', 'Aerobic Capacity', 'Tempo Running', 'Interval Running',
  'Strength', 'Mobility', 'Injury Prevention', 'Agility', 'Coordination',
  'Referee-Specific Training', 'Assistant Referee Training',
  'Integrated Physical-Technical Training'
];

function refchEventTypeById(id) {
  return EVENT_TYPES.filter(function (t) { return t.id === id; })[0];
}

function refchAddEvent(data) {
  var ev = {
    id: refchUid('ev'),
    refereeId: data.refereeId,
    type: data.type,
    topic: data.topic,
    date: data.date,
    time: data.time || '',
    location: data.location || '',
    notes: data.notes || ''
  };
  refchState.events.push(ev);
  refchSave();
  return ev;
}

function refchRemoveEvent(id) {
  refchState.events = refchState.events.filter(function (e) { return e.id !== id; });
  refchSave();
}

function refchEventsFor(filters) {
  filters = filters || {};
  return refchState.events
    .filter(function (e) { return !filters.refereeId || e.refereeId === filters.refereeId; })
    .filter(function (e) { return !filters.type || e.type === filters.type; })
    .filter(function (e) { return !filters.date || e.date === filters.date; })
    .filter(function (e) { return !filters.month || e.date.slice(0, 7) === filters.month; })
    .sort(function (a, b) { return a.date === b.date ? (a.time || '').localeCompare(b.time || '') : (a.date < b.date ? -1 : 1); });
}

/* ---------------- Communication ---------------- */

var ME = { id: 'staff_me', name: 'Alex Martin', role: 'Refereeing Officer' };

var AUDIENCE_TYPES = [
  { id: 'all_referees',   label: 'All Referees' },
  { id: 'all_assistants', label: 'All Assistant Referees' },
  { id: 'organization',   label: 'Everyone in an Organization' },
  { id: 'org_role',       label: 'A Role within an Organization' },
  { id: 'individual',     label: 'One Referee' }
];

function refchAudienceLabel(audienceType, params) {
  if (audienceType === 'all_referees') return 'All Referees';
  if (audienceType === 'all_assistants') return 'All Assistant Referees';
  if (audienceType === 'organization') {
    var org = refchState.organizations.filter(function (o) { return o.id === params.orgId; })[0];
    return org ? 'All of ' + org.name : 'Organization';
  }
  if (audienceType === 'org_role') {
    var org2 = refchState.organizations.filter(function (o) { return o.id === params.orgId; })[0];
    return (org2 ? org2.name : 'Organization') + ' — ' + refchRoleLabel(params.role);
  }
  if (audienceType === 'individual') {
    var r = refchRefereeById(params.refereeId);
    return r ? r.name : 'Referee';
  }
  return 'Recipients';
}

function refchResolveAudience(audienceType, params) {
  if (audienceType === 'all_referees') {
    return refchState.referees.filter(function (r) { return r.refType === 'Referee'; });
  }
  if (audienceType === 'all_assistants') {
    return refchState.referees.filter(function (r) { return r.refType === 'Assistant Referee'; });
  }
  if (audienceType === 'organization') {
    var org = refchState.organizations.filter(function (o) { return o.id === params.orgId; })[0];
    if (!org) return [];
    var ids = Array.from(new Set(org.members.map(function (m) { return m.refereeId; })));
    return ids.map(refchRefereeById).filter(Boolean);
  }
  if (audienceType === 'org_role') {
    var org2 = refchState.organizations.filter(function (o) { return o.id === params.orgId; })[0];
    if (!org2) return [];
    var ids2 = org2.members.filter(function (m) { return m.role === params.role; }).map(function (m) { return m.refereeId; });
    return Array.from(new Set(ids2)).map(refchRefereeById).filter(Boolean);
  }
  if (audienceType === 'individual') {
    var r = refchRefereeById(params.refereeId);
    return r ? [r] : [];
  }
  return [];
}

function refchSendMessage(data) {
  var recipients = refchResolveAudience(data.audienceType, data.params);
  var msg = {
    id: refchUid('msg'),
    direction: 'outgoing',
    senderId: null,
    audienceType: data.audienceType,
    audienceLabel: refchAudienceLabel(data.audienceType, data.params),
    recipientIds: recipients.map(function (r) { return r.id; }),
    subject: data.subject,
    body: data.body,
    sentAt: new Date().toISOString()
  };
  refchState.messages.push(msg);
  refchSave();
  return msg;
}

function refchReceiveMessage(data) {
  var msg = {
    id: refchUid('msg'),
    direction: 'incoming',
    senderId: data.refereeId,
    audienceType: null,
    audienceLabel: 'You (' + ME.role + ')',
    recipientIds: [],
    subject: data.subject,
    body: data.body,
    sentAt: new Date().toISOString()
  };
  refchState.messages.push(msg);
  refchSave();
  return msg;
}

function refchMessagesFor(filters) {
  filters = filters || {};
  return refchState.messages
    .filter(function (m) { return !filters.direction || m.direction === filters.direction; })
    .filter(function (m) {
      if (!filters.refereeId) return true;
      return m.senderId === filters.refereeId || m.recipientIds.indexOf(filters.refereeId) !== -1;
    })
    .sort(function (a, b) { return a.sentAt < b.sentAt ? 1 : -1; });
}

function refchSeed() {
  var referees = [
    { id: 'r1', name: 'Alex Martin', country: 'Spain', flag: '🇪🇸', category: 'Elite', refType: 'Referee', age: 38, status: 'Available' },
    { id: 'r2', name: 'Daniel König', country: 'Germany', flag: '🇩🇪', category: 'Elite', refType: 'Assistant Referee', age: 34, status: 'Match Assigned' },
    { id: 'r3', name: 'Sara Rossi', country: 'Italy', flag: '🇮🇹', category: 'International', refType: 'Referee', age: 31, status: 'Available' },
    { id: 'r4', name: 'Marko Jovanović', country: 'Serbia', flag: '🇷🇸', category: 'International', refType: 'Referee', age: 36, status: 'Modified Training' },
    { id: 'r5', name: 'Emre Aydın', country: 'Turkey', flag: '🇹🇷', category: 'National', refType: 'Assistant Referee', age: 29, status: 'Available' },
    { id: 'r6', name: 'Tomasz Nowak', country: 'Poland', flag: '🇵🇱', category: 'Elite', refType: 'Referee', age: 33, status: 'Injured' }
  ];
  referees.forEach(function (r, i) {
    r.color = AVATAR_COLORS[i % AVATAR_COLORS.length];
    r.anthro = { height: null, weight: null, bodyFat: null };
    r.bodyMap = {};
  });
  referees[0].anthro = { height: 181, weight: 76, bodyFat: 11.2 };
  referees[2].anthro = { height: 168, weight: 58, bodyFat: 16.5 };
  referees[3].anthro = { height: 179, weight: 79, bodyFat: 13.8 };
  referees[3].bodyMap = { l_hamstring: 'monitor' };
  referees[5].anthro = { height: 183, weight: 81, bodyFat: 12.9 };
  referees[5].bodyMap = { r_hamstring: 'injured' };

  var organizations = [
    {
      id: 'o1', name: 'UEFA', country: 'Europe', code: 'UEFA', color: '#1473E6',
      members: [
        { refereeId: 'r1', role: 'referee' },
        { refereeId: 'r2', role: 'assistant_referee' },
        { refereeId: 'r3', role: 'referee' }
      ]
    },
    {
      id: 'o2', name: 'Royal Spanish Football Federation', country: 'Spain', code: 'RFEF', color: '#18A558',
      members: [
        { refereeId: 'r1', role: 'referee' },
        { refereeId: 'r1', role: 'refereeing_officer' }
      ]
    }
  ];
  // de-dupe accidental same-role duplicates from seed authoring
  organizations.forEach(function (o) {
    var seen = {};
    o.members = o.members.filter(function (m) {
      var k = m.refereeId + ':' + m.role;
      if (seen[k]) return false;
      seen[k] = true;
      return true;
    });
  });

  var fitnessResults = [
    { id: 'fr1', refereeId: 'r1', protocolId: 'uefa20', date: '2026-03-02', value: 2080, notes: '' },
    { id: 'fr2', refereeId: 'r1', protocolId: 'sprint40', date: '2026-03-02', value: 5.65, notes: '' },
    { id: 'fr3', refereeId: 'r3', protocolId: 'yoyo_ir1', date: '2026-02-18', value: 2320, notes: '' },
    { id: 'fr4', refereeId: 'r6', protocolId: 'rsa', date: '2026-01-20', value: 6.80, notes: 'Pre-injury baseline' }
  ];

  var screeningResults = [
    { id: 'sr1', refereeId: 'r1', protocolId: 'forcedecks_jh', date: '2026-03-05', value: 34.2, notes: '' },
    { id: 'sr2', refereeId: 'r1', protocolId: 'forcedecks_asym', date: '2026-03-05', value: 6.1, notes: '' },
    { id: 'sr3', refereeId: 'r6', protocolId: 'nordbord_asym', date: '2026-02-10', value: 18.4, notes: 'Flagged — referred to medical' }
  ];

  var today = new Date();
  function offsetDate(days) {
    var d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  var events = [
    { id: 'ev1', refereeId: 'r1', type: 'match', topic: 'Bayern München vs Inter Milan', date: offsetDate(0), time: '20:00', location: 'Allianz Arena', notes: '' },
    { id: 'ev2', refereeId: 'r2', type: 'match', topic: 'Porto vs Fenerbahçe', date: offsetDate(0), time: '18:45', location: 'Estádio do Dragão', notes: '' },
    { id: 'ev3', refereeId: 'r3', type: 'match', topic: 'Barcelona vs Lyon', date: offsetDate(0), time: '21:00', location: 'Camp Nou', notes: '' },
    { id: 'ev4', refereeId: 'r1', type: 'training', topic: 'Repeated Sprint Ability', date: offsetDate(1), time: '09:00', location: 'Marbella Performance Centre', notes: '' },
    { id: 'ev5', refereeId: 'r1', type: 'training', topic: 'Interval Running', date: offsetDate(3), time: '09:00', location: 'Marbella Performance Centre', notes: '' },
    { id: 'ev6', refereeId: 'r1', type: 'training', topic: 'Strength', date: offsetDate(5), time: '10:30', location: 'Gym — Home Base', notes: '' },
    { id: 'ev7', refereeId: 'r2', type: 'training', topic: 'Recovery', date: offsetDate(1), time: '08:00', location: 'Home Base', notes: '' },
    { id: 'ev8', refereeId: 'r3', type: 'training', topic: 'Speed', date: offsetDate(2), time: '09:30', location: 'Rome Training Centre', notes: '' },
    { id: 'ev9', refereeId: 'r6', type: 'training', topic: 'Mobility', date: offsetDate(2), time: '08:30', location: 'Warsaw Medical Centre', notes: 'Modified — hamstring protocol' },
    { id: 'ev10', refereeId: 'r1', type: 'fitness_test', topic: 'UEFA20', date: offsetDate(3), time: '11:00', location: 'Marbella Performance Centre', notes: '' },
    { id: 'ev11', refereeId: 'r3', type: 'fitness_test', topic: 'Yo-Yo IR1', date: offsetDate(6), time: '10:00', location: 'Rome Training Centre', notes: '' },
    { id: 'ev12', refereeId: 'r5', type: 'fitness_test', topic: 'Repeated Sprint Ability', date: offsetDate(6), time: '10:00', location: 'Rome Training Centre', notes: '' },
    { id: 'ev13', refereeId: 'r6', type: 'fitness_test', topic: 'Sprint Test (40m)', date: offsetDate(9), time: '09:00', location: 'Warsaw Medical Centre', notes: 'Return-to-test clearance' },
    { id: 'ev14', refereeId: 'r1', type: 'screening', topic: 'ForceDecks', date: offsetDate(4), time: '09:00', location: 'Marbella Performance Centre', notes: '' },
    { id: 'ev15', refereeId: 'r6', type: 'screening', topic: 'NordBord', date: offsetDate(-2), time: '09:00', location: 'Warsaw Medical Centre', notes: 'Flagged — hamstring asymmetry' },
    { id: 'ev16', refereeId: 'r4', type: 'medical', topic: 'Physiotherapy Review', date: offsetDate(5), time: '14:00', location: 'Belgrade Sports Clinic', notes: '' },
    { id: 'ev17', refereeId: 'r1', type: 'course', topic: 'CORE 60 Seminar', date: offsetDate(2), time: '09:00', location: 'Nyon', notes: '' },
    { id: 'ev18', refereeId: 'r3', type: 'course', topic: 'AR Women Course', date: offsetDate(4), time: '09:00', location: 'Nyon', notes: '' },
    { id: 'ev19', refereeId: 'r2', type: 'deadline', topic: 'Match Assignment Deadline', date: offsetDate(7), time: '17:00', location: '', notes: '' }
  ];

  function isoOffset(days) {
    var d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString();
  }

  var messages = [
    {
      id: 'msg1', direction: 'outgoing', senderId: null, audienceType: 'all_referees',
      audienceLabel: 'All Referees', recipientIds: referees.filter(function (r) { return r.refType === 'Referee'; }).map(function (r) { return r.id; }),
      subject: 'Updated UEFA20 test window', body: 'Please confirm availability for the UEFA20 testing window opening next week.',
      sentAt: isoOffset(-3)
    },
    {
      id: 'msg2', direction: 'incoming', senderId: 'r6', audienceType: null,
      audienceLabel: 'You (Refereeing Officer)', recipientIds: [],
      subject: 'Hamstring update', body: 'Physio cleared the modified session today, feeling good for the return-to-test protocol.',
      sentAt: isoOffset(-1)
    },
    {
      id: 'msg3', direction: 'outgoing', senderId: null, audienceType: 'org_role',
      audienceLabel: 'UEFA — Fitness Coach', recipientIds: [],
      subject: 'Training load review', body: 'Please review this week\'s acute:chronic ratios before Friday\'s planning call.',
      sentAt: isoOffset(-5)
    }
  ];

  return { referees: referees, organizations: organizations, fitnessResults: fitnessResults, screeningResults: screeningResults, events: events, messages: messages };
}

function refchMigrate(state) {
  if (!state.fitnessResults) state.fitnessResults = [];
  if (!state.screeningResults) state.screeningResults = [];
  if (!state.events) state.events = [];
  if (!state.messages) state.messages = [];
  state.referees.forEach(function (r) {
    if (!r.anthro) r.anthro = { height: null, weight: null, bodyFat: null };
    if (!r.bodyMap) r.bodyMap = {};
  });
  return state;
}

function refchLoad() {
  try {
    var raw = localStorage.getItem(REFCH_KEY);
    if (raw) return refchMigrate(JSON.parse(raw));
  } catch (e) {}
  var seeded = refchSeed();
  refchSaveAll(seeded);
  return seeded;
}

function refchSaveAll(state) {
  localStorage.setItem(REFCH_KEY, JSON.stringify(state));
}

var refchState = refchLoad();

function refchSave() { refchSaveAll(refchState); }

function refchUid(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function refchInitials(name) {
  return name.split(' ').map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase();
}

function refchRoleLabel(roleId) {
  var r = ROLES.filter(function (x) { return x.id === roleId; })[0];
  return r ? r.label : roleId;
}

function refchRoleColor(roleId) {
  return ROLE_COLORS[roleId] || '#97A5B3';
}

/* ---------------- CRUD ---------------- */

function refchAddReferee(data) {
  var ref = {
    id: refchUid('r'),
    name: data.name,
    country: data.country,
    flag: data.flag || '🏳️',
    category: data.category,
    refType: data.refType,
    age: data.age || null,
    status: data.status || 'Available',
    color: AVATAR_COLORS[refchState.referees.length % AVATAR_COLORS.length]
  };
  refchState.referees.push(ref);
  refchSave();
  return ref;
}

function refchAddOrganization(data) {
  var org = {
    id: refchUid('o'),
    name: data.name,
    country: data.country,
    code: data.code,
    color: data.color || '#1473E6',
    members: []
  };
  refchState.organizations.push(org);
  refchSave();
  return org;
}

function refchAddMember(orgId, refereeId, role) {
  var org = refchState.organizations.filter(function (o) { return o.id === orgId; })[0];
  if (!org) return false;
  var exists = org.members.some(function (m) { return m.refereeId === refereeId && m.role === role; });
  if (exists) return false;
  org.members.push({ refereeId: refereeId, role: role });
  refchSave();
  return true;
}

function refchRemoveMember(orgId, refereeId, role) {
  var org = refchState.organizations.filter(function (o) { return o.id === orgId; })[0];
  if (!org) return;
  org.members = org.members.filter(function (m) { return !(m.refereeId === refereeId && m.role === role); });
  refchSave();
}

function refchRefereeById(id) {
  return refchState.referees.filter(function (r) { return r.id === id; })[0];
}

function refchOrgsForReferee(refereeId) {
  return refchState.organizations
    .filter(function (o) { return o.members.some(function (m) { return m.refereeId === refereeId; }); })
    .map(function (o) {
      var roles = o.members.filter(function (m) { return m.refereeId === refereeId; }).map(function (m) { return m.role; });
      return { org: o, roles: roles };
    });
}

/* ---------------- Fitness test protocols ---------------- */

function refchProtocolById(id) {
  return FITNESS_PROTOCOLS.filter(function (p) { return p.id === id; })[0];
}

function refchAddFitnessResult(data) {
  var rec = {
    id: refchUid('fr'),
    refereeId: data.refereeId,
    protocolId: data.protocolId,
    date: data.date,
    value: data.value,
    notes: data.notes || ''
  };
  refchState.fitnessResults.push(rec);
  refchSave();
  return rec;
}

function refchFitnessResultsFor(refereeId) {
  return refchState.fitnessResults
    .filter(function (r) { return !refereeId || r.refereeId === refereeId; })
    .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
}

function refchPreviousFitnessResult(refereeId, protocolId, beforeId) {
  var list = refchState.fitnessResults
    .filter(function (r) { return r.refereeId === refereeId && r.protocolId === protocolId && r.id !== beforeId; })
    .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  return list[0] || null;
}

function refchPassFail(protocol, value) {
  if (protocol.dir === 'neutral' || protocol.benchmark == null) return null;
  if (protocol.dir === 'high') return value >= protocol.benchmark;
  return value <= protocol.benchmark;
}

/* ---------------- Screening / VALD systems ---------------- */

function refchScreeningProtocolById(id) {
  return SCREENING_PROTOCOLS.filter(function (p) { return p.id === id; })[0];
}

function refchAddScreeningResult(data) {
  var rec = {
    id: refchUid('sr'),
    refereeId: data.refereeId,
    protocolId: data.protocolId,
    date: data.date,
    value: data.value,
    notes: data.notes || ''
  };
  refchState.screeningResults.push(rec);
  refchSave();
  return rec;
}

function refchScreeningResultsFor(refereeId) {
  return refchState.screeningResults
    .filter(function (r) { return !refereeId || r.refereeId === refereeId; })
    .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
}

/* ---------------- Anthropometrics ---------------- */

function refchSetAnthro(refereeId, anthro) {
  var r = refchRefereeById(refereeId);
  if (!r) return;
  r.anthro = anthro;
  refchSave();
}

function refchBmi(anthro) {
  if (!anthro || !anthro.height || !anthro.weight) return null;
  var m = anthro.height / 100;
  return anthro.weight / (m * m);
}

/* ---------------- Body map ---------------- */

function refchSetBodyStatus(refereeId, regionId, status) {
  var r = refchRefereeById(refereeId);
  if (!r) return;
  if (status === 'normal') {
    delete r.bodyMap[regionId];
  } else {
    r.bodyMap[regionId] = status;
  }
  refchSave();
}

function refchNextBodyStatus(current) {
  var idx = BODY_STATUS_CYCLE.indexOf(current || 'normal');
  return BODY_STATUS_CYCLE[(idx + 1) % BODY_STATUS_CYCLE.length];
}
