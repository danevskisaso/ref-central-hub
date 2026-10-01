/* ============================================================
   REF CENTRAL HUB — Settings page
   ============================================================ */

var SETTINGS_TABS = [
  { id: 'integrations', label: 'Integrations' },
  { id: 'personal', label: 'Personal' },
  { id: 'organization', label: 'Organization' },
  { id: 'security', label: 'Security' }
];

var MORE_INTEGRATIONS = ['Garmin', 'Catapult', 'STATSports', 'VALD', 'TrainingPeaks'];

var activeSettingsTab = 'integrations';

document.addEventListener('DOMContentLoaded', function () {
  renderTabs();
  renderPolar();
  renderMoreIntegrations();
  renderNotificationToggles();
  renderOrgList();
  renderAuditLog();

  document.getElementById('connectPolarBtn').addEventListener('click', function () {
    var clientId = document.getElementById('polarClientId').value.trim() || 'uefa-refcentralhub-demo';
    refchConnectPolar(clientId);
    showToast('Polar account connected.');
    renderPolar();
    renderAuditLog();
  });

  document.getElementById('disconnectPolarBtn').addEventListener('click', function () {
    refchDisconnectPolar();
    showToast('Polar account disconnected.');
    renderPolar();
  });

  document.getElementById('syncPolarBtn').addEventListener('click', function () {
    var refereeId = document.getElementById('polarSyncReferee').value;
    var session = refchSyncPolarNow(refereeId);
    if (session) {
      var ref = refchRefereeById(refereeId);
      showToast('Synced 1 new session for ' + (ref ? ref.name : 'referee') + ' from Polar.');
      renderPolar();
      renderAuditLog();
    }
  });
});

function renderTabs() {
  document.getElementById('settingsTabs').innerHTML = SETTINGS_TABS.map(function (t) {
    return '<button class="doc-tab' + (t.id === activeSettingsTab ? ' active' : '') + '" data-tab="' + t.id + '">' + t.label + '</button>';
  }).join('');

  document.querySelectorAll('.doc-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeSettingsTab = btn.getAttribute('data-tab');
      renderTabs();
      SETTINGS_TABS.forEach(function (t) {
        document.getElementById('panel-' + t.id).style.display = t.id === activeSettingsTab ? 'block' : 'none';
      });
    });
  });
}

function renderPolar() {
  var polar = refchState.integrations.polar;
  var badge = document.getElementById('polarStatusBadge');

  if (polar.connected) {
    badge.className = 'badge badge-good';
    badge.innerHTML = '<span class="badge-dot"></span>Connected';
    document.getElementById('polarDisconnected').style.display = 'none';
    document.getElementById('polarConnected').style.display = 'block';
    document.getElementById('polarClientIdValue').textContent = polar.clientId;
    document.getElementById('polarLastSync').textContent = polar.lastSync ? new Date(polar.lastSync).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never';

    var sel = document.getElementById('polarSyncReferee');
    if (!sel.options.length) {
      sel.innerHTML = refchState.referees.map(function (r) { return '<option value="' + r.id + '">' + r.name + '</option>'; }).join('');
    }
  } else {
    badge.className = 'badge badge-neutral';
    badge.innerHTML = '<span class="badge-dot"></span>Not Connected';
    document.getElementById('polarDisconnected').style.display = 'block';
    document.getElementById('polarConnected').style.display = 'none';
  }
}

function renderMoreIntegrations() {
  document.getElementById('moreIntegrations').innerHTML = MORE_INTEGRATIONS.map(function (name) {
    return '<div class="integration-card">' +
      '<div class="ic-badge">' + name.slice(0, 2).toUpperCase() + '</div>' +
      '<div class="ic-name">' + name + '</div>' +
      '<div class="ic-status">Coming Soon</div>' +
    '</div>';
  }).join('');
}

var NOTIF_DEFS = [
  { key: 'matchAssignments', label: 'Match Assignments', sub: 'New match assignments and changes' },
  { key: 'trainingReminders', label: 'Training Reminders', sub: 'Upcoming sessions and missed training' },
  { key: 'alerts', label: 'Signals & Alerts', sub: 'Load, wellness and injury-risk alerts' },
  { key: 'weeklyDigest', label: 'Weekly Digest', sub: 'Summary email every Monday morning' }
];

function renderNotificationToggles() {
  var prefs = refchState.notificationPrefs;
  document.getElementById('notifToggles').innerHTML = NOTIF_DEFS.map(function (n) {
    return '<div class="toggle-row">' +
      '<div><div class="toggle-row-label">' + n.label + '</div><div class="toggle-row-sub">' + n.sub + '</div></div>' +
      '<label class="switch"><input type="checkbox" data-key="' + n.key + '" ' + (prefs[n.key] ? 'checked' : '') + '><span class="switch-track"></span></label>' +
    '</div>';
  }).join('');

  document.querySelectorAll('#notifToggles input[type="checkbox"]').forEach(function (input) {
    input.addEventListener('change', function () {
      refchSetNotificationPref(input.getAttribute('data-key'), input.checked);
      showToast('Preference saved.');
    });
  });
}

function renderOrgList() {
  var el = document.getElementById('orgSettingsList');
  if (refchState.organizations.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="title">No organizations yet</div><div class="sub">Create one from the Organizations page.</div></div>';
    return;
  }
  el.innerHTML = refchState.organizations.map(function (o) {
    var memberCount = new Set(o.members.map(function (m) { return m.refereeId; })).size;
    return '<div class="org-settings-row">' +
      '<div class="org-settings-swatch" style="background:' + o.color + '"></div>' +
      '<div><div class="org-settings-name">' + o.name + '</div><div class="org-settings-sub">' + o.country + ' · ' + memberCount + ' member' + (memberCount === 1 ? '' : 's') + '</div></div>' +
    '</div>';
  }).join('');
}

function renderAuditLog() {
  var entries = refchAuditLog().slice(0, 40);
  var el = document.getElementById('auditList');
  if (entries.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="title">No activity yet</div><div class="sub">Actions across the platform will appear here.</div></div>';
    return;
  }
  el.innerHTML = entries.map(function (e) {
    var d = new Date(e.timestamp);
    var when = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return '<div class="audit-row"><span class="audit-time tabular">' + when + '</span><span class="audit-text">' + e.text + '</span></div>';
  }).join('');
}
