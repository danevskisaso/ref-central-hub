/* ============================================================
   REF CENTRAL HUB — Drills (field picker + canvas editor + generator)
   ============================================================ */

var DRAW_COLOR_PRESETS = ['#E63946', '#FFC928', '#18A558', '#1473E6', '#15212D', '#FFFFFF'];

var editingDrillId = null;     // set when re-opening a saved drill
var teamsList = [];
var selectedFieldType = null;
var selectedBackground = 'green';
var selectedPerspective = true;

var activeTool = 'select';
var currentColor = DRAW_COLOR_PRESETS[0];
var armedIcon = null;          // { kind: 'equipment'|'figure'|'pin', id, number }
var elements = [];
var selectedElId = null;
var undoStack = [];
var redoStack = [];
var isDrawing = false;
var drawStart = null;
var drawingElId = null;
var activeEditorTab = 'pins';

document.addEventListener('DOMContentLoaded', function () {
  renderDrillGrid();
  renderFieldGrid();
  populateGeneratorForm();

  document.getElementById('drillSearchPlayer').addEventListener('input', renderDrillGrid);
  document.getElementById('onlyMyDrills').addEventListener('change', renderDrillGrid);

  document.getElementById('openCreateDrill').addEventListener('click', function () {
    resetCreateFlow();
    openModal('createDrillModal');
  });

  document.getElementById('bgGreenBtn').addEventListener('click', function () { setBackground('green'); });
  document.getElementById('bgWhiteBtn').addEventListener('click', function () { setBackground('white'); });
  document.getElementById('perspectiveToggle').addEventListener('change', function () {
    selectedPerspective = this.checked;
    renderFieldGrid();
  });

  document.getElementById('teamsInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && this.value.trim()) {
      e.preventDefault();
      teamsList.push(this.value.trim());
      this.value = '';
      renderTeamsChips();
    }
  });

  document.getElementById('createDrillBtn').addEventListener('click', function () {
    if (!selectedFieldType) return;
    elements = [];
    undoStack = []; redoStack = [];
    selectedElId = null;
    document.getElementById('drillStep1').style.display = 'none';
    document.getElementById('drillStep2').style.display = 'block';
    initEditor();
  });

  initEditorToolbar();
  initEditorTabs();

  document.getElementById('saveDrillBtn').addEventListener('click', saveDrill);

  document.getElementById('openGenerator').addEventListener('click', function () {
    document.getElementById('generatorResult').style.display = 'none';
    openModal('generatorModal');
  });
  document.getElementById('runGeneratorBtn').addEventListener('click', runGenerator);
  document.getElementById('genSaveSessionBtn').addEventListener('click', saveGeneratedSession);
  document.getElementById('genAddCalendarBtn').addEventListener('click', saveGeneratedToCalendar);
});

/* ================= LIST PAGE ================= */

function renderDrillGrid() {
  var q = document.getElementById('drillSearchPlayer').value;
  var list = refchDrillsFor({ query: q });

  var grid = document.getElementById('drillGrid');
  if (list.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1; padding:80px 20px;"><div class="title">No drills created</div><div class="sub">Click "Create new drill" to design your first one.</div></div>';
    return;
  }

  grid.innerHTML = list.map(function (d) {
    var teamsHtml = d.teams.slice(0, 3).map(function (t) { return '<span class="tag-pill">' + t + '</span>'; }).join('');
    return '<div class="drill-card" data-id="' + d.id + '">' +
      '<svg class="drill-card-thumb" viewBox="0 0 900 560" preserveAspectRatio="xMidYMid slice">' + renderThumbSvg(d) + '</svg>' +
      '<div class="drill-card-body">' +
        '<div class="drill-card-name">' + d.name + '</div>' +
        '<div class="drill-card-meta">' + d.createdBy + ' · ' + new Date(d.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + '</div>' +
        '<div class="drill-card-teams">' + teamsHtml + '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  grid.querySelectorAll('.drill-card').forEach(function (card) {
    card.addEventListener('click', function () { openDrillForEdit(card.getAttribute('data-id')); });
  });
}

function renderThumbSvg(d) {
  return pitchMarkupFor(d.fieldType, d.background) + (d.elements || []).map(renderElementMarkup).join('');
}

function openDrillForEdit(id) {
  var d = refchState.drills.filter(function (x) { return x.id === id; })[0];
  if (!d) return;
  editingDrillId = id;
  teamsList = d.teams.slice();
  selectedFieldType = d.fieldType;
  selectedBackground = d.background;
  selectedPerspective = d.perspective;
  elements = JSON.parse(JSON.stringify(d.elements));
  undoStack = []; redoStack = []; selectedElId = null;

  openModal('createDrillModal');
  document.getElementById('drillStep1').style.display = 'none';
  document.getElementById('drillStep2').style.display = 'block';
  initEditor();
}

/* ================= STEP 1: TEAMS + FIELD ================= */

function resetCreateFlow() {
  editingDrillId = null;
  teamsList = [];
  selectedFieldType = null;
  selectedBackground = 'green';
  selectedPerspective = true;
  document.getElementById('teamsInput').value = '';
  renderTeamsChips();
  document.getElementById('bgGreenBtn').classList.add('active');
  document.getElementById('bgWhiteBtn').classList.remove('active');
  document.getElementById('perspectiveToggle').checked = true;
  document.getElementById('createDrillBtn').disabled = true;
  document.getElementById('drillStep1').style.display = 'block';
  document.getElementById('drillStep2').style.display = 'none';
  renderFieldGrid();
}

function renderTeamsChips() {
  var wrap = document.getElementById('teamsTagInput');
  var input = document.getElementById('teamsInput');
  wrap.querySelectorAll('.tag-chip').forEach(function (c) { c.remove(); });
  teamsList.forEach(function (t, i) {
    var chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.innerHTML = t + ' <button type="button">×</button>';
    chip.querySelector('button').addEventListener('click', function () { teamsList.splice(i, 1); renderTeamsChips(); });
    wrap.insertBefore(chip, input);
  });
}

function setBackground(bg) {
  selectedBackground = bg;
  document.getElementById('bgGreenBtn').classList.toggle('active', bg === 'green');
  document.getElementById('bgWhiteBtn').classList.toggle('active', bg === 'white');
  renderFieldGrid();
}

function renderFieldGrid() {
  var grid = document.getElementById('fieldGrid');
  grid.innerHTML = DRILL_FIELD_TYPES.map(function (f) {
    var selected = f.id === selectedFieldType;
    var style = selectedPerspective ? ' style="transform:perspective(500px) rotateX(28deg); transform-origin:center bottom;"' : '';
    return '<div class="field-card' + (selected ? ' selected' : '') + '" data-field="' + f.id + '">' +
      '<svg viewBox="0 0 160 120"' + style + '>' + pitchMarkupFor(f.id, selectedBackground) + '</svg>' +
    '</div>';
  }).join('');

  grid.querySelectorAll('.field-card').forEach(function (card) {
    card.addEventListener('click', function () {
      selectedFieldType = card.getAttribute('data-field');
      document.getElementById('createDrillBtn').disabled = false;
      renderFieldGrid();
    });
  });
}

/* ================= PITCH RENDERING ================= */

function pitchMarkupFor(fieldType, background) {
  var line = background === 'white' ? '#9AA5B1' : '#FFFFFF';
  var fill = background === 'white' ? '#FFFFFF' : '#2E7D4F';
  var stripe = background === 'white' ? '#F4F7FA' : '#35894F';
  var W = 900, H = 560;
  var sw = 3;

  var bg = '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="' + fill + '"/>';
  var stripes = '';
  for (var i = 0; i < 10; i++) {
    if (i % 2 === 0) stripes += '<rect x="' + (i * W / 10) + '" y="0" width="' + (W / 10) + '" height="' + H + '" fill="' + stripe + '"/>';
  }

  var lines = '';
  switch (fieldType) {
    case 'full':
      lines = '<rect x="20" y="20" width="' + (W - 40) + '" height="' + (H - 40) + '" fill="none" stroke="' + line + '" stroke-width="' + sw + '"/>' +
        '<line x1="' + (W / 2) + '" y1="20" x2="' + (W / 2) + '" y2="' + (H - 20) + '" stroke="' + line + '" stroke-width="' + sw + '"/>' +
        '<circle cx="' + (W / 2) + '" cy="' + (H / 2) + '" r="70" fill="none" stroke="' + line + '" stroke-width="' + sw + '"/>' +
        '<rect x="20" y="' + (H / 2 - 110) + '" width="130" height="220" fill="none" stroke="' + line + '" stroke-width="' + sw + '"/>' +
        '<rect x="' + (W - 150) + '" y="' + (H / 2 - 110) + '" width="130" height="220" fill="none" stroke="' + line + '" stroke-width="' + sw + '"/>';
      break;
    case 'half_h':
      lines = '<rect x="20" y="20" width="' + (W - 40) + '" height="' + (H - 40) + '" fill="none" stroke="' + line + '" stroke-width="' + sw + '"/>' +
        '<path d="M' + (W - 20) + ' 20 A200 200 0 010 ' + (W - 20) + ' ' + (H - 20) + '" fill="none" stroke="' + line + '" stroke-width="' + sw + '"/>' +
        '<rect x="20" y="' + (H / 2 - 110) + '" width="130" height="220" fill="none" stroke="' + line + '" stroke-width="' + sw + '"/>';
      break;
    case 'half_v1':
    case 'half_v2':
      lines = '<rect x="20" y="20" width="' + (W - 40) + '" height="' + (H - 40) + '" fill="none" stroke="' + line + '" stroke-width="' + sw + '"/>' +
        '<rect x="' + (W / 2 - 120) + '" y="20" width="240" height="140" fill="none" stroke="' + line + '" stroke-width="' + sw + '"/>' +
        '<circle cx="' + (W / 2) + '" cy="160" r="45" fill="none" stroke="' + line + '" stroke-width="' + sw + '"/>';
      break;
    case 'goal_area':
      lines = '<rect x="20" y="20" width="' + (W - 40) + '" height="' + (H - 40) + '" fill="none" stroke="' + line + '" stroke-width="' + sw + '"/>' +
        '<rect x="' + (W / 2 - 130) + '" y="20" width="260" height="170" fill="none" stroke="' + line + '" stroke-width="' + sw + '"/>' +
        '<rect x="' + (W / 2 - 60) + '" y="20" width="120" height="70" fill="none" stroke="' + line + '" stroke-width="' + sw + '"/>' +
        '<rect x="' + (W / 2 - 45) + '" y="2" width="90" height="18" fill="none" stroke="' + line + '" stroke-width="' + sw + '"/>';
      break;
    case 'final_third':
      lines = '<rect x="20" y="20" width="' + (W - 40) + '" height="' + (H - 40) + '" fill="none" stroke="' + line + '" stroke-width="' + sw + '"/>' +
        '<rect x="' + (W - 320) + '" y="' + (H / 2 - 130) + '" width="300" height="260" fill="none" stroke="' + line + '" stroke-width="' + sw + '"/>' +
        '<circle cx="' + (W - 320) + '" cy="' + (H / 2) + '" r="60" fill="none" stroke="' + line + '" stroke-width="' + sw + '"/>';
      break;
    case 'grid':
      for (var gx = 1; gx < 4; gx++) lines += '<line x1="' + (gx * W / 4) + '" y1="20" x2="' + (gx * W / 4) + '" y2="' + (H - 20) + '" stroke="' + line + '" stroke-width="2" stroke-dasharray="6 6"/>';
      for (var gy = 1; gy < 3; gy++) lines += '<line x1="20" y1="' + (gy * H / 3) + '" x2="' + (W - 20) + '" y2="' + (gy * H / 3) + '" stroke="' + line + '" stroke-width="2" stroke-dasharray="6 6"/>';
      lines += '<rect x="20" y="20" width="' + (W - 40) + '" height="' + (H - 40) + '" fill="none" stroke="' + line + '" stroke-width="' + sw + '"/>';
      break;
    case 'free':
    default:
      lines = '<rect x="20" y="20" width="' + (W - 40) + '" height="' + (H - 40) + '" fill="none" stroke="' + line + '" stroke-width="2" stroke-dasharray="4 4" opacity="0.5"/>';
      break;
  }

  return bg + (background === 'green' ? stripes : '') + lines;
}

/* ================= EDITOR ================= */

function initEditor() {
  activeTool = 'select';
  currentColor = DRAW_COLOR_PRESETS[0];
  armedIcon = null;
  document.querySelectorAll('.tool-btn[data-tool]').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-tool') === 'select'); });
  updateColorSwatch();
  renderEditorTabBody();
  renderCanvas();
}

function initEditorToolbar() {
  document.querySelectorAll('.tool-btn[data-tool]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeTool = btn.getAttribute('data-tool');
      armedIcon = null;
      document.querySelectorAll('.tool-btn[data-tool]').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelectorAll('.icon-swatch.armed, .pin-number.armed').forEach(function (el) { el.classList.remove('armed'); });
    });
  });

  document.getElementById('toolColorSwatch').addEventListener('click', function () {
    document.getElementById('toolColorInput').click();
  });
  document.getElementById('toolColorInput').addEventListener('input', function () {
    currentColor = this.value;
    updateColorSwatch();
  });

  document.getElementById('undoBtn').addEventListener('click', doUndo);
  document.getElementById('redoBtn').addEventListener('click', doRedo);
  document.getElementById('deleteSelectedBtn').addEventListener('click', function () {
    if (!selectedElId) return;
    pushUndo();
    elements = elements.filter(function (e) { return e.id !== selectedElId; });
    selectedElId = null;
    renderCanvas();
  });
  document.getElementById('clearAllBtn').addEventListener('click', function () {
    if (elements.length === 0) return;
    pushUndo();
    elements = [];
    selectedElId = null;
    renderCanvas();
  });

  var svg = document.getElementById('drillCanvas');
  svg.addEventListener('mousedown', onCanvasDown);
  svg.addEventListener('mousemove', onCanvasMove);
  window.addEventListener('mouseup', onCanvasUp);
}

function updateColorSwatch() {
  document.getElementById('toolColorSwatch').style.background = currentColor;
  document.getElementById('toolColorInput').value = rgbToHex(currentColor);
}

function rgbToHex(c) {
  if (c.charAt(0) === '#' && c.length === 7) return c;
  return '#E63946';
}

function svgPoint(svg, evt) {
  var pt = svg.createSVGPoint();
  pt.x = evt.clientX; pt.y = evt.clientY;
  var ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  var p = pt.matrixTransform(ctm.inverse());
  return { x: Math.round(p.x), y: Math.round(p.y) };
}

function onCanvasDown(evt) {
  var svg = document.getElementById('drillCanvas');
  var p = svgPoint(svg, evt);

  if (armedIcon) {
    pushUndo();
    if (armedIcon.kind === 'pin') {
      elements.push({ id: refchUid('el'), type: 'pin', x: p.x, y: p.y, color: currentColor, number: armedIcon.number });
    } else {
      elements.push({ id: refchUid('el'), type: 'icon', iconId: armedIcon.id, x: p.x, y: p.y, color: armedIcon.color || currentColor });
    }
    renderCanvas();
    return;
  }

  if (activeTool === 'select') {
    var hit = evt.target.closest('[data-el-id]');
    selectedElId = hit ? hit.getAttribute('data-el-id') : null;
    if (selectedElId) {
      isDrawing = true;
      drawStart = p;
    }
    renderCanvas();
    return;
  }

  isDrawing = true;
  drawStart = p;
  pushUndo();

  if (activeTool === 'text') {
    var txt = prompt('Text:');
    if (txt) {
      elements.push({ id: refchUid('el'), type: 'text', x: p.x, y: p.y, color: currentColor, text: txt });
      renderCanvas();
    }
    isDrawing = false;
    undoStack.pop();
    return;
  }

  var id = refchUid('el');
  drawingElId = id;
  if (activeTool === 'pencil' || activeTool === 'zigzag') {
    elements.push({ id: id, type: activeTool, color: currentColor, points: [p.x, p.y] });
  } else {
    elements.push({ id: id, type: activeTool, color: currentColor, x: p.x, y: p.y, x2: p.x, y2: p.y });
  }
  renderCanvas();
}

function onCanvasMove(evt) {
  if (!isDrawing) return;
  var svg = document.getElementById('drillCanvas');
  var p = svgPoint(svg, evt);

  if (activeTool === 'select' && selectedElId) {
    var el = elements.filter(function (e) { return e.id === selectedElId; })[0];
    if (el) {
      var dx = p.x - drawStart.x, dy = p.y - drawStart.y;
      moveElement(el, dx, dy);
      drawStart = p;
      renderCanvas();
    }
    return;
  }

  var dEl = elements.filter(function (e) { return e.id === drawingElId; })[0];
  if (!dEl) return;
  if (dEl.type === 'pencil' || dEl.type === 'zigzag') {
    dEl.points.push(p.x, p.y);
  } else {
    dEl.x2 = p.x; dEl.y2 = p.y;
  }
  renderCanvas();
}

function onCanvasUp() {
  isDrawing = false;
  drawingElId = null;
}

function moveElement(el, dx, dy) {
  if (el.x !== undefined) { el.x += dx; el.y += dy; }
  if (el.x2 !== undefined) { el.x2 += dx; el.y2 += dy; }
  if (el.points) { for (var i = 0; i < el.points.length; i += 2) { el.points[i] += dx; el.points[i + 1] += dy; } }
}

function pushUndo() {
  undoStack.push(JSON.stringify(elements));
  if (undoStack.length > 40) undoStack.shift();
  redoStack = [];
}
function doUndo() {
  if (!undoStack.length) return;
  redoStack.push(JSON.stringify(elements));
  elements = JSON.parse(undoStack.pop());
  selectedElId = null;
  renderCanvas();
}
function doRedo() {
  if (!redoStack.length) return;
  undoStack.push(JSON.stringify(elements));
  elements = JSON.parse(redoStack.pop());
  selectedElId = null;
  renderCanvas();
}

function renderCanvas() {
  var svg = document.getElementById('drillCanvas');
  var bgMarkup = pitchMarkupFor(selectedFieldType, selectedBackground);
  var elMarkup = elements.map(function (el) {
    return renderElementMarkup(el, el.id === selectedElId);
  }).join('');
  svg.innerHTML = bgMarkup + elMarkup;
}

function renderElementMarkup(el, selected) {
  var selAttr = selected ? ' data-selected="1"' : '';
  var ring = selected ? '<circle cx="' + (el.x || 0) + '" cy="' + (el.y || 0) + '" r="22" fill="none" stroke="#1473E6" stroke-width="1.5" stroke-dasharray="3 3"/>' : '';

  switch (el.type) {
    case 'line':
      return '<line data-el-id="' + el.id + '"' + selAttr + ' x1="' + el.x + '" y1="' + el.y + '" x2="' + el.x2 + '" y2="' + el.y2 + '" stroke="' + el.color + '" stroke-width="3" stroke-linecap="round"/>';
    case 'arrow':
      return arrowMarkup(el) ;
    case 'dashed':
      return '<line data-el-id="' + el.id + '"' + selAttr + ' x1="' + el.x + '" y1="' + el.y + '" x2="' + el.x2 + '" y2="' + el.y2 + '" stroke="' + el.color + '" stroke-width="3" stroke-linecap="round" stroke-dasharray="9 7"/>' + arrowHead(el.x2, el.y2, Math.atan2(el.y2 - el.y, el.x2 - el.x), el.color);
    case 'zigzag':
      return '<polyline data-el-id="' + el.id + '"' + selAttr + ' points="' + (el.points || []).join(',') + '" fill="none" stroke="' + el.color + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 10"/>';
    case 'pencil':
      return '<polyline data-el-id="' + el.id + '"' + selAttr + ' points="' + (el.points || []).join(',') + '" fill="none" stroke="' + el.color + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
    case 'rect':
      return '<rect data-el-id="' + el.id + '"' + selAttr + ' x="' + Math.min(el.x, el.x2) + '" y="' + Math.min(el.y, el.y2) + '" width="' + Math.abs(el.x2 - el.x) + '" height="' + Math.abs(el.y2 - el.y) + '" fill="none" stroke="' + el.color + '" stroke-width="3"/>';
    case 'circle':
      var rx = Math.abs(el.x2 - el.x) / 2, ry = Math.abs(el.y2 - el.y) / 2;
      return '<ellipse data-el-id="' + el.id + '"' + selAttr + ' cx="' + ((el.x + el.x2) / 2) + '" cy="' + ((el.y + el.y2) / 2) + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="' + el.color + '" stroke-width="3"/>';
    case 'text':
      return '<text data-el-id="' + el.id + '"' + selAttr + ' x="' + el.x + '" y="' + el.y + '" fill="' + el.color + '" font-size="18" font-weight="700" font-family="Inter, sans-serif">' + escapeXml(el.text) + '</text>';
    case 'pin':
      return '<g data-el-id="' + el.id + '"' + selAttr + '>' + ring +
        '<circle cx="' + el.x + '" cy="' + el.y + '" r="14" fill="' + el.color + '" stroke="white" stroke-width="2"/>' +
        '<text x="' + el.x + '" y="' + (el.y + 5) + '" text-anchor="middle" fill="white" font-size="13" font-weight="800" font-family="Inter, sans-serif">' + el.number + '</text></g>';
    case 'icon':
      return '<g data-el-id="' + el.id + '"' + selAttr + ' transform="translate(' + (el.x - 16) + ',' + (el.y - 16) + ')">' + iconSvg(el.iconId, el.color) + '</g>' + ring;
    default:
      return '';
  }
}

function arrowMarkup(el) {
  var angle = Math.atan2(el.y2 - el.y, el.x2 - el.x);
  return '<line data-el-id="' + el.id + '" x1="' + el.x + '" y1="' + el.y + '" x2="' + el.x2 + '" y2="' + el.y2 + '" stroke="' + el.color + '" stroke-width="3" stroke-linecap="round"/>' +
    arrowHead(el.x2, el.y2, angle, el.color);
}
function arrowHead(x, y, angle, color) {
  var size = 11;
  var x1 = x - size * Math.cos(angle - 0.45), y1 = y - size * Math.sin(angle - 0.45);
  var x2 = x - size * Math.cos(angle + 0.45), y2 = y - size * Math.sin(angle + 0.45);
  return '<polygon points="' + x + ',' + y + ' ' + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + '" fill="' + color + '"/>';
}

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ================= EDITOR SIDE PANEL ================= */

function initEditorTabs() {
  var tabs = [{ id: 'pins', label: 'Pins' }, { id: 'equipment', label: 'Equipment' }, { id: 'players', label: 'Referees & Players' }];
  document.getElementById('editorTabs').innerHTML = tabs.map(function (t) {
    return '<button class="editor-tab-btn' + (t.id === activeEditorTab ? ' active' : '') + '" data-tab="' + t.id + '">' + t.label + '</button>';
  }).join('');
  document.querySelectorAll('.editor-tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeEditorTab = btn.getAttribute('data-tab');
      document.querySelectorAll('.editor-tab-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderEditorTabBody();
    });
  });
}

function renderEditorTabBody() {
  var body = document.getElementById('editorTabBody');

  if (activeEditorTab === 'pins') {
    body.innerHTML =
      '<div class="icon-cat-title">Color</div>' +
      '<div class="color-preset-row" id="pinColorRow"></div>' +
      '<div class="icon-cat-title">Numbers</div>' +
      '<div class="pin-number-grid" id="pinNumberGrid"></div>';

    var colorRow = document.getElementById('pinColorRow');
    colorRow.innerHTML = DRAW_COLOR_PRESETS.map(function (c) {
      return '<span class="color-preset' + (c === currentColor ? ' active' : '') + '" data-color="' + c + '" style="background:' + c + ';' + (c === '#FFFFFF' ? 'box-shadow:0 0 0 1px #ccc;' : '') + '"></span>';
    }).join('');
    colorRow.querySelectorAll('.color-preset').forEach(function (sw) {
      sw.addEventListener('click', function () {
        currentColor = sw.getAttribute('data-color');
        updateColorSwatch();
        renderEditorTabBody();
      });
    });

    var numGrid = document.getElementById('pinNumberGrid');
    var nums = [];
    for (var i = 1; i <= 20; i++) nums.push(i);
    numGrid.innerHTML = nums.map(function (n) {
      var isArmed = armedIcon && armedIcon.kind === 'pin' && armedIcon.number === n;
      return '<div class="pin-number' + (isArmed ? ' armed' : '') + '" data-num="' + n + '" style="background:' + currentColor + '">' + n + '</div>';
    }).join('');
    numGrid.querySelectorAll('.pin-number').forEach(function (el) {
      el.addEventListener('click', function () {
        armedIcon = { kind: 'pin', number: parseInt(el.getAttribute('data-num'), 10) };
        document.querySelectorAll('.tool-btn[data-tool]').forEach(function (b) { b.classList.remove('active'); });
        renderEditorTabBody();
      });
    });
    return;
  }

  if (activeEditorTab === 'equipment') {
    var cats = {};
    DRILL_EQUIPMENT.forEach(function (eq) { (cats[eq.category] = cats[eq.category] || []).push(eq); });
    body.innerHTML = Object.keys(cats).map(function (cat) {
      return '<div class="icon-cat-title">' + cat + '</div><div class="icon-palette">' +
        cats[cat].map(function (eq) {
          var color = eq.colorable ? currentColor : '#6B7A89';
          var armed = armedIcon && armedIcon.kind === 'equipment' && armedIcon.id === eq.id;
          return '<div class="icon-swatch' + (armed ? ' armed' : '') + '" data-eq="' + eq.id + '" title="' + eq.label + '"><svg viewBox="0 0 32 32">' + iconSvg(eq.id, color) + '</svg></div>';
        }).join('') + '</div>';
    }).join('');

    body.querySelectorAll('.icon-swatch').forEach(function (sw) {
      sw.addEventListener('click', function () {
        var id = sw.getAttribute('data-eq');
        var eq = DRILL_EQUIPMENT.filter(function (e) { return e.id === id; })[0];
        armedIcon = { kind: 'equipment', id: id, color: eq.colorable ? currentColor : '#6B7A89' };
        document.querySelectorAll('.tool-btn[data-tool]').forEach(function (b) { b.classList.remove('active'); });
        renderEditorTabBody();
      });
    });
    return;
  }

  if (activeEditorTab === 'players') {
    var cats2 = {};
    DRILL_FIGURES.forEach(function (fg) { (cats2[fg.category] = cats2[fg.category] || []).push(fg); });
    body.innerHTML = Object.keys(cats2).map(function (cat) {
      return '<div class="icon-cat-title">' + cat + '</div><div class="icon-palette">' +
        cats2[cat].map(function (fg) {
          var color = fg.colorable ? currentColor : (fg.color || '#15212D');
          var armed = armedIcon && armedIcon.kind === 'figure' && armedIcon.id === fg.id;
          return '<div class="icon-swatch' + (armed ? ' armed' : '') + '" data-fig="' + fg.id + '" title="' + fg.label + '"><svg viewBox="0 0 32 32">' + iconSvg(fg.id, color) + '</svg></div>';
        }).join('') + '</div>';
    }).join('');

    body.querySelectorAll('.icon-swatch').forEach(function (sw) {
      sw.addEventListener('click', function () {
        var id = sw.getAttribute('data-fig');
        var fg = DRILL_FIGURES.filter(function (f) { return f.id === id; })[0];
        armedIcon = { kind: 'figure', id: id, color: fg.colorable ? currentColor : (fg.color || '#15212D') };
        document.querySelectorAll('.tool-btn[data-tool]').forEach(function (b) { b.classList.remove('active'); });
        renderEditorTabBody();
      });
    });
    return;
  }
}

/* ================= ICON LIBRARY ================= */

function iconSvg(id, color) {
  color = color || '#6B7A89';
  switch (id) {
    case 'ball':
      return '<circle cx="16" cy="16" r="10" fill="white" stroke="#222" stroke-width="1.5"/><polygon points="16,9 20,13 18,18 14,18 12,13" fill="#222"/>';
    case 'cone':
      return '<ellipse cx="16" cy="24" rx="9" ry="3" fill="' + color + '" opacity="0.3"/><polygon points="16,8 22,24 10,24" fill="' + color + '"/><rect x="11" y="20" width="10" height="2" fill="white" opacity="0.8"/>';
    case 'cone_tall':
      return '<polygon points="16,5 21,26 11,26" fill="' + color + '"/><rect x="12" y="18" width="8" height="2.2" fill="white" opacity="0.85"/><rect x="10.5" y="25" width="11" height="2.5" rx="1" fill="' + color + '"/>';
    case 'flag':
      return '<line x1="9" y1="5" x2="9" y2="27" stroke="#555" stroke-width="2" stroke-linecap="round"/><polygon points="9,6 23,10 9,14" fill="' + color + '"/>';
    case 'stick':
      return '<line x1="16" y1="4" x2="16" y2="28" stroke="' + color + '" stroke-width="3" stroke-linecap="round"/>';
    case 'cone_stick':
      return '<polygon points="7,24 11,24 9,17" fill="' + color + '"/><polygon points="21,24 25,24 23,17" fill="' + color + '"/><line x1="9" y1="18" x2="23" y2="18" stroke="' + color + '" stroke-width="2"/>';
    case 'dummy':
      return '<circle cx="16" cy="8" r="4" fill="' + color + '"/><path d="M9 28v-9a7 7 0 0114 0v9z" fill="' + color + '"/>';
    case 'hurdle':
      return '<path d="M8 26V14a8 8 0 0116 0v12" fill="none" stroke="' + color + '" stroke-width="2.5" stroke-linecap="round"/><line x1="8" y1="26" x2="8" y2="29" stroke="' + color + '" stroke-width="2.5"/><line x1="24" y1="26" x2="24" y2="29" stroke="' + color + '" stroke-width="2.5"/>';
    case 'hurdle_bar':
      return '<line x1="7" y1="22" x2="25" y2="22" stroke="' + color + '" stroke-width="2.5"/><line x1="7" y1="22" x2="7" y2="28" stroke="' + color + '" stroke-width="2.5"/><line x1="25" y1="22" x2="25" y2="28" stroke="' + color + '" stroke-width="2.5"/>';
    case 'hoop':
      return '<circle cx="16" cy="16" r="10" fill="none" stroke="' + color + '" stroke-width="2.5"/>';
    case 'hoop_oval':
      return '<ellipse cx="16" cy="16" rx="11" ry="6.5" fill="none" stroke="' + color + '" stroke-width="2.5"/>';
    case 'ladder':
      var rungs = '';
      [7, 12, 17, 22, 27].forEach(function (x) { rungs += '<line x1="' + x + '" y1="12" x2="' + x + '" y2="20" stroke="#B8860B" stroke-width="2.2"/>'; });
      return '<line x1="4" y1="12" x2="28" y2="12" stroke="#B8860B" stroke-width="2"/><line x1="4" y1="20" x2="28" y2="20" stroke="#B8860B" stroke-width="2"/>' + rungs;
    case 'box_small':
      return '<polygon points="9,12 19,12 23,8 13,8" fill="none" stroke="#555" stroke-width="1.4"/><polygon points="9,12 19,12 19,24 9,24" fill="none" stroke="#555" stroke-width="1.4"/><polygon points="19,12 23,8 23,20 19,24" fill="none" stroke="#555" stroke-width="1.4"/>';
    case 'box_long':
      return '<polygon points="4,14 22,14 27,9 9,9" fill="none" stroke="#555" stroke-width="1.4"/><polygon points="4,14 22,14 22,22 4,22" fill="none" stroke="#555" stroke-width="1.4"/><polygon points="22,14 27,9 27,17 22,22" fill="none" stroke="#555" stroke-width="1.4"/>';
    case 'mat':
      return '<rect x="5" y="12" width="22" height="9" rx="2" fill="#8A97A3"/>';
    case 'goal_small':
      return '<rect x="7" y="8" width="18" height="12" fill="none" stroke="#555" stroke-width="2"/><line x1="9" y1="9" x2="9" y2="19" stroke="#aaa" stroke-width="0.8"/><line x1="13" y1="9" x2="13" y2="19" stroke="#aaa" stroke-width="0.8"/><line x1="17" y1="9" x2="17" y2="19" stroke="#aaa" stroke-width="0.8"/><line x1="21" y1="9" x2="21" y2="19" stroke="#aaa" stroke-width="0.8"/>';
    case 'referee':
      return personSvg('#15212D', null, false);
    case 'assistant_referee':
      return personSvg('#CBE63A', null, true);
    case 'coach':
      return personSvg(color, 'clipboard', false);
    case 'goalkeeper':
      return personSvg(color, 'gloves', false);
    case 'runner_sprint':
      return runnerSvg(color, 'sprint');
    case 'runner_jog':
      return runnerSvg(color, 'jog');
    case 'runner_sideways':
      return runnerSvg(color, 'sideways');
    case 'runner_backward':
      return runnerSvg(color, 'backward');
    case 'runner_medium':
      return runnerSvg(color, 'medium');
    default:
      return '<circle cx="16" cy="16" r="8" fill="' + color + '"/>';
  }
}

function personSvg(kitColor, accessory, flagArm) {
  var flag = flagArm ? '<line x1="24" y1="12" x2="24" y2="4" stroke="#555" stroke-width="1.6"/><polygon points="24,4 30,6 24,8" fill="#E63946"/>' : '';
  var armPath = flagArm ? 'M20 15l4-3' : 'M20 15l3 1';
  var accessoryMark = '';
  if (accessory === 'clipboard') accessoryMark = '<rect x="7" y="14" width="5" height="6" rx="0.6" fill="white" stroke="#555" stroke-width="0.8"/>';
  if (accessory === 'gloves') accessoryMark = '<circle cx="9" cy="16" r="2" fill="white" stroke="#555" stroke-width="0.8"/><circle cx="23" cy="16" r="2" fill="white" stroke="#555" stroke-width="0.8"/>';
  return '<circle cx="16" cy="6" r="3.4" fill="#E8B48C"/>' +
    '<path d="M11 28v-8a5 5 0 0110 0v8z" fill="' + kitColor + '"/>' +
    '<path d="' + armPath + '" stroke="' + kitColor + '" stroke-width="2" stroke-linecap="round" fill="none"/>' +
    '<path d="M12 15l-3 1" stroke="' + kitColor + '" stroke-width="2" stroke-linecap="round" fill="none"/>' +
    '<line x1="13" y1="28" x2="12" y2="31" stroke="#222" stroke-width="2" stroke-linecap="round"/>' +
    '<line x1="19" y1="28" x2="20" y2="31" stroke="#222" stroke-width="2" stroke-linecap="round"/>' +
    accessoryMark + flag;
}

function runnerSvg(color, mode) {
  var outerTransform = '';
  if (mode === 'sideways') outerTransform = 'scale(0.8,1) translate(4,0)';
  if (mode === 'backward') outerTransform = 'scale(-1,1) translate(-32,0)';
  var lean = (mode === 'sprint') ? -10 : (mode === 'medium') ? -5 : 0;
  return '<g transform="' + outerTransform + '">' +
    '<g transform="rotate(' + lean + ' 16 16)">' +
    '<circle cx="17" cy="6" r="3.2" fill="#E8B48C"/>' +
    '<path d="M12 10l5 1 5-2" stroke="' + color + '" stroke-width="2.4" stroke-linecap="round" fill="none"/>' +
    '<path d="M17 11l-2 9" stroke="' + color + '" stroke-width="3.2" stroke-linecap="round"/>' +
    '<path d="M15 20l-4 8" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M15 20l6 6" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M15 12l-5 4" stroke="' + color + '" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M17 12l6 2" stroke="' + color + '" stroke-width="2.2" stroke-linecap="round"/>' +
    '</g></g>';
}

/* ================= SAVE ================= */

function saveDrill() {
  var name = prompt('Drill name:', 'Untitled Drill');
  if (name === null) return;
  var data = {
    name: name.trim() || 'Untitled Drill',
    teams: teamsList,
    fieldType: selectedFieldType,
    perspective: selectedPerspective,
    background: selectedBackground,
    elements: elements
  };
  if (editingDrillId) {
    refchUpdateDrill(editingDrillId, data);
    showToast('Drill updated.');
  } else {
    refchAddDrill(data);
    showToast('Drill saved.');
  }
  closeModal('createDrillModal');
  renderDrillGrid();
}

/* ================= TRAINING GENERATOR ================= */

function populateGeneratorForm() {
  document.getElementById('genType').innerHTML = GENERATOR_TYPES.map(function (t) {
    return '<option value="' + t.id + '">' + t.label + '</option>';
  }).join('');
  document.getElementById('genReferee').innerHTML = refchState.referees.map(function (r) {
    return '<option value="' + r.id + '">' + r.name + '</option>';
  }).join('');
}

var lastProposal = null;

function runGenerator() {
  var params = {
    type: document.getElementById('genType').value,
    distance: parseFloat(document.getElementById('genDistance').value) || 0,
    reps: parseInt(document.getElementById('genReps').value, 10) || 1,
    restSec: parseFloat(document.getElementById('genRest').value) || 0
  };
  lastProposal = refchGenerateTrainingProposal(params);

  document.getElementById('genResultTitle').textContent = lastProposal.reps + ' × ' + lastProposal.distance + 'm ' + lastProposal.type.label + ' — ' + lastProposal.restSec + 's recovery';
  document.getElementById('genTotalDistance').textContent = lastProposal.totalDistance + ' m';
  document.getElementById('genDuration').textContent = lastProposal.totalDurationMin + ' min';
  document.getElementById('genLoad').textContent = lastProposal.estimatedLoad;
  document.getElementById('genRatio').textContent = lastProposal.workRestRatio;
  document.getElementById('genNote').textContent = lastProposal.ratioNote + ' (Estimated pacing — not a clinical standard; adjust to the referee\'s real performance data.)';
  document.getElementById('generatorResult').style.display = 'block';
}

function saveGeneratedSession() {
  if (!lastProposal) return;
  var refId = document.getElementById('genReferee').value;
  var ref = refchRefereeById(refId);
  var hrMax = ref ? ref.hrMax : 190;
  refchAddTrainingSession({
    refereeId: refId,
    date: new Date().toISOString().slice(0, 10),
    category: lastProposal.type.category,
    durationMin: Math.round(lastProposal.totalDurationMin),
    distanceKm: Math.round(lastProposal.totalDistance / 100) / 10,
    trainingLoad: lastProposal.estimatedLoad,
    avgHR: Math.round(hrMax * 0.78),
    maxHR: Math.round(hrMax * 0.93),
    zones: { z1: 2, z2: 4, z3: 6, z4: Math.round(lastProposal.totalDurationMin * 0.3), z5: Math.round(lastProposal.totalDurationMin * 0.15) }
  });
  showToast('Saved as a training session for ' + (ref ? ref.name : 'referee') + '.');
}

function saveGeneratedToCalendar() {
  if (!lastProposal) return;
  var refId = document.getElementById('genReferee').value;
  refchAddEvent({
    refereeId: refId,
    type: 'training',
    topic: lastProposal.type.category,
    date: new Date().toISOString().slice(0, 10),
    time: '',
    location: '',
    notes: lastProposal.reps + 'x' + lastProposal.distance + 'm, ' + lastProposal.restSec + 's rest'
  });
  showToast('Added to calendar.');
}
