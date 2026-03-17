'use strict';
/* ═══════════════════════════════════════════════════════════
   KNX DATA — Manufacturer database + DPT database + device templates
   Fonte: KNX Association (www.knx.org) + assets/uploads/knx_*.json
   ═══════════════════════════════════════════════════════════ */

// ── Mediums KNX ──────────────────────────────────────────

const KNX_MEDIUMS = ['TP', 'PL', 'RF', 'IP'];

// ── Device types KNX ─────────────────────────────────────

const KNX_DEVICE_TYPES = [
  'sensor', 'actuator', 'sensor_actuator', 'system',
  'gateway', 'display', 'controller'
];

// ── Functional blocks KNX ────────────────────────────────

const KNX_FUNCTIONAL_BLOCKS = [
  'switch', 'dimming', 'shutter_blind', 'hvac', 'scene',
  'energy', 'rgb_color', 'audio_video', 'security', 'time',
  'generic', 'power_supply', 'coupler', 'router', 'gateway'
];

// ── DPT Database (standard KNX Datapoint Types) ──────────

const KNX_DPT = {
  '1.001': { name: 'Switch',             size: 1,  unit: '',      values: { 0: 'Off', 1: 'On' } },
  '1.002': { name: 'Boolean',            size: 1,  unit: '',      values: { 0: 'False', 1: 'True' } },
  '1.003': { name: 'Enable',             size: 1,  unit: '',      values: { 0: 'Disable', 1: 'Enable' } },
  '1.007': { name: 'Step',               size: 1,  unit: '',      values: { 0: 'Decrease', 1: 'Increase' } },
  '1.008': { name: 'UpDown',             size: 1,  unit: '',      values: { 0: 'Up', 1: 'Down' } },
  '1.009': { name: 'OpenClose',          size: 1,  unit: '',      values: { 0: 'Open', 1: 'Close' } },
  '1.010': { name: 'Start',              size: 1,  unit: '',      values: { 0: 'Stop', 1: 'Start' } },
  '1.011': { name: 'State',              size: 1,  unit: '',      values: { 0: 'Inactive', 1: 'Active' } },
  '1.017': { name: 'Trigger',            size: 1,  unit: '',      values: { 0: 'Trigger 0', 1: 'Trigger 1' } },
  '1.018': { name: 'Occupancy',          size: 1,  unit: '',      values: { 0: 'Not occupied', 1: 'Occupied' } },
  '1.019': { name: 'Window/Door',        size: 1,  unit: '',      values: { 0: 'Closed', 1: 'Open' } },
  '2.001': { name: 'Switch Control',     size: 2,  unit: '' },
  '3.007': { name: 'Control Dimming',    size: 4,  unit: '' },
  '3.008': { name: 'Control Blinds',     size: 4,  unit: '' },
  '5.001': { name: 'Scaling',            size: 8,  unit: '%',     range: [0, 100] },
  '5.003': { name: 'Angle',              size: 8,  unit: '°',     range: [0, 360] },
  '5.004': { name: 'Percent (0..255)',   size: 8,  unit: '%',     range: [0, 255] },
  '5.010': { name: 'Value 1 Ucount',     size: 8,  unit: 'cnt',   range: [0, 255] },
  '6.001': { name: 'Percent V8',         size: 8,  unit: '%',     range: [-128, 127] },
  '7.001': { name: 'Value 2 Ucount',     size: 16, unit: 'cnt',   range: [0, 65535] },
  '7.005': { name: 'TimePeriod s',       size: 16, unit: 's',     range: [0, 65535] },
  '7.013': { name: 'Lux',               size: 16, unit: 'lux',   range: [0, 65535] },
  '9.001': { name: 'Temperature',        size: 16, unit: '°C' },
  '9.002': { name: 'Temp Difference',    size: 16, unit: 'K' },
  '9.004': { name: 'Illuminance',        size: 16, unit: 'lux' },
  '9.005': { name: 'Wind Speed',         size: 16, unit: 'm/s' },
  '9.006': { name: 'Pressure',           size: 16, unit: 'Pa' },
  '9.007': { name: 'Humidity',           size: 16, unit: '%' },
  '9.008': { name: 'Air Quality',        size: 16, unit: 'ppm' },
  '9.020': { name: 'Voltage',            size: 16, unit: 'mV' },
  '9.021': { name: 'Current',            size: 16, unit: 'mA' },
  '9.024': { name: 'Power',              size: 16, unit: 'kW' },
  '10.001': { name: 'TimeOfDay',         size: 24, unit: 'HH:MM:SS' },
  '11.001': { name: 'Date',              size: 24, unit: 'DD/MM/YY' },
  '12.001': { name: 'Value 4 Ucount',    size: 32, unit: 'cnt' },
  '13.010': { name: 'Active Energy',     size: 32, unit: 'Wh' },
  '13.013': { name: 'Active Energy kWh', size: 32, unit: 'kWh' },
  '14.056': { name: 'Power (W)',         size: 32, unit: 'W' },
  '16.000': { name: 'ASCII String',      size: 112, unit: 'text' },
  '17.001': { name: 'Scene Number',      size: 8,  unit: 'scene', range: [0, 63] },
  '18.001': { name: 'Scene Control',     size: 8,  unit: 'scene' },
  '19.001': { name: 'DateTime',          size: 64, unit: 'dt' },
  '20.102': { name: 'HVAC Mode',         size: 8,  unit: '',
    values: { 0: 'Auto', 1: 'Comfort', 2: 'Standby', 3: 'Economy', 4: 'Building Protection' } },
  '232.600': { name: 'RGB Value',        size: 24, unit: 'RGB' },
};

// ── Manufacturers KNX (key subset) ──────────────────────

const KNX_MANUFACTURERS = [
  { id: 'ABB',       name: 'ABB',                      hex: '0x0003', country: 'CH', tier: 'enterprise' },
  { id: 'SIEMENS',   name: 'Siemens AG',               hex: '0x0008', country: 'DE', tier: 'enterprise' },
  { id: 'SCHNEIDER', name: 'Schneider / Merten',       hex: '0x000A', country: 'FR', tier: 'enterprise' },
  { id: 'JUNG',      name: 'Jung',                     hex: '0x0021', country: 'DE', tier: 'premium' },
  { id: 'GIRA',      name: 'Gira',                     hex: '0x00C5', country: 'DE', tier: 'premium' },
  { id: 'MDT',       name: 'MDT Technologies',         hex: '0x000C', country: 'DE', tier: 'professional' },
  { id: 'HAGER',     name: 'Hager / Tebis',            hex: '0x0090', country: 'DE', tier: 'professional' },
  { id: 'THEBEN',    name: 'Theben',                   hex: '0x00D4', country: 'DE', tier: 'professional' },
  { id: 'LEGRAND',   name: 'Legrand',                  hex: '0x0060', country: 'FR', tier: 'enterprise' },
  { id: 'BTICINO',   name: 'BTicino (Legrand)',        hex: '0x0060', country: 'IT', tier: 'professional' },
  { id: 'ZENNIO',    name: 'Zennio',                   hex: '0x0067', country: 'ES', tier: 'professional' },
  { id: 'WEINZIERL', name: 'Weinzierl Engineering',    hex: '0x00C8', country: 'DE', tier: 'professional' },
  { id: 'EKINEX',    name: 'Ekinex',                   hex: '0x0053', country: 'IT', tier: 'professional' },
  { id: 'VIMAR',     name: 'Vimar',                    hex: '0x0073', country: 'IT', tier: 'professional' },
  { id: 'GEWISS',    name: 'Gewiss',                   hex: '0x0044', country: 'IT', tier: 'professional' },
  { id: 'ELTAKO',    name: 'Eltako',                   hex: '0x0005', country: 'DE', tier: 'professional' },
  { id: 'WAGO',      name: 'WAGO',                     hex: '0x0047', country: 'DE', tier: 'enterprise' },
  { id: 'STEINEL',   name: 'Steinel',                  hex: '0x01AE', country: 'DE', tier: 'professional' },
  { id: 'ELSNER',    name: 'Elsner Elektronik',        hex: '0x01D5', country: 'DE', tier: 'professional' },
  { id: 'LOXONE',    name: 'Loxone',                   hex: '0x01C5', country: 'AT', tier: 'professional' },
  { id: 'SOMFY',     name: 'Somfy',                    hex: '0x0036', country: 'FR', tier: 'professional' },
  { id: 'FINDER',    name: 'Finder',                   hex: '0x0041', country: 'IT', tier: 'professional' },
  { id: 'LOYTEC',    name: 'LOYTEC',                   hex: '0x0055', country: 'AT', tier: 'enterprise' },
  { id: 'HDL',       name: 'HDL Automation',           hex: '0x00B4', country: 'CN', tier: 'value' },
  { id: 'INTERRA',   name: 'Interra Systems',          hex: '0x0248', country: 'TR', tier: 'professional' },
  { id: 'MEAN_WELL', name: 'Mean Well',                hex: null,     country: 'TW', tier: 'value' },
  { id: 'BERKER',    name: 'Berker (Hager)',           hex: '0x0082', country: 'DE', tier: 'premium' },
  { id: 'NICE',      name: 'Nice',                     hex: '0x0069', country: 'IT', tier: 'professional' },
  { id: 'URMET',     name: 'Urmet',                    hex: '0x0059', country: 'IT', tier: 'professional' },
  { id: 'PHOENIX',   name: 'Phoenix Contact',          hex: '0x007C', country: 'DE', tier: 'enterprise' },
  { id: 'GVS',       name: 'GVS',                      hex: '0x004B', country: 'IT', tier: 'professional' },
  { id: 'BLUMOTIX',  name: 'Blumotix',                 hex: '0x01B0', country: 'IT', tier: 'professional' },
  { id: 'CUSTOM',    name: '— Altro —',                hex: null,     country: '',   tier: '' },
];

// ── KNX device templates (con group objects predefiniti) ──

const KNX_DEVICE_TEMPLATES = [
  {
    model: 'Switch Actuator 8x',
    manufacturer: 'MDT',
    deviceType: 'actuator',
    functionalBlock: 'switch',
    desc: 'Attuatore 8 canali on/off',
    groupObjects: [
      { name: 'Switch Ch.1',     dpt: '1.001', flags: { C:true, R:true, W:true, T:false, U:true } },
      { name: 'Status Ch.1',     dpt: '1.001', flags: { C:true, R:true, W:false, T:true, U:false } },
      { name: 'Switch Ch.2',     dpt: '1.001', flags: { C:true, R:true, W:true, T:false, U:true } },
      { name: 'Status Ch.2',     dpt: '1.001', flags: { C:true, R:true, W:false, T:true, U:false } },
    ],
  },
  {
    model: 'Dimming Actuator 4x',
    manufacturer: 'MDT',
    deviceType: 'actuator',
    functionalBlock: 'dimming',
    desc: 'Dimmer 4 canali LED/alogeno',
    groupObjects: [
      { name: 'Switch Ch.1',     dpt: '1.001', flags: { C:true, R:true, W:true, T:false, U:true } },
      { name: 'Dimming Ch.1',    dpt: '3.007', flags: { C:true, R:false, W:true, T:false, U:false } },
      { name: 'Brightness Ch.1', dpt: '5.001', flags: { C:true, R:true, W:true, T:true, U:true } },
      { name: 'Status Ch.1',     dpt: '1.001', flags: { C:true, R:true, W:false, T:true, U:false } },
    ],
  },
  {
    model: 'Blind Actuator 4x',
    manufacturer: 'ABB',
    deviceType: 'actuator',
    functionalBlock: 'shutter_blind',
    desc: 'Attuatore tapparelle/veneziane 4CH',
    groupObjects: [
      { name: 'Move Up/Down Ch.1',    dpt: '1.008', flags: { C:true, R:false, W:true, T:false, U:false } },
      { name: 'Stop/Step Ch.1',       dpt: '1.007', flags: { C:true, R:false, W:true, T:false, U:false } },
      { name: 'Position Ch.1',        dpt: '5.001', flags: { C:true, R:true, W:true, T:true, U:true } },
      { name: 'Slat Position Ch.1',   dpt: '5.001', flags: { C:true, R:true, W:true, T:true, U:true } },
    ],
  },
  {
    model: 'Fan Coil Controller',
    manufacturer: 'SIEMENS',
    deviceType: 'controller',
    functionalBlock: 'hvac',
    desc: 'Controller fan coil 2/4 tubi',
    groupObjects: [
      { name: 'Room Temperature',     dpt: '9.001', flags: { C:true, R:true, W:false, T:true, U:false } },
      { name: 'Setpoint',             dpt: '9.001', flags: { C:true, R:true, W:true, T:true, U:true } },
      { name: 'HVAC Mode',            dpt: '20.102', flags: { C:true, R:true, W:true, T:true, U:true } },
      { name: 'Valve Output',         dpt: '5.001', flags: { C:true, R:true, W:false, T:true, U:false } },
      { name: 'Fan Speed',            dpt: '5.010', flags: { C:true, R:true, W:true, T:true, U:true } },
    ],
  },
  {
    model: 'Presence Detector',
    manufacturer: 'THEBEN',
    deviceType: 'sensor',
    functionalBlock: 'security',
    desc: 'Sensore presenza soffitto',
    groupObjects: [
      { name: 'Presence',             dpt: '1.018', flags: { C:true, R:true, W:false, T:true, U:false } },
      { name: 'Brightness',           dpt: '9.004', flags: { C:true, R:true, W:false, T:true, U:false } },
      { name: 'Switch Output',        dpt: '1.001', flags: { C:true, R:true, W:false, T:true, U:false } },
    ],
  },
  {
    model: 'Weather Station',
    manufacturer: 'ELSNER',
    deviceType: 'sensor',
    functionalBlock: 'generic',
    desc: 'Stazione meteo KNX',
    groupObjects: [
      { name: 'Temperature',          dpt: '9.001', flags: { C:true, R:true, W:false, T:true, U:false } },
      { name: 'Wind Speed',           dpt: '9.005', flags: { C:true, R:true, W:false, T:true, U:false } },
      { name: 'Brightness South',     dpt: '9.004', flags: { C:true, R:true, W:false, T:true, U:false } },
      { name: 'Rain',                 dpt: '1.001', flags: { C:true, R:true, W:false, T:true, U:false } },
    ],
  },
  {
    model: 'Touch Panel 7"',
    manufacturer: 'ZENNIO',
    deviceType: 'display',
    functionalBlock: 'scene',
    desc: 'Pannello touch capacitivo 7"',
    groupObjects: [
      { name: 'Page Select',          dpt: '5.010', flags: { C:true, R:true, W:true, T:true, U:true } },
      { name: 'Scene 1',              dpt: '17.001', flags: { C:true, R:false, W:false, T:true, U:false } },
      { name: 'Scene 2',              dpt: '17.001', flags: { C:true, R:false, W:false, T:true, U:false } },
    ],
  },
  {
    model: 'IP Router',
    manufacturer: 'WEINZIERL',
    deviceType: 'system',
    functionalBlock: 'router',
    desc: 'Router KNX/IP (tunnel + routing)',
    groupObjects: [],
  },
  {
    model: 'KNX Power Supply 640mA',
    manufacturer: 'MEAN_WELL',
    deviceType: 'system',
    functionalBlock: 'power_supply',
    desc: 'Alimentatore bus KNX 30V 640mA',
    groupObjects: [],
  },
  {
    model: 'Energy Meter 3ph',
    manufacturer: 'FINDER',
    deviceType: 'sensor',
    functionalBlock: 'energy',
    desc: 'Contatore energia trifase',
    groupObjects: [
      { name: 'Active Power',         dpt: '14.056', flags: { C:true, R:true, W:false, T:true, U:false } },
      { name: 'Total Energy',         dpt: '13.013', flags: { C:true, R:true, W:false, T:true, U:false } },
      { name: 'Voltage L1',           dpt: '9.020', flags: { C:true, R:true, W:false, T:true, U:false } },
      { name: 'Current L1',           dpt: '9.021', flags: { C:true, R:true, W:false, T:true, U:false } },
    ],
  },
  {
    model: 'Push Button 4x',
    manufacturer: 'JUNG',
    deviceType: 'sensor_actuator',
    functionalBlock: 'switch',
    desc: 'Pulsante 4 tasti con LED',
    groupObjects: [
      { name: 'Button 1 Switch',      dpt: '1.001', flags: { C:true, R:false, W:false, T:true, U:false } },
      { name: 'Button 1 LED',         dpt: '1.001', flags: { C:true, R:false, W:true, T:false, U:true } },
      { name: 'Button 2 Switch',      dpt: '1.001', flags: { C:true, R:false, W:false, T:true, U:false } },
      { name: 'Button 2 LED',         dpt: '1.001', flags: { C:true, R:false, W:true, T:false, U:true } },
    ],
  },
  {
    model: 'RGB LED Controller',
    manufacturer: 'MDT',
    deviceType: 'actuator',
    functionalBlock: 'rgb_color',
    desc: 'Controller LED RGB/RGBW',
    groupObjects: [
      { name: 'Switch',               dpt: '1.001', flags: { C:true, R:true, W:true, T:false, U:true } },
      { name: 'RGB Color',            dpt: '232.600', flags: { C:true, R:true, W:true, T:true, U:true } },
      { name: 'Brightness',           dpt: '5.001', flags: { C:true, R:true, W:true, T:true, U:true } },
    ],
  },
  {
    model: 'Thermostat',
    manufacturer: 'EKINEX',
    deviceType: 'sensor_actuator',
    functionalBlock: 'hvac',
    desc: 'Termostato ambiente con display',
    groupObjects: [
      { name: 'Temperature',          dpt: '9.001', flags: { C:true, R:true, W:false, T:true, U:false } },
      { name: 'Humidity',             dpt: '9.007', flags: { C:true, R:true, W:false, T:true, U:false } },
      { name: 'Setpoint',             dpt: '9.001', flags: { C:true, R:true, W:true, T:true, U:true } },
      { name: 'HVAC Mode',            dpt: '20.102', flags: { C:true, R:true, W:true, T:true, U:true } },
      { name: 'Valve Output',         dpt: '5.001', flags: { C:true, R:true, W:false, T:true, U:false } },
    ],
  },
  {
    model: 'Dispositivo KNX generico',
    manufacturer: 'CUSTOM',
    deviceType: 'sensor_actuator',
    functionalBlock: 'generic',
    desc: 'Device KNX personalizzabile',
    groupObjects: [],
  },
];
