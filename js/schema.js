'use strict';
/* ═══════════════════════════════════════════════════════════
   SCHEMA — Editor flussi draw.io style
   Dipende da: window-manager.js (WINS)
   ═══════════════════════════════════════════════════════════ */

function schemaBodyHTML(id) {
  return `
    <div class="schema-wrap" id="schemawrap${id}">
      <div class="schema-toolbar" id="schematb${id}">
        <button class="schema-toolbar-btn" id="schemaadd${id}">+ Nodo</button>
        <button class="schema-toolbar-btn" id="schemaclear${id}">Cancella tutto</button>
        <span class="schema-toolbar-hint">doppio clic → rinomina &nbsp;·&nbsp; porta → connetti &nbsp;·&nbsp; ✕ → elimina</span>
      </div>
      <div class="schema-canvas" id="schemacvs${id}">
        <svg class="schema-svg" id="schemasvg${id}"></svg>
      </div>
    </div>`;
}

// ── State helpers ──────────────────────────────────────────

function schemaGetData(id) {
  return WINS[id]?.schemaData || { nodes: [], edges: [] };
}

function schemaSave(id) {
  if (WINS[id]) {
    if (window.persistState) window.persistState();
  }
}

// ── Port position (absolute px relative to canvas) ─────────

function getPortPos(nodeEl, port, canvasEl) {
  const nr  = nodeEl.getBoundingClientRect();
  const cr  = canvasEl.getBoundingClientRect();
  const cx  = nr.left - cr.left + nr.width / 2;
  const cy  = nr.top  - cr.top  + nr.height / 2;
  const hw  = nr.width / 2;
  const hh  = nr.height / 2;
  if (port === 'top')    return { x: cx,      y: cy - hh };
  if (port === 'right')  return { x: cx + hw, y: cy      };
  if (port === 'bottom') return { x: cx,      y: cy + hh };
  if (port === 'left')   return { x: cx - hw, y: cy      };
  return { x: cx, y: cy };
}

// ── Edge bezier path ────────────────────────────────────────

function makeEdgePath(x1, y1, fromPort, x2, y2, toPort) {
  const d = Math.max(45, Math.hypot(x2 - x1, y2 - y1) * 0.42);
  const portDir = { top: [0, -1], right: [1, 0], bottom: [0, 1], left: [-1, 0] };
  const [fdx, fdy] = portDir[fromPort] || [1, 0];
  const [tdx, tdy] = portDir[toPort]   || [-1, 0];
  return `M ${x1} ${y1} C ${x1 + fdx * d} ${y1 + fdy * d} ${x2 + tdx * d} ${y2 + tdy * d} ${x2} ${y2}`;
}

// ── Nearest port from a point ───────────────────────────────

function schemaNearestPort(nodeEl, px, py, canvasEl) {
  const ports = ['top', 'right', 'bottom', 'left'];
  let best = null, bestDist = Infinity;
  ports.forEach(p => {
    const pos = getPortPos(nodeEl, p, canvasEl);
    const d = Math.hypot(pos.x - px, pos.y - py);
    if (d < bestDist) { bestDist = d; best = p; }
  });
  return best;
}

// ── Render edges SVG ────────────────────────────────────────

function renderSchemaEdges(id) {
  const w = WINS[id]; if (!w) return;
  const data    = w.schemaData;
  const svg     = document.getElementById('schemasvg' + id);
  const canvas  = document.getElementById('schemacvs' + id);
  if (!svg || !canvas) return;

  // clear existing edges
  svg.querySelectorAll('.schema-edge-group').forEach(el => el.remove());

  // arrowhead marker
  if (!svg.querySelector('#arr' + id)) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <marker id="arr${id}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="rgba(99,179,255,.7)"/>
      </marker>`;
    svg.insertBefore(defs, svg.firstChild);
  }

  data.edges.forEach(edge => {
    const fromEl = document.getElementById('snode' + id + '_' + edge.fromId);
    const toEl   = document.getElementById('snode' + id + '_' + edge.toId);
    if (!fromEl || !toEl) return;

    const fp = getPortPos(fromEl, edge.fromPort, canvas);
    const tp = getPortPos(toEl,   edge.toPort,   canvas);
    const d  = makeEdgePath(fp.x, fp.y, edge.fromPort, tp.x, tp.y, edge.toPort);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.className.baseVal = 'schema-edge-group';

    // wider invisible hit area
    const hit = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    hit.setAttribute('d', d);
    hit.setAttribute('stroke', 'transparent');
    hit.setAttribute('stroke-width', '12');
    hit.setAttribute('fill', 'none');
    hit.style.cursor = 'pointer';
    hit.style.pointerEvents = 'stroke';

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'schema-edge');
    path.setAttribute('marker-end', `url(#arr${id})`);

    hit.addEventListener('click', e => {
      e.stopPropagation();
      data.edges = data.edges.filter(e2 => e2.id !== edge.id);
      schemaSave(id);
      renderSchemaEdges(id);
    });

    g.appendChild(hit);
    g.appendChild(path);
    svg.appendChild(g);
  });
}

// ── Build a node element ────────────────────────────────────

function buildSchemaNodeEl(id, node) {
  const w      = WINS[id];
  const data   = w.schemaData;
  const canvas = document.getElementById('schemacvs' + id);

  const el = document.createElement('div');
  el.className = 'schema-node';
  el.id = 'snode' + id + '_' + node.id;
  el.style.left   = node.x + 'px';
  el.style.top    = node.y + 'px';
  el.style.width  = (node.w || 120) + 'px';
  el.style.minHeight = (node.h || 46) + 'px';

  el.innerHTML = `
    <div class="schema-node-label">${node.label}</div>
    <button class="schema-node-del" title="Elimina">✕</button>
    <div class="schema-port" data-port="top"></div>
    <div class="schema-port" data-port="right"></div>
    <div class="schema-port" data-port="bottom"></div>
    <div class="schema-port" data-port="left"></div>
  `;

  // ── drag node ──────────────────────────────────────────────
  let dragging = false, dx = 0, dy = 0, startX = 0, startY = 0;

  el.addEventListener('mousedown', e => {
    if (e.target.classList.contains('schema-port')) return;
    if (e.target.classList.contains('schema-node-del')) return;
    if (e.target.classList.contains('schema-node-inp')) return;
    dragging = true;
    const cr = canvas.getBoundingClientRect();
    startX = e.clientX; startY = e.clientY;
    dx = node.x; dy = node.y;
    e.stopPropagation();
  });

  function onMove(e) {
    if (!dragging) return;
    node.x = Math.max(0, dx + e.clientX - startX);
    node.y = Math.max(0, dy + e.clientY - startY);
    el.style.left = node.x + 'px';
    el.style.top  = node.y + 'px';
    renderSchemaEdges(id);
  }

  function onUp() {
    if (dragging) { dragging = false; schemaSave(id); }
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   onUp);

  // ── double-click rename ────────────────────────────────────
  el.addEventListener('dblclick', e => {
    if (e.target.classList.contains('schema-port')) return;
    e.stopPropagation();
    const lbl = el.querySelector('.schema-node-label');
    const inp = document.createElement('input');
    inp.className = 'schema-node-inp';
    inp.value = node.label;
    inp.onmousedown = ev => ev.stopPropagation();
    inp.onkeydown = ev => {
      ev.stopPropagation();
      if (ev.key === 'Enter' || ev.key === 'Escape') inp.blur();
    };
    inp.onblur = () => {
      const v = inp.value.trim();
      if (v) { node.label = v; lbl.textContent = v; }
      inp.replaceWith(lbl);
      schemaSave(id);
    };
    lbl.replaceWith(inp);
    inp.focus(); inp.select();
  });

  // ── delete node ────────────────────────────────────────────
  el.querySelector('.schema-node-del').addEventListener('click', e => {
    e.stopPropagation();
    data.nodes  = data.nodes.filter(n => n.id !== node.id);
    data.edges  = data.edges.filter(e2 => e2.fromId !== node.id && e2.toId !== node.id);
    el.remove();
    // cleanup listeners
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup',   onUp);
    renderSchemaEdges(id);
    schemaSave(id);
  });

  // ── port drag → connect ─────────────────────────────────────
  let connecting = false, tempLine = null, fromPort = null;

  el.querySelectorAll('.schema-port').forEach(portEl => {
    portEl.addEventListener('mousedown', e => {
      e.stopPropagation();
      connecting = true;
      fromPort = portEl.dataset.port;
      const fp = getPortPos(el, fromPort, canvas);

      // create temp SVG line
      const svg = document.getElementById('schemasvg' + id);
      tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      tempLine.setAttribute('class', 'schema-temp-line');
      svg.appendChild(tempLine);

      function onConnMove(ev) {
        if (!connecting || !tempLine) return;
        const cr = canvas.getBoundingClientRect();
        const mx = ev.clientX - cr.left;
        const my = ev.clientY - cr.top;
        tempLine.setAttribute('d', `M ${fp.x} ${fp.y} L ${mx} ${my}`);
      }

      function onConnUp(ev) {
        document.removeEventListener('mousemove', onConnMove);
        document.removeEventListener('mouseup',   onConnUp);
        if (!connecting) return;
        connecting = false;
        tempLine?.remove(); tempLine = null;

        // find target node under cursor
        const cr = canvas.getBoundingClientRect();
        const mx = ev.clientX - cr.left;
        const my = ev.clientY - cr.top;
        const elements = document.elementsFromPoint(ev.clientX, ev.clientY);
        const targetEl = elements.find(el2 =>
          el2.classList.contains('schema-node') && el2 !== el
        );
        if (!targetEl) return;

        const targetNodeId = targetEl.id.replace('snode' + id + '_', '');
        const toPort = schemaNearestPort(targetEl, mx, my, canvas);

        // avoid duplicate edge
        const exists = data.edges.some(e2 =>
          e2.fromId === node.id && e2.toId === targetNodeId &&
          e2.fromPort === fromPort && e2.toPort === toPort
        );
        if (exists) return;

        data.edges.push({
          id: 'e' + Date.now(),
          fromId: node.id, fromPort,
          toId: targetNodeId, toPort,
        });
        renderSchemaEdges(id);
        schemaSave(id);
      }

      document.addEventListener('mousemove', onConnMove);
      document.addEventListener('mouseup',   onConnUp);
    });
  });

  canvas.appendChild(el);

  // cleanup fn
  return () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup',   onUp);
  };
}

// ── Add node ────────────────────────────────────────────────

function addSchemaNode(id, x, y, label) {
  const w    = WINS[id]; if (!w) return;
  const data = w.schemaData;
  const node = {
    id: 'n' + Date.now(),
    label: label || 'Nodo',
    x: x ?? 80 + data.nodes.length * 40,
    y: y ?? 80 + data.nodes.length * 20,
    w: 120,
    h: 46,
  };
  data.nodes.push(node);
  buildSchemaNodeEl(id, node);
  renderSchemaEdges(id);
  schemaSave(id);
}

// ── Init ────────────────────────────────────────────────────

function initSchema(id) {
  const w = WINS[id]; if (!w) return;

  // ensure schemaData exists
  if (!w.schemaData) {
    w.schemaData = {
      nodes: [
        { id: 'n1', label: 'Inizio',   x: 80,  y: 100, w: 120, h: 46 },
        { id: 'n2', label: 'Processo', x: 260, y: 100, w: 120, h: 46 },
        { id: 'n3', label: 'Fine',     x: 440, y: 100, w: 120, h: 46 },
      ],
      edges: [
        { id: 'e1', fromId: 'n1', fromPort: 'right', toId: 'n2', toPort: 'left' },
        { id: 'e2', fromId: 'n2', fromPort: 'right', toId: 'n3', toPort: 'left' },
      ],
    };
  }

  const data   = w.schemaData;
  const canvas = document.getElementById('schemacvs' + id);
  const addBtn = document.getElementById('schemaadd' + id);
  const clrBtn = document.getElementById('schemaclear' + id);
  if (!canvas) return;

  const cleanups = [];

  // render existing nodes
  data.nodes.forEach(node => {
    const cleanup = buildSchemaNodeEl(id, node);
    cleanups.push(cleanup);
  });

  // render edges after nodes are in DOM
  requestAnimationFrame(() => renderSchemaEdges(id));

  // add node button
  addBtn?.addEventListener('click', () => {
    const cr = canvas.getBoundingClientRect();
    addSchemaNode(id, 40 + Math.random() * (cr.width - 200), 60 + Math.random() * (cr.height - 160));
  });

  // clear all
  clrBtn?.addEventListener('click', () => {
    if (!confirm('Cancellare tutti i nodi e le connessioni?')) return;
    data.nodes = [];
    data.edges = [];
    canvas.querySelectorAll('.schema-node').forEach(el => el.remove());
    document.getElementById('schemasvg' + id)?.querySelectorAll('.schema-edge-group').forEach(el => el.remove());
    schemaSave(id);
  });

  // dispose
  w._schemaDispose = () => {
    cleanups.forEach(fn => fn && fn());
  };
}
