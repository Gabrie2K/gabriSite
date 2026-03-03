'use strict';
/* ═══════════════════════════════════════════════════════════
   TEMPLATES — dati dei grafi costellazione
   Ogni template ha:
     color  : colore Three.js (hex)
     nodes  : array di nodi
       id     : identificatore unico
       label  : testo visualizzato nella scena 3D
       main   : true = nodo centrale (uno solo per template)
       attrs  : array { name, s:'have'|'want' }
       note   : stringa testo libero
   ═══════════════════════════════════════════════════════════ */

const TPL = {
  Computer: {
    color: 0x63b3ff,
    nodes: [
      {
        id: 'pc', label: 'Computer', main: true,
        attrs: [
          { name: 'Architettura x86', s: 'have' },
          { name: 'Storia CPU',       s: 'want' },
        ],
        note: '',
      },
      {
        id: 'cpu', label: 'CPU', main: false,
        attrs: [
          { name: 'Cicli di clock', s: 'have' },
          { name: 'Pipeline',       s: 'want' },
          { name: 'Cache L1/L2',    s: 'want' },
        ],
        note: '',
      },
      {
        id: 'ram', label: 'RAM', main: false,
        attrs: [
          { name: 'DDR5 16GB',     s: 'have' },
          { name: 'Dual channel',  s: 'have' },
          { name: 'XMP Profile',   s: 'want' },
        ],
        note: '',
      },
      {
        id: 'gpu', label: 'GPU', main: false,
        attrs: [
          { name: 'VRAM 8GB',    s: 'have' },
          { name: 'CUDA cores',  s: 'want' },
        ],
        note: '',
      },
      {
        id: 'ssd', label: 'Storage', main: false,
        attrs: [
          { name: 'SSD NVMe 1TB', s: 'have' },
          { name: 'RAID',         s: 'want' },
        ],
        note: '',
      },
    ],
  },

  Server: {
    color: 0xa78bfa,
    nodes: [
      {
        id: 'srv', label: 'Server', main: true,
        attrs: [
          { name: 'Uptime 99.9%',    s: 'want' },
          { name: 'Load balancing',  s: 'want' },
        ],
        note: '',
      },
      {
        id: 'nginx', label: 'Nginx', main: false,
        attrs: [
          { name: 'Config base', s: 'want' },
          { name: 'SSL/TLS',     s: 'want' },
        ],
        note: '',
      },
      {
        id: 'db', label: 'Database', main: false,
        attrs: [
          { name: 'PostgreSQL', s: 'want' },
          { name: 'Indici',     s: 'want' },
        ],
        note: '',
      },
      {
        id: 'docker', label: 'Docker', main: false,
        attrs: [
          { name: 'Container base', s: 'want' },
          { name: 'Compose',        s: 'want' },
        ],
        note: '',
      },
    ],
  },

  Analisi1: {
    color: 0x34d399,
    nodes: [
      {
        id: 'a1', label: 'Analisi 1', main: true,
        attrs: [
          { name: 'Limiti',    s: 'want' },
          { name: 'Derivate',  s: 'have' },
          { name: 'Integrali', s: 'want' },
        ],
        note: '',
      },
      {
        id: 'lim', label: 'Limiti', main: false,
        attrs: [
          { name: 'Epsilon-delta',   s: 'want' },
          { name: 'Limiti notevoli', s: 'want' },
          { name: 'Forme indet.',    s: 'want' },
        ],
        note: '',
      },
      {
        id: 'der', label: 'Derivate', main: false,
        attrs: [
          { name: 'Regole base',       s: 'have' },
          { name: 'Derivata composta', s: 'have' },
          { name: 'Studio funzione',   s: 'want' },
        ],
        note: '',
      },
      {
        id: 'int', label: 'Integrali', main: false,
        attrs: [
          { name: 'Integrale definito', s: 'want' },
          { name: 'Per parti',          s: 'want' },
        ],
        note: '',
      },
      {
        id: 'trig', label: 'Trigonometria', main: false,
        attrs: [
          { name: 'Cerchio unitario',      s: 'want' },
          { name: 'Identità fondamentali', s: 'want' },
        ],
        note: '',
      },
    ],
  },
};
