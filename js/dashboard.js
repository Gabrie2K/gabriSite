'use strict';
/* ═══════════════════════════════════════════════════════════
   DASHBOARD — Home screen stile Xbox 2001
   Dipende da: window-manager.js (WINS, createWin)
   ═══════════════════════════════════════════════════════════ */

const DASH_ITEMS = [
  { tab: 'Calendario',  sym: '▦', color: '#63b3ff', desc: 'Calendario settimanale con eventi drag-and-drop' },
  { tab: 'Mappa',       sym: '◎', color: '#34d399', desc: 'Globo 3D interattivo con pin geolocalizzati' },
  { tab: 'Albero',      sym: '⊞', color: '#a78bfa', desc: 'Struttura gerarchica con vista Lista, Grafo, Blocchi' },
  { tab: 'Note',        sym: '≡', color: '#fbbf24', desc: 'Notebook testuale con sezioni multiple' },
  { tab: 'Corpo Umano', sym: '♁', color: '#00d4ff', desc: 'Annotazioni anatomiche su corpo umano 2D' },
  { tab: 'Schema',      sym: '⬡', color: '#fb923c', desc: 'Editor di flussi con nodi e connessioni' },
  { tab: 'Pagina',      sym: '📄', color: '#e2e8f0', desc: 'Documento con testo e immagini ridimensionabili' },
  { tab: 'Computer',    sym: '⬢', color: '#63b3ff', desc: 'Costellazione componenti hardware e software' },
  { tab: 'Server',      sym: '▣', color: '#a78bfa', desc: 'Costellazione infrastruttura server' },
  { tab: 'Example',     sym: '◈', color: '#34d399', desc: 'Costellazione di esempio per un progetto' },
];

function dashBodyHTML(id) {
  return `<div class="dash-wrap" id="dashwrap${id}"></div>`;
}

function initDashboard(id) {
  const w = WINS[id];
  if (!w) return;

  const wrap = document.getElementById('dashwrap' + id);
  if (!wrap) return;

  let activeIdx = w._dashActiveIdx ?? 0;

  // ── build DOM ──────────────────────────────────────────────
  wrap.innerHTML = `
    <div class="dash-logo">✦ SPATIUM</div>
    <div class="dash-carousel" id="dashcar${id}">
      <button class="dash-arrow" id="dashleft${id}">‹</button>
      <div id="dashitems${id}" style="display:flex;gap:18px;align-items:center;"></div>
      <button class="dash-arrow" id="dashright${id}">›</button>
    </div>
    <div class="dash-detail" id="dashdet${id}">
      <div class="dash-detail-name" id="dashdn${id}"></div>
      <div class="dash-detail-desc" id="dashdd${id}"></div>
    </div>
    <button class="dash-open-btn" id="dashopen${id}">Apri →</button>
    <div class="dash-hint">← → per navigare &nbsp;·&nbsp; Invio o click per aprire</div>
  `;

  const itemsEl  = document.getElementById('dashitems' + id);
  const nameEl   = document.getElementById('dashdn' + id);
  const descEl   = document.getElementById('dashdd' + id);
  const openBtn  = document.getElementById('dashopen' + id);
  const leftBtn  = document.getElementById('dashleft' + id);
  const rightBtn = document.getElementById('dashright' + id);

  // render cards
  DASH_ITEMS.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'dash-item' + (i === activeIdx ? ' active' : '');
    el.style.setProperty('--item-color', item.color);
    el.dataset.idx = i;
    el.innerHTML = `
      <div class="dash-item-sym">${item.sym}</div>
      <div class="dash-item-name">${item.tab}</div>
      <div class="dash-item-desc">${item.desc}</div>
    `;
    el.addEventListener('click', () => {
      if (i === activeIdx) {
        openActive();
      } else {
        setActive(i);
      }
    });
    itemsEl.appendChild(el);
  });

  function setActive(idx) {
    activeIdx = ((idx % DASH_ITEMS.length) + DASH_ITEMS.length) % DASH_ITEMS.length;
    w._dashActiveIdx = activeIdx;

    itemsEl.querySelectorAll('.dash-item').forEach((el, i) => {
      el.classList.toggle('active', i === activeIdx);
    });

    const item = DASH_ITEMS[activeIdx];
    nameEl.textContent = item.tab;
    descEl.textContent = item.desc;
    openBtn.style.borderColor = item.color + '99';
    openBtn.style.color = item.color;

    // scroll active into view within carousel
    const activeEl = itemsEl.children[activeIdx];
    if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  function openActive() {
    const item = DASH_ITEMS[activeIdx];
    createWin(item.tab);
  }

  // init detail
  setActive(activeIdx);

  // nav buttons
  leftBtn.addEventListener('click',  () => setActive(activeIdx - 1));
  rightBtn.addEventListener('click', () => setActive(activeIdx + 1));
  openBtn.addEventListener('click',  () => openActive());

  // keyboard — only when this window is focused
  function onKeyDown(e) {
    if (!w.win.classList.contains('focused')) return;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); setActive(activeIdx - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); setActive(activeIdx + 1); }
    if (e.key === 'Enter')      { e.preventDefault(); openActive(); }
  }

  document.addEventListener('keydown', onKeyDown);
  w._dashDispose = () => document.removeEventListener('keydown', onKeyDown);
}
