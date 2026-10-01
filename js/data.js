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

/* ---------------- Documents ---------------- */

var DOCUMENT_TYPES = [
  { id: 'pdf',   label: 'PDF',           color: '#E63946', exts: ['pdf'] },
  { id: 'jpeg',  label: 'Image (JPEG)',  color: '#00B8D9', exts: ['jpg', 'jpeg'] },
  { id: 'excel', label: 'Excel',         color: '#18A558', exts: ['xls', 'xlsx', 'csv'] },
  { id: 'word',  label: 'Word',          color: '#1473E6', exts: ['doc', 'docx'] }
];

var DOC_SHARE_TYPES = [{ id: 'library', label: 'General Library (everyone)' }].concat(AUDIENCE_TYPES);

function refchDetectFileType(filename) {
  var ext = (filename.split('.').pop() || '').toLowerCase();
  var match = DOCUMENT_TYPES.filter(function (t) { return t.exts.indexOf(ext) !== -1; })[0];
  return match ? match.id : null;
}

function refchDocTypeById(id) {
  return DOCUMENT_TYPES.filter(function (t) { return t.id === id; })[0];
}

function refchFormatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function refchDocShareLabel(shareType, shareParams) {
  if (shareType === 'library') return 'General Library — everyone';
  return refchAudienceLabel(shareType, shareParams);
}

function refchDocShareCount(shareType, shareParams) {
  if (shareType === 'library') return refchState.referees.length;
  return refchResolveAudience(shareType, shareParams).length;
}

function refchAddDocument(meta) {
  var doc = {
    id: meta.id,
    name: meta.name,
    fileType: meta.fileType,
    sizeBytes: meta.sizeBytes,
    uploadedAt: new Date().toISOString(),
    shareType: meta.shareType,
    shareParams: meta.shareParams || {}
  };
  refchState.documents.push(doc);
  refchSave();
  return doc;
}

function refchRemoveDocumentMeta(id) {
  refchState.documents = refchState.documents.filter(function (d) { return d.id !== id; });
  refchSave();
}

function refchDocumentsFor(filters) {
  filters = filters || {};
  var q = (filters.query || '').toLowerCase();
  return refchState.documents
    .filter(function (d) { return !filters.fileType || d.fileType === filters.fileType; })
    .filter(function (d) { return !filters.libraryOnly || d.shareType === 'library'; })
    .filter(function (d) { return !q || d.name.toLowerCase().indexOf(q) !== -1; })
    .sort(function (a, b) { return a.uploadedAt < b.uploadedAt ? 1 : -1; });
}

/* ---------------- Training Analysis ----------------
   Implements the 11-metric evaluation model: monthly consistency,
   weekly frequency, monthly load, weekly load balance, HR intensity
   distribution, high-intensity exposure, recovery sessions, per-session
   HR classification, duration/volume, distance, and training variety. */

var EVAL_COLORS = {
  'Excellent': '#18A558',
  'Good': '#00B8D9',
  'Needs Improvement': '#FFC928',
  'Poor': '#E63946',
  'High Risk': '#E63946',
  'Possible overload risk': '#E63946',
  'Possible excessive volume': '#E63946',
  'Poor / High Risk': '#E63946'
};

function refchEvalColor(tier) { return EVAL_COLORS[tier] || '#97A5B3'; }

var VARIETY_BUCKETS = [
  { id: 'aerobic', label: 'Aerobic base / extensive endurance', min: 4, topics: ['Aerobic Capacity', 'Aerobic Power', 'Tempo Running', 'Low Intensity', 'Medium Intensity'] },
  { id: 'hi_interval', label: 'High-intensity interval training', min: 4, topics: ['High Intensity', 'Interval Running'] },
  { id: 'speed', label: 'Speed / repeated sprint / COD', min: 2, topics: ['Speed', 'Repeated Sprint Ability', 'Speed Endurance', 'Agility'] },
  { id: 'recovery', label: 'Recovery / low-intensity', min: 3, topics: ['Recovery'] },
  { id: 'strength', label: 'Strength / gym / injury prevention', min: 4, topics: ['Strength', 'Mobility', 'Injury Prevention', 'Coordination'] }
];

function refchWeekOfMonth(dateStr) {
  var day = parseInt(dateStr.slice(8, 10), 10);
  return Math.min(4, Math.ceil(day / 7));
}

function refchSessionIsHI(s, hrMax) {
  var z45 = (s.zones.z4 || 0) + (s.zones.z5 || 0);
  return (s.maxHR / hrMax) >= 0.90 || z45 >= 10 || (s.avgHR / hrMax) >= 0.80;
}

function refchSessionIsRecovery(s, hrMax) {
  var z12 = (s.zones.z1 || 0) + (s.zones.z2 || 0);
  var z345 = (s.zones.z3 || 0) + (s.zones.z4 || 0) + (s.zones.z5 || 0);
  return (s.avgHR / hrMax) <= 0.70 && z12 > z345;
}

function refchSessionLabel(s, hrMax) {
  if ((s.maxHR / hrMax) >= 0.90) return 'Maximal / Anaerobic Session';
  var avgPct = s.avgHR / hrMax;
  if (avgPct < 0.70) return 'Recovery Session';
  if (avgPct < 0.80) return 'Aerobic Session';
  if (avgPct < 0.85) return 'Tempo / Moderate Session';
  return 'High-Intensity Session';
}

function refchTrainingSessionsFor(refereeId, monthStr) {
  return refchState.trainingSessions
    .filter(function (s) { return (!refereeId || s.refereeId === refereeId) && (!monthStr || s.date.slice(0, 7) === monthStr); })
    .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
}

function refchAddTrainingSession(data) {
  var s = {
    id: refchUid('ts'),
    refereeId: data.refereeId,
    date: data.date,
    category: data.category,
    durationMin: data.durationMin || 0,
    distanceKm: data.distanceKm || 0,
    trainingLoad: data.trainingLoad || 0,
    avgHR: data.avgHR || 0,
    maxHR: data.maxHR || 0,
    zones: data.zones || { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 }
  };
  refchState.trainingSessions.push(s);
  refchSave();
  return s;
}

function refchRemoveTrainingSession(id) {
  refchState.trainingSessions = refchState.trainingSessions.filter(function (s) { return s.id !== id; });
  refchSave();
}

function refchTrainingAnalysis(refereeId, monthStr) {
  var ref = refchRefereeById(refereeId);
  var hrMax = (ref && ref.hrMax) || 190;
  var sessions = refchTrainingSessionsFor(refereeId, monthStr);
  var m = {};

  /* 1. Monthly Training Consistency */
  var count = sessions.length;
  var consistencyTier = count >= 24 ? 'Excellent' : count >= 21 ? 'Good' : count >= 17 ? 'Needs Improvement' : 'Poor';
  m.consistency = { title: 'Monthly Training Consistency', value: count, tier: consistencyTier, detail: count + ' completed session' + (count === 1 ? '' : 's') + ' this month' };

  /* 2. Weekly Training Frequency */
  var weeksSet = {};
  sessions.forEach(function (s) { weeksSet[refchWeekOfMonth(s.date)] = true; });
  var activeWeeks = Object.keys(weeksSet).length;
  var freqTier = activeWeeks >= 4 ? 'Excellent' : activeWeeks >= 3 ? 'Good' : activeWeeks >= 2 ? 'Needs Improvement' : 'Poor';
  var freqDetailMap = { 4: 'Training completed in all 4 weeks', 3: 'Training completed in at least 3 weeks', 2: 'Training completed in only 2 weeks', 1: 'Training completed in 1 week only', 0: 'No training recorded this month' };
  m.frequency = { title: 'Weekly Training Frequency', value: activeWeeks, tier: freqTier, detail: freqDetailMap[activeWeeks] || (activeWeeks + ' active weeks') };

  /* 3. Monthly Training Load */
  var totalLoad = sessions.reduce(function (sum, s) { return sum + s.trainingLoad; }, 0);
  var loadTier = totalLoad > 2800 ? 'Possible overload risk' : totalLoad >= 1800 ? 'Excellent' : totalLoad >= 1400 ? 'Good' : totalLoad >= 900 ? 'Needs Improvement' : 'Poor';
  m.load = { title: 'Monthly Training Load', value: totalLoad, tier: loadTier, detail: 'Total training load: ' + totalLoad.toLocaleString() + ' AU' };

  /* 4. Weekly Load Balance */
  var weekLoads = [1, 2, 3, 4].map(function (w) {
    return sessions.filter(function (s) { return refchWeekOfMonth(s.date) === w; }).reduce(function (sum, s) { return sum + s.trainingLoad; }, 0);
  });
  var maxJump = 0, maxJumpWeek = null, maxJumpDir = 'increased';
  for (var i = 1; i < 4; i++) {
    if (weekLoads[i - 1] > 0) {
      var pct = ((weekLoads[i] - weekLoads[i - 1]) / weekLoads[i - 1]) * 100;
      if (Math.abs(pct) > Math.abs(maxJump)) { maxJump = pct; maxJumpWeek = i + 1; maxJumpDir = pct >= 0 ? 'increased' : 'decreased'; }
    }
  }
  var absJump = Math.abs(maxJump);
  var balanceTier = maxJumpWeek === null ? 'Needs Improvement' : absJump <= 25 ? 'Excellent' : absJump <= 35 ? 'Good' : absJump <= 50 ? 'Needs Improvement' : 'High Risk';
  var balanceDetail = maxJumpWeek ? ('Week ' + maxJumpWeek + ' ' + maxJumpDir + ' by ' + Math.round(absJump) + '% compared with the previous week') : 'Not enough weekly data to compare';
  m.balance = { title: 'Weekly Load Balance', value: Math.round(absJump), tier: balanceTier, detail: balanceDetail, weekLoads: weekLoads };

  /* 5. Heart Rate Intensity Distribution */
  var z1 = 0, z2 = 0, z3 = 0, z4 = 0, z5 = 0;
  sessions.forEach(function (s) { z1 += s.zones.z1 || 0; z2 += s.zones.z2 || 0; z3 += s.zones.z3 || 0; z4 += s.zones.z4 || 0; z5 += s.zones.z5 || 0; });
  var totalZoneMin = z1 + z2 + z3 + z4 + z5;
  var pct12 = totalZoneMin ? ((z1 + z2) / totalZoneMin * 100) : 0;
  var pct3 = totalZoneMin ? (z3 / totalZoneMin * 100) : 0;
  var pct45 = totalZoneMin ? ((z4 + z5) / totalZoneMin * 100) : 0;
  function inRange(v, lo, hi) { return v >= lo && v <= hi; }
  var within12 = inRange(pct12, 55, 70), within3 = inRange(pct3, 15, 25), within45 = inRange(pct45, 10, 20);
  var withinCount = [within12, within3, within45].filter(Boolean).length;
  var distTier;
  if (totalZoneMin === 0) distTier = 'Needs Improvement';
  else if (withinCount === 3) distTier = 'Excellent';
  else if (withinCount === 2) distTier = 'Good';
  else if (pct45 > 25 || (pct12 > 75 && pct45 < 8)) distTier = 'High Risk';
  else distTier = 'Needs Improvement';
  m.distribution = { title: 'Heart Rate Intensity Distribution', value: null, tier: distTier, detail: 'Z1-Z2: ' + Math.round(pct12) + '%, Z3: ' + Math.round(pct3) + '%, Z4-Z5: ' + Math.round(pct45) + '%', pct12: pct12, pct3: pct3, pct45: pct45 };

  /* 6. High-Intensity Training Exposure */
  var hiCount = sessions.filter(function (s) { return refchSessionIsHI(s, hrMax); }).length;
  var hiTier = hiCount >= 9 ? 'Possible overload risk' : hiCount >= 6 ? 'Excellent' : hiCount >= 4 ? 'Good' : hiCount >= 2 ? 'Needs Improvement' : 'Poor';
  m.hiExposure = { title: 'High-Intensity Training Exposure', value: hiCount, tier: hiTier, detail: hiCount + ' high-intensity session' + (hiCount === 1 ? '' : 's') + ' completed this month' };

  /* 7. Recovery / Low-Intensity Sessions */
  var recCount = sessions.filter(function (s) { return refchSessionIsRecovery(s, hrMax); }).length;
  var recTier = recCount === 0 ? 'Poor / High Risk' : recCount <= 2 ? 'Needs Improvement' : recCount === 3 ? 'Good' : 'Excellent';
  m.recovery = { title: 'Recovery / Low-Intensity Sessions', value: recCount, tier: recTier, detail: recCount + ' low-intensity recovery session' + (recCount === 1 ? '' : 's') + ' completed' };

  /* 8. Average HR and Max HR Evaluation (per-session classification) */
  var sessionLabels = sessions.map(function (s) {
    return { session: s, label: refchSessionLabel(s, hrMax), avgPct: Math.round((s.avgHR / hrMax) * 100) };
  });
  var latest = sessionLabels[sessionLabels.length - 1];
  m.hrEval = {
    title: 'Average HR and Max HR Evaluation', value: null, tier: null,
    detail: latest ? ('Latest session — ' + latest.label + ': Average HR was ' + latest.avgPct + '% of HRmax') : 'No sessions logged yet',
    sessionLabels: sessionLabels
  };

  /* 9. Duration and Volume */
  var totalDuration = sessions.reduce(function (sum, s) { return sum + s.durationMin; }, 0);
  var durTier = totalDuration >= 1200 ? 'Excellent' : totalDuration >= 900 ? 'Good' : totalDuration >= 600 ? 'Needs Improvement' : 'Poor';
  m.duration = { title: 'Duration and Volume', value: totalDuration, tier: durTier, detail: 'Total duration: ' + totalDuration.toLocaleString() + ' minutes (' + (totalDuration / 60).toFixed(1) + ' hours)' };

  /* 10. Distance / External Volume */
  var totalDistance = Math.round(sessions.reduce(function (sum, s) { return sum + (s.distanceKm || 0); }, 0) * 10) / 10;
  var distVolTier = totalDistance > 130 ? 'Possible excessive volume' : totalDistance >= 80 ? 'Excellent' : totalDistance >= 60 ? 'Good' : totalDistance >= 40 ? 'Needs Improvement' : 'Poor';
  m.distanceVol = { title: 'Distance / External Volume', value: totalDistance, tier: distVolTier, detail: 'Monthly distance: ' + totalDistance + ' km' };

  /* 11. Training Variety */
  var bucketCounts = VARIETY_BUCKETS.map(function (b) {
    var c = sessions.filter(function (s) { return b.topics.indexOf(s.category) !== -1; }).length;
    return { bucket: b, count: c, met: c >= b.min };
  });
  var metCount = bucketCounts.filter(function (b) { return b.met; }).length;
  var varietyTier = metCount === 5 ? 'Excellent' : metCount === 4 ? 'Good' : metCount === 3 ? 'Needs Improvement' : 'Poor';
  var missing = bucketCounts.filter(function (b) { return !b.met; }).map(function (b) { return b.bucket.label; });
  var varietyDetail = missing.length === 0 ? 'All training categories meet their monthly minimum' : 'Missing / below target: ' + missing.join(', ');
  m.variety = { title: 'Training Variety', value: metCount, tier: varietyTier, detail: varietyDetail, buckets: bucketCounts };

  return { hrMax: hrMax, sessionCount: count, metrics: m };
}

function refchSeed() {
  var referees = [
    { id: 'r1', name: 'Alex Martin', country: 'Spain', flag: '🇪🇸', category: 'Elite', refType: 'Referee', age: 38, status: 'Available', hrMax: 190 },
    { id: 'r2', name: 'Daniel König', country: 'Germany', flag: '🇩🇪', category: 'Elite', refType: 'Assistant Referee', age: 34, status: 'Match Assigned', hrMax: 188 },
    { id: 'r3', name: 'Sara Rossi', country: 'Italy', flag: '🇮🇹', category: 'International', refType: 'Referee', age: 31, status: 'Available', hrMax: 192 },
    { id: 'r4', name: 'Marko Jovanović', country: 'Serbia', flag: '🇷🇸', category: 'International', refType: 'Referee', age: 36, status: 'Modified Training', hrMax: 187 },
    { id: 'r5', name: 'Emre Aydın', country: 'Turkey', flag: '🇹🇷', category: 'National', refType: 'Assistant Referee', age: 29, status: 'Available', hrMax: 194 },
    { id: 'r6', name: 'Tomasz Nowak', country: 'Poland', flag: '🇵🇱', category: 'Elite', refType: 'Referee', age: 33, status: 'Injured', hrMax: 189 }
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

  function monthDate(day) {
    var d = new Date(today.getFullYear(), today.getMonth(), Math.min(day, 28));
    return d.toISOString().slice(0, 10);
  }

  var trainingSessions = [
    { id: 'ts1', refereeId: 'r1', date: monthDate(2), category: 'Recovery', durationMin: 40, distanceKm: 5, trainingLoad: 120, avgHR: 118, maxHR: 135, zones: { z1: 30, z2: 10, z3: 0, z4: 0, z5: 0 } },
    { id: 'ts2', refereeId: 'r1', date: monthDate(4), category: 'Aerobic Capacity', durationMin: 70, distanceKm: 12, trainingLoad: 180, avgHR: 143, maxHR: 160, zones: { z1: 10, z2: 40, z3: 20, z4: 0, z5: 0 } },
    { id: 'ts3', refereeId: 'r1', date: monthDate(6), category: 'High Intensity', durationMin: 55, distanceKm: 8, trainingLoad: 210, avgHR: 158, maxHR: 178, zones: { z1: 5, z2: 10, z3: 15, z4: 15, z5: 10 } },
    { id: 'ts4', refereeId: 'r1', date: monthDate(9), category: 'Strength', durationMin: 60, distanceKm: 0, trainingLoad: 150, avgHR: 122, maxHR: 140, zones: { z1: 35, z2: 20, z3: 5, z4: 0, z5: 0 } },
    { id: 'ts5', refereeId: 'r1', date: monthDate(11), category: 'Recovery', durationMin: 35, distanceKm: 4, trainingLoad: 100, avgHR: 115, maxHR: 130, zones: { z1: 28, z2: 7, z3: 0, z4: 0, z5: 0 } },
    { id: 'ts6', refereeId: 'r1', date: monthDate(13), category: 'Aerobic Capacity', durationMin: 75, distanceKm: 13, trainingLoad: 190, avgHR: 145, maxHR: 162, zones: { z1: 8, z2: 45, z3: 22, z4: 0, z5: 0 } },
    { id: 'ts7', refereeId: 'r1', date: monthDate(16), category: 'High Intensity', durationMin: 50, distanceKm: 7, trainingLoad: 220, avgHR: 160, maxHR: 182, zones: { z1: 3, z2: 7, z3: 10, z4: 18, z5: 12 } },
    { id: 'ts8', refereeId: 'r1', date: monthDate(18), category: 'Strength', durationMin: 55, distanceKm: 0, trainingLoad: 140, avgHR: 120, maxHR: 138, zones: { z1: 32, z2: 18, z3: 5, z4: 0, z5: 0 } },
    { id: 'ts9', refereeId: 'r1', date: monthDate(20), category: 'Recovery', durationMin: 40, distanceKm: 5, trainingLoad: 110, avgHR: 116, maxHR: 132, zones: { z1: 31, z2: 9, z3: 0, z4: 0, z5: 0 } },
    { id: 'ts10', refereeId: 'r1', date: monthDate(23), category: 'Medium Intensity', durationMin: 65, distanceKm: 11, trainingLoad: 175, avgHR: 155, maxHR: 170, zones: { z1: 5, z2: 15, z3: 35, z4: 10, z5: 0 } },
    { id: 'ts11', refereeId: 'r1', date: monthDate(25), category: 'High Intensity', durationMin: 50, distanceKm: 6, trainingLoad: 215, avgHR: 159, maxHR: 180, zones: { z1: 2, z2: 8, z3: 10, z4: 18, z5: 12 } },
    { id: 'ts12', refereeId: 'r1', date: monthDate(27), category: 'Strength', durationMin: 60, distanceKm: 0, trainingLoad: 145, avgHR: 121, maxHR: 139, zones: { z1: 34, z2: 21, z3: 5, z4: 0, z5: 0 } },
    { id: 'ts13', refereeId: 'r1', date: monthDate(28), category: 'Aerobic Capacity', durationMin: 70, distanceKm: 13, trainingLoad: 185, avgHR: 146, maxHR: 163, zones: { z1: 9, z2: 43, z3: 18, z4: 0, z5: 0 } }
  ];

  return {
    referees: referees, organizations: organizations, fitnessResults: fitnessResults, screeningResults: screeningResults,
    events: events, messages: messages, documents: [], trainingSessions: trainingSessions,
    integrations: { polar: { connected: false, clientId: '', lastSync: null } },
    notificationPrefs: { matchAssignments: true, trainingReminders: true, alerts: true, weeklyDigest: false },
    drills: []
  };
}

function refchMigrate(state) {
  if (!state.fitnessResults) state.fitnessResults = [];
  if (!state.screeningResults) state.screeningResults = [];
  if (!state.events) state.events = [];
  if (!state.messages) state.messages = [];
  if (!state.documents) state.documents = [];
  if (!state.trainingSessions) state.trainingSessions = [];
  if (!state.integrations) state.integrations = { polar: { connected: false, clientId: '', lastSync: null } };
  if (!state.notificationPrefs) state.notificationPrefs = { matchAssignments: true, trainingReminders: true, alerts: true, weeklyDigest: false };
  if (!state.drills) state.drills = [];
  state.referees.forEach(function (r) {
    if (!r.anthro) r.anthro = { height: null, weight: null, bodyFat: null };
    if (!r.bodyMap) r.bodyMap = {};
    if (!r.hrMax) r.hrMax = 190;
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
    hrMax: data.hrMax || 190,
    anthro: { height: null, weight: null, bodyFat: null },
    bodyMap: {},
    color: AVATAR_COLORS[refchState.referees.length % AVATAR_COLORS.length]
  };
  refchState.referees.push(ref);
  refchSave();
  return ref;
}

function refchUpdateReferee(id, data) {
  var ref = refchRefereeById(id);
  if (!ref) return null;
  ['name', 'country', 'flag', 'category', 'refType', 'age', 'status', 'hrMax'].forEach(function (key) {
    if (data[key] !== undefined && data[key] !== null && data[key] !== '') ref[key] = data[key];
  });
  refchSave();
  return ref;
}

/* ---------------- Settings: integrations, notifications, audit log ---------------- */

var POLAR_SYNC_CATEGORIES = ['Aerobic Capacity', 'High Intensity', 'Recovery', 'Medium Intensity'];

function refchConnectPolar(clientId) {
  refchState.integrations.polar = { connected: true, clientId: clientId || 'polar-demo-client', lastSync: new Date().toISOString() };
  refchSave();
}

function refchDisconnectPolar() {
  refchState.integrations.polar.connected = false;
  refchSave();
}

function refchSyncPolarNow(refereeId) {
  var ref = refchRefereeById(refereeId);
  if (!ref || !refchState.integrations.polar.connected) return null;

  var category = POLAR_SYNC_CATEGORIES[Math.floor(Math.random() * POLAR_SYNC_CATEGORIES.length)];
  var avgPct = 0.60 + Math.random() * 0.30;
  var maxPct = Math.min(0.99, avgPct + 0.10 + Math.random() * 0.08);
  var avgHR = Math.round(ref.hrMax * avgPct);
  var maxHR = Math.round(ref.hrMax * maxPct);
  var duration = 35 + Math.round(Math.random() * 45);

  var session = refchAddTrainingSession({
    refereeId: refereeId,
    date: new Date().toISOString().slice(0, 10),
    category: category,
    durationMin: duration,
    distanceKm: Math.round(duration * 0.14 * 10) / 10,
    trainingLoad: Math.round(duration * (1.5 + avgPct)),
    avgHR: avgHR,
    maxHR: maxHR,
    zones: { z1: Math.round(duration * 0.2), z2: Math.round(duration * 0.3), z3: Math.round(duration * 0.3), z4: Math.round(duration * 0.15), z5: Math.round(duration * 0.05) }
  });

  refchState.integrations.polar.lastSync = new Date().toISOString();
  refchSave();
  return session;
}

function refchSetNotificationPref(key, value) {
  refchState.notificationPrefs[key] = value;
  refchSave();
}

function refchAuditLog() {
  var entries = [];
  refchState.documents.forEach(function (d) {
    entries.push({ timestamp: d.uploadedAt, text: 'Document uploaded: "' + d.name + '" (' + refchDocShareLabel(d.shareType, d.shareParams) + ')' });
  });
  refchState.messages.forEach(function (m) {
    if (m.direction === 'outgoing') {
      entries.push({ timestamp: m.sentAt, text: 'Message sent to ' + m.audienceLabel + ': "' + m.subject + '"' });
    } else {
      var sender = refchRefereeById(m.senderId);
      entries.push({ timestamp: m.sentAt, text: 'Message received from ' + (sender ? sender.name : 'Unknown') + ': "' + m.subject + '"' });
    }
  });
  refchState.trainingSessions.forEach(function (s) {
    var ref = refchRefereeById(s.refereeId);
    entries.push({ timestamp: s.date + 'T12:00:00.000Z', text: 'Training session logged for ' + (ref ? ref.name : 'Unknown') + ' — ' + s.category });
  });
  if (refchState.integrations.polar.lastSync) {
    entries.push({ timestamp: refchState.integrations.polar.lastSync, text: 'Polar integration synced' });
  }
  return entries.sort(function (a, b) { return a.timestamp < b.timestamp ? 1 : -1; });
}

/* ---------------- Drills ----------------
   Movement-type color convention (used for runner icons and the
   drawing-tool palette): sprint/high-intensity = red, sideways =
   yellow, backward = white, jogging = green, medium intensity = blue. */

var MOVEMENT_COLORS = {
  sprint: '#E63946',
  sideways: '#FFC928',
  backward: '#FFFFFF',
  jog: '#18A558',
  medium: '#1473E6'
};

var DRILL_FIELD_TYPES = [
  { id: 'full', label: 'Full Pitch' },
  { id: 'half_h', label: 'Half Pitch' },
  { id: 'half_v1', label: 'Attacking Third' },
  { id: 'half_v2', label: 'Defending Third' },
  { id: 'goal_area', label: 'Goal Area' },
  { id: 'final_third', label: 'Final Third' },
  { id: 'grid', label: 'Practice Grid' },
  { id: 'free', label: 'Blank Area' }
];

var DRILL_EQUIPMENT = [
  { id: 'ball', label: 'Ball', category: 'Balls', colorable: false },
  { id: 'cone', label: 'Flat Cone', category: 'Cones', colorable: true },
  { id: 'cone_tall', label: 'Tall Cone', category: 'Cones', colorable: true },
  { id: 'flag', label: 'Flag', category: 'Flags & Sticks', colorable: true },
  { id: 'stick', label: 'Stick', category: 'Flags & Sticks', colorable: true },
  { id: 'cone_stick', label: 'Cone Stick', category: 'Flags & Sticks', colorable: true },
  { id: 'dummy', label: 'Dummy', category: 'Dummies', colorable: true },
  { id: 'hurdle', label: 'Hurdle', category: 'Hurdles', colorable: true },
  { id: 'hurdle_bar', label: 'Hurdle Bar', category: 'Hurdles', colorable: true },
  { id: 'hoop', label: 'Hoop', category: 'Hoops', colorable: true },
  { id: 'hoop_oval', label: 'Hoop (Oval)', category: 'Hoops', colorable: true },
  { id: 'ladder', label: 'Agility Ladder', category: 'Other', colorable: false },
  { id: 'box_small', label: 'Small Box', category: 'Other', colorable: false },
  { id: 'box_long', label: 'Bench', category: 'Other', colorable: false },
  { id: 'mat', label: 'Mat', category: 'Other', colorable: false },
  { id: 'goal_small', label: 'Mini Goal', category: 'Other', colorable: false }
];

var DRILL_FIGURES = [
  { id: 'referee', label: 'Referee', category: 'Officials', colorable: false },
  { id: 'assistant_referee', label: 'Assistant Referee', category: 'Officials', colorable: false },
  { id: 'coach', label: 'Coach', category: 'Staff', colorable: true },
  { id: 'goalkeeper', label: 'Goalkeeper', category: 'Staff', colorable: true },
  { id: 'runner_sprint', label: 'Sprint', category: 'Movement', colorable: false, color: MOVEMENT_COLORS.sprint },
  { id: 'runner_jog', label: 'Jog', category: 'Movement', colorable: false, color: MOVEMENT_COLORS.jog },
  { id: 'runner_sideways', label: 'Sideways', category: 'Movement', colorable: false, color: MOVEMENT_COLORS.sideways },
  { id: 'runner_backward', label: 'Backward', category: 'Movement', colorable: false, color: MOVEMENT_COLORS.backward },
  { id: 'runner_medium', label: 'Medium Intensity', category: 'Movement', colorable: false, color: MOVEMENT_COLORS.medium }
];

function refchAddDrill(data) {
  var drill = {
    id: refchUid('drill'),
    name: data.name || 'Untitled Drill',
    teams: data.teams || [],
    fieldType: data.fieldType,
    perspective: !!data.perspective,
    background: data.background || 'green',
    elements: data.elements || [],
    createdAt: new Date().toISOString(),
    createdBy: ME.name
  };
  refchState.drills.push(drill);
  refchSave();
  return drill;
}

function refchUpdateDrill(id, data) {
  var drill = refchState.drills.filter(function (d) { return d.id === id; })[0];
  if (!drill) return null;
  ['name', 'teams', 'fieldType', 'perspective', 'background', 'elements'].forEach(function (key) {
    if (data[key] !== undefined) drill[key] = data[key];
  });
  refchSave();
  return drill;
}

function refchRemoveDrill(id) {
  refchState.drills = refchState.drills.filter(function (d) { return d.id !== id; });
  refchSave();
}

function refchDrillsFor(filters) {
  filters = filters || {};
  var q = (filters.query || '').toLowerCase();
  return refchState.drills
    .filter(function (d) { return !q || d.name.toLowerCase().indexOf(q) !== -1; })
    .sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; });
}

/* ---------------- Training Generator ----------------
   Produces a proposed session structure from intensity type + distance/
   reps/rest. Pace assumptions are labeled as estimates, not clinical
   standards — same caution as the fitness-test benchmarks. */

var GENERATOR_TYPES = [
  { id: 'high_intensity', label: 'High Intensity', category: 'High Intensity', paceMs: 6.2, loadFactor: 1.9 },
  { id: 'rsa', label: 'Repeated Sprint Ability', category: 'Repeated Sprint Ability', paceMs: 7.0, loadFactor: 2.1 },
  { id: 'medium_intensity', label: 'Medium Intensity', category: 'Medium Intensity', paceMs: 4.2, loadFactor: 1.3 },
  { id: 'tempo', label: 'Tempo Running', category: 'Tempo Running', paceMs: 3.6, loadFactor: 1.1 }
];

function refchGeneratorTypeById(id) {
  return GENERATOR_TYPES.filter(function (t) { return t.id === id; })[0];
}

function refchGenerateTrainingProposal(params) {
  var type = refchGeneratorTypeById(params.type);
  var distance = params.distance;
  var reps = params.reps;
  var restSec = params.restSec;

  var workTimePerRep = distance / type.paceMs;
  var totalWorkSec = workTimePerRep * reps;
  var totalRestSec = restSec * Math.max(0, reps - 1);
  var totalDurationMin = Math.round((totalWorkSec + totalRestSec) / 60 * 10) / 10;
  var totalDistance = distance * reps;
  var estimatedLoad = Math.round(totalWorkSec / 60 * type.loadFactor * 10);

  var ratio = restSec > 0 ? Math.round((restSec / workTimePerRep) * 10) / 10 : 0;
  var ratioText = '1:' + ratio;
  var ratioNote;
  if (type.id === 'high_intensity' || type.id === 'rsa') {
    ratioNote = ratio >= 3 ? 'Good recovery ratio for repeated high-intensity efforts.' : 'Rest may be short for full recovery between maximal efforts — consider increasing.';
  } else {
    ratioNote = ratio >= 1 ? 'Reasonable work:rest balance for this intensity.' : 'Rest is short relative to work — acceptable for tempo/aerobic development.';
  }

  return {
    type: type,
    distance: distance,
    reps: reps,
    restSec: restSec,
    workTimePerRep: Math.round(workTimePerRep * 10) / 10,
    totalWorkSec: Math.round(totalWorkSec),
    totalRestSec: totalRestSec,
    totalDurationMin: totalDurationMin,
    totalDistance: totalDistance,
    estimatedLoad: estimatedLoad,
    workRestRatio: ratioText,
    ratioNote: ratioNote
  };
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
