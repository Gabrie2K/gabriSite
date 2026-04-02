'use strict';
/* ═══════════════════════════════════════════════════════════
   DEVICES — Virtualizzazione dispositivi
   Editor visuale per configurazione controller → porte → device
   Dipende da: window-manager.js (WINS), knx-data.js (KNX_*)
   ═══════════════════════════════════════════════════════════ */

// ── catalogo controller ──────────────────────────────────

const DEV_CONTROLLERS = [
  {
    model: 'EHC 602', brand: 'Coster', panel: true,
    portDefs: [
      { key: 'M-Bus',   type: 'M-Bus',    label: 'M-Bus',   side: 'top',    pos: 0.20, pins: 4 },
      { key: 'RS485-1', type: 'RS 485',   label: 'RS485-1', side: 'bottom', pos: 0.12, pins: 3 },
      { key: 'RS485-2', type: 'RS 485',   label: 'RS485-2', side: 'bottom', pos: 0.28, pins: 3 },
      { key: 'C-BUS',   type: 'C-BUS',    label: 'C-BUS',   side: 'bottom', pos: 0.44, pins: 3 },
      { key: 'ETH-1',   type: 'Ethernet', label: 'ETH-1',   side: 'bottom', pos: 0.65, pins: 0 },
      { key: 'ETH-2',   type: 'Ethernet', label: 'ETH-2',   side: 'bottom', pos: 0.82, pins: 0 },
    ],
    addable: ['RS 485'],
  },
  {
    model: 'ZBC 862', brand: 'Coster', panel: true,
    portDefs: [
      { key: 'IN',      type: 'Digital In',  label: 'IN 1-8',  side: 'top',    pos: 0.22, pins: 4 },
      { key: 'V-OUT',   type: 'V-OUT',       label: 'V-OUT',   side: 'top',    pos: 0.48, pins: 3 },
      { key: 'RS485-1', type: 'RS 485',      label: 'RS485-1', side: 'top',    pos: 0.67, pins: 3 },
      { key: 'RS485-2', type: 'RS 485',      label: 'RS485-2', side: 'top',    pos: 0.82, pins: 3 },
      { key: 'BAC',     type: 'BACnet MSTP', label: 'BACnet',  side: 'bottom', pos: 0.08, pins: 3 },
      { key: 'DO',      type: 'Relay',       label: 'DO 1-6',  side: 'bottom', pos: 0.55, pins: 3 },
    ],
    addable: ['RS 485'],
  },
  {
    model: 'UCG 300', brand: 'Coster',
    portDefs: [
      { key: 'RS485-1',    type: 'RS 485',    label: 'RS485-1' },
      { key: 'BACnet-IP',  type: 'BACnet IP', label: 'BACnet IP' },
      { key: 'Modbus-TCP', type: 'Modbus TCP',label: 'Modbus TCP' },
      { key: 'M-Bus',      type: 'M-Bus',     label: 'M-Bus' },
    ],
    addable: ['RS 485'],
  },
  {
    model: 'UCG 400', brand: 'Coster',
    portDefs: [
      { key: 'RS485-1',    type: 'RS 485',    label: 'RS485-1' },
      { key: 'BACnet-IP',  type: 'BACnet IP', label: 'BACnet IP' },
      { key: 'Modbus-TCP', type: 'Modbus TCP',label: 'Modbus TCP' },
      { key: 'M-Bus',      type: 'M-Bus',     label: 'M-Bus' },
      { key: 'KNX',        type: 'KNX',       label: 'KNX' },
    ],
    addable: ['RS 485'],
  },
  {
    model: 'Kona Micro', brand: 'Tektelic',
    portDefs: [
      { key: 'LoRaWAN', type: 'LoRaWAN',  label: 'LoRaWAN' },
      { key: 'ETH-1',   type: 'Ethernet', label: 'ETH-1' },
    ],
    addable: [],
  },
  {
    model: 'Kona Macro', brand: 'Tektelic',
    portDefs: [
      { key: 'LoRaWAN', type: 'LoRaWAN',  label: 'LoRaWAN' },
      { key: 'ETH-1',   type: 'Ethernet', label: 'ETH-1' },
      { key: 'LTE',     type: 'LTE',      label: 'LTE' },
    ],
    addable: [],
  },
  {
    model: 'Kona Enterprise', brand: 'Tektelic',
    portDefs: [
      { key: 'LoRaWAN', type: 'LoRaWAN',  label: 'LoRaWAN' },
      { key: 'ETH-1',   type: 'Ethernet', label: 'ETH-1' },
      { key: 'Wi-Fi',   type: 'Wi-Fi',    label: 'Wi-Fi' },
      { key: 'LTE',     type: 'LTE',      label: 'LTE' },
    ],
    addable: [],
  },
  {
    model: 'Generico', brand: 'Custom',
    portDefs: [],
    addable: ['RS 485','M-Bus','Ethernet','LoRaWAN','KNX','DALI','Radio 868','BACnet IP','Modbus TCP','Wi-Fi','LTE'],
  },
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
  'C-BUS':      { color: '#f97316', bg: 'rgba(249,115,22,.1)',  border: 'rgba(249,115,22,.4)'  },
  'BACnet MSTP':{ color: '#f59e0b', bg: 'rgba(245,158,11,.1)', border: 'rgba(245,158,11,.4)' },
  'Digital In': { color: '#06b6d4', bg: 'rgba(6,182,212,.1)',  border: 'rgba(6,182,212,.4)'  },
  'V-OUT':      { color: '#84cc16', bg: 'rgba(132,204,22,.1)', border: 'rgba(132,204,22,.4)' },
  'Relay':      { color: '#f43f5e', bg: 'rgba(244,63,94,.1)',  border: 'rgba(244,63,94,.4)'  },
};

// ── pin count defaults per port type (0 = ETH jack, no screw block) ──
const DEV_PORT_DEFAULT_PINS = {
  'RS 485': 3, 'M-Bus': 4, 'C-BUS': 3, 'Ethernet': 0,
  'BACnet MSTP': 3, 'Digital In': 4, 'V-OUT': 3, 'Relay': 3,
};

// ── parametri default per tipo porta ─────────────────────

const DEV_PORT_PARAMS = {
  'RS 485': [
    { key: 'baud',   label: 'Baud Rate',      type: 'select', opts: ['1200','2400','4800','9600','19200','38400','57600','115200'], def: '9600' },
    { key: 'parity', label: 'Parity',          type: 'select', opts: ['None','Even','Odd'], def: 'None' },
    { key: 'stop',   label: 'Stop Bits',       type: 'select', opts: ['1','2'], def: '1' },
    { key: 'addr',   label: 'Addr. Range',     type: 'text',   def: '1–32' },
  ],
  'M-Bus': [
    { key: 'speed',  label: 'Speed (baud)',    type: 'select', opts: ['300','2400','9600'], def: '2400' },
    { key: 'mode',   label: 'Mode',            type: 'select', opts: ['primary','secondary'], def: 'primary' },
    { key: 'addrs',  label: 'Addr. Range',     type: 'text',   def: '1–250' },
  ],
  'Ethernet': [
    { key: 'ip',     label: 'IP Address',      type: 'text',   def: '192.168.1.100' },
    { key: 'mask',   label: 'Subnet Mask',     type: 'text',   def: '255.255.255.0' },
    { key: 'gw',     label: 'Gateway',         type: 'text',   def: '192.168.1.1' },
    { key: 'port',   label: 'TCP Port',        type: 'text',   def: '502' },
  ],
  'BACnet IP': [
    { key: 'devId',  label: 'Device ID',       type: 'text',   def: '1' },
    { key: 'port',   label: 'UDP Port',        type: 'text',   def: '47808' },
    { key: 'range',  label: 'Inst. Range',     type: 'text',   def: '0–4194302' },
  ],
  'Modbus TCP': [
    { key: 'ip',     label: 'IP Address',      type: 'text',   def: '192.168.1.100' },
    { key: 'port',   label: 'TCP Port',        type: 'text',   def: '502' },
    { key: 'unit',   label: 'Unit ID',         type: 'text',   def: '1' },
  ],
  'LoRaWAN': [
    { key: 'sf',     label: 'Spreading Factor',type: 'select', opts: ['SF7','SF8','SF9','SF10','SF11','SF12'], def: 'SF9' },
    { key: 'bw',     label: 'Bandwidth',       type: 'select', opts: ['125 kHz','250 kHz','500 kHz'], def: '125 kHz' },
    { key: 'appEui', label: 'App EUI',         type: 'text',   def: '' },
    { key: 'devEui', label: 'Dev EUI',         type: 'text',   def: '' },
    { key: 'appKey', label: 'App Key',         type: 'text',   def: '' },
  ],
  'KNX': [
    { key: 'ia',     label: 'Individual Addr', type: 'text',   def: '1.1.1' },
    { key: 'medium', label: 'Medium',          type: 'select', opts: ['TP','IP','RF','PL110'], def: 'TP' },
  ],
  'DALI': [
    { key: 'group',  label: 'Group Address',   type: 'text',   def: '0' },
    { key: 'level',  label: 'Power-on Level',  type: 'text',   def: '100' },
    { key: 'fade',   label: 'Fade Time',       type: 'select', opts: ['0s','0.7s','1s','2s','4s'], def: '1s' },
  ],
  'Radio 868': [
    { key: 'ch',     label: 'Channel',         type: 'text',   def: '1' },
    { key: 'power',  label: 'TX Power (dBm)',  type: 'select', opts: ['10','14','20','27'], def: '14' },
    { key: 'rate',   label: 'Data Rate',       type: 'select', opts: ['Low','Medium','High'], def: 'Medium' },
  ],
  'Wi-Fi': [
    { key: 'ssid',   label: 'SSID',            type: 'text',   def: '' },
    { key: 'sec',    label: 'Security',        type: 'select', opts: ['WPA2','WPA3','Open'], def: 'WPA2' },
  ],
  'LTE': [
    { key: 'apn',    label: 'APN',             type: 'text',   def: '' },
    { key: 'user',   label: 'Username',        type: 'text',   def: '' },
    { key: 'band',   label: 'Band',            type: 'text',   def: 'auto' },
  ],
  'C-BUS': [
    { key: 'baud',   label: 'Baud Rate',       type: 'select', opts: ['9600','19200','38400'], def: '9600' },
    { key: 'addr',   label: 'Addr. Range',     type: 'text',   def: '1–32' },
  ],
  'BACnet MSTP': [
    { key: 'devId',  label: 'Device ID',       type: 'text',   def: '1' },
    { key: 'mac',    label: 'MAC Addr',        type: 'text',   def: '0' },
    { key: 'baud',   label: 'Baud Rate',       type: 'select', opts: ['9600','19200','38400','76800'], def: '38400' },
  ],
  'Digital In': [
    { key: 'type',   label: 'Input Type',      type: 'select', opts: ['Dry contact','Wet 12V','Wet 24V'], def: 'Dry contact' },
    { key: 'logic',  label: 'Logic',           type: 'select', opts: ['NO','NC'], def: 'NO' },
  ],
  'V-OUT': [
    { key: 'volt',   label: 'Voltage',         type: 'select', opts: ['12V','24V'], def: '24V' },
    { key: 'imax',   label: 'Max current',     type: 'text',   def: '500mA' },
  ],
  'Relay': [
    { key: 'type',   label: 'Contact',         type: 'select', opts: ['NO','NC','changeover'], def: 'changeover' },
    { key: 'rating', label: 'Rating',          type: 'text',   def: '5A 250VAC' },
  ],
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
        <div class="dev-tb-lbl">Dispositivo</div>
        <select class="dev-tb-select" id="devseldev${id}">${devOpts}</select>
        <button class="dev-tb-btn" id="devadddev${id}">+ Dispositivo</button>
      </div>
      <div class="dev-tb-section">
        <button class="dev-tb-btn danger" id="devclear${id}">Cancella tutto</button>
      </div>
      <div class="dev-tb-hint">
        Trascina nodi per posizionare<br>
        Pin porta → trascina verso device<br>
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
  // Named ports (controller pins) — use the actual dot element's position
  if (!['top', 'right', 'bottom', 'left'].includes(port)) {
    const dotEl = nodeEl.querySelector(`.dev-port[data-port="${CSS.escape(port)}"]`);
    if (dotEl) {
      const pr = dotEl.getBoundingClientRect();
      const cr = canvasEl.getBoundingClientRect();
      return { x: pr.left - cr.left + pr.width / 2, y: pr.top - cr.top + pr.height / 2 };
    }
  }
  // Directional ports (top / right / bottom / left)
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
  let best = null, bestDist = Infinity;
  nodeEl.querySelectorAll('.dev-port').forEach(portEl => {
    const p   = portEl.dataset.port;
    const pos = _devPortPos(nodeEl, p, canvasEl);
    const d   = Math.hypot(pos.x - px, pos.y - py);
    if (d < bestDist) { bestDist = d; best = p; }
  });
  return best || 'left';
}

// ── port side for bezier direction ──────────────────────────

function _devPortSide(node, portKey) {
  if (['top', 'right', 'bottom', 'left'].includes(portKey)) return portKey;
  const defs = _devGetPortDefs(node);
  const pd = defs.find(d => d.key === portKey);
  if (pd?.side) return pd.side;
  return 'right'; // default: card-style ports on right edge
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

    // Determine node data for bezier direction and edge color
    const fromNode = data.nodes.find(n => n.id === edge.fromId);
    const toNode   = data.nodes.find(n => n.id === edge.toId);
    const fromSide = fromNode ? _devPortSide(fromNode, edge.fromPort) : edge.fromPort;
    const toSide   = toNode   ? _devPortSide(toNode,   edge.toPort)   : edge.toPort;
    const d  = _devEdgePath(fp.x, fp.y, fromSide, tp.x, tp.y, toSide);

    // Determine edge color from the connected port type
    const fromPd = fromNode?.portDefs?.find(pd => pd.key === edge.fromPort);
    const toPd   = toNode?.portDefs?.find(pd => pd.key === edge.toPort);
    let portType = null;
    if (fromNode?.ntype === 'controller') portType = fromPd?.type;
    else if (toNode?.ntype === 'controller') portType = toPd?.type;
    else if (fromNode?.ntype === 'port') portType = fromNode.portType;
    else if (toNode?.ntype === 'port')   portType = toNode.portType;
    const edgeColor = (portType && DEV_PORTS[portType]?.color) || null;

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
    if (edgeColor) {
      path.style.stroke = edgeColor;
      path.style.opacity = '0.65';
    }

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

  // refresh controller LED statuses after edges change
  if (w.devData) {
    w.devData.nodes.filter(n => n.ntype === 'controller').forEach(n => {
      _devRefreshCtrlLeds(id, n, w.devData);
    });
  }
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
    // ── info compatta controller ──
    addField('Modello', node.model, false);
    addField('Brand', node.brand, false);
    addField('Label', node.label || '', true, 'label');

    // ── compartimenti per porta ──
    const portDefs = _devGetPortDefs(node);
    if (!node.portParams) node.portParams = {};

    portDefs.forEach(pd => {
      if (!node.portParams[pd.key]) node.portParams[pd.key] = _devDefaultPortParams(pd.type);
      _devRenderPortCompartment(id, node, pd, body, _devData(id));
    });

    // ── aggiungi porta ──
    const cat = DEV_CONTROLLERS.find(c => c.model === node.model);
    const addable = cat?.addable || [];
    if (addable.length) {
      const addRow = document.createElement('div');
      addRow.className = 'dev-pp-addrow';
      const addSel = document.createElement('select');
      addSel.className = 'dev-tb-select dev-pp-addsel';
      addable.forEach(t => {
        const o = document.createElement('option'); o.value = t; o.textContent = t;
        addSel.appendChild(o);
      });
      const addBtn = document.createElement('button');
      addBtn.className = 'dev-tb-btn dev-pp-addbtn';
      addBtn.textContent = '+ Porta';
      addBtn.addEventListener('mousedown', e => e.stopPropagation());
      addBtn.addEventListener('click', e => {
        e.stopPropagation();
        _devAddPortInstance(id, node, addSel.value);
        _devShowDetail(id, node); // refresh panel
      });
      addSel.addEventListener('mousedown', e => e.stopPropagation());
      addRow.appendChild(addSel);
      addRow.appendChild(addBtn);
      body.appendChild(addRow);
    }
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

// ── port defs helpers ─────────────────────────────────────

function _devGetPortDefs(node) {
  if (node.portDefs) return node.portDefs;
  const cat = DEV_CONTROLLERS.find(c => c.model === node.model);
  if (!cat) return [];
  if (cat.portDefs) return cat.portDefs.map(pd => ({ ...pd }));
  if (cat.ports) return cat.ports.map(p => ({ key: p, type: p, label: p }));
  return [];
}

function _devDefaultPortParams(type) {
  const defs = DEV_PORT_PARAMS[type] || [];
  const out = {};
  defs.forEach(d => { out[d.key] = d.def; });
  return out;
}

// ── port compartment renderer (detail panel) ─────────────

function _devRenderPortCompartment(id, node, pd, body, data) {
  const ps  = DEV_PORTS[pd.type] || {};
  const col = ps.color || '#94a3b8';
  const connected = (data.edges || []).some(e =>
    (e.fromId === node.id && e.fromPort === pd.key) ||
    (e.toId   === node.id && e.toPort   === pd.key)
  );
  const params = DEV_PORT_PARAMS[pd.type] || [];

  const section = document.createElement('div');
  section.className = 'dev-pp-section';
  section.dataset.portkey = pd.key;

  // header
  const hdr = document.createElement('div');
  hdr.className = 'dev-pp-hdr';
  hdr.style.borderLeftColor = col;
  hdr.innerHTML = `
    <span class="dev-pp-led" style="${connected ? `background:${col}` : `border-color:${col}`}"></span>
    <span class="dev-pp-name" style="color:${col}">${pd.label}</span>
    <span class="dev-pp-type">${pd.type}</span>
    <span class="dev-pp-status">${connected ? 'connesso' : 'idle'}</span>`;

  // delete port button
  const delPBtn = document.createElement('button');
  delPBtn.className = 'dev-pp-del';
  delPBtn.textContent = '✕';
  delPBtn.title = 'Rimuovi porta';
  delPBtn.addEventListener('mousedown', e => e.stopPropagation());
  delPBtn.addEventListener('click', e => {
    e.stopPropagation();
    node.portDefs = (node.portDefs || []).filter(p => p.key !== pd.key);
    delete node.portParams[pd.key];
    // remove connected edges
    const devData = _devData(id);
    devData.edges = devData.edges.filter(e2 =>
      !(e2.fromId === node.id && e2.fromPort === pd.key) &&
      !(e2.toId   === node.id && e2.toPort   === pd.key)
    );
    _devRebuildCtrlNode(id, node);
    _devSave(id);
    _devShowDetail(id, node);
  });
  hdr.appendChild(delPBtn);
  section.appendChild(hdr);

  // params fields
  if (params.length) {
    const fields = document.createElement('div');
    fields.className = 'dev-pp-fields';
    params.forEach(def => {
      const row = document.createElement('div');
      row.className = 'dev-pp-row';
      const lbl = document.createElement('span');
      lbl.className = 'dev-pp-lbl';
      lbl.textContent = def.label;
      row.appendChild(lbl);

      let ctrl;
      if (def.type === 'select') {
        ctrl = document.createElement('select');
        ctrl.className = 'dev-tb-select dev-pp-ctrl';
        def.opts.forEach(o => {
          const opt = document.createElement('option');
          opt.value = o; opt.textContent = o;
          if ((node.portParams[pd.key]?.[def.key] || def.def) === o) opt.selected = true;
          ctrl.appendChild(opt);
        });
        ctrl.addEventListener('change', () => {
          if (!node.portParams[pd.key]) node.portParams[pd.key] = {};
          node.portParams[pd.key][def.key] = ctrl.value;
          _devSave(id);
        });
      } else {
        ctrl = document.createElement('input');
        ctrl.className = 'dev-detail-inp dev-pp-ctrl';
        ctrl.value = node.portParams[pd.key]?.[def.key] ?? def.def;
        ctrl.addEventListener('input', () => {
          if (!node.portParams[pd.key]) node.portParams[pd.key] = {};
          node.portParams[pd.key][def.key] = ctrl.value;
          _devSave(id);
        });
      }
      ctrl.addEventListener('mousedown', e => e.stopPropagation());
      row.appendChild(ctrl);
      fields.appendChild(row);
    });
    section.appendChild(fields);
  }

  // ── panel-only: pin count +/- and side toggle ──
  const pcat = DEV_CONTROLLERS.find(c => c.model === node.model);
  if (pcat?.panel && pd.type !== 'Ethernet') {
    const pinRow = document.createElement('div');
    pinRow.className = 'dev-pp-row dev-pp-pin-row';
    const pinLbl = document.createElement('span');
    pinLbl.className = 'dev-pp-lbl';
    pinLbl.textContent = 'Pins';
    const decBtn = document.createElement('button');
    decBtn.className = 'dev-tb-btn dev-pp-pin-btn';
    decBtn.textContent = '−';
    const pinVal = document.createElement('span');
    pinVal.className = 'dev-pp-pin-val';
    pinVal.textContent = pd.pins ?? (DEV_PORT_DEFAULT_PINS[pd.type] ?? 2);
    const incBtn = document.createElement('button');
    incBtn.className = 'dev-tb-btn dev-pp-pin-btn';
    incBtn.textContent = '+';
    [decBtn, incBtn].forEach(btn => btn.addEventListener('mousedown', e => e.stopPropagation()));
    decBtn.addEventListener('click', e => {
      e.stopPropagation();
      pd.pins = Math.max(1, (pd.pins ?? 2) - 1);
      pinVal.textContent = pd.pins;
      _devRebuildCtrlNode(id, node);
      _devSave(id);
    });
    incBtn.addEventListener('click', e => {
      e.stopPropagation();
      pd.pins = Math.min(8, (pd.pins ?? 2) + 1);
      pinVal.textContent = pd.pins;
      _devRebuildCtrlNode(id, node);
      _devSave(id);
    });
    pinRow.append(pinLbl, decBtn, pinVal, incBtn);
    section.appendChild(pinRow);
  }

  if (pcat?.panel) {
    const sideRow = document.createElement('div');
    sideRow.className = 'dev-pp-row dev-pp-side-row';
    const sideLbl = document.createElement('span');
    sideLbl.className = 'dev-pp-lbl';
    sideLbl.textContent = 'Lato';
    const sideBtn = document.createElement('button');
    sideBtn.className = 'dev-tb-btn dev-pp-side-btn';
    sideBtn.textContent = pd.side === 'top' ? '▲ Top' : '▼ Bottom';
    sideBtn.addEventListener('mousedown', e => e.stopPropagation());
    sideBtn.addEventListener('click', e => {
      e.stopPropagation();
      pd.side = (pd.side === 'top') ? 'bottom' : 'top';
      _devRebuildCtrlNode(id, node);
      _devSave(id);
      _devShowDetail(id, node);
    });
    sideRow.append(sideLbl, sideBtn);
    section.appendChild(sideRow);
  }

  body.appendChild(section);
}

// ── show port detail (click on pin) ──────────────────────

function _devShowPortDetail(id, node, portKey) {
  _devShowDetail(id, node);
  requestAnimationFrame(() => {
    const panel = document.getElementById('devdetail' + id);
    const sec = panel?.querySelector(`.dev-pp-section[data-portkey="${portKey}"]`);
    if (!sec) return;
    sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    sec.classList.add('dev-pp-focus');
    setTimeout(() => sec.classList.remove('dev-pp-focus'), 1200);
  });
}

// ── add port instance to controller ──────────────────────

function _devAddPortInstance(id, node, type) {
  if (!node.portDefs) node.portDefs = _devGetPortDefs(node);
  if (!node.portParams) node.portParams = {};
  const existing = node.portDefs.filter(pd => pd.type === type).length;
  const base  = type.replace(/\s+/g, '');
  const key   = base + '-' + (existing + 1);
  const label = type + '-' + (existing + 1);
  const cat   = DEV_CONTROLLERS.find(c => c.model === node.model);
  if (cat?.panel) {
    // Auto-place new ports on bottom strip
    const btmPorts = node.portDefs.filter(pd => pd.side === 'bottom');
    const pos  = Math.min(0.90, 0.10 + btmPorts.length * 0.18);
    const pins = DEV_PORT_DEFAULT_PINS[type] ?? 2;
    node.portDefs.push({ key, type, label, side: 'bottom', pos, pins });
  } else {
    node.portDefs.push({ key, type, label });
  }
  node.portParams[key] = _devDefaultPortParams(type);
  _devRebuildCtrlNode(id, node);
  _devSave(id);
}

// ── rebuild controller node element in canvas ─────────────

function _devRebuildCtrlNode(id, node) {
  const el = document.getElementById('dnode' + id + '_' + node.id);
  if (!el) return;
  const canvas = document.getElementById('devcvs' + id);
  const data   = _devData(id);
  const cat    = DEV_CONTROLLERS.find(c => c.model === node.model);
  const portDefs = _devGetPortDefs(node);

  if (cat?.panel) {
    // Rebuild strip content only — preserves face, delete button and handlers
    const topPorts = portDefs.filter(pd => pd.side === 'top');
    const btmPorts = portDefs.filter(pd => pd.side === 'bottom');
    const topStrip = el.querySelector('.dev-panel-strip-top');
    const btmStrip = el.querySelector('.dev-panel-strip-btm');
    if (topStrip) topStrip.innerHTML = topPorts.map(pd => _devPtermHTML(pd)).join('');
    if (btmStrip) btmStrip.innerHTML = btmPorts.map(pd => _devPtermHTML(pd)).join('');
    // Also rebuild LED rows in face
    const ledsDiv = el.querySelector('.dev-panel-face-leds');
    if (ledsDiv) {
      ledsDiv.innerHTML = portDefs.map(pd => {
        const ps  = DEV_PORTS[pd.type] || {};
        const col = ps.color || '#94a3b8';
        return `<div class="dev-panel-led-row">
          <span class="dev-panel-led" data-ledkey="${pd.key}" style="border-color:${col}88"></span>
          <span class="dev-panel-led-lbl" style="color:${col}bb">${pd.label}</span>
        </div>`;
      }).join('');
    }
  } else {
    const portRows = portDefs.map(pd => {
      const ps  = DEV_PORTS[pd.type] || {};
      const col = ps.color || '#94a3b8';
      const connected = data.edges.some(e =>
        (e.fromId === node.id && e.fromPort === pd.key) ||
        (e.toId   === node.id && e.toPort   === pd.key)
      );
      return `<div class="dev-ctrl-port" data-portkey="${pd.key}">
        <span class="dev-ctrl-port-led${connected ? ' active' : ''}" style="background:${connected ? col : 'transparent'};border-color:${col}40"></span>
        <span class="dev-ctrl-port-lbl" style="color:${col}">${pd.label}</span>
        <div class="dev-port" data-port="${pd.key}" style="background:${col};border-color:${col}40"></div>
      </div>`;
    }).join('');
    const portsDiv = el.querySelector('.dev-ctrl-ports');
    if (portsDiv) portsDiv.innerHTML = portRows;
  }

  // re-attach port drag listeners and terminal drag listeners
  _devSetupPortPins(id, node, el, canvas, data);
  if (cat?.panel) {
    const ts = el.querySelector('.dev-panel-strip-top');
    const bs = el.querySelector('.dev-panel-strip-btm');
    if (ts) _devSetupTermDrag(id, node, ts);
    if (bs) _devSetupTermDrag(id, node, bs);
  }
  _devRenderEdges(id);
}

// ── refresh controller LED statuses ──────────────────────

function _devRefreshCtrlLeds(id, node, data) {
  const el = document.getElementById('dnode' + id + '_' + node.id);
  if (!el) return;
  const isPanel = el.classList.contains('dev-panel');
  _devGetPortDefs(node).forEach(pd => {
    const connected = data.edges.some(e =>
      (e.fromId === node.id && e.fromPort === pd.key) ||
      (e.toId   === node.id && e.toPort   === pd.key)
    );
    const ps  = DEV_PORTS[pd.type] || {};
    const col = ps.color || '#94a3b8';
    if (isPanel) {
      // Port dot glow on strip
      const portDot = el.querySelector(`.dev-port[data-port="${CSS.escape(pd.key)}"]`);
      if (portDot) portDot.style.boxShadow = connected ? `0 0 7px ${col}, 0 0 3px ${col}` : 'none';
      // Face LED indicator
      const faceLed = el.querySelector(`.dev-panel-led[data-ledkey="${CSS.escape(pd.key)}"]`);
      if (faceLed) {
        faceLed.style.background  = connected ? col : 'transparent';
        faceLed.style.boxShadow   = connected ? `0 0 5px ${col}` : 'none';
      }
    } else {
      const led = el.querySelector(`.dev-ctrl-port[data-portkey="${pd.key}"] .dev-ctrl-port-led`);
      if (led) {
        led.style.background = connected ? col : 'transparent';
        led.classList.toggle('active', connected);
      }
    }
  });
}

// ── attach port-pin drag+click listeners ─────────────────

function _devSetupPortPins(id, node, el, canvas, data) {
  el.querySelectorAll('.dev-port').forEach(portEl => {
    if (portEl.dataset.lsnr) return;
    portEl.dataset.lsnr = '1';
    portEl.addEventListener('mousedown', e => {
      e.stopPropagation();
      const fromPort = portEl.dataset.port;
      const fp  = _devPortPos(el, fromPort, canvas);
      const svg = document.getElementById('devsvg' + id);
      let tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      tempLine.setAttribute('class', 'dev-temp-line');
      svg.appendChild(tempLine);
      let moved = 0, px = e.clientX, py = e.clientY;

      function onConnMove(ev) {
        if (!tempLine) return;
        moved += Math.abs(ev.clientX - px) + Math.abs(ev.clientY - py);
        px = ev.clientX; py = ev.clientY;
        const cr = canvas.getBoundingClientRect();
        tempLine.setAttribute('d', `M ${fp.x} ${fp.y} L ${ev.clientX - cr.left} ${ev.clientY - cr.top}`);
      }

      function onConnUp(ev) {
        document.removeEventListener('mousemove', onConnMove);
        document.removeEventListener('mouseup',   onConnUp);
        tempLine?.remove(); tempLine = null;

        const elements = document.elementsFromPoint(ev.clientX, ev.clientY);
        const targetEl = elements.find(el2 => el2.classList.contains('dev-node') && el2 !== el);

        if (!targetEl) {
          if (moved < 5 && node.ntype === 'controller') _devShowPortDetail(id, node, fromPort);
          return;
        }
        const cr  = canvas.getBoundingClientRect();
        const mx  = ev.clientX - cr.left;
        const my  = ev.clientY - cr.top;
        const tId = targetEl.id.replace('dnode' + id + '_', '');
        const toPort = _devNearestPort(targetEl, mx, my, canvas);

        if (data.edges.some(e2 => e2.fromId === node.id && e2.toId === tId && e2.fromPort === fromPort && e2.toPort === toPort)) return;
        data.edges.push({ id: 'de' + Date.now(), fromId: node.id, fromPort, toId: tId, toPort });
        _devRenderEdges(id);
        _devUpdateCount(id);
        _devSave(id);
      }
      document.addEventListener('mousemove', onConnMove);
      document.addEventListener('mouseup',   onConnUp);
    });
  });
}

// ── terminal block drag-to-reposition ────────────────────

function _devSetupTermDrag(id, node, stripEl) {
  stripEl.querySelectorAll('.dev-pterm-block').forEach(blockEl => {
    if (blockEl.dataset.tdlsnr) return;
    blockEl.dataset.tdlsnr = '1';
    blockEl.addEventListener('mousedown', e => {
      if (e.target.classList.contains('dev-port')) return;
      e.stopPropagation(); // prevent node-level drag
      const ptermEl = blockEl.closest('.dev-pterm');
      const stripW  = stripEl.getBoundingClientRect().width;
      const pd      = (node.portDefs || []).find(p => p.key === ptermEl?.dataset.termkey);
      if (!pd || !stripW) return;
      const startX = e.clientX, startPos = pd.pos;
      function onMove(ev) {
        pd.pos = Math.max(0.02, Math.min(0.97, startPos + (ev.clientX - startX) / stripW));
        ptermEl.style.left = (pd.pos * 100) + '%';
        _devRenderEdges(id);
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        _devSave(id);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  });
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

// ── panel (DIN-rail) HTML helpers ────────────────────────

function _devPtermHTML(pd) {
  const col  = DEV_PORTS[pd.type]?.color || '#94a3b8';
  const pins = pd.pins ?? (DEV_PORT_DEFAULT_PINS[pd.type] ?? 2);
  const isEth = (pins === 0);
  const innerShape = isEth
    ? `<div class="dev-pterm-jack" style="border-color:${col}88"></div>`
    : Array.from({ length: pins }, () =>
        `<div class="dev-pterm-pin" style="border-color:${col}66"></div>`
      ).join('');
  return `<div class="dev-pterm" style="left:${pd.pos * 100}%" data-termkey="${pd.key}">
    <div class="dev-port" data-port="${pd.key}" style="background:${col};border-color:${col}66" title="${pd.label}"></div>
    <div class="dev-pterm-block" data-termkey="${pd.key}">${innerShape}</div>
    <span class="dev-pterm-lbl" style="color:${col}">${pd.label}</span>
  </div>`;
}

function _devPanelHTML(node, cat) {
  const portDefs = node.portDefs || [];
  const topPorts = portDefs.filter(pd => pd.side === 'top');
  const btmPorts = portDefs.filter(pd => pd.side === 'bottom');
  const topHTML  = topPorts.map(pd => _devPtermHTML(pd)).join('');
  const btmHTML  = btmPorts.map(pd => _devPtermHTML(pd)).join('');

  const ledsHTML = portDefs.map(pd => {
    const ps  = DEV_PORTS[pd.type] || {};
    const col = ps.color || '#94a3b8';
    return `<div class="dev-panel-led-row">
      <span class="dev-panel-led" data-ledkey="${pd.key}" style="border-color:${col}88"></span>
      <span class="dev-panel-led-lbl" style="color:${col}bb">${pd.label}</span>
    </div>`;
  }).join('');

  return `
    <div class="dev-panel-strip dev-panel-strip-top">${topHTML}</div>
    <div class="dev-panel-face">
      <div class="dev-panel-face-leds">${ledsHTML}</div>
      <div class="dev-panel-face-id">
        <span class="dev-node-brand">${node.brand}</span>
        <span class="dev-node-model">${node.label || node.model}</span>
      </div>
    </div>
    <div class="dev-panel-strip dev-panel-strip-btm">${btmHTML}</div>
    <button class="dev-node-del" title="Elimina">✕</button>`;
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
    if (!node.portDefs)   node.portDefs   = _devGetPortDefs(node);
    if (!node.portParams) node.portParams = {};
    node.portDefs.forEach(pd => {
      if (!node.portParams[pd.key]) node.portParams[pd.key] = _devDefaultPortParams(pd.type);
    });

    const cat = DEV_CONTROLLERS.find(c => c.model === node.model);
    if (cat?.panel) {
      el.classList.add('dev-panel');
      el.innerHTML = _devPanelHTML(node, cat);
    } else {
      const portDefs = node.portDefs;
      const portRows = portDefs.map(pd => {
        const ps  = DEV_PORTS[pd.type] || {};
        const col = ps.color || '#94a3b8';
        return `<div class="dev-ctrl-port" data-portkey="${pd.key}">
          <span class="dev-ctrl-port-led" style="background:transparent;border-color:${col}40"></span>
          <span class="dev-ctrl-port-lbl" style="color:${col}">${pd.label}</span>
          <div class="dev-port" data-port="${pd.key}" style="background:${col};border-color:${col}40"></div>
        </div>`;
      }).join('');

      el.innerHTML = `
        <div class="dev-ctrl-header">
          <div class="dev-node-model">${node.label || node.model}</div>
          <div class="dev-node-brand">${node.brand}</div>
        </div>
        <div class="dev-ctrl-ports">${portRows}</div>
        <button class="dev-node-del" title="Elimina">✕</button>`;
    }
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
    if (e.target.closest('.dev-pterm')) return; // terminal block drag handles itself
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
    if (e.target.closest('.dev-pterm')) return; // terminal clicks don't open node detail
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

  // ── port drag → connect (+ click → configure) ──
  _devSetupPortPins(id, node, el, canvas, data);

  // ── terminal block drag-to-reposition (panel only) ──
  if (node.ntype === 'controller') {
    const _cat = DEV_CONTROLLERS.find(c => c.model === node.model);
    if (_cat?.panel) {
      const topStrip = el.querySelector('.dev-panel-strip-top');
      const btmStrip = el.querySelector('.dev-panel-strip-btm');
      if (topStrip) _devSetupTermDrag(id, node, topStrip);
      if (btmStrip) _devSetupTermDrag(id, node, btmStrip);
    }
  }

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

  const portDefs = (cat.portDefs || []).map(pd => ({ ...pd }));
  const portParams = {};
  portDefs.forEach(pd => { portParams[pd.key] = _devDefaultPortParams(pd.type); });

  const node = {
    id: 'dc' + Date.now(),
    ntype: 'controller',
    model: cat.model,
    brand: cat.brand,
    label: '',
    portDefs,
    portParams,
    x: 60 + Math.random() * Math.max(100, (cr?.width || 400) - 300),
    y: 60 + Math.random() * Math.max(60, (cr?.height || 300) - 200),
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
