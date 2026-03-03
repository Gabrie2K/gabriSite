'use strict';
/* ═══════════════════════════════════════════════════════════
   WINDOW MANAGER — gestione finestre desktop-like
   Dipende da: templates.js, three-helpers.js
   Chiama (lazy): scene3d.js, calendar.js, sidepanel.js
   ═══════════════════════════════════════════════════════════ */

let WC = 0;   // contatore finestre create
let TZ = 100; // z-index progressivo

/** Registro globale delle finestre: WINS[id] = { win, tpl, type, scene3d, nodes?, events?, calState? } */
const WINS = {};

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

// ─── Creazione finestra ────────────────────────────────────

function createWin(tplName, pos) {
  const id         = ++WC;
  const isCalendar = (tplName === 'Calendario');
  const x = pos?.x ?? 40 + (id - 1) * 28;
  const y = pos?.y ?? 28 + (id - 1) * 28;

  // elemento finestra
  const win = document.createElement('div');
  win.className = 'win focused';
  win.id = 'w' + id;
  win.style.cssText = `left:${x}px;top:${y}px;width:var(--win-w);height:var(--win-h);z-index:${++TZ}`;

  // tabs: tutte le costellazioni + Calendario
  const allTabs  = [...Object.keys(TPL), 'Calendario'];
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
      <span class="win-name" id="wn${id}">✦ ${tplName}</span>
    </div>
    <div class="win-tabs" id="wtabs${id}">${tabsHTML}</div>
    <div class="win-body" id="wb${id}">
      ${isCalendar ? calendarBodyHTML(id) : graphBodyHTML(id)}
    </div>
    <div class="rh" id="rh${id}"></div>
  `;

  document.getElementById('desktop').appendChild(win);

  // pulsante taskbar
  const tb = document.createElement('button');
  tb.className = 'tb-btn active';
  tb.id = 'tb' + id;
  tb.textContent = '◈ ' + tplName;
  tb.onclick = () => toggleMin(id);
  document.getElementById('tb-wins').appendChild(tb);

  // stato finestra
  const winData = {
    win, tpl: tplName,
    type: isCalendar ? 'calendar' : 'constellation',
    scene3d: null,
    calState: null,
  };

  if (!isCalendar) {
    const raw = TPL[tplName] || TPL.Computer;
    const tpl = JSON.parse(JSON.stringify(raw));
    assignPositions(tpl.nodes);
    winData.nodes = tpl.nodes;
  } else {
    winData.events = [];
  }

  WINS[id] = winData;
  setupWinEvents(id);
  focusW(id);

  if (!isCalendar) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (WINS[id])
        WINS[id].scene3d = create3DScene(
          id, WINS[id].nodes,
          TPL[tplName]?.color || 0x63b3ff,
          node => openSP(id, node, 'node')
        );
    }));
  } else {
    requestAnimationFrame(() => initCalendar(id));
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
  WINS[id]?.scene3d?.dispose();
  WINS[id]?.win.remove();
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

// ─── Cambio tab (layer) ────────────────────────────────────

function switchLayer(id, l) {
  const w = WINS[id];
  if (!w) return;

  document.getElementById('wn' + id).textContent = '✦ ' + l;
  document.getElementById('tb' + id).textContent  = '◈ ' + l;
  w.tpl = l;

  const wb = document.getElementById('wb' + id);
  const sp = document.getElementById('sp' + id);
  if (sp) sp.classList.remove('open');

  const isCalendar = (l === 'Calendario');

  // smonta scena 3D precedente
  w.scene3d?.dispose();
  w.scene3d = null;

  wb.innerHTML = isCalendar ? calendarBodyHTML(id) : graphBodyHTML(id);

  // ri-aggancia bottone chiusura pannello
  document.getElementById('spx' + id).addEventListener('click',
    () => document.getElementById('sp' + id).classList.remove('open')
  );

  if (!isCalendar) {
    w.type = 'constellation';
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
  } else {
    w.type = 'calendar';
    if (!w.events) w.events = [];
    requestAnimationFrame(() => initCalendar(id));
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
    if (a === 'cl') closeW(id);
    else if (a === 'mn') toggleMin(id);
    else if (a === 'mx') maxW(id);
  }));

  // tab switch
  document.getElementById('wtabs' + id).addEventListener('click', e => {
    const l = e.target.dataset.l;
    if (!l) return;
    win.querySelectorAll('.wtab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    switchLayer(id, l);
  });

  // chiudi side panel
  document.getElementById('spx' + id).addEventListener('click',
    () => document.getElementById('sp' + id).classList.remove('open')
  );

  // resize handle (angolo basso-destra)
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
