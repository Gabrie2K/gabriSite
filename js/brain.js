'use strict';
/* ═══════════════════════════════════════════════════════════
   CORPO UMANO — visualizzazione 2D neon con annotazioni
   Dipende da: window-manager.js (WINS)
   ═══════════════════════════════════════════════════════════ */

const THOUGHT_COLORS = [
  0x63b3ff, 0xa78bfa, 0x34d399,
  0xfbbf24, 0xfb923c, 0xec4899,
];

// ─── Regioni cliccabili del corpo (coordinate normalizzate 0-1) ──
const BODY_REGIONS = [
  { id: 'testa',      label: 'Testa',       cx: 0.500, cy: 0.082, r: 0.068 },
  { id: 'collo',      label: 'Collo',       cx: 0.500, cy: 0.155, r: 0.030 },
  { id: 'torace',     label: 'Torace',      cx: 0.500, cy: 0.290, r: 0.095 },
  { id: 'addome',     label: 'Addome',      cx: 0.500, cy: 0.450, r: 0.085 },
  { id: 'braccio_sx', label: 'Braccio Sx',  cx: 0.320, cy: 0.350, r: 0.055 },
  { id: 'braccio_dx', label: 'Braccio Dx',  cx: 0.680, cy: 0.350, r: 0.055 },
  { id: 'mano_sx',    label: 'Mano Sx',     cx: 0.245, cy: 0.520, r: 0.038 },
  { id: 'mano_dx',    label: 'Mano Dx',     cx: 0.755, cy: 0.520, r: 0.038 },
  { id: 'gamba_sx',   label: 'Gamba Sx',    cx: 0.435, cy: 0.680, r: 0.065 },
  { id: 'gamba_dx',   label: 'Gamba Dx',    cx: 0.565, cy: 0.680, r: 0.065 },
  { id: 'piede_sx',   label: 'Piede Sx',    cx: 0.425, cy: 0.920, r: 0.042 },
  { id: 'piede_dx',   label: 'Piede Dx',    cx: 0.575, cy: 0.920, r: 0.042 },
];

// ─── HTML struttura finestra ──────────────────────────────────

function brainBodyHTML(id) {
  return `
    <div class="brain-wrap" id="brainwrap${id}">
      <div class="brain-left">
        <div class="brain-left-title">Annotazioni</div>
        <div class="brain-form" id="brainform${id}">
          <div class="brain-form-hint" id="brainhint${id}">
            Clicca su una regione del corpo per aggiungere un'annotazione
          </div>
          <div class="brain-region-lbl" id="brainregion${id}"></div>
          <input class="brain-form-inp" id="braintitle${id}" placeholder="Titolo…" disabled>
          <textarea class="brain-form-ta" id="braincontent${id}" placeholder="Descrizione…" disabled></textarea>
          <button class="brain-form-add" id="brainadd${id}" disabled>+ Aggiungi annotazione</button>
        </div>
        <div class="brain-thought-list" id="brainlist${id}"></div>
      </div>
      <div class="brain-scene" id="brainscene${id}">
        <div class="brain-scene-hint">click su regione → annotazione</div>
        <div class="brain-popup" id="brainpopup${id}" style="display:none">
          <div class="brain-popup-hdr">
            <input class="brain-popup-title-inp" id="brainptitle${id}" placeholder="Titolo…">
            <button class="brain-popup-close" id="brainpclose${id}">✕</button>
          </div>
          <textarea class="brain-popup-note" id="brainpnote${id}" placeholder="Descrizione…"></textarea>
          <button class="brain-popup-del" id="brainpdel${id}">Elimina annotazione</button>
        </div>
      </div>
    </div>`;
}

// ─── Init ─────────────────────────────────────────────────────

function initBrain(id) {
  const w = WINS[id];
  if (!w || w.type !== 'brain') return;
  if (!w.thoughts) w.thoughts = [];

  const addBtn    = document.getElementById('brainadd'     + id);
  const titleInp  = document.getElementById('braintitle'   + id);
  const contentTa = document.getElementById('braincontent' + id);
  const hintEl    = document.getElementById('brainhint'    + id);
  const regionLbl = document.getElementById('brainregion'  + id);

  w._brainPendingPos = null;

  addBtn.onclick = () => {
    const t = titleInp.value.trim();
    if (!t || !w._brainPendingPos) return;

    const thought = {
      id:      'th-' + Date.now(),
      cx:      w._brainPendingPos.cx,
      cy:      w._brainPendingPos.cy,
      region:  w._brainPendingPos.regionId,
      title:   t,
      content: contentTa.value.trim(),
      color:   THOUGHT_COLORS[w.thoughts.length % THOUGHT_COLORS.length],
    };
    w.thoughts.push(thought);
    renderThoughtList(id);
    redrawBody(id);

    titleInp.value  = '';
    contentTa.value = '';
    titleInp.disabled  = true;
    contentTa.disabled = true;
    addBtn.disabled    = true;
    hintEl.textContent = 'Clicca su una regione del corpo per aggiungere un\'annotazione';
    if (regionLbl) regionLbl.textContent = '';
    w._brainPendingPos = null;

    if (window.persistState) window.persistState();
  };

  document.getElementById('brainpclose' + id).onclick = () => closeThoughtPopup(id);

  renderThoughtList(id);
  createBodyCanvas(id);
}

// ─── Canvas 2D ────────────────────────────────────────────────

function createBodyCanvas(id) {
  const container = document.getElementById('brainscene' + id);
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'bodycvs' + id;
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;cursor:crosshair;';
  container.insertBefore(canvas, container.firstChild);

  const w = WINS[id];
  if (!w) return;

  function resize() {
    canvas.width  = container.offsetWidth  || 600;
    canvas.height = container.offsetHeight || 400;
    redrawBody(id);
  }
  resize();

  const ro = new ResizeObserver(resize);
  ro.observe(container);

  canvas.addEventListener('click', e => handleBodyClick(id, e, canvas));
  canvas.addEventListener('mousemove', e => handleBodyHover(id, e, canvas));

  w._brainDispose = () => {
    ro.disconnect();
    canvas.remove();
  };
}

// ─── Disegno corpo ────────────────────────────────────────────

function redrawBody(id) {
  const cvs = document.getElementById('bodycvs' + id);
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  const W = cvs.width, H = cvs.height;
  drawBody(ctx, W, H, WINS[id]?.thoughts || [], WINS[id]?._hoverRegion);
}

function drawBody(ctx, W, H, thoughts, hoverRegionId) {
  ctx.clearRect(0, 0, W, H);

  // ── Sfondo ──────────────────────────────────────────────
  ctx.fillStyle = '#040a14';
  ctx.fillRect(0, 0, W, H);

  // griglia in basso (stile retro-futurista)
  const gridY = H * 0.82;
  const gridCols = 20, gridRows = 8;
  const cellW = W / gridCols, cellH = (H - gridY) / gridRows;
  ctx.strokeStyle = 'rgba(0,80,200,.22)';
  ctx.lineWidth = 0.8;
  for (let c = 0; c <= gridCols; c++) {
    ctx.beginPath();
    ctx.moveTo(c * cellW, gridY);
    ctx.lineTo(W / 2 + (c * cellW - W / 2) * 2.5, H + cellH * 2);
    ctx.stroke();
  }
  for (let r = 0; r <= gridRows; r++) {
    const y = gridY + r * cellH;
    const shrink = r / gridRows;
    const margin = shrink * W * 0.35;
    ctx.beginPath();
    ctx.moveTo(margin, y); ctx.lineTo(W - margin, y);
    ctx.stroke();
  }

  // ── Parametri corpo ──────────────────────────────────────
  // Il corpo è scalato rispetto all'altezza del canvas
  const bodyH = H * 0.88;
  const bodyW = bodyH * 0.42;
  const ox = W / 2;     // centro orizzontale
  const oy = H * 0.04;  // offset verticale (top del corpo)

  function bx(nx) { return ox + (nx - 0.5) * bodyW * 2.4; }
  function by(ny) { return oy + ny * bodyH; }

  // ── Helper glow ──────────────────────────────────────────
  function setGlow(color, blur) {
    ctx.shadowColor = color;
    ctx.shadowBlur  = blur;
    ctx.strokeStyle = color;
  }
  function clearGlow() { ctx.shadowBlur = 0; }

  // ── Corpo: outline principale ────────────────────────────
  ctx.lineWidth = 2;
  setGlow('#00d4ff', 16);

  // Testa
  const headCX = bx(0.5), headCY = by(0.08), headR = bodyH * 0.068;
  ctx.beginPath();
  ctx.arc(headCX, headCY, headR, 0, Math.PI * 2);
  ctx.stroke();

  // Collo
  ctx.beginPath();
  ctx.moveTo(bx(0.46), by(0.145));
  ctx.lineTo(bx(0.46), by(0.175));
  ctx.moveTo(bx(0.54), by(0.145));
  ctx.lineTo(bx(0.54), by(0.175));
  ctx.stroke();

  // Torso
  ctx.beginPath();
  ctx.moveTo(bx(0.46), by(0.175));
  ctx.bezierCurveTo(bx(0.36), by(0.20), bx(0.30), by(0.26), bx(0.30), by(0.36));
  ctx.bezierCurveTo(bx(0.30), by(0.46), bx(0.36), by(0.52), bx(0.40), by(0.54));
  ctx.lineTo(bx(0.42), by(0.60));
  ctx.moveTo(bx(0.54), by(0.175));
  ctx.bezierCurveTo(bx(0.64), by(0.20), bx(0.70), by(0.26), bx(0.70), by(0.36));
  ctx.bezierCurveTo(bx(0.70), by(0.46), bx(0.64), by(0.52), bx(0.60), by(0.54));
  ctx.lineTo(bx(0.58), by(0.60));
  ctx.stroke();

  // Spalle e linea clavicola
  ctx.beginPath();
  ctx.moveTo(bx(0.30), by(0.22));
  ctx.lineTo(bx(0.70), by(0.22));
  ctx.stroke();

  // Braccia
  ctx.beginPath();
  // braccio sx
  ctx.moveTo(bx(0.30), by(0.22));
  ctx.bezierCurveTo(bx(0.24), by(0.28), bx(0.22), by(0.38), bx(0.24), by(0.50));
  ctx.bezierCurveTo(bx(0.25), by(0.55), bx(0.24), by(0.58), bx(0.22), by(0.60));
  // mano sx
  ctx.bezierCurveTo(bx(0.20), by(0.62), bx(0.18), by(0.64), bx(0.19), by(0.66));
  ctx.bezierCurveTo(bx(0.195), by(0.68), bx(0.22), by(0.68), bx(0.23), by(0.66));
  // braccio dx
  ctx.moveTo(bx(0.70), by(0.22));
  ctx.bezierCurveTo(bx(0.76), by(0.28), bx(0.78), by(0.38), bx(0.76), by(0.50));
  ctx.bezierCurveTo(bx(0.75), by(0.55), bx(0.76), by(0.58), bx(0.78), by(0.60));
  // mano dx
  ctx.bezierCurveTo(bx(0.80), by(0.62), bx(0.82), by(0.64), bx(0.81), by(0.66));
  ctx.bezierCurveTo(bx(0.805), by(0.68), bx(0.78), by(0.68), bx(0.77), by(0.66));
  ctx.stroke();

  // Bacino
  ctx.beginPath();
  ctx.moveTo(bx(0.42), by(0.60));
  ctx.bezierCurveTo(bx(0.38), by(0.61), bx(0.35), by(0.62), bx(0.36), by(0.64));
  ctx.bezierCurveTo(bx(0.37), by(0.66), bx(0.43), by(0.66), bx(0.44), by(0.64));
  ctx.moveTo(bx(0.58), by(0.60));
  ctx.bezierCurveTo(bx(0.62), by(0.61), bx(0.65), by(0.62), bx(0.64), by(0.64));
  ctx.bezierCurveTo(bx(0.63), by(0.66), bx(0.57), by(0.66), bx(0.56), by(0.64));
  ctx.stroke();

  // Gambe
  ctx.beginPath();
  // gamba sx
  ctx.moveTo(bx(0.44), by(0.64));
  ctx.bezierCurveTo(bx(0.42), by(0.72), bx(0.41), by(0.80), bx(0.42), by(0.88));
  ctx.bezierCurveTo(bx(0.42), by(0.93), bx(0.40), by(0.96), bx(0.39), by(0.98));
  ctx.moveTo(bx(0.56), by(0.64));
  ctx.bezierCurveTo(bx(0.58), by(0.72), bx(0.59), by(0.80), bx(0.58), by(0.88));
  ctx.bezierCurveTo(bx(0.58), by(0.93), bx(0.60), by(0.96), bx(0.61), by(0.98));
  // piedi
  ctx.moveTo(bx(0.39), by(0.98));
  ctx.bezierCurveTo(bx(0.37), by(0.985), bx(0.33), by(0.988), bx(0.34), by(0.995));
  ctx.moveTo(bx(0.61), by(0.98));
  ctx.bezierCurveTo(bx(0.63), by(0.985), bx(0.67), by(0.988), bx(0.66), by(0.995));
  ctx.stroke();
  clearGlow();

  // ── Organi interni ───────────────────────────────────────
  ctx.lineWidth = 1.5;

  // Cuore
  setGlow('#ff3377', 14);
  ctx.fillStyle = 'rgba(255,50,100,.25)';
  ctx.beginPath();
  const hx = bx(0.48), hy = by(0.27), hr = bodyH * 0.032;
  ctx.arc(hx - hr * 0.6, hy, hr, -Math.PI, 0);
  ctx.arc(hx + hr * 0.6, hy, hr, -Math.PI, 0);
  ctx.bezierCurveTo(hx + hr * 1.6, hy + hr * 0.7, hx, hy + hr * 2.2, hx - hr * 0.05, hy + hr * 2.4);
  ctx.bezierCurveTo(hx - hr * 0.05, hy + hr * 2.2, hx - hr * 1.6, hy + hr * 0.7, hx - hr * 1.6, hy);
  ctx.fill(); ctx.stroke();
  clearGlow();

  // Polmoni
  setGlow('#4488cc', 10);
  ctx.fillStyle = 'rgba(40,100,200,.15)';
  ctx.strokeStyle = '#4488cc';
  // polmone sx
  ctx.beginPath();
  ctx.ellipse(bx(0.41), by(0.27), bodyH * 0.03, bodyH * 0.055, -0.15, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // polmone dx
  ctx.beginPath();
  ctx.ellipse(bx(0.59), by(0.27), bodyH * 0.03, bodyH * 0.055, 0.15, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  clearGlow();

  // Fegato/addome
  setGlow('#2266aa', 8);
  ctx.fillStyle = 'rgba(20,80,160,.18)';
  ctx.strokeStyle = '#2266aa';
  ctx.beginPath();
  ctx.ellipse(bx(0.50), by(0.39), bodyH * 0.065, bodyH * 0.038, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Reni
  ctx.beginPath();
  ctx.ellipse(bx(0.43), by(0.44), bodyH * 0.022, bodyH * 0.038, 0.2, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(bx(0.57), by(0.44), bodyH * 0.022, bodyH * 0.038, -0.2, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  clearGlow();

  // ── Vasi sanguigni principali ────────────────────────────
  ctx.lineWidth = 1.2;

  // Arteria aorta
  setGlow('#00bbcc', 8);
  ctx.strokeStyle = 'rgba(0,180,210,.6)';
  ctx.beginPath();
  ctx.moveTo(bx(0.50), by(0.19));
  ctx.bezierCurveTo(bx(0.50), by(0.24), bx(0.50), by(0.30), bx(0.50), by(0.56));
  ctx.stroke();

  // Vena cava
  ctx.strokeStyle = 'rgba(0,130,180,.45)';
  ctx.beginPath();
  ctx.moveTo(bx(0.52), by(0.19));
  ctx.bezierCurveTo(bx(0.53), by(0.30), bx(0.53), by(0.44), bx(0.53), by(0.56));
  ctx.stroke();

  // Vasi arti superiori
  ctx.lineWidth = 0.9;
  ctx.strokeStyle = 'rgba(0,160,200,.4)';
  ctx.beginPath();
  ctx.moveTo(bx(0.30), by(0.24));
  ctx.bezierCurveTo(bx(0.26), by(0.35), bx(0.24), by(0.45), bx(0.22), by(0.62));
  ctx.moveTo(bx(0.70), by(0.24));
  ctx.bezierCurveTo(bx(0.74), by(0.35), bx(0.76), by(0.45), bx(0.78), by(0.62));
  ctx.stroke();

  // Vasi arti inferiori
  ctx.beginPath();
  ctx.moveTo(bx(0.47), by(0.60));
  ctx.bezierCurveTo(bx(0.45), by(0.70), bx(0.44), by(0.82), bx(0.43), by(0.95));
  ctx.moveTo(bx(0.53), by(0.60));
  ctx.bezierCurveTo(bx(0.55), by(0.70), bx(0.56), by(0.82), bx(0.57), by(0.95));
  ctx.stroke();
  clearGlow();

  // ── Highlight regione hover ──────────────────────────────
  if (hoverRegionId) {
    const reg = BODY_REGIONS.find(r => r.id === hoverRegionId);
    if (reg) {
      const rx = bx(reg.cx) - ox + ox;
      const ry = by(reg.cy);
      const rr = reg.r * bodyH;
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#00d4ff';
      ctx.shadowColor = '#00d4ff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(bx(reg.cx), ry, rr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ── Marker annotazioni ───────────────────────────────────
  thoughts.forEach(t => {
    const tx = bx(t.cx), ty = by(t.cy);
    const col = '#' + (t.color || 0x63b3ff).toString(16).padStart(6, '0');

    ctx.save();
    ctx.shadowColor = col;
    ctx.shadowBlur  = 14;

    // cerchio
    ctx.fillStyle   = col;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(tx, ty, 7, 0, Math.PI * 2);
    ctx.fill();

    // linea al label
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = col;
    ctx.lineWidth   = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + 18, ty - 14);
    ctx.stroke();
    ctx.setLineDash([]);

    // label testo
    ctx.globalAlpha = 1;
    ctx.fillStyle   = col;
    ctx.font        = 'bold 10px Space Mono, monospace';
    ctx.shadowBlur  = 6;
    ctx.fillText(t.title.length > 14 ? t.title.slice(0, 12) + '…' : t.title, tx + 20, ty - 12);
    ctx.restore();
  });
}

// ─── Hover ────────────────────────────────────────────────────

function handleBodyHover(id, e, canvas) {
  const w = WINS[id];
  if (!w) return;
  const reg = getBodyRegionAt(e, canvas);
  const rid = reg?.id || null;
  if (w._hoverRegion !== rid) {
    w._hoverRegion = rid;
    canvas.style.cursor = rid ? 'pointer' : 'crosshair';
    redrawBody(id);
  }
}

// ─── Click ────────────────────────────────────────────────────

function handleBodyClick(id, e, canvas) {
  const w = WINS[id];
  if (!w) return;

  // check pensiero esistente (priorità)
  const rect  = canvas.getBoundingClientRect();
  const mx    = (e.clientX - rect.left) / rect.width;
  const my    = (e.clientY - rect.top)  / rect.height;
  const bodyH = 0.88; // rapporto canvasH del corpo
  const bodyW = bodyH * 0.42 * (rect.height / rect.width) * 2.4;
  const ox = 0.5;
  const oy = 0.04;

  for (const t of (w.thoughts || [])) {
    const dx = mx - (ox + (t.cx - 0.5) * bodyW);
    const dy = my - (oy + t.cy * bodyH);
    if (Math.sqrt(dx*dx + dy*dy) < 0.025) {
      openThoughtPopup(id, t, e.clientX, e.clientY);
      return;
    }
  }

  // check regione corpo
  const reg = getBodyRegionAt(e, canvas);
  if (!reg) return;

  w._brainPendingPos = { cx: reg.cx, cy: reg.cy, regionId: reg.id };

  const titleInp  = document.getElementById('braintitle'   + id);
  const contentTa = document.getElementById('braincontent' + id);
  const addBtn    = document.getElementById('brainadd'     + id);
  const hintEl    = document.getElementById('brainhint'    + id);
  const regionLbl = document.getElementById('brainregion'  + id);

  if (titleInp)  titleInp.disabled  = false;
  if (contentTa) contentTa.disabled = false;
  if (addBtn)    addBtn.disabled    = false;
  if (hintEl)    hintEl.textContent = 'Regione selezionata — compila e aggiungi';
  if (regionLbl) { regionLbl.textContent = '📍 ' + reg.label; regionLbl.style.color = '#00d4ff'; }
  if (titleInp)  titleInp.focus();
}

function getBodyRegionAt(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const mx   = (e.clientX - rect.left)  / rect.width;
  const my   = (e.clientY - rect.top)   / rect.height;
  const aspect = rect.width / rect.height;

  return BODY_REGIONS.find(reg => {
    // cx/cy sono normalizzati rispetto alla stessa trasformazione del disegno
    const bodyH = 0.88;
    const bodyW = bodyH * 0.42 / aspect * 2.4;
    const rx = 0.5 + (reg.cx - 0.5) * bodyW;
    const ry = 0.04 + reg.cy * bodyH;
    const rr = reg.r * bodyH / aspect * 0.85; // raggio normalizzato
    const dx = mx - rx, dy = my - ry;
    return Math.sqrt(dx*dx + dy*dy) < rr;
  }) || null;
}

// ─── Popup editing annotazione ────────────────────────────────

function openThoughtPopup(id, thought, screenX, screenY) {
  const w = WINS[id];
  if (!w) return;
  w._brainActiveThought = thought.id;

  const popup    = document.getElementById('brainpopup'  + id);
  const titleInp = document.getElementById('brainptitle' + id);
  const noteTA   = document.getElementById('brainpnote'  + id);
  const delBtn   = document.getElementById('brainpdel'   + id);
  if (!popup) return;

  titleInp.value = thought.title;
  noteTA.value   = thought.content || '';

  const container = document.getElementById('brainscene' + id);
  if (container) {
    const rect = container.getBoundingClientRect();
    let px = screenX - rect.left + 14;
    let py = screenY - rect.top  - 10;
    if (px + 250 > rect.width)  px = rect.width  - 258;
    if (py + 200 > rect.height) py = rect.height - 210;
    popup.style.left = Math.max(4, px) + 'px';
    popup.style.top  = Math.max(4, py) + 'px';
  }
  popup.style.display = 'block';

  titleInp.oninput = () => {
    thought.title = titleInp.value;
    redrawBody(id);
    renderThoughtList(id);
    if (window.persistState) window.persistState();
  };

  noteTA.oninput = () => {
    thought.content = noteTA.value;
    if (window.persistState) window.persistState();
  };

  delBtn.onclick = () => {
    w.thoughts = (w.thoughts || []).filter(t => t.id !== thought.id);
    redrawBody(id);
    renderThoughtList(id);
    closeThoughtPopup(id);
    if (window.persistState) window.persistState();
  };
}

function closeThoughtPopup(id) {
  const popup = document.getElementById('brainpopup' + id);
  if (popup) popup.style.display = 'none';
  const w = WINS[id];
  if (w) w._brainActiveThought = null;
}

// ─── Lista annotazioni ────────────────────────────────────────

function renderThoughtList(id) {
  const w      = WINS[id];
  const listEl = document.getElementById('brainlist' + id);
  if (!w || !listEl) return;

  listEl.innerHTML = '';
  (w.thoughts || []).forEach(t => {
    const col  = '#' + (t.color || 0x63b3ff).toString(16).padStart(6, '0');
    const item = document.createElement('div');
    item.className = 'brain-thought-item';
    item.style.borderLeftColor = col;

    const regionName = BODY_REGIONS.find(r => r.id === t.region)?.label || t.region || '';
    const preview = t.content ? t.content.slice(0, 55) + (t.content.length > 55 ? '…' : '') : '';
    item.innerHTML = `
      <div class="brain-thought-title" style="color:${col}">${t.title}</div>
      ${regionName ? `<div class="brain-thought-region">${regionName}</div>` : ''}
      ${preview    ? `<div class="brain-thought-preview">${preview}</div>` : ''}
    `;
    item.onclick = () => {
      const cvs = document.getElementById('bodycvs' + id);
      const container = document.getElementById('brainscene' + id);
      if (cvs && container) {
        const rect = container.getBoundingClientRect();
        const bodyH = rect.height * 0.88;
        const bodyW = bodyH * 0.42 * 2.4;
        const sx = rect.left + rect.width / 2 + (t.cx - 0.5) * bodyW;
        const sy = rect.top  + rect.height * 0.04 + t.cy * bodyH;
        openThoughtPopup(id, t, sx, sy);
      }
    };
    listEl.appendChild(item);
  });
}
