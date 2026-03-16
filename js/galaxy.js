'use strict';
/* ═══════════════════════════════════════════════════════════
   GALAXY — Coster e Tektelic ecosystem viewer (D3.js)
   Dipende da: window-manager.js (WINS), D3.js (CDN)
   ═══════════════════════════════════════════════════════════ */

// ── colori ──────────────────────────────────────────────────
const GC = {
  ehc:'#f0c040', bacnet:'#34d399', seriey:'#fb923c', radio:'#c084fc',
  sup:'#38bdf8', esp:'#f472b6',  proto:'#94a3b8',  monitor:'#4ade80',
  tgw:'#22d3ee', tcity:'#818cf8', ttrack:'#f97316', thealth:'#fb7185',
  tagri:'#a3e635', tsrv:'#60a5fa', tsafety:'#fbbf24',
  coster:'#f0c040', tektelic:'#22d3ee',
  blorawan:'#e879f9', bbms:'#34d399', bapi:'#f59e0b',
};
const gc = k => GC[k] || '#aaa';

// ── dati COSTER ──────────────────────────────────────────────
const COSTER_NODES = [
  {id:'hub_c', label:'COSTER', type:'hub', r:40, col:'coster', icon:'🏗️',
   info:{titolo:'Coster – Building Automation', sottotitolo:'Efficienza energetica per edifici',
     note:'Piattaforma BA completa: BACnet, Modbus, M-Bus, C-Bus, Radio 868 MHz.'}},
  {id:'g_ehc',  label:'Edge Device',    type:'cat', r:25, col:'ehc',    icon:'⚡',
   info:{titolo:'Edge Device', note:'EHC 602, YHC 700, ZHC 602. Hub multiprotocollo centrale.'}},
  {id:'g_bac',  label:'BACnet',         type:'cat', r:24, col:'bacnet', icon:'🔌',
   info:{titolo:'BACnet ASHRAE 135', note:'ZBC 862, ZRC 658, MFD 438.'}},
  {id:'g_sy',   label:'Serie Y\nModbus',type:'cat', r:24, col:'seriey', icon:'🔥',
   info:{titolo:'Serie Y – Modbus RTU/TCP', note:'YLC 880, GPC 642.'}},
  {id:'g_rad',  label:'Radio 868',      type:'cat', r:24, col:'radio',  icon:'📡',
   info:{titolo:'Radio 868 MHz', note:'CSW 868, BRG 868/868C.'}},
  {id:'g_sup',  label:'Supervisione',   type:'cat', r:23, col:'sup',    icon:'🌐',
   info:{titolo:'Supervisione', note:'RUT 302, Webgarage BMS.'}},
  {id:'g_esp',  label:'Espansione',     type:'cat', r:22, col:'esp',    icon:'🧩',
   info:{titolo:'Espansione I/O', note:'EST 482, ESU 402, ESP 442.'}},
  {id:'g_pro',  label:'Protocolli',     type:'cat', r:22, col:'proto',  icon:'⚙️',
   info:{titolo:'Protocolli Seriali', note:'RS-485 · Modbus RTU · BACnet MS/TP · M-Bus · C-Bus.'}},
  {id:'g_mon',  label:'Monitoring',     type:'cat', r:22, col:'monitor',icon:'📊',
   info:{titolo:'Monitoring Energetico', note:'MFD, MHF/MHN, CMC 422/428.'}},
  {id:'br_lora',label:'LoRaWAN\n↔ BACnet/Modbus', type:'bridge', r:21, col:'blorawan', icon:'🔗',
   info:{titolo:'Bridge: LoRaWAN ↔ BACnet/Modbus', sottotitolo:'KONA GW → EHC 602',
     note:'Sensori TEKTELIC → KONA GW → KONA NS → MQTT → EHC 602.',
     protocolli:['LoRaWAN','Modbus TCP','BACnet IP','MQTT TLS']}},
  {id:'br_bms', label:'API / BMS',  type:'bridge', r:18, col:'bbms', icon:'🔄',
   info:{titolo:'Bridge: API/BMS Integration', note:'MQTT/REST per dashboard unificata.',
     protocolli:['MQTT TLS','REST API','OAuth2']}},
  {id:'br_rad', label:'CSW 868\n↔ LoRaWAN',type:'bridge', r:18, col:'bapi', icon:'📻',
   info:{titolo:'Bridge: Radio/M-Bus ↔ LoRaWAN',
     note:'Sonde 868 → CSW 868 → RS-485 → EHC 602.',
     protocolli:['Radio 868','RS-485','M-Bus EN13757','LoRaWAN']}},
];
const COSTER_LINKS = [
  {s:'hub_c',t:'g_ehc'},{s:'hub_c',t:'g_bac'},{s:'hub_c',t:'g_sy'},
  {s:'hub_c',t:'g_rad'},{s:'hub_c',t:'g_sup'},{s:'hub_c',t:'g_esp'},
  {s:'hub_c',t:'g_pro'},{s:'hub_c',t:'g_mon'},
  {s:'hub_c',t:'br_lora',b:1},{s:'g_ehc',t:'br_lora',b:1},
  {s:'hub_c',t:'br_bms', b:1},{s:'g_sup',t:'br_bms', b:1},
  {s:'g_rad',t:'br_rad', b:1},{s:'g_mon',t:'br_rad', b:1},
];
const COSTER_LEG = [
  {k:'ehc',    col:'#f0c040', lbl:'Edge Device'},
  {k:'bacnet', col:'#34d399', lbl:'BACnet'},
  {k:'seriey', col:'#fb923c', lbl:'Serie Y/Modbus'},
  {k:'radio',  col:'#c084fc', lbl:'Radio 868'},
  {k:'sup',    col:'#38bdf8', lbl:'Supervisione'},
  {k:'esp',    col:'#f472b6', lbl:'Espansione I/O'},
  {k:'proto',  col:'#94a3b8', lbl:'Protocolli'},
  {k:'monitor',col:'#4ade80', lbl:'Monitoring'},
  {k:'bridge', col:'#e879f9', lbl:'Bridge'},
];

// ── dati TEKTELIC ────────────────────────────────────────────
const TEKTELIC_NODES = [
  {id:'hub_t', label:'TEKTELIC', type:'hub', r:40, col:'tektelic', icon:'📡',
   info:{titolo:'TEKTELIC – LPWAN IoT', sottotitolo:'End-to-end LoRaWAN® solutions',
     note:'Gateway carrier-grade, sensori, Network Server, applicazioni.'}},
  {id:'t_gw',  label:'Gateway\nKONA', type:'cat', r:25, col:'tgw',    icon:'📶',
   info:{titolo:'KONA Gateway Family', note:'Mega, Macro, Enterprise, Micro, Photon.'}},
  {id:'t_cit', label:'Smart City',  type:'cat', r:24, col:'tcity',  icon:'🏙️',
   info:{titolo:'Smart City Sensors', note:'COMFORT, VIVID, BREEZE, TUNDRA, MEMO, TEMPO.'}},
  {id:'t_trk', label:'Asset\nTracker',type:'cat',r:24, col:'ttrack', icon:'📍',
   info:{titolo:'Asset Trackers', note:'ORCA, SEAL, SPARROW, CHICKADEE, PELICAN, STORK.'}},
  {id:'t_hlt', label:'eHealth',     type:'cat', r:22, col:'thealth', icon:'❤️',
   info:{titolo:'eHealth', note:'eDoctor, eBeat.'}},
  {id:'t_agr', label:'Agricoltura', type:'cat', r:22, col:'tagri',  icon:'🌱',
   info:{titolo:'Smart Agriculture', note:'KIWI & CLOVER.'}},
  {id:'t_srv', label:'Server & App',type:'cat', r:24, col:'tsrv',   icon:'☁️',
   info:{titolo:'Server & App', note:'KONA Core NS, OA&M, App Server, Geolocation, LOCUS.'}},
  {id:'t_saf', label:'Safety',      type:'cat', r:21, col:'tsafety', icon:'🛡️',
   info:{titolo:'Safety', note:'ROBIN, FINCH.'}},
];
const TEKTELIC_LINKS = [
  {s:'hub_t',t:'t_gw'},{s:'hub_t',t:'t_cit'},{s:'hub_t',t:'t_trk'},
  {s:'hub_t',t:'t_hlt'},{s:'hub_t',t:'t_agr'},{s:'hub_t',t:'t_srv'},{s:'hub_t',t:'t_saf'},
];
const TEKTELIC_LEG = [
  {k:'tgw',    col:'#22d3ee', lbl:'Gateway KONA'},
  {k:'tcity',  col:'#818cf8', lbl:'Smart City'},
  {k:'ttrack', col:'#f97316', lbl:'Asset Tracker'},
  {k:'thealth',col:'#fb7185', lbl:'eHealth'},
  {k:'tagri',  col:'#a3e635', lbl:'Agricoltura'},
  {k:'tsrv',   col:'#60a5fa', lbl:'Server & App'},
  {k:'tsafety',col:'#fbbf24', lbl:'Safety'},
];

// ── matrice protocolli (Coster) ──────────────────────────────
const GW_PROTOCOLS = [
  {id:'modbus_rtu', label:'Modbus RTU',   col:'#fb923c'},
  {id:'modbus_tcp', label:'Modbus TCP',   col:'#fbbf24'},
  {id:'bacnet_mstp',label:'BACnet MS/TP', col:'#34d399'},
  {id:'bacnet_ip',  label:'BACnet IP',    col:'#6ee7b7'},
  {id:'lorawan',    label:'LoRaWAN',      col:'#22d3ee'},
  {id:'m_bus',      label:'M-Bus',        col:'#4ade80'},
  {id:'rs485',      label:'RS-485',       col:'#94a3b8'},
  {id:'mqtt',       label:'MQTT/TLS',     col:'#60a5fa'},
  {id:'gps',        label:'GPS/GNSS',     col:'#a3e635'},
  {id:'ble',        label:'BLE',          col:'#f472b6'},
  {id:'fourg',      label:'4G/3G',        col:'#38bdf8'},
  {id:'wifi',       label:'Wi-Fi',        col:'#818cf8'},
];

const COSTER_MROWS = [
  {grp:'BRIDGE — Integrazione'},
  {brand:'bridge',cat:'blorawan',col:'blorawan',name:'LoRaWAN ↔ BACnet/Modbus',sub:'KONA GW → EHC 602',
   p:{modbus_rtu:0,modbus_tcp:1,bacnet_mstp:0,bacnet_ip:1,lorawan:1,m_bus:0,rs485:0,mqtt:1,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'Bridge LoRaWAN ↔ BACnet/Modbus',prezzo:'—',protocolli:['LoRaWAN','Modbus TCP','BACnet IP','MQTT']}},
  {brand:'bridge',cat:'bbms',col:'bbms',name:'API / BMS Integration',sub:'Webgarage ↔ TEKTELIC App',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:0,m_bus:0,rs485:0,mqtt:1,gps:0,ble:0,fourg:0,wifi:1},
   info:{titolo:'Bridge API/BMS',prezzo:'—',protocolli:['MQTT TLS','REST API','OAuth2']}},
  {grp:'COSTER — Edge Device'},
  {brand:'coster',cat:'ehc',col:'ehc',name:'EHC 602',sub:'Edge Device Multiprotocollo',
   p:{modbus_rtu:1,modbus_tcp:1,bacnet_mstp:1,bacnet_ip:1,lorawan:0,m_bus:1,rs485:1,mqtt:0.5,gps:0,ble:0,fourg:0,wifi:1},
   info:{titolo:'EHC 602',prezzo:'Su richiesta',protocolli:['BACnet MS/TP','BACnet IP','Modbus RTU','Modbus TCP','M-Bus','C-Bus'],porte:'2×RS485·1×M-Bus·2×Ethernet',alimentazione:'12Vdc/24Vac',note:'Hub centrale. Webgarage embedded ≤2000 pt.'}},
  {brand:'coster',cat:'ehc',col:'ehc',name:'YHC 700',sub:'Network-Manager Modbus/TCP',
   p:{modbus_rtu:1,modbus_tcp:1,bacnet_mstp:0,bacnet_ip:0,lorawan:0,m_bus:0,rs485:1,mqtt:0,gps:0,ble:0,fourg:0.5,wifi:0},
   info:{titolo:'YHC 700',prezzo:'Su richiesta',protocolli:['Modbus TCP','Modbus RTU'],note:'6 DIN. SIM card. Per YLC 880.'}},
  {brand:'coster',cat:'ehc',col:'ehc',name:'ZHC 602',sub:'Gateway BACnet MS/TP → IP',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:1,bacnet_ip:1,lorawan:0,m_bus:0,rs485:1,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'ZHC 602',prezzo:'Su richiesta',protocolli:['BACnet MS/TP','BACnet IP'],note:'6 DIN. Max 600 pt BACnet/linea.'}},
  {grp:'COSTER — BACnet'},
  {brand:'coster',cat:'bacnet',col:'bacnet',name:'ZBC 862',sub:'Regolatore BACnet MS/TP',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:1,bacnet_ip:0,lorawan:0,m_bus:0,rs485:1,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'ZBC 862',prezzo:'Su richiesta',protocolli:['BACnet MS/TP'],io:'8UI·2AO·6DO',note:'8 DIN. CosterCAD/Diagram.'}},
  {brand:'coster',cat:'bacnet',col:'bacnet',name:'MFD 438',sub:'Analizzatore rete BACnet',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:1,bacnet_ip:0,lorawan:0,m_bus:0,rs485:1,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'MFD 438',prezzo:'€460',protocolli:['BACnet MS/TP'],note:'Unico analizzatore Coster con BACnet nativo.'}},
  {grp:'COSTER — Serie Y / Modbus'},
  {brand:'coster',cat:'seriey',col:'seriey',name:'YLC 880',sub:'Regolatore Multi-Configurabile',
   p:{modbus_rtu:1,modbus_tcp:1,bacnet_mstp:0,bacnet_ip:0,lorawan:0,m_bus:0,rs485:1,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'YLC 880',prezzo:'Su richiesta',protocolli:['Modbus RTU','Modbus TCP'],note:'32 misure, 32 scheduler.'}},
  {brand:'coster',cat:'seriey',col:'seriey',name:'GPC 642',sub:'Compatto con 4G integrato',
   p:{modbus_rtu:1,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:0,m_bus:1,rs485:1,mqtt:0,gps:0,ble:0,fourg:1,wifi:0},
   info:{titolo:'GPC 642',prezzo:'Su richiesta',protocolli:['Modbus RTU','M-Bus'],io:'6UI·4DO·1AO',note:'4G integrato.'}},
  {grp:'COSTER — Radio 868 MHz'},
  {brand:'coster',cat:'radio',col:'radio',name:'CSW 868',sub:'Concentratore Sonde Radio',
   p:{modbus_rtu:1,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:0,m_bus:0,rs485:1,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'CSW 868',prezzo:'€470',protocolli:['Radio 868 MHz','RS-485'],note:'≤40 device.'}},
  {brand:'coster',cat:'radio',col:'radio',name:'BRG 868 / 868C',sub:'Bridge wireless',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:0,m_bus:0,rs485:1,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'BRG 868',prezzo:'€580',protocolli:['Radio 868 MHz','RS-485'],note:'≤7 BRG (BA) / ≤16 (Monitor).'}},
  {grp:'COSTER — Supervisione'},
  {brand:'coster',cat:'sup',col:'sup',name:'RUT 302',sub:'Router 4G',
   p:{modbus_rtu:1,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:0,m_bus:0,rs485:1,mqtt:0,gps:0,ble:0,fourg:1,wifi:0},
   info:{titolo:'RUT 302',prezzo:'€530',protocolli:['4G LTE','RS-485'],note:'C-Bus + Modbus simultaneo.'}},
  {brand:'coster',cat:'sup',col:'sup',name:'Webgarage BMS',sub:'Licenze CWS €970–€15.120',
   p:{modbus_rtu:0.5,modbus_tcp:0.5,bacnet_mstp:0.5,bacnet_ip:0.5,lorawan:0.5,m_bus:0.5,rs485:0,mqtt:0.5,gps:0,ble:0,fourg:0,wifi:1},
   info:{titolo:'Webgarage BMS',prezzo:'€970–€15.120',note:'100pt €970 → 10K €15.120.'}},
  {grp:'COSTER — Espansione I/O'},
  {brand:'coster',cat:'esp',col:'esp',name:'EST 482',sub:'8 Ingressi Universali',
   p:{modbus_rtu:1,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:0,m_bus:0,rs485:1,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'EST 482',prezzo:'Su richiesta',protocolli:['Modbus RTU'],io:'8 UI'}},
  {brand:'coster',cat:'esp',col:'esp',name:'ESU 402',sub:'4 Uscite Analogiche 0-10V',
   p:{modbus_rtu:1,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:0,m_bus:0,rs485:1,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'ESU 402',prezzo:'Su richiesta',protocolli:['Modbus RTU'],io:'4 AO 0-10Vdc'}},
  {grp:'COSTER — Monitoring'},
  {brand:'coster',cat:'monitor',col:'monitor',name:'MFD 448 / 548',sub:'Analizzatore elettrico',
   p:{modbus_rtu:1,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:0,m_bus:0,rs485:1,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'MFD 448/548',prezzo:'€610/€640',protocolli:['Modbus RTU'],note:'Mono/trifase. MFD 548 MID.'}},
  {brand:'coster',cat:'monitor',col:'monitor',name:'MHF / MHN',sub:'Contatori calore',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:0,m_bus:1,rs485:0,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'MHF/MHN',prezzo:'da €342',protocolli:['M-Bus'],note:'MID cert. Classe 3.'}},
  {brand:'coster',cat:'monitor',col:'monitor',name:'CMC 422 / 428',sub:'Converter M-Bus → Modbus',
   p:{modbus_rtu:1,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:0,m_bus:1,rs485:1,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'CMC 422/428',prezzo:'€480',protocolli:['M-Bus','Modbus RTU'],note:'≤5 device M-Bus.'}},
];

const TEKTELIC_MROWS = [
  {grp:'TEKTELIC — Gateway KONA'},
  {brand:'tektelic',cat:'tgw',col:'tgw',name:'KONA Mega',sub:'72Rx/8Tx · Full Duplex · IP67',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:1,ble:0,fourg:1,wifi:0},
   info:{titolo:'KONA Mega',prezzo:'Su richiesta',protocolli:['LoRaWAN','GPS TDoA'],note:'12M msg/day. -40/+60°C.'}},
  {brand:'tektelic',cat:'tgw',col:'tgw',name:'KONA Macro',sub:'16Rx/2Tx · Outdoor · IP67',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:1,ble:0,fourg:1,wifi:0},
   info:{titolo:'KONA Macro',prezzo:'Su richiesta',protocolli:['LoRaWAN'],note:'Cavity Filter. Geolocation opt.'}},
  {brand:'tektelic',cat:'tgw',col:'tgw',name:'KONA Enterprise',sub:'8Rx/1Tx · PoE · IP67',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:1,ble:0,fourg:1,wifi:0},
   info:{titolo:'KONA Enterprise',prezzo:'Su richiesta',protocolli:['LoRaWAN'],note:'Plug&play.'}},
  {brand:'tektelic',cat:'tgw',col:'tgw',name:'KONA Micro',sub:'8Rx/1Tx · Indoor · Battery',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:0,ble:0,fourg:1,wifi:0},
   info:{titolo:'KONA Micro',prezzo:'Su richiesta',protocolli:['LoRaWAN'],note:'Battery backup 4-6h.'}},
  {brand:'tektelic',cat:'tgw',col:'tgw',name:'KONA Photon',sub:'Solar · 100h Battery · IP67',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:1,ble:0,fourg:1,wifi:0},
   info:{titolo:'KONA Photon',prezzo:'Su richiesta',protocolli:['LoRaWAN','3G/4G'],note:'Solare. IP67. -30/+65°C.'}},
  {grp:'TEKTELIC — Smart City & Building'},
  {brand:'tektelic',cat:'tcity',col:'tcity',name:'COMFORT & VIVID',sub:'T·UR·Motion·Leak·Shock',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'COMFORT & VIVID',prezzo:'Su richiesta',protocolli:['LoRaWAN'],note:'T, UR, luce, motion, shock, leak.'}},
  {brand:'tektelic',cat:'tcity',col:'tcity',name:'BREEZE & BREEZE-V',sub:'CO₂·T·UR·Pressione·Luce',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'BREEZE',prezzo:'Su richiesta',protocolli:['LoRaWAN'],note:'BREEZE-V aggiunge PIR.'}},
  {brand:'tektelic',cat:'tcity',col:'tcity',name:'TUNDRA',sub:'Cold chain -40/+85°C · 15yr',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'TUNDRA',prezzo:'Su richiesta',protocolli:['LoRaWAN'],note:'Cold chain. 125 giorni stored.'}},
  {brand:'tektelic',cat:'tcity',col:'tcity',name:'MEMO Display',sub:'E-Ink 1072×720 · 12mo batt.',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'MEMO Display',prezzo:'Su richiesta',protocolli:['LoRaWAN'],note:'4 schermi, multilingual.'}},
  {grp:'TEKTELIC — Asset & People Tracker'},
  {brand:'tektelic',cat:'ttrack',col:'ttrack',name:'ORCA',sub:'GPS·BLE·5yr·IP67 Industrial',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:1,ble:1,fourg:0,wifi:0},
   info:{titolo:'ORCA',prezzo:'Su richiesta',protocolli:['LoRaWAN','GPS','BLE'],note:'-40/+85°C. Accelerometro.'}},
  {brand:'tektelic',cat:'ttrack',col:'ttrack',name:'SEAL & SEAL Ex',sub:'Wearable GPS·ATEX opt.',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:1,ble:1,fourg:0,wifi:0},
   info:{titolo:'SEAL & SEAL Ex',prezzo:'Su richiesta',protocolli:['LoRaWAN','GPS','BLE'],note:'Fall detection. SEAL Ex: ATEX.'}},
  {brand:'tektelic',cat:'ttrack',col:'ttrack',name:'SPARROW',sub:'Enterprise 5yr/16mo beacon',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:0,ble:1,fourg:0,wifi:0},
   info:{titolo:'SPARROW',prezzo:'Su richiesta',protocolli:['LoRaWAN','BLE'],note:'Ospedali. Pattern movement.'}},
  {brand:'tektelic',cat:'ttrack',col:'ttrack',name:'CHICKADEE',sub:'Badge GPS+BLE+Wi-Fi',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:1,ble:1,fourg:0,wifi:1},
   info:{titolo:'CHICKADEE',prezzo:'Su richiesta',protocolli:['LoRaWAN','BLE','Wi-Fi','GNSS'],note:'Indoor: BLE+WiFi.'}},
  {grp:'TEKTELIC — eHealth'},
  {brand:'tektelic',cat:'thealth',col:'thealth',name:'eDoctor',sub:'Respiratory·T·FC·SPO₂',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'eDoctor',prezzo:'Su richiesta',protocolli:['LoRaWAN'],note:'3 mesi batteria.'}},
  {brand:'tektelic',cat:'thealth',col:'thealth',name:'eBeat Arm Band',sub:'T·FC·SPO₂·4mo',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'eBeat',prezzo:'Su richiesta',protocolli:['LoRaWAN'],note:'Pazienti/anziani.'}},
  {grp:'TEKTELIC — Smart Agriculture'},
  {brand:'tektelic',cat:'tagri',col:'tagri',name:'KIWI',sub:'Post/Vine mount · IP67 · 10yr',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'KIWI',prezzo:'Su richiesta',protocolli:['LoRaWAN'],note:'T/UR, luce, orientation.'}},
  {brand:'tektelic',cat:'tagri',col:'tagri',name:'CLOVER',sub:'Soil Surface · IP67 · 10yr',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:0,ble:0,fourg:0,wifi:0},
   info:{titolo:'CLOVER',prezzo:'Su richiesta',protocolli:['LoRaWAN'],note:'Soil moisture+T.'}},
  {grp:'TEKTELIC — Server & Applications'},
  {brand:'tektelic',cat:'tsrv',col:'tsrv',name:'KONA Core NS',sub:'>five 9s · LoRaWAN 1.0/1.1',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:1,gps:0,ble:0,fourg:0,wifi:1},
   info:{titolo:'KONA Core NS',prezzo:'Su richiesta',protocolli:['LoRaWAN NS','MQTT TLS','REST API'],note:'Geolocation. 3rd party GW.'}},
  {brand:'tektelic',cat:'tsrv',col:'tsrv',name:'TEKTELIC App Server',sub:'Dashboard · rule engine',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:0,m_bus:0,rs485:0,mqtt:1,gps:0,ble:0,fourg:0,wifi:1},
   info:{titolo:'App Server',prezzo:'Su richiesta',protocolli:['MQTT','REST','TLS'],note:'Custom widgets. Rule engine.'}},
  {brand:'tektelic',cat:'tsrv',col:'tsrv',name:'LOCUS RTLS',sub:'Real-time Location Services',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:1,ble:1,fourg:0,wifi:0},
   info:{titolo:'TEKTELIC LOCUS',prezzo:'Su richiesta',protocolli:['LoRaWAN','BLE','GPS'],note:'Floor plan/map.'}},
  {grp:'TEKTELIC — Safety'},
  {brand:'tektelic',cat:'tsafety',col:'tsafety',name:'ROBIN',sub:'Outdoor Panic Button · 15yr',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:0,ble:1,fourg:0,wifi:0},
   info:{titolo:'ROBIN',prezzo:'Su richiesta',protocolli:['LoRaWAN','BLE'],note:'SOS. Lone worker.'}},
  {brand:'tektelic',cat:'tsafety',col:'tsafety',name:'FINCH',sub:'Indoor Panic Button · 5yr',
   p:{modbus_rtu:0,modbus_tcp:0,bacnet_mstp:0,bacnet_ip:0,lorawan:1,m_bus:0,rs485:0,mqtt:0,gps:0,ble:1,fourg:0,wifi:0},
   info:{titolo:'FINCH',prezzo:'Su richiesta',protocolli:['LoRaWAN','BLE'],note:'Senior care, hospitality.'}},
];

// ── HTML ────────────────────────────────────────────────────

function costerBodyHTML(id) { return _galaxyHTML(id, 'COSTER.', COSTER_LEG); }
function tektelicBodyHTML(id) { return _galaxyHTML(id, 'TEKTELIC.', TEKTELIC_LEG); }

function _galaxyHTML(id, title, legend) {
  const legItems = legend.map(l =>
    `<div class="gw-li" data-k="${l.k}" id="gwleg-${l.k}-${id}">
       <div class="gw-li-dot" style="background:${l.col}"></div>
       <span>${l.lbl}</span>
     </div>`
  ).join('');

  return `
    <div class="gw-wrap" id="gwwrap${id}">
      <div class="gw-topbar">
        <div class="gw-title">${title}</div>
        <div class="gw-tabs" id="gwtabs${id}">
          <button class="gw-tab active" data-t="galaxy">⬡ Galaxy</button>
          <button class="gw-tab" data-t="matrix">▦ Matrix</button>
        </div>
        <div class="gw-hint" id="gwhint${id}">clicca nodo · trascina · scroll zoom</div>
      </div>
      <div class="gw-body">
        <div class="gw-galaxy" id="gwgal${id}">
          <svg class="gw-svg" id="gwsvg${id}"></svg>
          <div class="gw-legend" id="gwlegend${id}">${legItems}</div>
          <div class="gw-popup" id="gwpop${id}">
            <button class="gw-popup-x" id="gwpopx${id}">✕</button>
            <div class="gw-popup-body" id="gwpopbody${id}"></div>
          </div>
        </div>
        <div class="gw-matrix" id="gwmat${id}" style="display:none">
          <div class="gw-proto-pills" id="gwpills${id}"></div>
          <div class="gw-mx-scroll">
            <table class="gw-mxt">
              <thead><tr id="gwmxthead${id}"></tr></thead>
              <tbody id="gwmxtbody${id}"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Init ────────────────────────────────────────────────────

function initCoster(id) {
  _initGalaxy(id, COSTER_NODES, COSTER_LINKS, COSTER_LEG, COSTER_MROWS);
}

function initTektelic(id) {
  _initGalaxy(id, TEKTELIC_NODES, TEKTELIC_LINKS, TEKTELIC_LEG, TEKTELIC_MROWS);
}

function _initGalaxy(id, nodes, links, legend, mrows) {
  if (!window.d3) { console.warn('[galaxy] D3 non caricato'); return; }

  const w = WINS[id];
  if (!w) return;

  // stato filtri per questa istanza
  const hidden = new Set();

  // tab switch
  const tabsEl = document.getElementById('gwtabs' + id);
  const galEl  = document.getElementById('gwgal' + id);
  const matEl  = document.getElementById('gwmat' + id);
  const hintEl = document.getElementById('gwhint' + id);

  tabsEl?.addEventListener('click', e => {
    const t = e.target.dataset?.t;
    if (!t) return;
    tabsEl.querySelectorAll('.gw-tab').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    if (t === 'galaxy') {
      galEl.style.display = '';
      matEl.style.display = 'none';
      if (hintEl) hintEl.textContent = 'clicca nodo · trascina · scroll zoom';
    } else {
      galEl.style.display = 'none';
      matEl.style.display = '';
      if (hintEl) hintEl.textContent = 'clicca colonna per ordinare · ● nativo · ◑ bridge';
      _buildMatrix(id, mrows);
    }
    _closePopup(id);
  });

  // legend toggle
  const legEl = document.getElementById('gwlegend' + id);
  legEl?.addEventListener('click', e => {
    const li = e.target.closest('.gw-li');
    if (!li) return;
    const k = li.dataset.k;
    if (hidden.has(k)) { hidden.delete(k); li.classList.remove('off'); }
    else               { hidden.add(k);    li.classList.add('off'); }
    _applyFilter(id, hidden);
  });

  // popup close
  document.getElementById('gwpopx' + id)?.addEventListener('click', () => _closePopup(id));
  document.getElementById('gwsvg' + id)?.addEventListener('click', () => _closePopup(id));

  // build galaxy
  _buildGalaxy(id, nodes, links, hidden);

  // store dispose
  w._galaxyDispose = () => {
    const svg = document.getElementById('gwsvg' + id);
    if (svg) d3.select(svg).selectAll('*').remove();
  };
}

// ── D3 galaxy render ────────────────────────────────────────

function _buildGalaxy(id, nodesDef, linksDef, hidden) {
  const container = document.getElementById('gwgal' + id);
  const svgEl = document.getElementById('gwsvg' + id);
  if (!container || !svgEl || !window.d3) return;

  const W = container.offsetWidth  || 600;
  const H = container.offsetHeight || 400;

  const svg = d3.select(svgEl).attr('viewBox', `0 0 ${W} ${H}`);
  svg.selectAll('*').remove();

  const defs = svg.append('defs');
  // hub gradient
  const hg = defs.append('radialGradient').attr('id', 'gwHubGrad' + id);
  hg.append('stop').attr('offset','0%').attr('stop-color','#fff').attr('stop-opacity',.15);
  hg.append('stop').attr('offset','100%').attr('stop-color','#fff').attr('stop-opacity',.02);

  const gMain = svg.append('g');
  const zoom = d3.zoom().scaleExtent([.1, 5])
    .on('zoom', e => gMain.attr('transform', e.transform));
  svg.call(zoom);
  svg.on('click', () => _closePopup(id));

  const ns = nodesDef.map(n => ({ ...n, x: W/2 + (Math.random()-.5)*60, y: H/2 + (Math.random()-.5)*60 }));
  const nm = {}; ns.forEach(n => nm[n.id] = n);
  const ls = linksDef.map(l => ({ source: l.s, target: l.t, b: l.b || 0 }));

  // glow filters
  ns.forEach(n => {
    const f = defs.append('filter').attr('id', 'gwgf' + n.id + id)
      .attr('x','-60%').attr('y','-60%').attr('width','220%').attr('height','220%');
    f.append('feGaussianBlur').attr('stdDeviation','6').attr('result','b');
    const m = f.append('feMerge');
    m.append('feMergeNode').attr('in','b');
    m.append('feMergeNode').attr('in','SourceGraphic');
  });

  // links
  const LE = gMain.append('g').selectAll('line').data(ls).enter().append('line')
    .attr('class', d => 'gw-lnk' + (d.b ? ' brd' : ''))
    .attr('stroke', d => {
      if (d.b) return '#e879f9';
      const sn = nm[typeof d.source === 'object' ? d.source.id : d.source] || { col: '?' };
      return gc(sn.col);
    });

  // nodes
  const NE = gMain.append('g').selectAll('g.gw-ng').data(ns).enter().append('g')
    .attr('class', 'gw-node gw-ng')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
    )
    .on('click', (e, d) => { e.stopPropagation(); _showPopup(id, e, d, container); });

  // pulse ring
  NE.filter(d => d.type !== 'device')
    .append('circle').attr('class','gw-pr')
    .attr('r', d => d.r + 9).attr('fill','none')
    .attr('stroke', d => gc(d.col)).attr('stroke-width',1.4).attr('stroke-opacity',.14);

  // bridge dashed ring
  NE.filter(d => d.type === 'bridge')
    .append('circle').attr('r', d => d.r + 15).attr('fill','none')
    .attr('stroke', d => gc(d.col)).attr('stroke-width',1.1)
    .attr('stroke-dasharray','4 3').attr('stroke-opacity',.4);

  // main circle
  NE.append('circle').attr('class','gw-mc')
    .attr('r', d => d.r)
    .attr('fill', d => d.type === 'hub' ? `url(#gwHubGrad${id})` : gc(d.col) + '18')
    .attr('stroke', d => gc(d.col))
    .attr('stroke-width', d => d.type === 'hub' ? 3 : d.type === 'bridge' ? 2.2 : 1.8)
    .attr('filter', d => (d.type === 'hub' || d.type === 'cat' || d.type === 'bridge') ? `url(#gwgf${d.id}${id})` : 'none');

  // icon
  NE.filter(d => d.type !== 'device')
    .append('text').attr('text-anchor','middle').attr('dominant-baseline','central')
    .attr('dy', d => d.type === 'hub' ? -11 : -7)
    .attr('font-size', d => d.type === 'hub' ? '18px' : '12px')
    .text(d => d.icon);

  // label
  NE.append('text')
    .attr('class', d => `gw-nlbl${d.type === 'hub' || d.type === 'cat' || d.type === 'bridge' ? ' big' : ''}`)
    .attr('dy', d => d.type === 'hub' ? 12 : d.type === 'cat' || d.type === 'bridge' ? 8 : 4)
    .each(function(d) {
      const el = d3.select(this);
      const lines = d.label.split('\n');
      if (lines.length === 1) { el.text(lines[0]); return; }
      lines.forEach((ln, i) => el.append('tspan').attr('x',0).attr('dy', i === 0 ? 0 : '1.1em').text(ln));
    });

  const sim = d3.forceSimulation(ns)
    .force('link', d3.forceLink(ls).id(d => d.id)
      .distance(d => d.b ? 200 : (nm[typeof d.source==='object'?d.source.id:d.source]?.type === 'hub' ? 180 : 110))
      .strength(d => d.b ? .35 : .6))
    .force('charge', d3.forceManyBody().strength(d => d.type === 'hub' ? -1400 : d.type === 'bridge' ? -600 : -550))
    .force('center', d3.forceCenter(W/2, H/2))
    .force('collision', d3.forceCollide(d => d.r + 20).strength(.82))
    .on('tick', () => {
      LE.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      NE.attr('transform', d => `translate(${d.x},${d.y})`);
    });

  gMain.style('opacity', 0);
  gMain.transition().duration(300).style('opacity', 1);
  setTimeout(() => svg.transition().duration(600).call(
    zoom.transform, d3.zoomIdentity.translate(W*(1-.82)/2, H*(1-.82)/2).scale(.82)
  ), 400);

  _applyFilter(id, hidden);

  // resize
  const ro = new ResizeObserver(() => {
    if (!WINS[id]) return;
    const nW = container.offsetWidth, nH = container.offsetHeight;
    if (!nW || !nH) return;
    svg.attr('viewBox', `0 0 ${nW} ${nH}`);
    sim.force('center', d3.forceCenter(nW/2, nH/2)).alpha(.1).restart();
  });
  ro.observe(container);
  if (WINS[id]) WINS[id]._galaxyRO = ro;
}

// ── Popup ────────────────────────────────────────────────────

function _showPopup(id, event, d, container) {
  const pop     = document.getElementById('gwpop' + id);
  const bodyEl  = document.getElementById('gwpopbody' + id);
  if (!pop || !bodyEl) return;

  const col  = gc(d.col);
  const info = d.info || {};

  let html = `<div class="gw-ph">
    <div class="gw-ph-ico" style="background:${col}20;border:1.5px solid ${col}40">${d.icon || '📦'}</div>
    <div>
      <div class="gw-ph-t" style="color:${col}">${info.titolo || d.label || ''}</div>
      ${info.sottotitolo ? `<div class="gw-ph-s">${info.sottotitolo}</div>` : ''}
    </div>
  </div>`;

  if (info.prezzo && info.prezzo !== '—') {
    const onReq = info.prezzo.includes('richiesta');
    html += `<div class="gw-price" style="border-color:${col}30">
      <span class="gw-price-lbl">Prezzo</span>
      <span style="color:${onReq ? 'var(--dim)' : col}">${info.prezzo}</span>
    </div>`;
  }
  if (info.protocolli?.length) {
    html += `<div class="gw-sec-lbl">Protocolli</div><div class="gw-tags">`;
    info.protocolli.forEach(p => html += `<span class="gw-tag" style="background:${col}1a;border:1px solid ${col}35;color:${col}">${p}</span>`);
    html += `</div>`;
  }
  const rows = [];
  if (info.porte)        rows.push(['Porte', info.porte]);
  if (info.io)           rows.push(['I/O',   info.io]);
  if (info.alimentazione)rows.push(['Alim.', info.alimentazione]);
  if (rows.length) {
    html += `<div class="gw-divider"></div><div class="gw-rows">`;
    rows.forEach(([k,v]) => html += `<div class="gw-row"><span class="gw-rk">${k}</span><span class="gw-rv">${v}</span></div>`);
    html += `</div>`;
  }
  if (info.note) html += `<div class="gw-note" style="border-color:${col}80">${info.note.replace(/\n/g,'<br>')}</div>`;

  bodyEl.innerHTML = html;

  // posiziona relativo al container
  const cRect = container.getBoundingClientRect();
  const pw = 300, ph = 340, m = 12;
  let px = event.clientX - cRect.left + 14;
  let py = event.clientY - cRect.top  - 20;
  if (px + pw > cRect.width  - m) px = event.clientX - cRect.left - pw - 14;
  if (py + ph > cRect.height - m) py = cRect.height - ph - m;
  if (py < 0) py = 0;
  pop.style.left = px + 'px';
  pop.style.top  = py + 'px';
  pop.style.display = 'block';
}

function _closePopup(id) {
  const pop = document.getElementById('gwpop' + id);
  if (pop) pop.style.display = 'none';
}

// ── Filter ──────────────────────────────────────────────────

function _applyFilter(id, hidden) {
  const svgEl = document.getElementById('gwsvg' + id);
  if (!svgEl || !window.d3) return;
  const svg = d3.select(svgEl);
  svg.selectAll('g.gw-ng').each(function(d) {
    const off = hidden.has(d.col) || (d.type === 'bridge' && hidden.has('bridge'));
    d3.select(this).classed('off', off);
  });
  svg.selectAll('line.gw-lnk').each(function(d) {
    const sn = typeof d.source === 'object' ? d.source : { col: '?' };
    const tn = typeof d.target === 'object' ? d.target : { col: '?' };
    const off = hidden.has(sn.col) || hidden.has(tn.col);
    d3.select(this).classed('off', off);
  });
}

// ── Matrix ──────────────────────────────────────────────────

function _buildMatrix(id, mrows) {
  const pillsEl   = document.getElementById('gwpills' + id);
  const theadEl   = document.getElementById('gwmxthead' + id);
  const tbodyEl   = document.getElementById('gwmxtbody' + id);
  if (!pillsEl || !theadEl || !tbodyEl) return;
  if (tbodyEl.dataset.built === '1') return; // already built
  tbodyEl.dataset.built = '1';

  const activeProtos = new Set(GW_PROTOCOLS.map(p => p.id));

  // pills
  pillsEl.innerHTML = '';
  GW_PROTOCOLS.forEach(pr => {
    const btn = document.createElement('button');
    btn.className = 'gw-pill on';
    btn.textContent = pr.label;
    btn.style.borderColor = pr.col + '55';
    btn.style.color = pr.col;
    btn.addEventListener('click', () => {
      if (activeProtos.has(pr.id)) { activeProtos.delete(pr.id); btn.classList.remove('on'); btn.style.color = ''; }
      else                          { activeProtos.add(pr.id);    btn.classList.add('on');    btn.style.color = pr.col; }
      document.querySelectorAll(`#gwpills${id} ~ * [data-pid="${pr.id}"]`)
        .forEach(el => el.classList.toggle('gw-pcol-hidden', !activeProtos.has(pr.id)));
      // also update thead/tbody columns
      tbodyEl.parentElement.querySelectorAll(`[data-pid="${pr.id}"]`)
        .forEach(el => el.classList.toggle('gw-pcol-hidden', !activeProtos.has(pr.id)));
    });
    pillsEl.appendChild(btn);
  });

  // thead
  theadEl.innerHTML = '';
  const th0 = document.createElement('th'); th0.className = 'gw-s0'; th0.textContent = 'Brand'; theadEl.appendChild(th0);
  const th1 = document.createElement('th'); th1.className = 'gw-s1'; th1.textContent = 'Prodotto'; theadEl.appendChild(th1);
  GW_PROTOCOLS.forEach(pr => {
    const th = document.createElement('th');
    th.className = 'gw-pcol'; th.dataset.pid = pr.id; th.style.color = pr.col;
    th.textContent = pr.label; theadEl.appendChild(th);
  });

  // tbody
  tbodyEl.innerHTML = '';
  mrows.forEach(row => {
    if (row.grp !== undefined) {
      const tr = document.createElement('tr'); tr.className = 'gw-grp-row';
      tr.innerHTML = `<td class="gw-s0"></td><td class="gw-s1" colspan="${1 + GW_PROTOCOLS.length}">${row.grp}</td>`;
      tbodyEl.appendChild(tr); return;
    }
    const col = gc(row.col);
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', () => {
      const pop = document.getElementById('gwpop' + id);
      if (pop) {
        const bodyEl = document.getElementById('gwpopbody' + id);
        const info = row.info || {};
        let html = `<div class="gw-ph">
          <div class="gw-ph-ico" style="background:${col}20;border:1.5px solid ${col}40">📦</div>
          <div><div class="gw-ph-t" style="color:${col}">${info.titolo || row.name}</div>
          <div class="gw-ph-s">${row.sub || ''}</div></div></div>`;
        if (info.prezzo) {
          const onReq = info.prezzo.includes('richiesta');
          html += `<div class="gw-price" style="border-color:${col}30">
            <span class="gw-price-lbl">Prezzo</span>
            <span style="color:${onReq?'var(--dim)':col}">${info.prezzo}</span></div>`;
        }
        if (info.protocolli?.length) {
          html += `<div class="gw-sec-lbl">Protocolli</div><div class="gw-tags">`;
          info.protocolli.forEach(p => html += `<span class="gw-tag" style="background:${col}1a;border:1px solid ${col}35;color:${col}">${p}</span>`);
          html += `</div>`;
        }
        const rows2 = [];
        if (info.porte) rows2.push(['Porte', info.porte]);
        if (info.io)    rows2.push(['I/O', info.io]);
        if (rows2.length) {
          html += `<div class="gw-divider"></div><div class="gw-rows">`;
          rows2.forEach(([k,v]) => html += `<div class="gw-row"><span class="gw-rk">${k}</span><span class="gw-rv">${v}</span></div>`);
          html += `</div>`;
        }
        if (info.note) html += `<div class="gw-note" style="border-color:${col}80">${info.note}</div>`;
        bodyEl.innerHTML = html;
        pop.style.left = '12px'; pop.style.top = '60px';
        pop.style.display = 'block';
      }
    });
    const tdB = document.createElement('td'); tdB.className = 'gw-s0';
    tdB.innerHTML = `<span class="gw-brand ${row.brand}">${row.brand === 'bridge' ? 'Bridge' : row.brand === 'coster' ? 'Coster' : 'TEKTELIC'}</span>`;
    tr.appendChild(tdB);
    const tdP = document.createElement('td'); tdP.className = 'gw-s1';
    tdP.innerHTML = `<div class="gw-pname">${row.name}</div>
      <div class="gw-psub"><div class="gw-psub-dot" style="background:${col}"></div>${row.sub}</div>`;
    tr.appendChild(tdP);
    GW_PROTOCOLS.forEach(pr => {
      const td = document.createElement('td'); td.className = 'gw-pcell'; td.dataset.pid = pr.id;
      const v = row.p?.[pr.id] || 0;
      if (v === 1)   td.innerHTML = `<span class="gw-cell-yes" style="background:${pr.col}22;color:${pr.col}">●</span>`;
      else if (v === .5) td.innerHTML = `<span class="gw-cell-partial" style="color:${pr.col}">◑</span>`;
      else           td.innerHTML = `<span class="gw-cell-no">—</span>`;
      tr.appendChild(td);
    });
    tbodyEl.appendChild(tr);
  });
}
