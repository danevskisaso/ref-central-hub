/* ============================================================
   REF CENTRAL HUB — Organizations page
   ============================================================ */

var activeDetailOrgId = null;

document.addEventListener('DOMContentLoaded', function () {
  renderOrgGrid();

  document.getElementById('orgSearch').addEventListener('input', renderOrgGrid);

  document.getElementById('openAddOrg').addEventListener('click', function () {
    document.getElementById('addOrgForm').reset();
    document.getElementById('ogColor').value = '#1473E6';
    openModal('addOrgModal');
  });

  document.getElementById('submitAddOrg').addEventListener('click', function () {
    var name = document.getElementById('ogName').value.trim();
    var code = document.getElementById('ogCode').value.trim().toUpperCase();
    var country = document.getElementById('ogCountry').value.trim();
    if (!name || !code || !country) {
      showToast('Please fill in all fields.');
      return;
    }
    refchAddOrganization({
      name: name,
      code: code,
      country: country,
      color: document.getElementById('ogColor').value
    });
    closeModal('addOrgModal');
    showToast('Organization "' + name + '" created.');
    renderOrgGrid();
  });

  document.getElementById('odAssignBtn').addEventListener('click', function () {
    var refId = document.getElementById('odRefSelect').value;
    var role = document.getElementById('odRoleSelect').value;
    if (!refId || !role || !activeDetailOrgId) return;
    var ok = refchAddMember(activeDetailOrgId, refId, role);
    if (ok) {
      showToast('Member added.');
      renderOrgDetail(activeDetailOrgId);
      renderOrgGrid();
    } else {
      showToast('That referee already has this role here.');
    }
  });
});

function renderOrgGrid() {
  var q = (document.getElementById('orgSearch').value || '').toLowerCase();
  var list = refchState.organizations.filter(function (o) {
    return !q || o.name.toLowerCase().indexOf(q) !== -1 || o.code.toLowerCase().indexOf(q) !== -1 || o.country.toLowerCase().indexOf(q) !== -1;
  });

  document.getElementById('orgCount').textContent = list.length + ' organization' + (list.length === 1 ? '' : 's');

  var grid = document.getElementById('orgGrid');

  if (list.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">' +
      '<div class="title">No organizations yet</div>' +
      '<div class="sub">Create one to start assigning referees and roles.</div>' +
      '</div>';
    return;
  }

  grid.innerHTML = list.map(function (o) {
    var refCount = o.members.length ? new Set(o.members.map(function (m) { return m.refereeId; })).size : 0;
    var coachCount = o.members.filter(function (m) { return m.role === 'fitness_coach' || m.role === 'national_fitness_coach'; }).length;
    var officerCount = o.members.filter(function (m) { return m.role === 'refereeing_officer'; }).length;

    return '' +
      '<div class="org-card" data-id="' + o.id + '">' +
        '<div class="org-card-top">' +
          '<div class="org-badge-lg" style="background:' + o.color + '">' + o.code + '</div>' +
          '<div>' +
            '<div class="org-card-name">' + o.name + '</div>' +
            '<div class="org-card-sub">' + o.country + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="org-card-stats">' +
          '<div class="org-card-stat"><div class="num tabular">' + refCount + '</div><div class="lbl">Members</div></div>' +
          '<div class="org-card-stat"><div class="num tabular">' + officerCount + '</div><div class="lbl">Officers</div></div>' +
          '<div class="org-card-stat"><div class="num tabular">' + coachCount + '</div><div class="lbl">Coaches</div></div>' +
        '</div>' +
      '</div>';
  }).join('');

  grid.querySelectorAll('.org-card').forEach(function (card) {
    card.addEventListener('click', function () { openOrgDetail(card.getAttribute('data-id')); });
  });
}

function openOrgDetail(id) {
  activeDetailOrgId = id;
  renderOrgDetail(id);
  openModal('orgDetailModal');
}

function renderOrgDetail(id) {
  var o = refchState.organizations.filter(function (x) { return x.id === id; })[0];
  if (!o) return;

  document.getElementById('odName').textContent = o.name;
  document.getElementById('odMeta').textContent = o.code + ' · ' + o.country;

  var body = document.getElementById('odRosterBody');
  if (o.members.length === 0) {
    body.innerHTML = '<tr><td colspan="3"><div class="empty-state"><div class="title">No members yet</div><div class="sub">Add a referee and assign their role below.</div></div></td></tr>';
  } else {
    body.innerHTML = o.members.map(function (m) {
      var ref = refchRefereeById(m.refereeId);
      if (!ref) return '';
      return '<tr>' +
        '<td><a class="roster-name" href="referees.html?open=' + ref.id + '" title="Open and edit this referee\'s profile"><span class="avatar avatar-xs" style="background:' + ref.color + '">' + refchInitials(ref.name) + '</span>' + ref.name + '</a></td>' +
        '<td><span class="role-chip"><span class="dot" style="background:' + refchRoleColor(m.role) + '"></span>' + refchRoleLabel(m.role) + '</span></td>' +
        '<td style="text-align:right;"><button class="btn btn-ghost roster-remove" data-ref="' + m.refereeId + '" data-role="' + m.role + '" style="padding:5px 10px;font-size:11.5px;">Remove</button></td>' +
      '</tr>';
    }).join('');

    body.querySelectorAll('.roster-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        refchRemoveMember(id, btn.getAttribute('data-ref'), btn.getAttribute('data-role'));
        renderOrgDetail(id);
        renderOrgGrid();
        showToast('Member removed.');
      });
    });
  }

  var refSelect = document.getElementById('odRefSelect');
  refSelect.innerHTML = refchState.referees.length
    ? refchState.referees.map(function (r) { return '<option value="' + r.id + '">' + r.name + ' (' + r.country + ')</option>'; }).join('')
    : '<option value="">No referees yet</option>';

  var roleSelect = document.getElementById('odRoleSelect');
  roleSelect.innerHTML = ROLES.map(function (role) { return '<option value="' + role.id + '">' + role.label + '</option>'; }).join('');
}
