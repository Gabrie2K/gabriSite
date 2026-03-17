'use strict';
/* ═══════════════════════════════════════════════════════════
   DEVICES — Virtualizzazione dispositivi
   Editor visuale per configurazione controller → porte → device
   Dipende da: window-manager.js (WINS), knx-data.js (KNX_*)
   ═══════════════════════════════════════════════════════════ */

// ── catalogo controller ──────────────────────────────────

const DEV_CONTROLLERS = [
  { model: 'EHC 602',           brand: 'Coster',   ports: ['RS 485', 'M-Bus', 'Radio 868', 'DALI'] },
  { model: 'UCG 300',           brand: 'Coster',   ports: ['RS 485', 'BACnet IP', 'Modbus TCP', 'M-Bus'] },
  { model: 'UCG 400',           brand: 'Coster',   ports: ['RS 485', 'BACnet IP', 'Modbus TCP', 'M-Bus', 'KNX'] },
  { model: 'Kona Micro',        brand: 'Tektelic', ports: ['LoRaWAN', 'Ethernet'] },
  { model: 'Kona Macro',        brand: 'Tektelic', ports: ['LoRaWAN', 'Ethernet', 'LTE'] },
  { model: 'Kona Enterprise',   brand: 'Tektelic', ports: ['LoRaWAN', 'Ethernet', 'Wi-Fi', 'LTE'] },
  { model: 'Generico',          brand: 'Custom',   ports: ['RS 485', 'Modbus TCP', 'BACnet IP', 'M-Bus', 'LoRaWAN', 'KNX', 'DALI', 'Radio 868', 'Ethernet', 'Wi-Fi', 'LTE'] },
];

// ── catalogo porte ───────────────────────────────────────

const DEV_PORTS = {
  'RS 485':     { color: '#38bdf8', bg: 'rgba(56,189,248,.1)',  border: 'rgba(56,189,248,.4)' },
  'M-Bus':      { color: '#a3e635', bg: 'rgba(163,230,53,.1)', border: 'rgba(163,230,53,.4)' },
  'Radio 868':  { color: '#c084fc', bg: 'rgba(192,132,252,.1)', border: 'rgba(192,132,252,.4)' },
  'LoRaWAN':    { color: '#fb923c', bg: 'rgba(251,146,60,.1)', border: 'rgba(251,146,60,.4)' },
  'BACnet IP':  { color: '#34d399', bg: 'rgba(52,211,153,.1)', border: 'rgba(52,211,153,.4)' },
  'Modbus TCP': { color: '#f472b6', bg: 'rgba(244,114,182,.1)', border: 'rgba(244,114,182,.4)' },
  'KNX':        { color: '#22d3ee', bg: 'rgba(34,211,238,.1)', border: 'rgba(34,211,238,.4)' },
  'DALI':       { color: '#fbbf24', bg: 'rgba(251,191,36,.1)', border: 'rgba(251,191,36,.4)' },
  'Ethernet':   { color: '#94a3b8', bg: 'rgba(148,163,184,.1)', border: 'rgba(148,163,184,.4)' },
  'Wi-Fi':      { color: '#818cf8', bg: 'rgba(129,140,248,.1)', border: 'rgba(129,140,248,.4)' },
  'LTE':        { color: '#f87171', bg: 'rgba(248,113,113,.1)', border: 'rgba(248,113,113,.4)' },
};

// ── catalogo device ──────────────────────────────────────

const DEV_DEVICES = [
  // Coster — RS 485
  { model: 'EST 482',    brand: 'Coster',   desc: 'Modulo espansione I/O',      portTypes: ['RS 485'] },
  { model: 'EST 483',    brand: 'Coster',   desc: 'Modulo espansione avanzato', portTypes: ['RS 485'] },
  { model: 'EFC 410',    brand: 'Coster',   desc: 'Controller fan coil',        portTypes: ['RS 485'] },
  { model: 'EVD 400',    brand: 'Coster',   desc: 'Driver valvola elettronica', portTypes: ['RS 485'] },
  // Coster — M-Bus
  { model: 'IEF 276',    brand: 'Coster',   desc: 'Contatore energia M-Bus',    portTypes: ['M-Bus'] },
  { model: 'IEF 277',    brand: 'Coster',   desc: 'Contatore acqua M-Bus',      portTypes: ['M-Bus'] },
  // Coster — Radio 868
  { model: 'THP 868',    brand: 'Coster',   desc: 'Sonda T/H wireless',         portTypes: ['Radio 868'] },
  { model: 'BRG 868',    brand: 'Coster',   desc: 'Bridge radio 868 MHz',       portTypes: ['Radio 868'] },
  { model: 'CO2 868',    brand: 'Coster',   desc: 'Sensore CO₂ wireless',       portTypes: ['Radio 868'] },
  // Tektelic — LoRaWAN
  { model: 'Vivid',      brand: 'Tektelic', desc: 'Smart Room Sensor',          portTypes: ['LoRaWAN'] },
  { model: 'Sparrow',    brand: 'Tektelic', desc: 'Outdoor Sensor',             portTypes: ['LoRaWAN'] },
  { model: 'Pelican',    brand: 'Tektelic', desc: 'Tracker GPS/LoRa',           portTypes: ['LoRaWAN'] },
  { model: 'Orca',       brand: 'Tektelic', desc: 'Industrial Sensor',          portTypes: ['LoRaWAN'] },
  { model: 'Stork',      brand: 'Tektelic', desc: 'Cold Room Sensor',           portTypes: ['LoRaWAN'] },
  // Generico
  { model: 'Sensore',    brand: 'Generico', desc: 'Sensore custom',             portTypes: ['*'] },
  { model: 'Attuatore',  brand: 'Generico', desc: 'Attuatore custom',           portTypes: ['*'] },
  { model: 'Contatore',  brand: 'Generico', desc: 'Contatore custom',           portTypes: ['*'] },
];

// ── Aggiungi KNX devices dal catalogo KNX_DEVICE_TEMPLATES ──
// (populated at load time from knx-data.js)
if (typeof KNX_DEVICE_TEMPLATES !== 'undefined') {
  KNX_DEVICE_TEMPLATES.forEach(t => {
    DEV_DEVICES.push({
      model: t.model,
      brand: (KNX_MANUFACTURERS?.find(m => m.id === t.manufacturer)?.name) || t.manufacturer,
      desc: t.desc,
      portTypes: ['KNX'],
      knxTemplate: t,
    });
  });
}

// ── body HTML ────────────────────────────────────────────

function devicesBodyHTML(id) {
  const ctrlOpts = DEV_CONTROLLERS.map(c =>
    `<option value="${c.model}">${c.model} (${c.brand})</option>`
  ).join('');

  const portOpts = Object.keys(DEV_PORTS).map(p =>
    `<option value="${p}">${p}</option>`
  ).join('');

  const devOpts = DEV_DEVICES.map(d =>
    `<option value="${d.model}">${d.model} — ${d.desc}</option>`
  ).join('');

  return `<div class="dev-wrap" id="devwrap${id}">
    <div class="dev-toolbar" id="devtb${id}">
      <div class="dev-tb-section">
        <div class="dev-tb-lbl">Controller</div>
        <select class="dev-tb-select" id="devselctrl${id}">${ctrlOpts}</select>
        <button class="dev-tb-btn" id="devaddctrl${id}">+ Controller</button>
      </div>
      <div class="dev-tb-section">
        <div class="dev-tb-lbl">Porta</div>
        <select class="dev-tb-select" id="devselport${id}">${portOpts}</select>
        <button class="dev-tb-btn" id="devaddport${id}">+ Porta</button>
      </div>
      <div class="dev-tb-section">
        <div class="dev-tb-lbl">Dispositivo</div>
        <select class="dev-tb-select" id="devseldev${id}">${devOpts}</select>
        <button class="dev-tb-btn" id="devadddev${id}">+ Dispositivo</button>
      </div>
      <div class="dev-tb-section">
        <button class="dev-tb-btn danger" id="devclear${id}">Cancella tutto</button>
      </div>
      <div class="dev-tb-hint">
        Trascina nodi per posizionare<br>
        Porta → connetti<br>
        Doppio clic → rinomina<br>
        Click → dettagli
      </div>
    </div>
    <div class="dev-canvas-wrap">
      <div class="dev-canvas-topbar">
        <span class="dev-canvas-title">Virtualizzazione Device</span>
        <span class="dev-canvas-count" id="devcount${id}">0 nodi</span>
      </div>
      <div class="dev-canvas" id="devcvs${id}">
        <svg class="dev-svg" id="devsvg${id}"></svg>
      </div>
    </div>
    <div class="dev-detail" id="devdetail${id}">
      <div class="dev-detail-hdr">
        <span class="dev-detail-title" id="devdettitle${id}">—</span>
        <button class="dev-detail-x" id="devdetx${id}">✕</button>
      </div>
      <div class="dev-detail-body" id="devdetbody${id}"></div>
    </div>
  </div>`;
}

// ── state helpers ────────────────────────────────────────

function _devData(id) {
  return WINS[id]?.devData || { nodes: [], edges: [] };
}

function _devSave(id) {
  if (WINS[id] && window.persistState) window.persistState();
}

// ── port position (same algorithm as schema) ─────────────

function _devPortPos(nodeEl, port, canvasEl) {
  const nr = nodeEl.getBoundingClientRect();
  const cr = canvasEl.getBoundingClientRect();
  const cx = nr.left - cr.left + nr.width / 2;
  const cy = nr.top  - cr.top  + nr.height / 2;
  const hw = nr.width / 2;
  const hh = nr.height / 2;
  if (port === 'top')    return { x: cx,      y: cy - hh };
  if (port === 'right')  return { x: cx + hw, y: cy      };
  if (port === 'bottom') return { x: cx,      y: cy + hh };
  if (port === 'left')   return { x: cx - hw, y: cy      };
  return { x: cx, y: cy };
}

function _devNearestPort(nodeEl, px, py, canvasEl) {
  const ports = ['top', 'right', 'bottom', 'left'];
  let best = null, bestDist = Infinity;
  ports.forEach(p => {
    const pos = _devPortPos(nodeEl, p, canvasEl);
    const d = Math.hypot(pos.x - px, pos.y - py);
    if (d < bestDist) { bestDist = d; best = p; }
  });
  return best;
}

function _devEdgePath(x1, y1, fromPort, x2, y2, toPort) {
  const d = Math.max(40, Math.hypot(x2 - x1, y2 - y1) * 0.4);
  const dir = { top: [0, -1], right: [1, 0], bottom: [0, 1], left: [-1, 0] };
  const [fdx, fdy] = dir[fromPort] || [1, 0];
  const [tdx, tdy] = dir[toPort]   || [-1, 0];
  return `M ${x1} ${y1} C ${x1 + fdx * d} ${y1 + fdy * d} ${x2 + tdx * d} ${y2 + tdy * d} ${x2} ${y2}`;
}

// ── render edges ─────────────────────────────────────────

function _devRenderEdges(id) {
  const w = WINS[id]; if (!w) return;
  const data   = w.devData;
  const svg    = document.getElementById('devsvg' + id);
  const canvas = document.getElementById('devcvs' + id);
  if (!svg || !canvas) return;

  svg.querySelectorAll('.dev-edge-group').forEach(el => el.remove());

  if (!svg.querySelector('#devarr' + id)) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <marker id="devarr${id}" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
        <path d="M0,0 L0,6 L7,3 z" fill="rgba(150,170,200,.5)"/>
      </marker>`;
    svg.insertBefore(defs, svg.firstChild);
  }

  data.edges.forEach(edge => {
    const fromEl = document.getElementById('dnode' + id + '_' + edge.fromId);
    const toEl   = document.getElementById('dnode' + id + '_' + edge.toId);
    if (!fromEl || !toEl) return;

    const fp = _devPortPos(fromEl, edge.fromPort, canvas);
    const tp = _devPortPos(toEl,   edge.toPort,   canvas);
    const d  = _devEdgePath(fp.x, fp.y, edge.fromPort, tp.x, tp.y, edge.toPort);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.className.baseVal = 'dev-edge-group';

    const hit = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    hit.setAttribute('d', d);
    hit.setAttribute('stroke', 'transparent');
    hit.setAttribute('stroke-width', '12');
    hit.setAttribute('fill', 'none');
    hit.style.cursor = 'pointer';
    hit.style.pointerEvents = 'stroke';

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'dev-edge');
    path.setAttribute('marker-end', `url(#devarr${id})`);

    hit.addEventListener('click', e => {
      e.stopPropagation();
      data.edges = data.edges.filter(e2 => e2.id !== edge.id);
      _devSave(id);
      _devRenderEdges(id);
    });

    g.appendChild(hit);
    g.appendChild(path);
    svg.appendChild(g);
  });
}

// ── update count ─────────────────────────────────────────

function _devUpdateCount(id) {
  const c = document.getElementById('devcount' + id);
  const data = _devData(id);
  if (c) c.textContent = data.nodes.length + ' nodi · ' + data.edges.length + ' connessioni';
}

// ── detail panel ─────────────────────────────────────────

function _devShowDetail(id, node) {
  const panel = document.getElementById('devdetail' + id);
  const title = document.getElementById('devdettitle' + id);
  const body  = document.getElementById('devdetbody' + id);
  if (!panel || !body) return;

  panel.classList.add('open');
  title.textContent = node.model || node.portType || 'Nodo';

  body.innerHTML = '';

  function addField(label, value, editable, key) {
    const div = document.createElement('div');
    div.className = 'dev-detail-field';
    const lbl = document.createElement('div');
    lbl.className = 'dev-detail-lbl';
    lbl.textContent = label;
    div.appendChild(lbl);

    if (editable) {
      const inp = document.createElement('input');
      inp.className = 'dev-detail-inp';
      inp.value = value || '';
      inp.addEventListener('input', () => {
        node[key] = inp.value;
        _devRefreshNodeEl(id, node);
        _devSave(id);
      });
      inp.addEventListener('mousedown', e => e.stopPropagation());
      div.appendChild(inp);
    } else {
      const val = document.createElement('div');
      val.className = 'dev-detail-val';
      val.textContent = value || '—';
      div.appendChild(val);
    }
    body.appendChild(div);
  }

  if (node.ntype === 'controller') {
    addField('Tipo', 'Controller', false);
    addField('Modello', node.model, false);
    addField('Brand', node.brand, false);
    addField('Label', node.label || '', true, 'label');
    addField('Porte disponibili', (DEV_CONTROLLERS.find(c => c.model === node.model)?.ports || []).join(', '), false);
  } else if (node.ntype === 'port') {
    addField('Tipo', 'Porta', false);
    addField('Tipo porta', node.portType, false);
    addField('Label', node.label || '', true, 'label');
  } else if (node.ntype === 'device') {
    addField('Tipo', 'Dispositivo', false);
    addField('Modello', node.model, false);
    addField('Brand', node.brand, false);
    addField('Label', node.label || '', true, 'label');
    addField('Descrizione', node.desc, false);
    addField('Indirizzo fisico', node.physAddr || '', true, 'physAddr');
    addField('Indirizzo virtuale', node.virtAddr || '', true, 'virtAddr');

    // ── KNX-specific fields ──
    if (node.knx) {
      _devRenderKnxDetail(id, node, body);
    }
  }
}

function _devCloseDetail(id) {
  document.getElementById('devdetail' + id)?.classList.remove('open');
}

// ── KNX detail panel renderer ────────────────────────────

function _devRenderKnxDetail(id, node, body) {
  const knx = node.knx;

  // separator
  const sep = document.createElement('div');
  sep.className = 'dev-knx-sep';
  sep.textContent = 'KNX';
  body.appendChild(sep);

  // Individual Address
  _devKnxField(body, 'Individual Address', knx.individualAddress, val => {
    knx.individualAddress = val;
    _devRefreshNodeEl(id, node);
    _devSave(id);
  });

  // Medium dropdown
  _devKnxSelect(body, 'Medium', KNX_MEDIUMS, knx.medium, val => {
    knx.medium = val; _devSave(id);
  });

  // Manufacturer dropdown
  if (typeof KNX_MANUFACTURERS !== 'undefined') {
    const mfOpts = KNX_MANUFACTURERS.map(m => m.id);
    const mfLabels = KNX_MANUFACTURERS.map(m => m.name);
    _devKnxSelect(body, 'Manufacturer', mfOpts, knx.manufacturer, val => {
      knx.manufacturer = val; _devSave(id);
    }, mfLabels);
  }

  // Device Type
  _devKnxSelect(body, 'Device Type', KNX_DEVICE_TYPES, knx.deviceType, val => {
    knx.deviceType = val; _devSave(id);
  });

  // Functional Block
  _devKnxSelect(body, 'Functional Block', KNX_FUNCTIONAL_BLOCKS, knx.functionalBlock, val => {
    knx.functionalBlock = val; _devSave(id);
  });

  // Status
  _devKnxSelect(body, 'Status', ['online', 'offline', 'programming', 'unknown'], knx.status, val => {
    knx.status = val; _devSave(id);
  });

  // ── Group Objects ──
  const goSep = document.createElement('div');
  goSep.className = 'dev-knx-sep';
  goSep.textContent = 'GROUP OBJECTS (' + knx.groupObjects.length + ')';
  body.appendChild(goSep);

  const goList = document.createElement('div');
  goList.className = 'dev-knx-go-list';
  body.appendChild(goList);

  function renderGOs() {
    goList.innerHTML = '';
    goSep.textContent = 'GROUP OBJECTS (' + knx.groupObjects.length + ')';
    knx.groupObjects.forEach((go, idx) => {
      const card = document.createElement('div');
      card.className = 'dev-knx-go-card';

      // header with name + delete
      const hdr = document.createElement('div');
      hdr.className = 'dev-knx-go-hdr';
      hdr.innerHTML = `<span class="dev-knx-go-idx">#${go.objectIndex}</span>
        <span class="dev-knx-go-name">${go.name}</span>`;
      const delBtn = document.createElement('button');
      delBtn.className = 'dev-knx-go-del';
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', e => {
        e.stopPropagation();
        knx.groupObjects.splice(idx, 1);
        renderGOs();
        _devSave(id);
      });
      delBtn.addEventListener('mousedown', e => e.stopPropagation());
      hdr.appendChild(delBtn);
      card.appendChild(hdr);

      // name input
      const nameInp = document.createElement('input');
      nameInp.className = 'dev-detail-inp dev-knx-go-inp';
      nameInp.value = go.name;
      nameInp.placeholder = 'Object name';
      nameInp.addEventListener('input', () => { go.name = nameInp.value; hdr.querySelector('.dev-knx-go-name').textContent = go.name; _devSave(id); });
      nameInp.addEventListener('mousedown', e => e.stopPropagation());
      card.appendChild(nameInp);

      // DPT selector
      const dptRow = document.createElement('div');
      dptRow.className = 'dev-knx-go-row';
      const dptLbl = document.createElement('span');
      dptLbl.className = 'dev-knx-go-rlbl';
      dptLbl.textContent = 'DPT:';
      dptRow.appendChild(dptLbl);
      const dptSel = document.createElement('select');
      dptSel.className = 'dev-tb-select dev-knx-go-sel';
      if (typeof KNX_DPT !== 'undefined') {
        Object.keys(KNX_DPT).forEach(k => {
          const opt = document.createElement('option');
          opt.value = k;
          opt.textContent = k + ' — ' + KNX_DPT[k].name;
          if (k === go.dpt) opt.selected = true;
          dptSel.appendChild(opt);
        });
      }
      dptSel.addEventListener('change', () => { go.dpt = dptSel.value; _devSave(id); });
      dptSel.addEventListener('mousedown', e => e.stopPropagation());
      dptRow.appendChild(dptSel);
      card.appendChild(dptRow);

      // DPT info
      const dptInfo = KNX_DPT?.[go.dpt];
      if (dptInfo) {
        const info = document.createElement('div');
        info.className = 'dev-knx-go-info';
        info.textContent = (dptInfo.unit ? dptInfo.unit + ' · ' : '') + dptInfo.size + ' bit';
        card.appendChild(info);
      }

      // Flags
      const flagRow = document.createElement('div');
      flagRow.className = 'dev-knx-go-flags';
      ['C', 'R', 'W', 'T', 'U'].forEach(f => {
        const lbl = document.createElement('label');
        lbl.className = 'dev-knx-flag';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = go.flags?.[f] || false;
        cb.addEventListener('change', () => {
          if (!go.flags) go.flags = {};
          go.flags[f] = cb.checked;
          _devSave(id);
        });
        cb.addEventListener('mousedown', e => e.stopPropagation());
        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode(' ' + f));
        flagRow.appendChild(lbl);
      });
      card.appendChild(flagRow);

      // Group Addresses
      const gaRow = document.createElement('div');
      gaRow.className = 'dev-knx-go-row';
      const gaLbl = document.createElement('span');
      gaLbl.className = 'dev-knx-go-rlbl';
      gaLbl.textContent = 'GA:';
      gaRow.appendChild(gaLbl);
      const gaInp = document.createElement('input');
      gaInp.className = 'dev-detail-inp dev-knx-go-inp';
      gaInp.value = (go.groupAddresses || []).join(', ');
      gaInp.placeholder = '1/2/3, 1/2/4';
      gaInp.addEventListener('input', () => {
        go.groupAddresses = gaInp.value.split(',').map(s => s.trim()).filter(Boolean);
        _devSave(id);
      });
      gaInp.addEventListener('mousedown', e => e.stopPropagation());
      gaRow.appendChild(gaInp);
      card.appendChild(gaRow);

      goList.appendChild(card);
    });
  }

  renderGOs();

  // Add GO button
  const addGoBtn = document.createElement('button');
  addGoBtn.className = 'dev-tb-btn';
  addGoBtn.textContent = '+ Group Object';
  addGoBtn.style.marginTop = '4px';
  addGoBtn.addEventListener('click', e => {
    e.stopPropagation();
    knx.groupObjects.push({
      objectIndex: knx.groupObjects.length,
      name: 'New Object',
      dpt: '1.001',
      flags: { C: true, R: true, W: true, T: false, U: true },
      groupAddresses: [],
    });
    renderGOs();
    _devSave(id);
  });
  addGoBtn.addEventListener('mousedown', e => e.stopPropagation());
  body.appendChild(addGoBtn);
}

// ── KNX detail field helpers ─────────────────────────────

function _devKnxField(body, label, value, onChange) {
  const div = document.createElement('div');
  div.className = 'dev-detail-field';
  const lbl = document.createElement('div');
  lbl.className = 'dev-detail-lbl';
  lbl.textContent = label;
  div.appendChild(lbl);
  const inp = document.createElement('input');
  inp.className = 'dev-detail-inp';
  inp.value = value || '';
  inp.addEventListener('input', () => onChange(inp.value));
  inp.addEventListener('mousedown', e => e.stopPropagation());
  div.appendChild(inp);
  body.appendChild(div);
}

function _devKnxSelect(body, label, options, currentVal, onChange, labels) {
  const div = document.createElement('div');
  div.className = 'dev-detail-field';
  const lbl = document.createElement('div');
  lbl.className = 'dev-detail-lbl';
  lbl.textContent = label;
  div.appendChild(lbl);
  const sel = document.createElement('select');
  sel.className = 'dev-tb-select';
  options.forEach((opt, i) => {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = labels ? labels[i] : opt;
    if (opt === currentVal) o.selected = true;
    sel.appendChild(o);
  });
  sel.addEventListener('change', () => onChange(sel.value));
  sel.addEventListener('mousedown', e => e.stopPropagation());
  div.appendChild(sel);
  body.appendChild(div);
}

// ── refresh a single node element ────────────────────────

function _devRefreshNodeEl(id, node) {
  const el = document.getElementById('dnode' + id + '_' + node.id);
  if (!el) return;

  if (node.ntype === 'controller') {
    const m = el.querySelector('.dev-node-model');
    const b = el.querySelector('.dev-node-brand');
    if (m) m.textContent = node.label || node.model;
    if (b) b.textContent = node.brand;
  } else if (node.ntype === 'port') {
    const t = el.querySelector('.dev-node-porttype');
    const l = el.querySelector('.dev-node-portlbl');
    if (t) t.textContent = node.portType;
    if (l) l.textContent = node.label || node.portType;
  } else if (node.ntype === 'device') {
    const m = el.querySelector('.dev-node-devmodel');
    const l = el.querySelector('.dev-node-devlbl');
    const a = el.querySelector('.dev-node-addr');
    if (m) m.textContent = node.model;
    if (l) l.textContent = node.label || '';
    if (a) {
      let txt = '';
      if (node.knx) {
        txt = node.knx.individualAddress || '';
        if (node.knx.groupObjects?.length) txt += (txt ? '\n' : '') + node.knx.groupObjects.length + ' GO';
      } else {
        if (node.physAddr) txt += 'Fisico: ' + node.physAddr;
        if (node.virtAddr) txt += (txt ? '\n' : '') + 'Virtuale: ' + node.virtAddr;
      }
      a.textContent = txt || '—';
    }
  }
}

// ── build node element ───────────────────────────────────

function _devBuildNodeEl(id, node) {
  const w      = WINS[id];
  const data   = w.devData;
  const canvas = document.getElementById('devcvs' + id);

  const el = document.createElement('div');
  el.className = 'dev-node ' + node.ntype + (node.knx ? ' knx-device' : '');
  el.id = 'dnode' + id + '_' + node.id;
  el.style.left = node.x + 'px';
  el.style.top  = node.y + 'px';

  // apply port-specific colors
  if (node.ntype === 'port') {
    const ps = DEV_PORTS[node.portType] || DEV_PORTS['Ethernet'];
    el.style.background  = ps.bg;
    el.style.borderColor = ps.border;
  }

  // inner HTML by type
  if (node.ntype === 'controller') {
    el.innerHTML = `
      <div class="dev-node-model">${node.label || node.model}</div>
      <div class="dev-node-brand">${node.brand}</div>
      <button class="dev-node-del" title="Elimina">✕</button>
      <div class="dev-port" data-port="top"></div>
      <div class="dev-port" data-port="right"></div>
      <div class="dev-port" data-port="bottom"></div>
      <div class="dev-port" data-port="left"></div>`;
  } else if (node.ntype === 'port') {
    el.innerHTML = `
      <div class="dev-node-porttype">${node.portType}</div>
      <div class="dev-node-portlbl">${node.label || node.portType}</div>
      <button class="dev-node-del" title="Elimina">✕</button>
      <div class="dev-port" data-port="top"></div>
      <div class="dev-port" data-port="right"></div>
      <div class="dev-port" data-port="bottom"></div>
      <div class="dev-port" data-port="left"></div>`;
  } else if (node.ntype === 'device') {
    let addrTxt = '';
    if (node.knx) {
      addrTxt = node.knx.individualAddress || '';
      if (node.knx.groupObjects?.length) addrTxt += (addrTxt ? '\n' : '') + node.knx.groupObjects.length + ' GO';
    } else {
      if (node.physAddr) addrTxt += 'Fisico: ' + node.physAddr;
      if (node.virtAddr) addrTxt += (addrTxt ? '\n' : '') + 'Virtuale: ' + node.virtAddr;
    }
    el.innerHTML = `
      <div class="dev-node-devmodel">${node.model}</div>
      <div class="dev-node-devlbl">${node.label || ''}</div>
      <div class="dev-node-addr">${addrTxt || '—'}</div>
      <button class="dev-node-del" title="Elimina">✕</button>
      <div class="dev-port" data-port="top"></div>
      <div class="dev-port" data-port="right"></div>
      <div class="dev-port" data-port="bottom"></div>
      <div class="dev-port" data-port="left"></div>`;
  }

  // ── drag ──
  let dragging = false, dx = 0, dy = 0, startX = 0, startY = 0;

  el.addEventListener('mousedown', e => {
    if (e.target.classList.contains('dev-port')) return;
    if (e.target.classList.contains('dev-node-del')) return;
    if (e.target.tagName === 'INPUT') return;
    dragging = true;
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
    _devRenderEdges(id);
  }
  function onUp() {
    if (dragging) { dragging = false; _devSave(id); }
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   onUp);

  // ── click → detail panel ──
  el.addEventListener('click', e => {
    if (e.target.classList.contains('dev-port')) return;
    if (e.target.classList.contains('dev-node-del')) return;
    e.stopPropagation();
    // deselect all
    canvas.querySelectorAll('.dev-node.selected').forEach(n => n.classList.remove('selected'));
    el.classList.add('selected');
    _devShowDetail(id, node);
  });

  // ── double-click → rename label ──
  el.addEventListener('dblclick', e => {
    if (e.target.classList.contains('dev-port')) return;
    e.stopPropagation();
    const labelEl = el.querySelector('.dev-node-model, .dev-node-porttype, .dev-node-devmodel');
    if (!labelEl) return;
    const inp = document.createElement('input');
    inp.className = 'dev-detail-inp';
    inp.style.cssText = 'width:90%;text-align:center;margin:2px auto;display:block;';
    inp.value = node.label || node.model || node.portType || '';
    inp.onmousedown = ev => ev.stopPropagation();
    inp.onkeydown = ev => {
      ev.stopPropagation();
      if (ev.key === 'Enter' || ev.key === 'Escape') inp.blur();
    };
    inp.onblur = () => {
      const v = inp.value.trim();
      if (v) node.label = v;
      _devRefreshNodeEl(id, node);
      inp.replaceWith(labelEl);
      _devSave(id);
    };
    labelEl.replaceWith(inp);
    inp.focus(); inp.select();
  });

  // ── delete ──
  el.querySelector('.dev-node-del').addEventListener('click', e => {
    e.stopPropagation();
    data.nodes = data.nodes.filter(n => n.id !== node.id);
    data.edges = data.edges.filter(e2 => e2.fromId !== node.id && e2.toId !== node.id);
    el.remove();
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup',   onUp);
    _devRenderEdges(id);
    _devUpdateCount(id);
    _devCloseDetail(id);
    _devSave(id);
  });

  // ── port drag → connect ──
  el.querySelectorAll('.dev-port').forEach(portEl => {
    portEl.addEventListener('mousedown', e => {
      e.stopPropagation();
      const fromPort = portEl.dataset.port;
      const fp = _devPortPos(el, fromPort, canvas);
      const svg = document.getElementById('devsvg' + id);
      let tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      tempLine.setAttribute('class', 'dev-temp-line');
      svg.appendChild(tempLine);

      function onConnMove(ev) {
        if (!tempLine) return;
        const cr = canvas.getBoundingClientRect();
        const mx = ev.clientX - cr.left;
        const my = ev.clientY - cr.top;
        tempLine.setAttribute('d', `M ${fp.x} ${fp.y} L ${mx} ${my}`);
      }

      function onConnUp(ev) {
        document.removeEventListener('mousemove', onConnMove);
        document.removeEventListener('mouseup',   onConnUp);
        tempLine?.remove(); tempLine = null;

        const elements = document.elementsFromPoint(ev.clientX, ev.clientY);
        const targetEl = elements.find(el2 =>
          el2.classList.contains('dev-node') && el2 !== el
        );
        if (!targetEl) return;

        const cr = canvas.getBoundingClientRect();
        const mx = ev.clientX - cr.left;
        const my = ev.clientY - cr.top;
        const targetNodeId = targetEl.id.replace('dnode' + id + '_', '');
        const toPort = _devNearestPort(targetEl, mx, my, canvas);

        const exists = data.edges.some(e2 =>
          e2.fromId === node.id && e2.toId === targetNodeId &&
          e2.fromPort === fromPort && e2.toPort === toPort
        );
        if (exists) return;

        data.edges.push({
          id: 'de' + Date.now(),
          fromId: node.id, fromPort,
          toId: targetNodeId, toPort,
        });
        _devRenderEdges(id);
        _devUpdateCount(id);
        _devSave(id);
      }

      document.addEventListener('mousemove', onConnMove);
      document.addEventListener('mouseup',   onConnUp);
    });
  });

  canvas.appendChild(el);

  return () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup',   onUp);
  };
}

// ── add node helpers ─────────────────────────────────────

function _devAddController(id, model) {
  const w = WINS[id]; if (!w) return;
  const data = w.devData;
  const cat  = DEV_CONTROLLERS.find(c => c.model === model) || DEV_CONTROLLERS[0];
  const canvas = document.getElementById('devcvs' + id);
  const cr = canvas?.getBoundingClientRect();
  const node = {
    id: 'dc' + Date.now(),
    ntype: 'controller',
    model: cat.model,
    brand: cat.brand,
    label: '',
    x: 60 + Math.random() * Math.max(100, (cr?.width || 400) - 300),
    y: 200 + Math.random() * Math.max(60, (cr?.height || 300) - 300),
  };
  data.nodes.push(node);
  _devBuildNodeEl(id, node);
  _devUpdateCount(id);
  _devSave(id);
}

function _devAddPort(id, portType) {
  const w = WINS[id]; if (!w) return;
  const data = w.devData;
  const canvas = document.getElementById('devcvs' + id);
  const cr = canvas?.getBoundingClientRect();
  const node = {
    id: 'dp' + Date.now(),
    ntype: 'port',
    portType: portType,
    label: '',
    x: 250 + Math.random() * Math.max(100, (cr?.width || 400) - 400),
    y: 100 + Math.random() * Math.max(100, (cr?.height || 300) - 250),
  };
  data.nodes.push(node);
  _devBuildNodeEl(id, node);
  _devUpdateCount(id);
  _devSave(id);
}

function _devAddDevice(id, model) {
  const w = WINS[id]; if (!w) return;
  const data = w.devData;
  const cat  = DEV_DEVICES.find(d => d.model === model) || DEV_DEVICES[0];
  const canvas = document.getElementById('devcvs' + id);
  const cr = canvas?.getBoundingClientRect();
  const node = {
    id: 'dd' + Date.now(),
    ntype: 'device',
    model: cat.model,
    brand: cat.brand,
    desc: cat.desc,
    label: '',
    physAddr: '',
    virtAddr: '',
    x: 480 + Math.random() * Math.max(60, (cr?.width || 400) - 560),
    y: 60 + Math.random() * Math.max(100, (cr?.height || 300) - 200),
  };
  // KNX-specific init from template
  if (cat.knxTemplate) {
    const t = cat.knxTemplate;
    node.knx = {
      individualAddress: '1.1.1',
      medium: 'TP',
      manufacturer: t.manufacturer,
      deviceType: t.deviceType,
      functionalBlock: t.functionalBlock,
      groupObjects: (t.groupObjects || []).map((go, i) => ({
        objectIndex: i,
        name: go.name,
        dpt: go.dpt,
        flags: { ...go.flags },
        groupAddresses: [],
      })),
      status: 'online',
    };
  }
  data.nodes.push(node);
  _devBuildNodeEl(id, node);
  _devUpdateCount(id);
  _devSave(id);
}

// ── init ─────────────────────────────────────────────────

function initDevices(id) {
  const w = WINS[id]; if (!w) return;

  if (!w.devData) {
    w.devData = { nodes: [], edges: [] };
  }

  const data    = w.devData;
  const canvas  = document.getElementById('devcvs' + id);
  const cleanups = [];

  // render existing nodes
  data.nodes.forEach(node => {
    const cleanup = _devBuildNodeEl(id, node);
    cleanups.push(cleanup);
  });

  requestAnimationFrame(() => {
    _devRenderEdges(id);
    _devUpdateCount(id);
  });

  // toolbar buttons
  document.getElementById('devaddctrl' + id)?.addEventListener('click', () => {
    const sel = document.getElementById('devselctrl' + id);
    _devAddController(id, sel?.value || 'EHC 602');
  });

  document.getElementById('devaddport' + id)?.addEventListener('click', () => {
    const sel = document.getElementById('devselport' + id);
    _devAddPort(id, sel?.value || 'RS 485');
  });

  document.getElementById('devadddev' + id)?.addEventListener('click', () => {
    const sel = document.getElementById('devseldev' + id);
    _devAddDevice(id, sel?.value || 'EST 482');
  });

  // clear all
  document.getElementById('devclear' + id)?.addEventListener('click', () => {
    if (!confirm('Cancellare tutti i nodi e le connessioni?')) return;
    data.nodes = [];
    data.edges = [];
    canvas.querySelectorAll('.dev-node').forEach(el => el.remove());
    document.getElementById('devsvg' + id)?.querySelectorAll('.dev-edge-group').forEach(el => el.remove());
    _devUpdateCount(id);
    _devCloseDetail(id);
    _devSave(id);
  });

  // close detail panel
  document.getElementById('devdetx' + id)?.addEventListener('click', () => _devCloseDetail(id));

  // click canvas → deselect
  canvas?.addEventListener('click', () => {
    canvas.querySelectorAll('.dev-node.selected').forEach(n => n.classList.remove('selected'));
    _devCloseDetail(id);
  });

  // dispose
  w._devDispose = () => {
    cleanups.forEach(fn => fn && fn());
  };
}
