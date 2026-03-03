'use strict';
/* ═══════════════════════════════════════════════════════════
   CALENDAR — logica calendario settimanale
   Dipende da: window-manager.js (WINS), sidepanel.js (openSP)
   QUICK EDIT: cambia --cal-hour-h in css/base.css
   ═══════════════════════════════════════════════════════════ */

const DAYS_IT   = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
const MONTHS_IT = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
                   'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

/** Palette colori eventi — cicla automaticamente */
const EV_COLORS = [
  'rgba(99,179,255,.85)',
  'rgba(167,139,250,.85)',
  'rgba(52,211,153,.85)',
  'rgba(251,191,36,.85)',
  'rgba(251,146,60,.85)',
  'rgba(236,72,153,.85)',
];
let evColorIdx = 0;

/** Legge l'altezza di un'ora dalla CSS custom property --cal-hour-h */
function hourH() {
  return parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--cal-hour-h')) || 64;
}

/** Ritorna il lunedì della settimana contenente `date` */
function getWeekStart(date) {
  const d   = new Date(date);
  const day = d.getDay();                   // 0=dom, 1=lun, …
  const off = day === 0 ? -6 : 1 - day;    // offset verso lunedì
  d.setDate(d.getDate() + off);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Formatta Date come 'YYYY-MM-DD' */
function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/** Converte minuti totali in 'HH:MM' — clampato a 00:00–23:59 */
function minToHHMM(m) {
  m = Math.max(0, Math.min(1439, Math.round(m)));
  return `${String(Math.floor(m / 60)).padStart(2,'0')}:${String(m % 60).padStart(2,'0')}`;
}

/** Snap a intervalli di 15 minuti */
function snapMin(m) {
  return Math.round(m / 15) * 15;
}

// ─── Init ──────────────────────────────────────────────────

function initCalendar(id) {
  const w = WINS[id];
  if (!w || w.type !== 'calendar') return;
  const today = new Date();
  w.calState = {
    viewYear:  today.getFullYear(),
    viewMonth: today.getMonth(),
    weekStart: getWeekStart(today),
    today,
    ghostEl: null,
  };
  renderMiniCal(id);
  renderWeekGrid(id);
  bindCalNav(id);
}

// ─── Navigazione ───────────────────────────────────────────

function bindCalNav(id) {
  document.getElementById('cal-pmo' + id).onclick = () => {
    const cs = WINS[id].calState;
    cs.viewMonth--;
    if (cs.viewMonth < 0) { cs.viewMonth = 11; cs.viewYear--; }
    renderMiniCal(id);
  };
  document.getElementById('cal-nmo' + id).onclick = () => {
    const cs = WINS[id].calState;
    cs.viewMonth++;
    if (cs.viewMonth > 11) { cs.viewMonth = 0; cs.viewYear++; }
    renderMiniCal(id);
  };
  document.getElementById('cal-today' + id).onclick = () => {
    const cs = WINS[id].calState;
    const t  = new Date();
    cs.weekStart  = getWeekStart(t);
    cs.viewYear   = t.getFullYear();
    cs.viewMonth  = t.getMonth();
    renderMiniCal(id);
    renderWeekGrid(id);
  };
}

// ─── Mini calendario mensile ────────────────────────────────

function renderMiniCal(id) {
  const w = WINS[id];
  if (!w?.calState) return;
  const { viewYear, viewMonth, weekStart, today } = w.calState;

  document.getElementById('cal-mlbl' + id).textContent =
    `${MONTHS_IT[viewMonth].slice(0, 3)} ${viewYear}`;

  const mini = document.getElementById('mini' + id);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevDays    = new Date(viewYear, viewMonth,     0).getDate();
  const firstDow    = (() => {
    const d = new Date(viewYear, viewMonth, 1).getDay();
    return d === 0 ? 6 : d - 1; // 0=lun
  })();

  let html = `<div class="mini-dow">${DAYS_IT.map(d => `<span>${d[0]}</span>`).join('')}</div><div class="mini-days">`;

  // giorni del mese precedente
  for (let i = firstDow - 1; i >= 0; i--) {
    const d = new Date(viewYear, viewMonth - 1, prevDays - i);
    html += `<div class="mday other-month" data-date="${fmtDate(d)}">${prevDays - i}</div>`;
  }

  // giorni del mese corrente
  const ws = new Date(weekStart);
  const we = new Date(weekStart); we.setDate(we.getDate() + 6);

  for (let d = 1; d <= daysInMonth; d++) {
    const dt    = new Date(viewYear, viewMonth, d);
    const dtStr = fmtDate(dt);
    const cls   = [
      'mday',
      dtStr === fmtDate(today) ? 'today'    : '',
      (dt >= ws && dt <= we)   ? 'in-week'  : '',
    ].filter(Boolean).join(' ');
    html += `<div class="${cls}" data-date="${dtStr}">${d}</div>`;
  }

  // giorni del mese successivo per completare la griglia
  const total = firstDow + daysInMonth;
  const cells = Math.ceil(total / 7) * 7;
  for (let i = 1; i <= cells - total; i++) {
    const dt = new Date(viewYear, viewMonth + 1, i);
    html += `<div class="mday other-month" data-date="${fmtDate(dt)}">${i}</div>`;
  }

  html += '</div>';
  mini.innerHTML = html;

  // click su giorno → naviga alla settimana
  mini.querySelectorAll('.mday').forEach(el => {
    el.addEventListener('click', () => {
      const dt = new Date(el.dataset.date + 'T00:00:00');
      w.calState.weekStart = getWeekStart(dt);
      renderMiniCal(id);
      renderWeekGrid(id);
    });
  });
}

// ─── Griglia settimanale ────────────────────────────────────

function renderWeekGrid(id) {
  const w = WINS[id];
  if (!w?.calState) return;
  const { weekStart, today } = w.calState;
  const HH       = hourH();
  const todayStr = fmtDate(today);

  // header giorni
  const hdrsEl = document.getElementById('cal-hdrs' + id);
  hdrsEl.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const d    = new Date(weekStart); d.setDate(d.getDate() + i);
    const dStr = fmtDate(d);
    const div  = document.createElement('div');
    div.className = 'cal-day-hdr' + (dStr === todayStr ? ' today' : '');
    div.innerHTML = `<div class="dow">${DAYS_IT[i]}</div><div class="dom">${d.getDate()}</div>`;
    hdrsEl.appendChild(div);
  }

  // colonna orari
  const timeCol = document.getElementById('cal-time' + id);
  timeCol.style.cssText = `position:relative;height:${HH * 24}px`;
  timeCol.innerHTML = '';
  for (let h = 0; h < 24; h++) {
    const lbl = document.createElement('div');
    lbl.className  = 'hr-lbl';
    lbl.style.top  = (h * HH) + 'px';
    lbl.textContent = h === 0 ? '' : String(h).padStart(2, '0') + ':00';
    timeCol.appendChild(lbl);
  }

  // griglia 7 colonne
  const grid = document.getElementById('cal-grid' + id);
  grid.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const col = document.createElement('div');
    col.className    = 'cal-col';
    col.dataset.day  = i;
    col.style.height = (HH * 24) + 'px';

    // linee orizzontali per ora e mezzora
    for (let h = 0; h < 24; h++) {
      const line = document.createElement('div');
      line.className = 'hr-line'; line.style.top = (h * HH) + 'px';
      col.appendChild(line);
      if (h > 0) {
        const half = document.createElement('div');
        half.className = 'hr-half'; half.style.top = (h * HH - HH / 2) + 'px';
        col.appendChild(half);
      }
    }

    // linea "adesso" solo sul giorno odierno
    const d = new Date(weekStart); d.setDate(d.getDate() + i);
    if (fmtDate(d) === todayStr) {
      const now    = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const nl     = document.createElement('div');
      nl.className  = 'now-line';
      nl.style.top  = (nowMin / 60 * HH) + 'px';
      col.appendChild(nl);
      setInterval(() => {
        const n = new Date();
        nl.style.top = ((n.getHours() * 60 + n.getMinutes()) / 60 * HH) + 'px';
      }, 60000);
    }

    grid.appendChild(col);
  }

  renderAllEvents(id);
  bindDragCreate(id);
}

// ─── Drag-to-create evento ─────────────────────────────────

function bindDragCreate(id) {
  const w    = WINS[id];
  const grid = document.getElementById('cal-grid' + id);
  if (!grid) return;
  const HH   = hourH();

  let dragState = null;

  grid.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    if (e.target.classList.contains('cal-event') || e.target.closest('.cal-event')) return;
    const col = e.target.closest('.cal-col');
    if (!col) return;

    const dayIdx   = parseInt(col.dataset.day);
    const rect     = col.getBoundingClientRect();
    const scrollEl = document.getElementById('cal-scroll' + id);
    const relY     = e.clientY - rect.top + scrollEl.scrollTop;
    const startMin = Math.min(1410, Math.max(0, snapMin(relY / HH * 60)));

    dragState = { dayIdx, startMin, endMin: Math.min(1439, startMin + 60), col };

    if (w.calState.ghostEl) w.calState.ghostEl.remove();
    const ghost = document.createElement('div');
    ghost.className  = 'cal-ghost';
    ghost.style.top  = (startMin / 60 * HH) + 'px';
    ghost.style.height = HH + 'px';
    col.appendChild(ghost);
    w.calState.ghostEl = ghost;

    e.preventDefault(); e.stopPropagation();
  });

  document.addEventListener('mousemove', e => {
    if (!dragState) return;
    const rect     = dragState.col.getBoundingClientRect();
    const scrollEl = document.getElementById('cal-scroll' + id);
    if (!scrollEl) return;
    const relY   = e.clientY - rect.top + scrollEl.scrollTop;
    const curMin = snapMin(Math.max(0, Math.min(1425, relY / HH * 60)));
    dragState.endMin = Math.min(1439, Math.max(dragState.startMin + 15, curMin));
    if (w.calState.ghostEl) {
      w.calState.ghostEl.style.top    = (dragState.startMin / 60 * HH) + 'px';
      w.calState.ghostEl.style.height = ((dragState.endMin - dragState.startMin) / 60 * HH) + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    if (!dragState) return;
    if (w.calState.ghostEl) { w.calState.ghostEl.remove(); w.calState.ghostEl = null; }

    const dayDate = new Date(w.calState.weekStart);
    dayDate.setDate(dayDate.getDate() + dragState.dayIdx);

    const event = {
      id:       'ev-' + Date.now(),
      title:    'Nuovo evento',
      date:     fmtDate(dayDate),
      startMin: Math.min(1410, Math.max(0, dragState.startMin)),
      endMin:   Math.min(1439, Math.max(dragState.startMin + 15, dragState.endMin)),
      note:     '',
      color:    EV_COLORS[evColorIdx++ % EV_COLORS.length],
    };

    WINS[id].events.push(event);
    renderAllEvents(id);
    openSP(id, event, 'event');
    dragState = null;
  });
}

// ─── Render eventi ─────────────────────────────────────────

function renderAllEvents(id) {
  const w = WINS[id];
  if (!w?.calState) return;
  const { weekStart } = w.calState;
  const HH   = hourH();
  const grid = document.getElementById('cal-grid' + id);
  if (!grid) return;

  grid.querySelectorAll('.cal-event').forEach(e => e.remove());

  w.events.forEach(ev => {
    // salta eventi con orari illegali
    if (ev.startMin < 0 || ev.endMin > 1439 || ev.startMin >= ev.endMin) return;
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart); d.setDate(d.getDate() + i);
      if (fmtDate(d) !== ev.date) continue;

      const col = grid.querySelector(`[data-day="${i}"]`);
      if (!col) break;

      const el = document.createElement('div');
      el.className    = 'cal-event';
      el.dataset.evid = ev.id;
      el.style.top    = (ev.startMin / 60 * HH) + 'px';
      el.style.height = Math.max(18, (ev.endMin - ev.startMin) / 60 * HH) + 'px';
      el.style.background = ev.color;
      el.style.color      = '#07090f';
      el.innerHTML = `
        <div class="ev-title">${ev.title}</div>
        <div class="ev-time">${minToHHMM(ev.startMin)} – ${minToHHMM(ev.endMin)}</div>
      `;
      el.addEventListener('click', e => { e.stopPropagation(); openSP(id, ev, 'event'); });
      col.appendChild(el);
      break;
    }
  });
}

/** Scrolla la vista verso l'ora attuale */
function scrollToNow(id) {
  const sc = document.getElementById('cal-scroll' + id);
  if (!sc) return;
  const now = new Date();
  sc.scrollTop = Math.max(0, (now.getHours() - 1) * hourH());
}
