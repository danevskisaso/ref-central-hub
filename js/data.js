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

function refchSeed() {
  var referees = [
    { id: 'r1', name: 'Alex Martin', country: 'Spain', flag: '🇪🇸', category: 'Elite', refType: 'Referee', age: 38, status: 'Available' },
    { id: 'r2', name: 'Daniel König', country: 'Germany', flag: '🇩🇪', category: 'Elite', refType: 'Assistant Referee', age: 34, status: 'Match Assigned' },
    { id: 'r3', name: 'Sara Rossi', country: 'Italy', flag: '🇮🇹', category: 'International', refType: 'Referee', age: 31, status: 'Available' },
    { id: 'r4', name: 'Marko Jovanović', country: 'Serbia', flag: '🇷🇸', category: 'International', refType: 'Referee', age: 36, status: 'Modified Training' },
    { id: 'r5', name: 'Emre Aydın', country: 'Turkey', flag: '🇹🇷', category: 'National', refType: 'Assistant Referee', age: 29, status: 'Available' },
    { id: 'r6', name: 'Tomasz Nowak', country: 'Poland', flag: '🇵🇱', category: 'Elite', refType: 'Referee', age: 33, status: 'Injured' }
  ];
  referees.forEach(function (r, i) { r.color = AVATAR_COLORS[i % AVATAR_COLORS.length]; });

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

  return { referees: referees, organizations: organizations };
}

function refchLoad() {
  try {
    var raw = localStorage.getItem(REFCH_KEY);
    if (raw) return JSON.parse(raw);
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
