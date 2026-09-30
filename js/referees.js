/* ============================================================
   REF CENTRAL HUB — Referees page
   ============================================================ */

var activeDetailRefereeId = null;

document.addEventListener('DOMContentLoaded', function () {
  populateSelect(document.getElementById('filterCategory'), CATEGORIES, 'All Categories');
  populateSelect(document.getElementById('filterType'), ['Referee', 'Assistant Referee'], 'Referee / Assistant');
  populateSelect(document.getElementById('filterStatus'), STATUSES, 'All Statuses');
  populateSelect(document.getElementById('rfCategory'), CATEGORIES);
  populateSelect(document.getElementById('rfStatus'), STATUSES);

  renderRefereeGrid();

  document.getElementById('refSearch').addEventListener('input', renderRefereeGrid);
  document.getElementById('filterCategory').addEventListener('change', renderRefereeGrid);
  document.getElementById('filterType').addEventListener('change', renderRefereeGrid);
  document.getElementById('filterStatus').addEventListener('change', renderRefereeGrid);

  document.getElementById('openAddReferee').addEventListener('click', function () {
    document.getElementById('addRefereeForm').reset();
    openModal('addRefereeModal');
  });

  document.getElementById('submitAddReferee').addEventListener('click', function () {
    var name = document.getElementById('rfName').value.trim();
    var country = document.getElementById('rfCountry').value.trim();
    if (!name || !country) {
      showToast('Please fill in name and country.');
      return;
    }
    refchAddReferee({
      name: name,
      country: country,
      flag: document.getElementById('rfFlag').value.trim() || '🏳️',
      category: document.getElementById('rfCategory').value,
      refType: document.getElementById('rfType').value,
      age: parseInt(document.getElementById('rfAge').value, 10) || null,
      status: document.getElementById('rfStatus').value
    });
    closeModal('addRefereeModal');
    showToast('Referee "' + name + '" created.');
    renderRefereeGrid();
  });

  document.getElementById('rdAssignBtn').addEventListener('click', function () {
    var orgId = document.getElementById('rdOrgSelect').value;
    var role = document.getElementById('rdRoleSelect').value;
    if (!orgId || !role || !activeDetailRefereeId) return;
    var ok = refchAddMember(orgId, activeDetailRefereeId, role);
    if (ok) {
      showToast('Assigned to organization.');
      renderRefDetail(activeDetailRefereeId);
      renderRefereeGrid();
    } else {
      showToast('Already assigned with that role.');
    }
  });
});

function populateSelect(el, values, allLabel) {
  if (!el) return;
  if (allLabel) {
    el.innerHTML = '<option value="">' + allLabel + '</option>';
  } else {
    el.innerHTML = '';
  }
  values.forEach(function (v) {
    var opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    el.appendChild(opt);
  });
}

function renderRefereeGrid() {
  var q = (document.getElementById('refSearch').value || '').toLowerCase();
  var cat = document.getElementById('filterCategory').value;
  var type = document.getElementById('filterType').value;
  var status = document.getElementById('filterStatus').value;

  var list = refchState.referees.filter(function (r) {
    if (q && r.name.toLowerCase().indexOf(q) === -1 && r.country.toLowerCase().indexOf(q) === -1) return false;
    if (cat && r.category !== cat) return false;
    if (type && r.refType !== type) return false;
    if (status && r.status !== status) return false;
    return true;
  });

  document.getElementById('filterCount').textContent = list.length + ' referee' + (list.length === 1 ? '' : 's');

  var grid = document.getElementById('refereeGrid');

  if (list.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">' +
      '<div class="title">No referees match these filters</div>' +
      '<div class="sub">Try clearing a filter or add a new referee.</div>' +
      '</div>';
    return;
  }

  grid.innerHTML = list.map(function (r) {
    var orgs = refchOrgsForReferee(r.id);
    var orgChips = orgs.length
      ? orgs.map(function (o) {
          return '<span class="tag-pill" style="background:' + o.org.color + '22;color:' + o.org.color + '">' + o.org.code + '</span>';
        }).join('')
      : '<span class="empty-hint">No organization assigned</span>';

    var statusBadgeClass = r.status === 'Available' ? 'badge-good'
      : r.status === 'Injured' ? 'badge-critical'
      : (r.status === 'Modified Training' || r.status === 'Match Assigned') ? 'badge-warn'
      : 'badge-info';

    return '' +
      '<div class="referee-card" data-id="' + r.id + '">' +
        '<div class="referee-card-top">' +
          '<div class="avatar" style="background:' + r.color + '">' + refchInitials(r.name) + '</div>' +
          '<div>' +
            '<div class="referee-card-name">' + r.name + ' <span class="flag">' + r.flag + '</span></div>' +
            '<div class="referee-card-sub">' + r.country + (r.age ? ' · Age ' + r.age : '') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="referee-card-tags">' +
          '<span class="tag-pill cat">' + r.category + '</span>' +
          '<span class="tag-pill">' + r.refType + '</span>' +
          '<span class="badge ' + statusBadgeClass + '"><span class="badge-dot"></span>' + r.status + '</span>' +
        '</div>' +
        '<div class="referee-card-orgs">' + orgChips + '</div>' +
      '</div>';
  }).join('');

  grid.querySelectorAll('.referee-card').forEach(function (card) {
    card.addEventListener('click', function () {
      openRefDetail(card.getAttribute('data-id'));
    });
  });
}

function openRefDetail(id) {
  activeDetailRefereeId = id;
  renderRefDetail(id);
  openModal('refDetailModal');
}

function renderRefDetail(id) {
  var r = refchRefereeById(id);
  if (!r) return;

  document.getElementById('rdName').textContent = r.name + ' ' + r.flag;
  document.getElementById('rdMeta').textContent = r.country + ' · ' + r.category + ' · ' + r.refType + (r.age ? ' · Age ' + r.age : '');

  var orgs = refchOrgsForReferee(id);
  var listEl = document.getElementById('rdOrgList');

  if (orgs.length === 0) {
    listEl.innerHTML = '<div class="empty-state"><div class="title">Not assigned to any organization</div><div class="sub">Use the controls below to add this referee to one.</div></div>';
  } else {
    listEl.innerHTML = orgs.map(function (o) {
      var roleChips = o.roles.map(function (role) {
        return '<span class="role-chip">' +
          '<span class="dot" style="background:' + refchRoleColor(role) + '"></span>' +
          refchRoleLabel(role) +
          '<button class="rm" data-org="' + o.org.id + '" data-role="' + role + '" title="Remove role">×</button>' +
          '</span>';
      }).join('');
      return '<div class="org-assign-row">' +
        '<div class="org-badge" style="background:' + o.org.color + '">' + o.org.code + '</div>' +
        '<div class="org-info">' +
          '<div class="org-name">' + o.org.name + '</div>' +
          '<div class="org-roles">' + roleChips + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    listEl.querySelectorAll('.rm').forEach(function (btn) {
      btn.addEventListener('click', function () {
        refchRemoveMember(btn.getAttribute('data-org'), id, btn.getAttribute('data-role'));
        renderRefDetail(id);
        renderRefereeGrid();
        showToast('Role removed.');
      });
    });
  }

  var orgSelect = document.getElementById('rdOrgSelect');
  orgSelect.innerHTML = refchState.organizations.length
    ? refchState.organizations.map(function (o) { return '<option value="' + o.id + '">' + o.name + '</option>'; }).join('')
    : '<option value="">No organizations yet</option>';

  var roleSelect = document.getElementById('rdRoleSelect');
  roleSelect.innerHTML = ROLES.map(function (role) { return '<option value="' + role.id + '">' + role.label + '</option>'; }).join('');
}
