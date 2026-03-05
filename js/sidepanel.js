'use strict';
/* ═══════════════════════════════════════════════════════════
   SIDE PANEL — pannello laterale condiviso
   Usato sia dalla vista costellazione (nodo) sia dal calendario (evento)
   Dipende da: window-manager.js (WINS), calendar.js (renderAllEvents)
   ═══════════════════════════════════════════════════════════ */

/**
 * Apre il pannello laterale della finestra e ne popola il contenuto.
 * @param {number} winId  - ID finestra
 * @param {object} data   - nodo o evento
 * @param {string} type   - 'node' | 'event'
 */
function openSP(winId, data, type) {
  document.getElementById('sp' + winId).classList.add('open');
  if (type === 'node')  renderSPNode(winId, data);
  if (type === 'event') renderSPEvent(winId, data);
}

// ─── Vista nodo costellazione ──────────────────────────────

function renderSPNode(winId, node) {
  document.getElementById('stt' + winId).textContent = node.label;
  document.getElementById('sts' + winId).textContent = node.main ? 'nodo principale' : 'componente';

  const body = document.getElementById('spb' + winId);
  body.innerHTML = '';

  // ── attributi ──
  const atSec = mkDiv('');
  atSec.appendChild(mkLbl('● Attributi'));

  node.attrs.forEach(attr => {
    const row = mkDiv('aitem');
    row.innerHTML = `
      <span class="aname">${attr.name}</span>
      <span class="abadge ${attr.s}">${attr.s === 'have' ? '✓ Ho' : '→ Voglio'}</span>
      <button class="atog">${attr.s === 'have' ? 'voglio' : 'ho'}</button>
    `;
    row.querySelector('.atog').onclick = () => {
      attr.s = attr.s === 'have' ? 'want' : 'have';
      WINS[winId]?.scene3d?.refreshDots(node);
      renderSPNode(winId, node);
    };
    atSec.appendChild(row);
  });

  // riga aggiunta attributo
  const ar  = mkDiv('addrow');
  const inp = Object.assign(document.createElement('input'), {
    className: 'ainp', type: 'text', placeholder: 'nuovo attributo...',
  });
  const bh = Object.assign(document.createElement('button'), { className: 'bh', textContent: 'Ho' });
  const bw = Object.assign(document.createElement('button'), { className: 'bw', textContent: 'Voglio' });

  const addAttr = s => {
    if (!inp.value.trim()) return;
    node.attrs.push({ name: inp.value.trim(), s });
    WINS[winId]?.scene3d?.refreshDots(node);
    renderSPNode(winId, node);
  };
  bh.onclick = () => addAttr('have');
  bw.onclick = () => addAttr('want');
  inp.onkeydown  = e => { if (e.key === 'Enter') addAttr('have'); e.stopPropagation(); };
  inp.onmousedown = e => e.stopPropagation();

  ar.append(inp, bh, bw);
  atSec.appendChild(ar);
  body.appendChild(atSec);

  // ── note ──
  const ns = mkDiv('note-sec');
  ns.appendChild(mkLbl('● Note'));
  const ta = document.createElement('textarea');
  ta.className   = 'note-ta';
  ta.placeholder = 'Note libere...';
  ta.value       = node.note || '';
  ta.oninput     = () => { node.note = ta.value; };
  ta.onkeydown   = e => e.stopPropagation();
  ta.onmousedown = e => e.stopPropagation();
  ns.appendChild(ta);
  body.appendChild(ns);

  // ── componenti hardware (solo Computer/Server)
  if (node.label === 'Computer' || node.label === 'Server') {
    node.components = node.components || [];
    const cs = mkDiv('comp-sec');
    cs.appendChild(mkLbl('● Componenti'));
    node.components.forEach((c,i) => {
      const row = mkDiv('comp-item');
      row.textContent = `centro (${c.x.toFixed(1)},${c.y.toFixed(1)}) r=${c.r.toFixed(1)}`;
      const del = document.createElement('button');
      del.textContent = '✕';
      del.onclick = () => { node.components.splice(i,1); renderSPNode(winId,node); WINS[winId]?.scene3d?.refreshDots(node); };
      row.appendChild(del);
      cs.appendChild(row);
    });
    const add = document.createElement('button');
    add.className = 'comp-add-btn';
    add.textContent = '+ Aggiungi';
    add.onclick = () => { addComponent(node); renderSPNode(winId,node); WINS[winId]?.scene3d?.refreshDots(node); };
    cs.appendChild(add);
    body.appendChild(cs);
  }
}

// helper per componenti (centro/raggio)
function addComponent(node) {
  const R = 60;
  node.components = node.components || [];
  const r = 8 + Math.random()*12;
  let x,y,ok,tries=0;
  do {
    const ang = Math.random()*2*Math.PI;
    const dist = Math.random()*(R - r);
    x = dist * Math.cos(ang);
    y = dist * Math.sin(ang);
    ok = true;
    for (const c of node.components) {
      if (Math.hypot(x - c.x, y - c.y) < (r + c.r)) {
        ok = false; break;
      }
    }
    tries++;
  } while(!ok && tries < 100);
  node.components.push({ x, y, r });
}

// ─── Vista evento calendario ───────────────────────────────

function renderSPEvent(winId, ev) {
  document.getElementById('stt' + winId).textContent = 'Evento';
  document.getElementById('sts' + winId).textContent = ev.date;

  const body = document.getElementById('spb' + winId);
  body.innerHTML = '';

  // ── titolo ──
  const tSec = mkDiv('');
  tSec.appendChild(mkLbl('● Titolo'));
  const ti = Object.assign(document.createElement('input'), {
    className: 'ev-title-inp', type: 'text',
    value: ev.title, placeholder: 'Nome evento...',
  });
  ti.oninput     = () => { ev.title = ti.value; renderAllEvents(winId); };
  ti.onkeydown   = e => e.stopPropagation();
  ti.onmousedown = e => e.stopPropagation();
  tSec.appendChild(ti);
  body.appendChild(tSec);

  // ── orario ──
  const tsSec = mkDiv('');
  tsSec.appendChild(mkLbl('● Orario'));
  const row1 = mkDiv('ev-time-row');

  const li  = Object.assign(document.createElement('input'), {
    className: 'ev-time-inp', type: 'time', value: minToHHMM(ev.startMin),
  });
  const sep = Object.assign(document.createElement('span'), {
    className: 'ev-time-lbl', textContent: '→',
  });
  const ri  = Object.assign(document.createElement('input'), {
    className: 'ev-time-inp', type: 'time', value: minToHHMM(ev.endMin),
  });

  li.oninput = () => {
    const [h, m] = li.value.split(':').map(Number);
    ev.startMin = Math.max(0, Math.min(1410, h * 60 + m));
    if (ev.endMin <= ev.startMin) ev.endMin = Math.min(1439, ev.startMin + 15);
    ri.value = minToHHMM(ev.endMin);
    renderAllEvents(winId);
  };
  ri.oninput = () => {
    const [h, m] = ri.value.split(':').map(Number);
    ev.endMin = Math.max(ev.startMin + 1, Math.min(1439, h * 60 + m));
    renderAllEvents(winId);
  };
  [li, sep, ri].forEach(el => {
    el.onmousedown = e => e.stopPropagation();
    if ('onkeydown' in el) el.onkeydown = e => e.stopPropagation();
  });

  row1.append(li, sep, ri);
  tsSec.appendChild(row1);
  body.appendChild(tsSec);

  // ── note ──
  const ns = mkDiv('note-sec');
  ns.appendChild(mkLbl('● Note'));
  const ta = document.createElement('textarea');
  ta.className   = 'note-ta';
  ta.placeholder = 'Note evento...';
  ta.value       = ev.note || '';
  ta.oninput     = () => { ev.note = ta.value; };
  ta.onkeydown   = e => e.stopPropagation();
  ta.onmousedown = e => e.stopPropagation();
  ns.appendChild(ta);
  body.appendChild(ns);

  // ── elimina ──
  const del = document.createElement('button');
  del.className   = 'ev-del-btn';
  del.textContent = '🗑 Elimina evento';
  del.onclick = () => {
    WINS[winId].events = WINS[winId].events.filter(e => e.id !== ev.id);
    renderAllEvents(winId);
    document.getElementById('sp' + winId).classList.remove('open');
  };
  body.appendChild(del);
}

// ─── Utility DOM ───────────────────────────────────────────

function mkDiv(cls) {
  const d = document.createElement('div');
  if (cls) d.className = cls;
  return d;
}

function mkLbl(txt) {
  const l = mkDiv('slbl');
  l.textContent = txt;
  return l;
}
