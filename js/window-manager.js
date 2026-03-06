'use strict';
/* ═══════════════════════════════════════════════════════════
   WINDOW MANAGER — gestione finestre desktop-like
   Dipende da: templates.js, three-helpers.js
   Chiama (lazy): scene3d.js, calendar.js, sidepanel.js, map.js, tree.js
   ═══════════════════════════════════════════════════════════ */

let WC = 0;   // contatore finestre create
let TZ = 100; // z-index progressivo

/** Registro globale delle finestre */
const WINS = {};

// ─── Tipo finestra ─────────────────────────────────────────

function getWinType(tplName) {
  if (tplName === 'Calendario') return 'calendar';
  if (tplName === 'Mappa')      return 'map';
  if (tplName === 'Albero')     return 'tree';
  if (tplName === 'Note')       return 'notes';
  if (tplName === 'Cervello' || tplName === 'Corpo Umano') return 'brain';
  if (tplName === 'Home')       return 'dashboard';
  if (tplName === 'Schema')     return 'schema';
  return 'constellation';
}

// ─── Template HTML dei body ────────────────────────────────

function graphBodyHTML(id) {
  return `
    <div class="g3d" id="g3d${id}">
      <div class="g3d-hint">drag → ruota &nbsp;·&nbsp; scroll → zoom &nbsp;·&nbsp; click → dettagli</div>
    </div>
    <div class="sp" id="sp${id}">
      <div class="sp-top">
        <div>
          <div class="sp-ttl" id="stt${id}">—</div>
          <div class="sp-sub" id="sts${id}">nodo</div>
        </div>
        <button class="sp-x" id="spx${id}">✕</button>
      </div>
      <div class="sp-body" id="spb${id}"></div>
    </div>`;
}

function calendarBodyHTML(id) {
  return `
    <div class="cal-wrap" id="calwrap${id}">
      <div class="cal-left">
        <div class="cal-nav">
          <button class="cal-nav-btn" id="cal-pmo${id}">‹</button>
          <span class="cal-nav-lbl" id="cal-mlbl${id}">—</span>
          <button class="cal-nav-btn" id="cal-nmo${id}">›</button>
        </div>
        <div class="mini-cal" id="mini${id}"></div>
        <button class="cal-today-btn" id="cal-today${id}">Oggi</button>
      </div>
      <div class="cal-right" id="calright${id}">
        <div class="cal-week-header">
          <div class="cal-corner"></div>
          <div class="cal-day-hdrs" id="cal-hdrs${id}"></div>
        </div>
        <div class="cal-scroll" id="cal-scroll${id}">
          <div class="cal-time-col" id="cal-time${id}"></div>
          <div class="cal-grid" id="cal-grid${id}"></div>
        </div>
      </div>
    </div>
    <div class="sp" id="sp${id}">
      <div class="sp-top">
        <div>
          <div class="sp-ttl" id="stt${id}">Evento</div>
          <div class="sp-sub" id="sts${id}">—</div>
        </div>
        <button class="sp-x" id="spx${id}">✕</button>
      </div>
      <div class="sp-body" id="spb${id}"></div>
    </div>`;
}

function getBodyHTML(id, tplName, type) {
  if (type === 'calendar')     return calendarBodyHTML(id);
  if (type === 'map')          return mapBodyHTML(id);
  if (type === 'tree')         return treeBodyHTML(id);
  if (type === 'notes')        return notesBodyHTML(id);
  if (type === 'brain')        return brainBodyHTML(id);
  if (type === 'dashboard')    return dashBodyHTML(id);
  if (type === 'schema')       return schemaBodyHTML(id);
  return graphBodyHTML(id);
}

// ─── Creazione finestra ────────────────────────────────────

function createWin(tplName, pos) {
  const id   = ++WC;
  const type = getWinType(tplName);
  const x = pos?.x ?? 40 + (id - 1) * 28;
  const y = pos?.y ?? 28 + (id - 1) * 28;

  const win = document.createElement('div');
  win.className = 'win focused';
  win.id = 'w' + id;
  win.style.cssText = `left:${x}px;top:${y}px;width:var(--win-w);height:var(--win-h);z-index:${++TZ}`;

  const allTabs  = ['Home', ...Object.keys(TPL), 'Calendario', 'Mappa', 'Albero', 'Note', 'Corpo Umano', 'Schema'];
  const tabsHTML = allTabs.map(l =>
    `<button class="wtab${l === tplName ? ' active' : ''}" data-l="${l}">${l}</button>`
  ).join('');

  win.innerHTML = `
    <div class="win-title" id="wt${id}">
      <div class="dots">
        <div class="dot cl" data-a="cl"></div>
        <div class="dot mn" data-a="mn"></div>
        <div class="dot mx" data-a="mx"></div>
      </div>
      <span class="win-name" id="wn${id}" title="Doppio clic per rinominare">✦ ${tplName}</span>
      <button class="win-export-btn" id="we${id}" title="Esporta dati">↓</button>
    </div>
    <div class="win-tabs" id="wtabs${id}">${tabsHTML}</div>
    <div class="win-body" id="wb${id}">
      ${getBodyHTML(id, tplName, type)}
    </div>
    <div class="rh" id="rh${id}"></div>
    <div class="win-close-confirm" id="wcc${id}">
      <div class="win-close-confirm-box">
        <div class="win-close-confirm-msg">Chiudere questa finestra?</div>
        <div class="win-close-confirm-btns">
          <button class="wcc-yes" id="wcc-yes${id}">Chiudi</button>
          <button class="wcc-no" id="wcc-no${id}">Annulla</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('desktop').appendChild(win);

  const tb = document.createElement('button');
  tb.className = 'tb-btn active';
  tb.id = 'tb' + id;
  tb.textContent = '◈ ' + tplName;
  tb.onclick = () => toggleMin(id);
  document.getElementById('tb-wins').appendChild(tb);

  const winData = {
    win, tpl: tplName, type, scene3d: null, calState: null,
    wid: id, wname: tplName, createdAt: new Date().toISOString(),
  };

  if (type === 'constellation') {
    const raw = TPL[tplName] || TPL.Computer;
    const tpl = JSON.parse(JSON.stringify(raw));
    assignPositions(tpl.nodes);
    winData.nodes = tpl.nodes;
  } else if (type === 'calendar') {
    winData.events = [];
  } else if (type === 'map') {
    winData.pins = [];
  } else if (type === 'tree') {
    winData.treeData = { roots: [] };
  } else if (type === 'notes') {
    // notebook structure for this window
    winData.notes = [
      { id: 'n1', title: 'Sezione 1', content: 'Testo di esempio per la sezione 1.' },
      { id: 'n2', title: 'Sezione 2', content: 'Contenuto della sezione 2...' },
      { id: 'n3', title: 'Sezione 3', content: 'Altro testo di esempio per la sezione 3.' }
    ];
    winData.currentNoteId = 'n1';
  } else if (type === 'brain') {
    winData.thoughts = [];
  } else if (type === 'schema') {
    winData.schemaData = null; // initialized lazily in initSchema
  } else if (type === 'page') {
    winData.pageData = null; // initialized lazily in initPage
  }

  WINS[id] = winData;
  setupWinEvents(id);
  focusW(id);

  if (type === 'constellation') {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (WINS[id])
        WINS[id].scene3d = create3DScene(
          id, WINS[id].nodes,
          TPL[tplName]?.color || 0x63b3ff,
          node => openSP(id, node, 'node')
        );
    }));
  } else if (type === 'calendar') {
    requestAnimationFrame(() => initCalendar(id));
  } else if (type === 'map') {
    requestAnimationFrame(() => initMap(id));
  } else if (type === 'tree') {
    requestAnimationFrame(() => initTree(id));
  } else if (type === 'notes') {
    requestAnimationFrame(() => initNotes(id));
  } else if (type === 'brain') {
    requestAnimationFrame(() => initBrain(id));
  } else if (type === 'dashboard') {
    requestAnimationFrame(() => initDashboard(id));
  } else if (type === 'schema') {
    requestAnimationFrame(() => initSchema(id));
  } else if (type === 'page') {
    requestAnimationFrame(() => initPage(id));
  }

  return id;
}

// ─── Focus / minimize / close / maximize ──────────────────

function focusW(id) {
  Object.keys(WINS).forEach(i => {
    WINS[i].win.classList.remove('focused');
    document.getElementById('tb' + i)?.classList.remove('active');
  });
  if (!WINS[id]) return;
  WINS[id].win.classList.add('focused');
  WINS[id].win.style.zIndex = ++TZ;
  document.getElementById('tb' + id)?.classList.add('active');
}

function toggleMin(id) {
  if (!WINS[id]) return;
  const isMin = WINS[id].win.classList.contains('minimized');
  WINS[id].win.classList.toggle('minimized');
  document.getElementById('tb' + id)?.classList.toggle('minimized', !isMin);
  if (isMin) focusW(id);
}

function closeW(id) {
  const w = WINS[id];
  if (!w) return;
  w.scene3d?.dispose();
  w._mapDispose?.();
  w._brainDispose?.();
  w._dashDispose?.();
  w._schemaDispose?.();
  w._pageDispose?.();
  w.win.remove();
  document.getElementById('tb' + id)?.remove();
  delete WINS[id];
}

function maxW(id) {
  const win = WINS[id]?.win;
  if (!win) return;
  if (win.dataset.maxed) {
    win.style.left   = win.dataset.px;
    win.style.top    = win.dataset.py;
    win.style.width  = win.dataset.pw;
    win.style.height = win.dataset.ph;
    delete win.dataset.maxed;
  } else {
    win.dataset.px = win.style.left;
    win.dataset.py = win.style.top;
    win.dataset.pw = win.style.width;
    win.dataset.ph = win.style.height;
    win.style.left   = '0';
    win.style.top    = '0';
    win.style.width  = '100vw';
    win.style.height = 'calc(100vh - 48px)';
    win.dataset.maxed = '1';
  }
}

function showCloseConfirm(id) {
  document.getElementById('wcc' + id)?.classList.add('visible');
}

function startWinRename(id) {
  const w = WINS[id];
  if (!w) return;
  const span = document.getElementById('wn' + id);
  if (!span) return;
  const inp = document.createElement('input');
  inp.className = 'win-name-inp';
  inp.value = w.wname;
  inp.onkeydown = e => {
    e.stopPropagation();
    if (e.key === 'Enter')  inp.blur();
    if (e.key === 'Escape') { inp.remove(); span.style.display = ''; }
  };
  inp.onblur = () => {
    const v = inp.value.trim();
    if (v && WINS[id]) { WINS[id].wname = v; span.textContent = '✦ ' + v; }
    inp.remove(); span.style.display = '';
  };
  inp.onmousedown = e => e.stopPropagation();
  span.style.display = 'none';
  span.parentNode.insertBefore(inp, span);
  inp.focus(); inp.select();
}

function exportWin(id) {
  const w = WINS[id];
  if (!w) return;
  const data = {
    wid: w.wid, wname: w.wname, createdAt: w.createdAt,
    type: w.type, tpl: w.tpl, exportedAt: new Date().toISOString(),
  };
  if (w.type === 'constellation') data.nodes = w.nodes;
  if (w.type === 'calendar')      data.events = w.events;
  if (w.type === 'map')           data.pins = w.pins;
  if (w.type === 'tree')          data.treeData = w.treeData;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = (w.wname.replace(/\s+/g, '-') || 'win') + '-' + id + '.json';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ─── Cambio tab (layer) ────────────────────────────────────

function switchLayer(id, l) {
  const w = WINS[id];
  if (!w) return;

  const newType = getWinType(l);

  document.getElementById('wn' + id).textContent = '✦ ' + l;
  document.getElementById('tb' + id).textContent  = '◈ ' + l;
  w.tpl  = l;
  w.type = newType;

  const wb = document.getElementById('wb' + id);
  const sp = document.getElementById('sp' + id);
  if (sp) sp.classList.remove('open');

  // smonta risorse precedenti
  w.scene3d?.dispose(); w.scene3d = null;
  w._mapDispose?.(); w._mapDispose = null;
  w._brainDispose?.(); w._brainDispose = null;
  w._dashDispose?.(); w._dashDispose = null;
  w._schemaDispose?.(); w._schemaDispose = null;
  w._pageDispose?.(); w._pageDispose = null;

  wb.innerHTML = getBodyHTML(id, l, newType);

  // ri-aggancia close panel (solo se esiste un sp)
  const newSp = document.getElementById('sp' + id);
  if (newSp) {
    document.getElementById('spx' + id)?.addEventListener('click',
      () => newSp.classList.remove('open')
    );
  }

  if (newType === 'constellation') {
    const raw = TPL[l] || TPL.Computer;
    const tpl = JSON.parse(JSON.stringify(raw));
    assignPositions(tpl.nodes);
    w.nodes = tpl.nodes;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (WINS[id])
        WINS[id].scene3d = create3DScene(
          id, WINS[id].nodes, raw.color,
          node => openSP(id, node, 'node')
        );
    }));
  } else if (newType === 'calendar') {
    if (!w.events) w.events = [];
    requestAnimationFrame(() => initCalendar(id));
  } else if (newType === 'map') {
    if (!w.pins) w.pins = [];
    requestAnimationFrame(() => initMap(id));
  } else if (newType === 'tree') {
    if (!w.treeData) w.treeData = { roots: [] };
    requestAnimationFrame(() => initTree(id));
  } else if (newType === 'notes') {
    if (!w.notes) {
      w.notes = [
        { id: 'n1', title: 'Sezione 1', content: 'Testo di esempio per la sezione 1.' },
        { id: 'n2', title: 'Sezione 2', content: 'Contenuto della sezione 2...' },
        { id: 'n3', title: 'Sezione 3', content: 'Altro testo di esempio per la sezione 3.' }
      ];
    }
    w.currentNoteId = w.currentNoteId || w.notes[0]?.id;
    requestAnimationFrame(() => initNotes(id));
  } else if (newType === 'brain') {
    if (!w.thoughts) w.thoughts = [];
    requestAnimationFrame(() => initBrain(id));
  } else if (newType === 'dashboard') {
    requestAnimationFrame(() => initDashboard(id));
  } else if (newType === 'schema') {
    requestAnimationFrame(() => initSchema(id));
  } else if (newType === 'page') {
    requestAnimationFrame(() => initPage(id));
  }
}

// ─── Event binding finestra ────────────────────────────────

function setupWinEvents(id) {
  const win = WINS[id].win;
  win.addEventListener('mousedown', () => focusW(id));

  // drag titlebar
  const title = document.getElementById('wt' + id);
  let td = false, tx = 0, ty = 0, tlx = 0, tly = 0;
  title.addEventListener('mousedown', e => {
    if (e.target.dataset.a) return;
    td = true; tx = e.clientX; ty = e.clientY;
    tlx = win.offsetLeft; tly = win.offsetTop;
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!td) return;
    win.style.left = (tlx + e.clientX - tx) + 'px';
    win.style.top  = Math.max(0, tly + e.clientY - ty) + 'px';
  });
  document.addEventListener('mouseup', () => { td = false; });

  // semafori
  win.querySelectorAll('.dot').forEach(d => d.addEventListener('click', e => {
    e.stopPropagation();
    const a = d.dataset.a;
    if (a === 'cl') showCloseConfirm(id);
    else if (a === 'mn') toggleMin(id);
    else if (a === 'mx') maxW(id);
  }));

  // conferma chiusura
  document.getElementById('wcc-yes' + id)?.addEventListener('click', e => {
    e.stopPropagation(); closeW(id);
  });
  document.getElementById('wcc-no' + id)?.addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('wcc' + id)?.classList.remove('visible');
  });

  // esporta
  document.getElementById('we' + id)?.addEventListener('click', e => {
    e.stopPropagation(); exportWin(id);
  });
  document.getElementById('we' + id)?.addEventListener('mousedown', e => e.stopPropagation());

  // rinomina con doppio clic
  document.getElementById('wn' + id)?.addEventListener('dblclick', e => {
    e.stopPropagation(); startWinRename(id);
  });

  // tab switch
  document.getElementById('wtabs' + id).addEventListener('click', e => {
    const l = e.target.dataset.l;
    if (!l) return;
    win.querySelectorAll('.wtab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    switchLayer(id, l);
  });

  // close side panel (solo per tipi che ce l'hanno)
  document.getElementById('spx' + id)?.addEventListener('click',
    () => document.getElementById('sp' + id)?.classList.remove('open')
  );

  // resize handle
  const rh = document.getElementById('rh' + id);
  let rd = false, rx = 0, ry = 0, rw = 0, rh2 = 0;
  rh.addEventListener('mousedown', e => {
    rd = true; rx = e.clientX; ry = e.clientY;
    rw = win.offsetWidth; rh2 = win.offsetHeight;
    e.preventDefault(); e.stopPropagation();
  });
  document.addEventListener('mousemove', e => {
    if (!rd) return;
    win.style.width  = Math.max(440, rw  + e.clientX - rx) + 'px';
    win.style.height = Math.max(340, rh2 + e.clientY - ry) + 'px';
  });
  document.addEventListener('mouseup', () => { rd = false; });
}
