/* ============================================================
   REF CENTRAL HUB — Training Files
   ============================================================ */

var TF_TABS = [
  { id: 'hrm', label: 'HRM files', icon: 'heart' },
  { id: 'gps', label: 'GPS files', icon: 'pin' },
  { id: 'epts', label: 'EPTS files', icon: 'chip' },
  { id: 'upload', label: 'Upload', icon: 'upload' },
  { id: 'imports', label: 'Imports', icon: 'import' }
];

var tfActiveTab = 'hrm';
var tfPage = 1;
var tfPageSize = 25;
var tfSelectedFile = null;

document.addEventListener('DOMContentLoaded', function () {
  renderTfTabs();
  populateTfFilters();
  populateTfUploadForm();
  setDefaultDateRange();
  renderTfPanel();

  document.getElementById('tfFilterBtn').addEventListener('click', function () { tfPage = 1; renderTfPanel(); });
  document.getElementById('tfResetBtn').addEventListener('click', function () {
    setDefaultDateRange();
    document.getElementById('tfStatus').value = 'All';
    tfPage = 1;
    renderTfPanel();
  });

  document.getElementById('tfPrevBtn').addEventListener('click', function () { if (tfPage > 1) { tfPage--; renderTfPanel(); } });
  document.getElementById('tfNextBtn').addEventListener('click', function () { tfPage++; renderTfPanel(); });
  document.getElementById('tfPageSize').addEventListener('change', function () {
    tfPageSize = parseInt(this.value, 10);
    tfPage = 1;
    renderTfPanel();
  });

  var dropzone = document.getElementById('tfDropzone');
  var fileInput = document.getElementById('tfFileInput');
  dropzone.addEventListener('click', function () { fileInput.click(); });
  dropzone.addEventListener('dragover', function (e) { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', function () { dropzone.classList.remove('drag-over'); });
  dropzone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) handleTfFileChosen(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', function () { if (fileInput.files.length) handleTfFileChosen(fileInput.files[0]); });

  document.getElementById('tfUploadBtn').addEventListener('click', uploadTfFile);
});

function setDefaultDateRange() {
  var to = new Date();
  var from = new Date();
  from.setMonth(from.getMonth() - 6);
  document.getElementById('tfDateFrom').value = from.toISOString().slice(0, 10);
  document.getElementById('tfDateTo').value = to.toISOString().slice(0, 10);
}

function renderTfTabs() {
  document.getElementById('tfTabs').innerHTML = TF_TABS.map(function (t) {
    return '<button class="tf-tab' + (t.id === tfActiveTab ? ' active' : '') + '" data-tab="' + t.id + '">' + tfTabIcon(t.icon) + '<span data-i18n="' + tfTabI18nKey(t.id) + '">' + t.label + '</span></button>';
  }).join('');

  document.querySelectorAll('.tf-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      tfActiveTab = btn.getAttribute('data-tab');
      tfPage = 1;
      renderTfTabs();
      renderTfPanel();
    });
  });

  if (typeof refchApplyTranslations === 'function') refchApplyTranslations(refchGetLanguage());
}

function tfTabI18nKey(id) {
  return { hrm: 'tab_hrm_files', gps: 'tab_gps_files', epts: 'tab_epts_files', upload: 'tab_upload', imports: 'tab_imports' }[id];
}

function tfTabIcon(name) {
  var icons = {
    heart: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>',
    pin: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    chip: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>',
    upload: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M12 3l-4 4M12 3l4 4"/><path d="M4 15v4a2 2 0 002 2h12a2 2 0 002-2v-4"/></svg>',
    import: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>'
  };
  return icons[name] || '';
}

function populateTfFilters() {
  var sel = document.getElementById('tfStatus');
  sel.innerHTML = '<option value="All">All</option>' + FILE_STATUS_OPTIONS.map(function (s) { return '<option value="' + s + '">' + s + '</option>'; }).join('');
}

function populateTfUploadForm() {
  document.getElementById('tfUploadReferee').innerHTML = refchState.referees.map(function (r) { return '<option value="' + r.id + '">' + r.name + '</option>'; }).join('');
  document.getElementById('tfUploadType').innerHTML = TRAINING_FILE_TYPES.map(function (t) { return '<option value="' + t.id + '">' + t.label + '</option>'; }).join('');
  document.getElementById('tfUploadDate').value = new Date().toISOString().slice(0, 10);
}

function renderTfPanel() {
  var isFileTab = tfActiveTab === 'hrm' || tfActiveTab === 'gps' || tfActiveTab === 'epts';
  document.getElementById('tfFilterCard').style.display = isFileTab ? 'block' : 'none';
  document.getElementById('tfResultsPanel').style.display = isFileTab ? 'block' : 'none';
  document.getElementById('tfUploadPanel').style.display = tfActiveTab === 'upload' ? 'block' : 'none';
  document.getElementById('tfImportsPanel').style.display = tfActiveTab === 'imports' ? 'block' : 'none';

  if (isFileTab) renderTfResults();
  if (tfActiveTab === 'imports') renderTfImports();
}

function renderTfResults() {
  var filters = {
    dateFrom: document.getElementById('tfDateFrom').value,
    dateTo: document.getElementById('tfDateTo').value,
    status: document.getElementById('tfStatus').value
  };
  var all = refchTrainingFilesFor(tfActiveTab, filters);
  var total = all.length;
  var totalPages = Math.max(1, Math.ceil(total / tfPageSize));
  if (tfPage > totalPages) tfPage = totalPages;
  var start = (tfPage - 1) * tfPageSize;
  var pageItems = all.slice(start, start + tfPageSize);

  var body = document.getElementById('tfResultsBody');
  if (total === 0) {
    body.innerHTML = '<div class="tf-empty"><div class="tf-empty-box"><div class="title" data-i18n="msg_no_results_title">No results!</div><div class="sub" data-i18n="msg_no_results_sub">Unfortunately no results could be found to your search.</div></div></div>';
  } else {
    body.innerHTML = pageItems.map(function (f) {
      var ref = refchRefereeById(f.refereeId);
      var statusClass = f.status === 'Processed' ? 'badge-good' : f.status === 'Pending' ? 'badge-warn' : 'badge-critical';
      return '<div class="tf-file-row">' +
        '<div class="tf-file-icon">' + tfTypeIcon(f.type) + '</div>' +
        '<div class="tf-file-info">' +
          '<div class="tf-file-name">' + f.filename + '</div>' +
          '<div class="tf-file-meta">' + (ref ? ref.name : 'Unknown') + ' · Session ' + f.sessionDate + ' · ' + refchFormatBytes(f.fileSize) + '</div>' +
        '</div>' +
        '<span class="tf-file-source">' + f.source + '</span>' +
        '<span class="badge ' + statusClass + '"><span class="badge-dot"></span>' + f.status + '</span>' +
        '<div class="tf-file-actions">' +
          '<button class="tf-download" data-id="' + f.id + '" title="Download"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M12 15l-4-4M12 15l4-4"/><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg></button>' +
          '<button class="tf-delete" data-id="' + f.id + '" title="Delete"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0l-1 14a1 1 0 01-1 1H7a1 1 0 01-1-1L5 6"/></svg></button>' +
        '</div>' +
      '</div>';
    }).join('');

    body.querySelectorAll('.tf-download').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        var f = refchState.trainingFiles.filter(function (x) { return x.id === id; })[0];
        idbGetFile('tfile_' + id).then(function (blob) {
          if (!blob) { showToast('No stored file data for this demo record.'); return; }
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url; a.download = f.filename;
          document.body.appendChild(a); a.click(); a.remove();
          URL.revokeObjectURL(url);
        });
      });
    });
    body.querySelectorAll('.tf-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        refchRemoveTrainingFile(id);
        idbDeleteFile('tfile_' + id);
        showToast('File deleted.');
        renderTfResults();
      });
    });
  }

  var showingEl = document.getElementById('tfShowing');
  var rangeStart = total === 0 ? 0 : start + 1;
  var rangeEnd = Math.min(start + tfPageSize, total);
  showingEl.innerHTML = '<span data-i18n="label_showing">Showing</span> ' + rangeStart + ' - ' + rangeEnd + ' of ' + total;
  document.getElementById('tfPrevBtn').disabled = tfPage <= 1;
  document.getElementById('tfNextBtn').disabled = tfPage >= totalPages;

  if (typeof refchApplyTranslations === 'function') refchApplyTranslations(refchGetLanguage());
}

function tfTypeIcon(type) {
  if (type === 'hrm') return tfTabIcon('heart');
  if (type === 'gps') return tfTabIcon('pin');
  return tfTabIcon('chip');
}

function renderTfImports() {
  var files = refchState.trainingFiles;
  var bySource = {};
  files.forEach(function (f) {
    var key = f.source;
    if (!bySource[key]) bySource[key] = { source: key, count: 0, lastDate: f.uploadedAt };
    bySource[key].count++;
    if (f.uploadedAt > bySource[key].lastDate) bySource[key].lastDate = f.uploadedAt;
  });
  var batches = Object.keys(bySource).map(function (k) { return bySource[k]; }).sort(function (a, b) { return a.lastDate < b.lastDate ? 1 : -1; });

  var body = document.getElementById('tfImportsBody');
  if (batches.length === 0) {
    body.innerHTML = '<div class="empty-state"><div class="title">No imports yet</div><div class="sub">Upload a file or connect an integration in Settings to see import batches here.</div></div>';
    return;
  }
  body.innerHTML = batches.map(function (b) {
    var when = new Date(b.lastDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return '<div class="tf-import-row"><span class="badge badge-info"><span class="badge-dot"></span>' + b.source + '</span>' +
      '<span style="font-size:13px;font-weight:600;">' + b.count + ' file' + (b.count === 1 ? '' : 's') + '</span>' +
      '<span style="margin-left:auto;font-size:12px;color:var(--text-400);font-weight:600;">Last: ' + when + '</span></div>';
  }).join('');
}

/* ---------------- Upload ---------------- */

function handleTfFileChosen(file) {
  tfSelectedFile = file;
  var box = document.getElementById('tfSelectedFile');
  box.style.display = 'flex';
  box.innerHTML = '<span class="name">' + file.name + '</span><span class="size tabular">' + refchFormatBytes(file.size) + '</span>';
  document.getElementById('tfUploadBtn').disabled = false;

  var ext = file.name.split('.').pop().toLowerCase();
  var typeSel = document.getElementById('tfUploadType');
  if (ext === 'hrm') typeSel.value = 'hrm';
  else if (ext === 'fit' || ext === 'tcx' || ext === 'gpx') typeSel.value = 'gps';
}

function uploadTfFile() {
  if (!tfSelectedFile) return;
  var id = refchUid('tf');
  idbPutFile('tfile_' + id, tfSelectedFile).then(function () {
    var file = refchAddTrainingFile({
      id: id,
      refereeId: document.getElementById('tfUploadReferee').value,
      type: document.getElementById('tfUploadType').value,
      filename: tfSelectedFile.name,
      sessionDate: document.getElementById('tfUploadDate').value,
      fileSize: tfSelectedFile.size,
      source: document.getElementById('tfUploadSource').value.trim() || 'Manual Upload'
    });
    showToast('File uploaded.');
    tfSelectedFile = null;
    document.getElementById('tfFileInput').value = '';
    document.getElementById('tfSelectedFile').style.display = 'none';
    document.getElementById('tfUploadBtn').disabled = true;
    tfActiveTab = file.type;
    tfPage = 1;
    renderTfTabs();
    renderTfPanel();
  });
}
