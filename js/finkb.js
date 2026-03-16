'use strict';
/* ═══════════════════════════════════════════════════════════
   FIN KB — Knowledge Base FIN Framework
   Struttura cluster / categorie (integrazione massiva separata)
   ═══════════════════════════════════════════════════════════ */

// ─── Struttura dati FIN KB ────────────────────────────────

const FINKB_DATA = [
  {
    id: 'overview',
    icon: '🌐',
    label: 'Overview',
    pages: [
      { id: 'fin-intro',     title: 'Cos\'è FIN Framework',      badge: 'core',
        body: `<p>FIN Framework è una piattaforma software aperta per la gestione di edifici intelligenti (smart building), reti IoT industriali e sistemi BMS/BAS.</p><p>Sviluppato da J2 Innovations, FIN è costruito sul linguaggio Axon e sul protocollo Haystack, garantendo interoperabilità con centinaia di protocolli di campo (BACnet, Modbus, MQTT, LoRaWAN, KNX, ecc.).</p><p>FIN gira su hardware proprietario (ioTium, Coster, Tektelic) o su macchine virtuali.</p>` },
      { id: 'fin-arch',      title: 'Architettura generale',      badge: 'arch',
        body: `<p>FIN si basa su un'architettura a livelli:</p><p><strong>Layer 1 — Edge:</strong> controller fisici (Coster UCG, Tektelic Kona) raccolgono dati dai sensori e li pubblicano via MQTT/BACnet.</p><p><strong>Layer 2 — Fog:</strong> FIN Supervisor o FIN Edge aggregano i dati, eseguono la logica di controllo e gestiscono i database Haystack.</p><p><strong>Layer 3 — Cloud:</strong> FIN Connect o piattaforme terze (Azure IoT, AWS) ricevono telemetria e dashboard centralizzate.</p>` },
      { id: 'fin-haystack',  title: 'Project Haystack',           badge: 'std',
        body: `<p>Project Haystack è un framework open-source per la semantica dei dati IoT/building. Definisce tag standard per punti, dispositivi, sites e systems.</p><p>Ogni record in FIN è un "dict" con tag Haystack. I tag principali: <code>dis</code> (display name), <code>point</code>, <code>equip</code>, <code>site</code>, <code>sensor</code>, <code>cmd</code>, <code>sp</code> (set point).</p><p>FIN espone un'API REST Haystack-compliant per integrazioni esterne.</p>` },
    ]
  },
  {
    id: 'connectivity',
    icon: '🔗',
    label: 'Connettività & Protocolli',
    pages: [
      { id: 'proto-bacnet',  title: 'BACnet IP / MS-TP',          badge: 'proto',
        body: `<p>BACnet è il protocollo standard ASHRAE per building automation. FIN supporta BACnet/IP e BACnet MS-TP come client e server.</p><p>In FIN si usa il connettore <strong>BacnetExt</strong> per fare discovery automatico dei device e importare i punti nel database Haystack.</p><p>Supporta COV (Change of Value), scheduling BACnet, alarm e trend log nativi.</p>` },
      { id: 'proto-modbus',  title: 'Modbus TCP / RTU',           badge: 'proto',
        body: `<p>Modbus è il protocollo industriale più diffuso. FIN supporta Modbus TCP (Ethernet) e Modbus RTU (RS-485).</p><p>Il connettore <strong>ModbusExt</strong> permette di mappare coil, discrete input, holding register e input register come punti Haystack.</p><p>Polling configurabile per ogni punto (1s–1h). Supporto write per holding register e coil.</p>` },
      { id: 'proto-mqtt',    title: 'MQTT',                       badge: 'proto',
        body: `<p>MQTT è il protocollo IoT leggero publish/subscribe. FIN integra un broker MQTT interno e può connettersi a broker esterni (Mosquitto, AWS IoT, Azure IoT Hub).</p><p>I Coster UCG e i gateway Tektelic pubblicano telemetria LoRaWAN su topic MQTT strutturati. FIN mappa automaticamente i payload JSON su punti Haystack tramite regole di parsing.</p>` },
      { id: 'proto-lorawan', title: 'LoRaWAN',                    badge: 'proto',
        body: `<p>LoRaWAN è il protocollo LPWAN per sensori IoT a lungo raggio e basso consumo. FIN si integra con network server LoRaWAN (Chirpstack, TTN, Actility) via API HTTP o MQTT.</p><p>I gateway Tektelic Kona Macro/Micro/Enterprise servono come concentratori LoRaWAN. I pacchetti uplink vengono decodificati in FIN tramite script Axon per estrarre grandezze fisiche (temperatura, umidità, CO₂, ecc.).</p>` },
      { id: 'proto-knx',     title: 'KNX',                        badge: 'proto',
        body: `<p>KNX è lo standard europeo per building automation (illuminazione, tapparelle, HVAC). FIN supporta KNX/IP tramite il connettore <strong>KnxExt</strong>.</p><p>Supporta la lettura e scrittura di indirizzi di gruppo (Group Address). Il discovery avviene importando il file ETS del progetto KNX o tramite scansione.</p>` },
      { id: 'proto-opc',     title: 'OPC-UA',                     badge: 'proto',
        body: `<p>OPC-UA è lo standard di interoperabilità per l'automazione industriale (IEC 62541). FIN supporta OPC-UA come client tramite il connettore <strong>OpcUaExt</strong>.</p><p>Permette di navigare il namespace OPC e importare nodi come punti Haystack con mapping automatico dei tipi di dato.</p>` },
    ]
  },
  {
    id: 'applications',
    icon: '🏗️',
    label: 'Applicazioni FIN',
    pages: [
      { id: 'app-edge',      title: 'FIN Edge',                   badge: 'product',
        body: `<p>FIN Edge è la versione embedded di FIN per controller di campo. Gira su hardware come i Coster UCG o su Raspberry Pi industriali.</p><p>Funzionalità: connettività multi-protocollo, logica Axon locale, storage storico locale (fallback quando non raggiunge il supervisor), OTA update.</p><p>Limiti rispetto a FIN Supervisor: niente dashboard web avanzate, niente utenti multipli.</p>` },
      { id: 'app-supervisor', title: 'FIN Supervisor',            badge: 'product',
        body: `<p>FIN Supervisor è il livello intermedio (fog) che aggrega più device FIN Edge. Tipicamente gira su server rack o VM.</p><p>Funzionalità aggiuntive rispetto a Edge: dashboard grafiche avanzate (wigets, KPI), gestione allarmi e notifiche, scheduling centralizzato, storico a lungo termine, accesso multi-utente con ruoli.</p>` },
      { id: 'app-connect',   title: 'FIN Connect',                badge: 'product',
        body: `<p>FIN Connect è il layer cloud di FIN, pensato per aggregare decine di Supervisor in una singola piattaforma enterprise.</p><p>Offre: vista portfolio multi-sito, normalization dei tag, report energetici aggregati, API REST/GraphQL per integrazioni terze, SSO/LDAP.</p>` },
      { id: 'app-axon',      title: 'Axon — Linguaggio FIN',      badge: 'dev',
        body: `<p>Axon è il linguaggio funzionale proprietario di FIN (e Project Haystack). Sintassi ispirata a Lisp e Haskell, ottimizzata per manipolazione di stream di dati time-series.</p><p>Esempi di uso: funzioni di calcolo (media, delta, kWh → CO₂), trigger su soglie, generazione automatica di punti virtuali, integration flow con API esterne.</p><p>L'ambiente di sviluppo è il <strong>Workbench</strong> integrato in FIN.</p>` },
    ]
  },
  {
    id: 'energy',
    icon: '⚡',
    label: 'Energy & Analytics',
    pages: [
      { id: 'en-metering',   title: 'Sub-metering elettrico',     badge: 'usecase',
        body: `<p>FIN supporta la gestione di contatori elettrici (kWh, kW, PF, V, A) tramite Modbus o M-Bus. I dati vengono normalizzati in punti Haystack con tag <code>elec</code>, <code>meter</code>, <code>energy</code>.</p><p>Dashboard pre-built per consumo giornaliero/mensile, confronto periodi, baseline e anomaly detection.</p>` },
      { id: 'en-hvac',       title: 'HVAC & Comfort',             badge: 'usecase',
        body: `<p>Integrazione con UTA, fan coil, chiller, pompe di calore via BACnet o Modbus. FIN gestisce setpoint, scheduling, modalità operativa e allarmi.</p><p>Algoritmi embedded: demand-controlled ventilation (DCV), economizer control, optimal start/stop.</p>` },
      { id: 'en-kpi',        title: 'KPI & Reporting',            badge: 'analytics',
        body: `<p>FIN calcola KPI energetici in tempo reale: EUI (Energy Use Intensity), COP, PUE (datacenter), Degree Day normalizzation.</p><p>I report possono essere esportati in PDF/Excel o inviati via email schedulata. Supporto per certificazioni LEED, BREEAM, ISO 50001.</p>` },
    ]
  },
  {
    id: 'security',
    icon: '🔒',
    label: 'Sicurezza & Accessi',
    pages: [
      { id: 'sec-auth',      title: 'Autenticazione',             badge: 'security',
        body: `<p>FIN supporta autenticazione locale (username/password), LDAP/Active Directory e SAML 2.0 (SSO enterprise).</p><p>2FA via TOTP è disponibile dalla versione FIN 5.1. Le sessioni hanno timeout configurabile e log di accesso completo.</p>` },
      { id: 'sec-roles',     title: 'Ruoli & Permessi',           badge: 'security',
        body: `<p>Gerarchia di ruoli: <strong>su</strong> (superuser), <strong>admin</strong>, <strong>op</strong> (operator), <strong>view</strong>. Ogni ruolo può essere limitato a specifici siti, device o punti.</p><p>I permessi sono granulari: read, write, admin per ogni namespace Haystack.</p>` },
      { id: 'sec-tls',       title: 'TLS & Comunicazioni sicure', badge: 'security',
        body: `<p>FIN usa HTTPS/TLS 1.2+ per tutte le comunicazioni web. Il certificato può essere auto-firmato (sviluppo) o emesso da CA (produzione).</p><p>Per MQTT, supporta TLS con certificati client (mutual TLS). Per BACnet, BACnet/SC (Secure Connect) è supportato dalla versione FIN 5.2.</p>` },
    ]
  },
  {
    id: 'deployment',
    icon: '🚀',
    label: 'Deploy & Manutenzione',
    pages: [
      { id: 'dep-install',   title: 'Installazione & Setup',      badge: 'ops',
        body: `<p>FIN si installa come applicazione Java (JVM 11+). Pacchetti disponibili per Linux (deb/rpm), Windows, macOS e immagini Docker.</p><p>Configurazione iniziale tramite wizard web: network, timezone, utente admin, attivazione licenza.</p>` },
      { id: 'dep-update',    title: 'Aggiornamenti OTA',          badge: 'ops',
        body: `<p>Gli aggiornamenti FIN vengono distribuiti tramite il portale J2 Innovations o tramite un FIN Connect centrale (update server privato).</p><p>Supporto rollback: prima di ogni aggiornamento viene creato un backup automatico. È possibile fare rollback all'ultima versione stabile in caso di problemi.</p>` },
      { id: 'dep-backup',    title: 'Backup & Recovery',          badge: 'ops',
        body: `<p>FIN include un sistema di backup integrato: snapshot del database Haystack, configurazione, certificati e script Axon.</p><p>I backup possono essere schedulati (giornaliero/settimanale), salvati localmente o inviati via SFTP/S3 a storage remoto.</p>` },
      { id: 'dep-docker',    title: 'Deploy con Docker',          badge: 'ops',
        body: `<p>L'immagine Docker ufficiale FIN è disponibile su Docker Hub (j2innovations/fin). Supporta docker-compose per ambienti multi-container con PostgreSQL o TimescaleDB come storage esterno.</p><p>Variabili d'ambiente per configurare porta, timezone, licenza, path dati persistenti.</p>` },
    ]
  },
  {
    id: 'integration',
    icon: '🔌',
    label: 'Integrazioni Ecosistema',
    pages: [
      { id: 'int-coster',    title: 'Coster + FIN',               badge: 'partner',
        body: `<p>I controller Coster UCG (Universal Controller Gateway) eseguono FIN Edge natively. La gamma UCG include varianti per BACnet, Modbus, LoRaWAN e DALI.</p><p>Configurazione tramite FIN Workbench: discovery automatico dei moduli I/O Coster, binding punti hardware → Haystack, logica di controllo locale.</p>` },
      { id: 'int-tektelic',  title: 'Tektelic + FIN',             badge: 'partner',
        body: `<p>I gateway Tektelic Kona (Micro, Macro, Enterprise) supportano FIN tramite integrazione MQTT. I pacchetti LoRaWAN vengono pubblicati su topic MQTT strutturati e FIN li mappa automaticamente.</p><p>Tektelic Kona Enterprise supporta anche l'esecuzione locale di applicazioni Docker, permettendo di eseguire un'istanza FIN Edge direttamente sul gateway.</p>` },
      { id: 'int-azure',     title: 'Azure IoT Hub',              badge: 'cloud',
        body: `<p>FIN può pubblicare telemetria su Azure IoT Hub tramite MQTT o AMQP. Il connettore <strong>AzureIotExt</strong> gestisce autenticazione SAS token e routing dei messaggi.</p><p>Integrazione con Azure Digital Twins (ADT) per modelli semantici degli edifici, e con Azure Time Series Insights per analytics avanzati.</p>` },
      { id: 'int-aws',       title: 'AWS IoT Core',               badge: 'cloud',
        body: `<p>Integrazione con AWS IoT Core via MQTT con certificati X.509. FIN invia i dati Haystack come JSON su topic IoT Core, da dove possono essere routati su DynamoDB, S3, Lambda o Kinesis.</p>` },
    ]
  },
];

// ─── Body HTML ────────────────────────────────────────────

function finkbBodyHTML(id) {
  return `<div class="finkb-wrap" id="finkbwrap${id}">
    <div class="finkb-sidebar">
      <div class="finkb-search">
        <input class="finkb-search-inp" id="finkbsrch${id}" placeholder="Cerca…" type="text" autocomplete="off">
      </div>
      <div class="finkb-view-toggle">
        <button class="finkb-view-btn active" data-v="list" id="finkbbtnlist${id}">Lista</button>
        <button class="finkb-view-btn" data-v="tree" id="finkbbtntree${id}">Albero</button>
      </div>
      <div class="finkb-nav" id="finkbnav${id}"></div>
    </div>
    <div class="finkb-content">
      <div class="finkb-breadcrumb" id="finkbbc${id}">
        <span>FIN KB</span>
      </div>
      <div class="finkb-article" id="finkbart${id}">
        <div class="finkb-empty">
          <div class="finkb-empty-icon">📚</div>
          <div>Seleziona un articolo dalla sidebar</div>
        </div>
      </div>
    </div>
  </div>`;
}

// ─── Init ─────────────────────────────────────────────────

function initFinkb(id) {
  const state = {
    view:       'list',
    activeId:   null,
    searchQ:    '',
  };
  WINS[id]._finkbState = state;

  const nav     = document.getElementById('finkbnav' + id);
  const art     = document.getElementById('finkbart' + id);
  const bc      = document.getElementById('finkbbc' + id);
  const srch    = document.getElementById('finkbsrch' + id);
  const btnList = document.getElementById('finkbbtnlist' + id);
  const btnTree = document.getElementById('finkbbtntree' + id);

  // ── flat page index ──
  const allPages = [];
  FINKB_DATA.forEach(cat => {
    cat.pages.forEach(p => allPages.push({ ...p, catId: cat.id, catLabel: cat.label, catIcon: cat.icon }));
  });

  function findPage(pid) { return allPages.find(p => p.id === pid); }

  // ── render nav ──
  function renderNav() {
    nav.innerHTML = '';
    const q = state.searchQ.toLowerCase();
    const matchCat = cat => cat.pages.some(p =>
      p.title.toLowerCase().includes(q) || cat.label.toLowerCase().includes(q)
    );
    const matchPage = p =>
      p.title.toLowerCase().includes(q) ||
      allPages.find(x => x.id === p.id)?.catLabel?.toLowerCase().includes(q);

    if (state.view === 'list') {
      FINKB_DATA.forEach(cat => {
        if (q && !matchCat(cat)) return;
        const catEl = document.createElement('div');
        catEl.className = 'finkb-cat';
        catEl.textContent = cat.icon + ' ' + cat.label;
        nav.appendChild(catEl);
        cat.pages.forEach(p => {
          if (q && !p.title.toLowerCase().includes(q)) return;
          const el = document.createElement('div');
          el.className = 'finkb-item' + (state.activeId === p.id ? ' active' : '');
          el.textContent = p.title;
          el.addEventListener('click', () => openPage(p.id));
          nav.appendChild(el);
        });
      });
    } else {
      // tree view
      FINKB_DATA.forEach(cat => {
        if (q && !matchCat(cat)) return;
        const folder = document.createElement('div');
        folder.className = 'finkb-folder';
        const hdr = document.createElement('div');
        hdr.className = 'finkb-folder-hdr';
        const expanded = { v: true };
        hdr.innerHTML = `
          <span class="finkb-folder-toggle">${expanded.v ? '▾' : '▸'}</span>
          <span class="finkb-folder-icon">${cat.icon}</span>
          <span class="finkb-folder-name">${cat.label}</span>
          <span class="finkb-folder-badge">${cat.pages.length}</span>`;
        folder.appendChild(hdr);

        const children = document.createElement('div');
        children.className = 'finkb-folder-children';
        cat.pages.forEach(p => {
          if (q && !p.title.toLowerCase().includes(q)) return;
          const pg = document.createElement('div');
          pg.className = 'finkb-page' + (state.activeId === p.id ? ' active' : '');
          pg.textContent = p.title;
          pg.addEventListener('click', () => openPage(p.id));
          children.appendChild(pg);
        });
        folder.appendChild(children);

        hdr.addEventListener('click', () => {
          expanded.v = !expanded.v;
          children.classList.toggle('collapsed', !expanded.v);
          hdr.querySelector('.finkb-folder-toggle').textContent = expanded.v ? '▾' : '▸';
        });

        nav.appendChild(folder);
      });
    }
  }

  // ── open article ──
  function openPage(pid) {
    const p = findPage(pid);
    if (!p) return;
    state.activeId = pid;

    // breadcrumb
    bc.innerHTML = `<span>${p.catIcon} ${p.catLabel}</span><span class="finkb-breadcrumb-sep">›</span><span class="finkb-breadcrumb-cur">${p.title}</span>`;

    // article
    art.innerHTML = `
      <div class="finkb-article-title">${p.title}</div>
      <div class="finkb-article-meta">
        <span>${p.catIcon} ${p.catLabel}</span>
        <span class="finkb-article-badge">${p.badge || 'info'}</span>
      </div>
      <div class="finkb-article-body">${p.body}</div>`;

    renderNav(); // re-render to update active state
  }

  // ── view toggle ──
  btnList.addEventListener('click', () => {
    state.view = 'list';
    btnList.classList.add('active'); btnTree.classList.remove('active');
    renderNav();
  });
  btnTree.addEventListener('click', () => {
    state.view = 'tree';
    btnTree.classList.add('active'); btnList.classList.remove('active');
    renderNav();
  });

  // ── search ──
  srch.addEventListener('input', () => {
    state.searchQ = srch.value;
    renderNav();
  });

  renderNav();
}
