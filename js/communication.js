/* ============================================================
   REF CENTRAL HUB — Communication page
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  populateAudienceType();
  populateOrgAndRoleSelects();
  populateRefSelects();
  updateAudienceFields();
  updateAudiencePreview();
  renderKpis();
  renderMessageLog();

  document.getElementById('audienceType').addEventListener('change', function () {
    updateAudienceFields();
    updateAudiencePreview();
  });
  document.getElementById('audienceOrg').addEventListener('change', updateAudiencePreview);
  document.getElementById('audienceRole').addEventListener('change', updateAudiencePreview);
  document.getElementById('audienceRef').addEventListener('change', updateAudiencePreview);

  document.getElementById('submitCompose').addEventListener('click', function () {
    var subject = document.getElementById('composeSubject').value.trim();
    var body = document.getElementById('composeBody').value.trim();
    if (!subject || !body) {
      showToast('Please write a subject and message.');
      return;
    }
    var audienceType = document.getElementById('audienceType').value;
    var params = audienceParams(audienceType);
    var recipients = refchResolveAudience(audienceType, params);
    if (recipients.length === 0) {
      showToast('No recipients match that audience.');
      return;
    }
    refchSendMessage({ audienceType: audienceType, params: params, subject: subject, body: body });
    document.getElementById('composeForm').reset();
    updateAudienceFields();
    updateAudiencePreview();
    showToast('Sent to ' + recipients.length + ' recipient' + (recipients.length === 1 ? '' : 's') + '.');
    renderKpis();
    renderMessageLog();
  });

  document.getElementById('submitIncoming').addEventListener('click', function () {
    var refereeId = document.getElementById('incomingFrom').value;
    var subject = document.getElementById('incomingSubject').value.trim();
    var body = document.getElementById('incomingBody').value.trim();
    if (!refereeId || !subject || !body) {
      showToast('Please complete all fields.');
      return;
    }
    refchReceiveMessage({ refereeId: refereeId, subject: subject, body: body });
    document.getElementById('incomingForm').reset();
    showToast('Incoming message logged.');
    renderKpis();
    renderMessageLog();
  });

  document.getElementById('filterDirection').addEventListener('change', renderMessageLog);
  document.getElementById('filterRefMsg').addEventListener('change', renderMessageLog);
});

function populateAudienceType() {
  var sel = document.getElementById('audienceType');
  sel.innerHTML = AUDIENCE_TYPES.map(function (a) { return '<option value="' + a.id + '">' + a.label + '</option>'; }).join('');
}

function populateOrgAndRoleSelects() {
  var orgSel = document.getElementById('audienceOrg');
  orgSel.innerHTML = refchState.organizations.map(function (o) { return '<option value="' + o.id + '">' + o.name + '</option>'; }).join('');

  var roleSel = document.getElementById('audienceRole');
  roleSel.innerHTML = ROLES.map(function (r) { return '<option value="' + r.id + '">' + r.label + '</option>'; }).join('');
}

function populateRefSelects() {
  var options = refchState.referees.map(function (r) { return '<option value="' + r.id + '">' + r.name + '</option>'; }).join('');
  document.getElementById('audienceRef').innerHTML = options;

  var incomingOptions = refchState.referees.map(function (r) { return '<option value="' + r.id + '">' + r.name + ' (' + r.refType + ')</option>'; }).join('');
  document.getElementById('incomingFrom').innerHTML = incomingOptions;

  var filterOptions = refchState.referees.map(function (r) { return '<option value="' + r.id + '">' + r.name + '</option>'; }).join('');
  document.getElementById('filterRefMsg').insertAdjacentHTML('beforeend', filterOptions);
}

function updateAudienceFields() {
  var type = document.getElementById('audienceType').value;
  document.getElementById('audienceOrgWrap').style.display = (type === 'organization' || type === 'org_role') ? 'block' : 'none';
  document.getElementById('audienceRoleWrap').style.display = (type === 'org_role') ? 'block' : 'none';
  document.getElementById('audienceRefWrap').style.display = (type === 'individual') ? 'block' : 'none';
}

function audienceParams(type) {
  return {
    orgId: document.getElementById('audienceOrg').value,
    role: document.getElementById('audienceRole').value,
    refereeId: document.getElementById('audienceRef').value
  };
}

function updateAudiencePreview() {
  var type = document.getElementById('audienceType').value;
  var params = audienceParams(type);
  var recipients = refchResolveAudience(type, params);
  var el = document.getElementById('audiencePreview');

  if (recipients.length === 0) {
    el.className = 'audience-preview empty';
    el.textContent = 'No referees currently match this audience.';
    return;
  }

  el.className = 'audience-preview';
  var names = recipients.slice(0, 4).map(function (r) { return r.name; }).join(', ');
  var extra = recipients.length > 4 ? ' +' + (recipients.length - 4) + ' more' : '';
  el.textContent = recipients.length + ' recipient' + (recipients.length === 1 ? '' : 's') + ': ' + names + extra;
}

function renderKpis() {
  var msgs = refchState.messages;
  var sent = msgs.filter(function (m) { return m.direction === 'outgoing'; });
  var received = msgs.filter(function (m) { return m.direction === 'incoming'; });
  var uniqueReached = new Set();
  sent.forEach(function (m) { m.recipientIds.forEach(function (id) { uniqueReached.add(id); }); });

  var kpis = [
    { label: 'Messages Sent', value: sent.length },
    { label: 'Messages Received', value: received.length },
    { label: 'Referees Reached', value: uniqueReached.size },
    { label: 'Total Logged', value: msgs.length }
  ];
  document.getElementById('commKpis').innerHTML = kpis.map(function (k) {
    return '<div class="kpi-card"><div class="kpi-value tabular">' + k.value + '</div><div class="kpi-label">' + k.label + '</div></div>';
  }).join('');
}

function formatSentAt(iso) {
  var d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function renderMessageLog() {
  var direction = document.getElementById('filterDirection').value;
  var refFilter = document.getElementById('filterRefMsg').value;

  var list = refchMessagesFor({ direction: direction, refereeId: refFilter });
  document.getElementById('msgCount').textContent = list.length + ' message' + (list.length === 1 ? '' : 's');

  var body = document.getElementById('msgLogBody');
  if (list.length === 0) {
    body.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="title">No messages yet</div><div class="sub">Send a message or log an incoming one to get started.</div></div></td></tr>';
    return;
  }

  body.innerHTML = list.map(function (m) {
    var directionHtml = m.direction === 'outgoing'
      ? '<span class="direction-badge out">Sent</span>'
      : '<span class="direction-badge in">Received</span>';

    var fromTo;
    var recipientsText;
    if (m.direction === 'outgoing') {
      fromTo = m.audienceLabel;
      recipientsText = m.recipientIds.length;
    } else {
      var sender = refchRefereeById(m.senderId);
      fromTo = (sender ? sender.name : 'Unknown') + ' → ' + m.audienceLabel;
      recipientsText = '—';
    }

    return '<tr>' +
      '<td>' + directionHtml + '</td>' +
      '<td>' + fromTo + '</td>' +
      '<td>' + m.subject + '</td>' +
      '<td class="tabular">' + recipientsText + '</td>' +
      '<td class="tabular">' + formatSentAt(m.sentAt) + '</td>' +
    '</tr>';
  }).join('');
}
