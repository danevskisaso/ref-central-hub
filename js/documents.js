/* ============================================================
   REF CENTRAL HUB — Documents page
   Files are stored in IndexedDB (this browser only) via the shared
   idb* helpers in app.js. Metadata (name, type, size, sharing) lives
   in the regular refchState.
   ============================================================ */

var selectedFile = null;
var activeDocTab = 'all';

document.addEventListener('DOMContentLoaded', function () {
  populateShareType();
  populateOrgRoleRefSelects();
  populateFileTypeFilter();
  renderTabs();
  updateShareFields();
  updateSharePreview();
  renderKpis();
  renderDocList();

  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');

  dropzone.addEventListener('click', function () { fileInput.click(); });
  dropzone.addEventListener('dragover', function (e) { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', function () { dropzone.classList.remove('drag-over'); });
  dropzone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) handleFileChosen(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', function () {
    if (fileInput.files.length) handleFileChosen(fileInput.files[0]);
  });

  document.getElementById('shareType').addEventListener('change', function () {
    updateShareFields();
    updateSharePreview();
  });
  document.getElementById('shareOrg').addEventListener('change', updateSharePreview);
  document.getElementById('shareRole').addEventListener('change', updateSharePreview);
  document.getElementById('shareRef').addEventListener('change', updateSharePreview);

  document.getElementById('uploadBtn').addEventListener('click', function () {
    if (!selectedFile) return;
    var fileType = refchDetectFileType(selectedFile.name);
    var id = refchUid('doc');
    var shareType = document.getElementById('shareType').value;
    var params = shareParams();

    idbPutFile(id, selectedFile).then(function () {
      refchAddDocument({ id: id, name: selectedFile.name, fileType: fileType, sizeBytes: selectedFile.size, shareType: shareType, shareParams: params });
      showToast('Uploaded and shared.');
      resetUploadForm();
      renderKpis();
      renderDocList();
    }).catch(function (err) {
      showToast('Upload failed: ' + (err && err.message ? err.message : 'storage error'));
    });
  });

  document.getElementById('docSearch').addEventListener('input', renderDocList);
  document.getElementById('filterFileType').addEventListener('change', renderDocList);
});

function handleFileChosen(file) {
  var fileType = refchDetectFileType(file.name);
  if (!fileType) {
    showToast('Unsupported file type. Please choose a PDF, JPEG, Excel or Word file.');
    return;
  }
  selectedFile = file;
  var box = document.getElementById('selectedFile');
  box.style.display = 'flex';
  box.innerHTML = '<span class="name">' + file.name + '</span><span class="size tabular">' + refchFormatBytes(file.size) + '</span>';
  document.getElementById('uploadBtn').disabled = false;
}

function resetUploadForm() {
  selectedFile = null;
  document.getElementById('fileInput').value = '';
  document.getElementById('selectedFile').style.display = 'none';
  document.getElementById('uploadBtn').disabled = true;
}

function populateShareType() {
  document.getElementById('shareType').innerHTML = DOC_SHARE_TYPES.map(function (t) {
    return '<option value="' + t.id + '">' + t.label + '</option>';
  }).join('');
}

function populateOrgRoleRefSelects() {
  document.getElementById('shareOrg').innerHTML = refchState.organizations.map(function (o) { return '<option value="' + o.id + '">' + o.name + '</option>'; }).join('');
  document.getElementById('shareRole').innerHTML = ROLES.map(function (r) { return '<option value="' + r.id + '">' + r.label + '</option>'; }).join('');
  document.getElementById('shareRef').innerHTML = refchState.referees.map(function (r) { return '<option value="' + r.id + '">' + r.name + '</option>'; }).join('');
}

function populateFileTypeFilter() {
  var sel = document.getElementById('filterFileType');
  DOCUMENT_TYPES.forEach(function (t) {
    var opt = document.createElement('option');
    opt.value = t.id; opt.textContent = t.label;
    sel.appendChild(opt);
  });
}

function updateShareFields() {
  var type = document.getElementById('shareType').value;
  document.getElementById('shareOrgWrap').style.display = (type === 'organization' || type === 'org_role') ? 'block' : 'none';
  document.getElementById('shareRoleWrap').style.display = (type === 'org_role') ? 'block' : 'none';
  document.getElementById('shareRefWrap').style.display = (type === 'individual') ? 'block' : 'none';
}

function shareParams() {
  return {
    orgId: document.getElementById('shareOrg').value,
    role: document.getElementById('shareRole').value,
    refereeId: document.getElementById('shareRef').value
  };
}

function updateSharePreview() {
  var type = document.getElementById('shareType').value;
  var el = document.getElementById('sharePreview');

  if (type === 'library') {
    el.className = 'audience-preview';
    el.textContent = 'Visible to everyone in the General Library (' + refchState.referees.length + ' referees today).';
    return;
  }

  var recipients = refchResolveAudience(type, shareParams());
  if (recipients.length === 0) {
    el.className = 'audience-preview empty';
    el.textContent = 'No referees currently match this audience.';
    return;
  }
  el.className = 'audience-preview';
  var names = recipients.slice(0, 4).map(function (r) { return r.name; }).join(', ');
  var extra = recipients.length > 4 ? ' +' + (recipients.length - 4) + ' more' : '';
  el.textContent = 'Shared with ' + recipients.length + ': ' + names + extra;
}

function renderTabs() {
  var tabs = [{ id: 'all', label: 'All Documents' }, { id: 'library', label: 'General Library' }];
  document.getElementById('docTabs').innerHTML = tabs.map(function (t) {
    return '<button class="doc-tab' + (t.id === activeDocTab ? ' active' : '') + '" data-tab="' + t.id + '">' + t.label + '</button>';
  }).join('');
  document.querySelectorAll('.doc-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeDocTab = btn.getAttribute('data-tab');
      document.getElementById('docListTitle').textContent = activeDocTab === 'library' ? 'General Library' : 'All Documents';
      renderTabs();
      renderDocList();
    });
  });
}

function renderKpis() {
  var docs = refchState.documents;
  var libraryCount = docs.filter(function (d) { return d.shareType === 'library'; }).length;
  var totalBytes = docs.reduce(function (sum, d) { return sum + d.sizeBytes; }, 0);
  var weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  var thisWeek = docs.filter(function (d) { return new Date(d.uploadedAt) >= weekAgo; }).length;

  var kpis = [
    { label: 'Total Documents', value: docs.length },
    { label: 'In General Library', value: libraryCount },
    { label: 'Storage Used', value: refchFormatBytes(totalBytes) },
    { label: 'Uploaded This Week', value: thisWeek }
  ];
  document.getElementById('docKpis').innerHTML = kpis.map(function (k) {
    return '<div class="kpi-card"><div class="kpi-value tabular">' + k.value + '</div><div class="kpi-label">' + k.label + '</div></div>';
  }).join('');
}

function renderDocList() {
  var query = document.getElementById('docSearch').value;
  var fileType = document.getElementById('filterFileType').value;
  var list = refchDocumentsFor({ query: query, fileType: fileType, libraryOnly: activeDocTab === 'library' });

  document.getElementById('docCount').textContent = list.length + ' document' + (list.length === 1 ? '' : 's');

  var container = document.getElementById('docList');
  if (list.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="title">No documents here yet</div><div class="sub">Upload a PDF, JPEG, Excel or Word file to get started.</div></div>';
    return;
  }

  container.innerHTML = list.map(function (d) {
    var typeDef = refchDocTypeById(d.fileType);
    var shareLabel = refchDocShareLabel(d.shareType, d.shareParams);
    var shareClass = d.shareType === 'library' ? 'doc-share library' : 'doc-share';
    var uploadedStr = new Date(d.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return '<div class="doc-row">' +
      '<div class="doc-icon" style="background:' + (typeDef ? typeDef.color : '#97A5B3') + '">' + d.fileType.slice(0, 3).toUpperCase() + '</div>' +
      '<div class="doc-info">' +
        '<div class="doc-name">' + d.name + '</div>' +
        '<div class="doc-meta">' + refchFormatBytes(d.sizeBytes) + ' · Uploaded ' + uploadedStr + '</div>' +
      '</div>' +
      '<span class="' + shareClass + '">' + shareLabel + '</span>' +
      '<div class="doc-actions">' +
        '<button class="doc-download" data-id="' + d.id + '" title="Download"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M12 15l-4-4M12 15l4-4"/><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg></button>' +
        '<button class="doc-delete" data-id="' + d.id + '" title="Delete"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0l-1 14a1 1 0 01-1 1H7a1 1 0 01-1-1L5 6"/></svg></button>' +
      '</div>' +
    '</div>';
  }).join('');

  container.querySelectorAll('.doc-download').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-id');
      var doc = refchState.documents.filter(function (d) { return d.id === id; })[0];
      idbGetFile(id).then(function (blob) {
        if (!blob) {
          showToast('File data not found for this document.');
          return;
        }
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = doc ? doc.name : 'download';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }).catch(function () { showToast('Could not read file from storage.'); });
    });
  });

  container.querySelectorAll('.doc-delete').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-id');
      idbDeleteFile(id).then(function () {
        refchRemoveDocumentMeta(id);
        showToast('Document removed.');
        renderKpis();
        renderDocList();
      });
    });
  });
}
