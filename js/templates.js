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

  // ── Computer ─────────────────────────────────────────────
  Computer: {
    color: 0x63b3ff,
    nodes: [
      {
        id: 'pc', label: 'Computer', main: true,
        attrs: [
          { name: 'Architettura x86-64', s: 'have' },
          { name: 'Storia delle CPU',    s: 'want' },
        ],
        note: '',
      },
      {
        id: 'cpu', label: 'CPU', main: false,
        attrs: [
          { name: 'Cicli di clock',  s: 'have' },
          { name: 'Pipeline',        s: 'want' },
          { name: 'Cache L1/L2/L3', s: 'want' },
          { name: 'Multi-core',      s: 'have' },
        ],
        note: '',
      },
      {
        id: 'ram', label: 'RAM', main: false,
        attrs: [
          { name: 'DDR5 16 GB',    s: 'have' },
          { name: 'Dual channel',  s: 'have' },
          { name: 'XMP profile',   s: 'want' },
        ],
        note: '',
      },
      {
        id: 'gpu', label: 'GPU', main: false,
        attrs: [
          { name: 'VRAM 8 GB',     s: 'have' },
          { name: 'CUDA cores',    s: 'want' },
          { name: 'Ray tracing',   s: 'want' },
        ],
        note: '',
      },
      {
        id: 'storage', label: 'Storage', main: false,
        attrs: [
          { name: 'SSD NVMe 1 TB', s: 'have' },
          { name: 'RAID',          s: 'want' },
          { name: 'Backup policy', s: 'want' },
        ],
        note: '',
      },
      {
        id: 'net', label: 'Rete', main: false,
        attrs: [
          { name: 'Ethernet 1 Gbps', s: 'have' },
          { name: 'Wi-Fi 6',         s: 'want' },
        ],
        note: '',
      },
      {
        id: 'os', label: 'OS', main: false,
        attrs: [
          { name: 'Linux (Arch)',  s: 'have' },
          { name: 'Kernel tuning', s: 'want' },
          { name: 'Windows WSL2', s: 'have' },
        ],
        note: '',
      },
      {
        id: 'periferiche', label: 'Periferiche', main: false,
        attrs: [
          { name: 'Monitor 4K',    s: 'have' },
          { name: 'Tastiera mec.', s: 'have' },
          { name: 'Webcam HD',     s: 'want' },
        ],
        note: '',
      },
    ],
  },

  // ── Server ───────────────────────────────────────────────
  Server: {
    color: 0xa78bfa,
    nodes: [
      {
        id: 'srv', label: 'Server', main: true,
        attrs: [
          { name: 'Uptime 99.9%',   s: 'want' },
          { name: 'Load balancing', s: 'want' },
        ],
        note: '',
      },
      {
        id: 'nginx', label: 'Nginx', main: false,
        attrs: [
          { name: 'Config base',   s: 'have' },
          { name: 'SSL / TLS',     s: 'want' },
          { name: 'Rate limiting', s: 'want' },
        ],
        note: '',
      },
      {
        id: 'db', label: 'Database', main: false,
        attrs: [
          { name: 'PostgreSQL', s: 'have' },
          { name: 'Indici',     s: 'want' },
          { name: 'Replication', s: 'want' },
        ],
        note: '',
      },
      {
        id: 'docker', label: 'Docker', main: false,
        attrs: [
          { name: 'Container base', s: 'have' },
          { name: 'Compose',        s: 'have' },
          { name: 'Swarm / K8s',    s: 'want' },
        ],
        note: '',
      },
      {
        id: 'cicd', label: 'CI / CD', main: false,
        attrs: [
          { name: 'GitHub Actions', s: 'have' },
          { name: 'Pipeline test',  s: 'want' },
          { name: 'Deploy auto',    s: 'want' },
        ],
        note: '',
      },
      {
        id: 'monitoring', label: 'Monitoring', main: false,
        attrs: [
          { name: 'Grafana',    s: 'want' },
          { name: 'Prometheus', s: 'want' },
          { name: 'Alerting',   s: 'want' },
        ],
        note: '',
      },
      {
        id: 'security', label: 'Sicurezza', main: false,
        attrs: [
          { name: 'Firewall UFW', s: 'have' },
          { name: 'Fail2ban',     s: 'want' },
          { name: 'Certificati', s: 'have' },
        ],
        note: '',
      },
    ],
  },

  // ── Example ──────────────────────────────────────────────
  Example: {
    color: 0x34d399,
    nodes: [
      {
        id: 'proj', label: 'Progetto', main: true,
        attrs: [
          { name: 'Obiettivo chiaro', s: 'have' },
          { name: 'Budget definito',  s: 'want' },
        ],
        note: '',
      },
      {
        id: 'obiettivi', label: 'Obiettivi', main: false,
        attrs: [
          { name: 'OKR definiti',      s: 'want' },
          { name: 'KPI misurabili',    s: 'want' },
          { name: 'Deadline reali',    s: 'have' },
        ],
        note: '',
      },
      {
        id: 'risorse', label: 'Risorse', main: false,
        attrs: [
          { name: 'Team formato',    s: 'have' },
          { name: 'Tool scelti',     s: 'have' },
          { name: 'Budget allocato', s: 'want' },
        ],
        note: '',
      },
      {
        id: 'timeline', label: 'Timeline', main: false,
        attrs: [
          { name: 'Milestone definite', s: 'have' },
          { name: 'Buffer rischi',      s: 'want' },
          { name: 'Sprint planning',    s: 'want' },
        ],
        note: '',
      },
      {
        id: 'deliverables', label: 'Deliverable', main: false,
        attrs: [
          { name: 'MVP definito',   s: 'have' },
          { name: 'Documentazione', s: 'want' },
          { name: 'Test plan',      s: 'want' },
        ],
        note: '',
      },
      {
        id: 'rischi', label: 'Rischi', main: false,
        attrs: [
          { name: 'Analisi fatta',    s: 'have' },
          { name: 'Piano B pronto',   s: 'want' },
          { name: 'Dipendenze esterne', s: 'want' },
        ],
        note: '',
      },
      {
        id: 'comunicazione', label: 'Comunicazione', main: false,
        attrs: [
          { name: 'Stakeholder map', s: 'want' },
          { name: 'Report cadenza',  s: 'want' },
          { name: 'Canali scelti',   s: 'have' },
        ],
        note: '',
      },
    ],
  },

  // ── Note ─────────────────────────────────────────────────
  Note: {
    color: 0xfbbf24,
    nodes: [
      {
        id: 'note-hub', label: 'Note', main: true,
        attrs: [
          { name: 'Sistema in uso',  s: 'have' },
          { name: 'Review regolare', s: 'want' },
        ],
        note: '',
      },
      {
        id: 'idee', label: 'Idee', main: false,
        attrs: [
          { name: 'Catturate subito',  s: 'want' },
          { name: 'Revisionate',       s: 'want' },
        ],
        note: '',
      },
      {
        id: 'todo', label: 'To-Do', main: false,
        attrs: [
          { name: 'Priorità definita', s: 'want' },
          { name: 'Scadenze',          s: 'want' },
          { name: 'Done tracking',     s: 'have' },
        ],
        note: '',
      },
      {
        id: 'riferimenti', label: 'Riferimenti', main: false,
        attrs: [
          { name: 'Link salvati',   s: 'have' },
          { name: 'Libri / articoli', s: 'want' },
          { name: 'Fonti citate',   s: 'want' },
        ],
        note: '',
      },
      {
        id: 'bozze', label: 'Bozze', main: false,
        attrs: [
          { name: 'Prima versione', s: 'have' },
          { name: 'Revisione',      s: 'want' },
        ],
        note: '',
      },
      {
        id: 'archivio', label: 'Archivio', main: false,
        attrs: [
          { name: 'Ricercabile',  s: 'want' },
          { name: 'Taggato bene', s: 'want' },
          { name: 'Backup',       s: 'have' },
        ],
        note: '',
      },
    ],
  },

};
