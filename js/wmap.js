'use strict';
/* ═══════════════════════════════════════════════════════════
   W-MAP — Vista Italia hub-spoke con sfondo Matrix rosso
   Fase 1: struttura + dati   Fase 2: dati Italia hardcoded
   Fase 3: albero hub-spoke navigabile (Italia→Regione→Provincia→Città)
   Autocontenuto: nessuna dipendenza esterna.
   ═══════════════════════════════════════════════════════════ */

// ─── Fase 2 — Dati Italia (hardcoded, no API) ────────────────
const ITALIA_DATA = {
  nome: 'Italia',
  regioni: [
    { id:'pie', nome:'Piemonte',        cap:'Torino',     province:[
      {nome:'Torino',        cap:'Torino',       citta:['Torino','Moncalieri','Pinerolo','Collegno','Nichelino']},
      {nome:'Vercelli',      cap:'Vercelli',     citta:['Vercelli']},
      {nome:'Novara',        cap:'Novara',       citta:['Novara']},
      {nome:'Cuneo',         cap:'Cuneo',        citta:['Cuneo','Alba','Savigliano','Fossano']},
      {nome:'Asti',          cap:'Asti',         citta:['Asti']},
      {nome:'Alessandria',   cap:'Alessandria',  citta:['Alessandria','Casale M.','Novi Ligure']},
      {nome:'Biella',        cap:'Biella',       citta:['Biella']},
      {nome:'VCO',           cap:'Verbania',     citta:['Verbania','Domodossola']},
    ]},
    { id:'vda', nome:"Valle d'Aosta",   cap:'Aosta',      province:[
      {nome:'Aosta',         cap:'Aosta',        citta:['Aosta']},
    ]},
    { id:'lom', nome:'Lombardia',       cap:'Milano',     province:[
      {nome:'Milano',        cap:'Milano',       citta:['Milano','Sesto S.G.','Cinisello B.','Rho','Corsico']},
      {nome:'Bergamo',       cap:'Bergamo',      citta:['Bergamo','Treviglio','Dalmine','Seriate']},
      {nome:'Brescia',       cap:'Brescia',      citta:['Brescia','Desenzano','Chiari']},
      {nome:'Como',          cap:'Como',         citta:['Como','Cantù','Mariano C.']},
      {nome:'Cremona',       cap:'Cremona',      citta:['Cremona','Crema']},
      {nome:'Lecco',         cap:'Lecco',        citta:['Lecco']},
      {nome:'Lodi',          cap:'Lodi',         citta:['Lodi']},
      {nome:'Mantova',       cap:'Mantova',      citta:['Mantova']},
      {nome:'Monza-Brianza', cap:'Monza',        citta:['Monza','Seregno','Desio','Cesano M.']},
      {nome:'Pavia',         cap:'Pavia',        citta:['Pavia','Vigevano']},
      {nome:'Sondrio',       cap:'Sondrio',      citta:['Sondrio']},
      {nome:'Varese',        cap:'Varese',       citta:['Varese','Busto A.','Gallarate','Saronno']},
    ]},
    { id:'taa', nome:'Trentino-A.A.',   cap:'Trento',     province:[
      {nome:'Trento',        cap:'Trento',       citta:['Trento','Rovereto']},
      {nome:'Bolzano',       cap:'Bolzano',      citta:['Bolzano','Merano','Bressanone']},
    ]},
    { id:'ven', nome:'Veneto',          cap:'Venezia',    province:[
      {nome:'Venezia',       cap:'Venezia',      citta:['Venezia','Mestre','Chioggia']},
      {nome:'Padova',        cap:'Padova',       citta:['Padova','Abano T.']},
      {nome:'Vicenza',       cap:'Vicenza',      citta:['Vicenza','Bassano del G.','Schio']},
      {nome:'Verona',        cap:'Verona',       citta:['Verona','Legnago','Villafranca']},
      {nome:'Treviso',       cap:'Treviso',      citta:['Treviso','Vittorio V.','Castelfranco V.']},
      {nome:'Belluno',       cap:'Belluno',      citta:['Belluno','Feltre']},
      {nome:'Rovigo',        cap:'Rovigo',       citta:['Rovigo','Adria']},
    ]},
    { id:'fvg', nome:'Friuli-V.G.',     cap:'Trieste',    province:[
      {nome:'Trieste',       cap:'Trieste',      citta:['Trieste']},
      {nome:'Udine',         cap:'Udine',        citta:['Udine']},
      {nome:'Pordenone',     cap:'Pordenone',    citta:['Pordenone']},
      {nome:'Gorizia',       cap:'Gorizia',      citta:['Gorizia','Monfalcone']},
    ]},
    { id:'lig', nome:'Liguria',         cap:'Genova',     province:[
      {nome:'Genova',        cap:'Genova',       citta:['Genova']},
      {nome:'Savona',        cap:'Savona',       citta:['Savona','Albenga']},
      {nome:'La Spezia',     cap:'La Spezia',    citta:['La Spezia']},
      {nome:'Imperia',       cap:'Imperia',      citta:['Imperia','Sanremo']},
    ]},
    { id:'emr', nome:'Emilia-Romagna',  cap:'Bologna',    province:[
      {nome:'Bologna',       cap:'Bologna',      citta:['Bologna','Imola','Casalecchio']},
      {nome:'Ferrara',       cap:'Ferrara',      citta:['Ferrara','Copparo']},
      {nome:'Forlì-Cesena',  cap:'Forlì',        citta:['Forlì','Cesena','Cesenatico']},
      {nome:'Modena',        cap:'Modena',       citta:['Modena','Carpi','Sassuolo']},
      {nome:'Parma',         cap:'Parma',        citta:['Parma','Fidenza']},
      {nome:'Piacenza',      cap:'Piacenza',     citta:['Piacenza']},
      {nome:'Ravenna',       cap:'Ravenna',      citta:['Ravenna','Faenza','Lugo']},
      {nome:'Reggio E.',     cap:'Reggio E.',    citta:['Reggio E.','Correggio','Scandiano']},
      {nome:'Rimini',        cap:'Rimini',       citta:['Rimini','Riccione','Cattolica']},
    ]},
    { id:'tos', nome:'Toscana',         cap:'Firenze',    province:[
      {nome:'Firenze',       cap:'Firenze',      citta:['Firenze','Scandicci','Sesto F.no']},
      {nome:'Arezzo',        cap:'Arezzo',       citta:['Arezzo']},
      {nome:'Grosseto',      cap:'Grosseto',     citta:['Grosseto']},
      {nome:'Livorno',       cap:'Livorno',      citta:['Livorno','Piombino']},
      {nome:'Lucca',         cap:'Lucca',        citta:['Lucca','Viareggio']},
      {nome:'Massa-Carrara', cap:'Massa',        citta:['Massa','Carrara']},
      {nome:'Pisa',          cap:'Pisa',         citta:['Pisa','Pontedera']},
      {nome:'Pistoia',       cap:'Pistoia',      citta:['Pistoia','Monsummano T.']},
      {nome:'Prato',         cap:'Prato',        citta:['Prato']},
      {nome:'Siena',         cap:'Siena',        citta:['Siena','Poggibonsi']},
    ]},
    { id:'umb', nome:'Umbria',          cap:'Perugia',    province:[
      {nome:'Perugia',       cap:'Perugia',      citta:['Perugia','Foligno','Città di C.','Gubbio']},
      {nome:'Terni',         cap:'Terni',        citta:['Terni','Orvieto']},
    ]},
    { id:'mar', nome:'Marche',          cap:'Ancona',     province:[
      {nome:'Ancona',        cap:'Ancona',       citta:['Ancona','Senigallia','Jesi']},
      {nome:'Ascoli P.',     cap:'Ascoli P.',    citta:['Ascoli Piceno','San Benedetto T.']},
      {nome:'Fermo',         cap:'Fermo',        citta:['Fermo','Porto San Giorgio']},
      {nome:'Macerata',      cap:'Macerata',     citta:['Macerata','Civitanova M.']},
      {nome:'Pesaro-Urbino', cap:'Pesaro',       citta:['Pesaro','Fano','Urbino']},
    ]},
    { id:'laz', nome:'Lazio',           cap:'Roma',       province:[
      {nome:'Roma',          cap:'Roma',         citta:['Roma','Guidonia','Fiumicino','Tivoli','Pomezia']},
      {nome:'Frosinone',     cap:'Frosinone',    citta:['Frosinone','Cassino','Alatri']},
      {nome:'Latina',        cap:'Latina',       citta:['Latina','Aprilia','Terracina']},
      {nome:'Rieti',         cap:'Rieti',        citta:['Rieti']},
      {nome:'Viterbo',       cap:'Viterbo',      citta:['Viterbo']},
    ]},
    { id:'abr', nome:'Abruzzo',         cap:"L'Aquila",   province:[
      {nome:"L'Aquila",      cap:"L'Aquila",     citta:["L'Aquila"]},
      {nome:'Chieti',        cap:'Chieti',       citta:['Chieti','Lanciano','Vasto']},
      {nome:'Pescara',       cap:'Pescara',      citta:['Pescara','Montesilvano']},
      {nome:'Teramo',        cap:'Teramo',       citta:['Teramo']},
    ]},
    { id:'mol', nome:'Molise',          cap:'Campobasso', province:[
      {nome:'Campobasso',    cap:'Campobasso',   citta:['Campobasso','Termoli']},
      {nome:'Isernia',       cap:'Isernia',      citta:['Isernia']},
    ]},
    { id:'cam', nome:'Campania',        cap:'Napoli',     province:[
      {nome:'Napoli',        cap:'Napoli',       citta:['Napoli','Giugliano','Torre del G.','Castellammare']},
      {nome:'Avellino',      cap:'Avellino',     citta:['Avellino','Ariano I.']},
      {nome:'Benevento',     cap:'Benevento',    citta:['Benevento']},
      {nome:'Caserta',       cap:'Caserta',      citta:['Caserta','Aversa','Marcianise']},
      {nome:'Salerno',       cap:'Salerno',      citta:['Salerno','Battipaglia','Cava dei T.']},
    ]},
    { id:'pug', nome:'Puglia',          cap:'Bari',       province:[
      {nome:'Bari',          cap:'Bari',         citta:['Bari','Altamura','Molfetta','Bitonto']},
      {nome:'BAT',           cap:'Andria',       citta:['Andria','Barletta','Trani']},
      {nome:'Brindisi',      cap:'Brindisi',     citta:['Brindisi','Francavilla F.','Fasano']},
      {nome:'Foggia',        cap:'Foggia',       citta:['Foggia','Manfredonia','Cerignola']},
      {nome:'Lecce',         cap:'Lecce',        citta:['Lecce','Surbo','Galatina']},
      {nome:'Taranto',       cap:'Taranto',      citta:['Taranto','Martina F.','Massafra']},
    ]},
    { id:'bas', nome:'Basilicata',      cap:'Potenza',    province:[
      {nome:'Potenza',       cap:'Potenza',      citta:['Potenza','Melfi']},
      {nome:'Matera',        cap:'Matera',       citta:['Matera','Pisticci']},
    ]},
    { id:'cal', nome:'Calabria',        cap:'Catanzaro',  province:[
      {nome:'Catanzaro',     cap:'Catanzaro',    citta:['Catanzaro','Lamezia T.']},
      {nome:'Cosenza',       cap:'Cosenza',      citta:['Cosenza','Rende','Castrovillari']},
      {nome:'Crotone',       cap:'Crotone',      citta:['Crotone']},
      {nome:'Reggio C.',     cap:'Reggio C.',    citta:['Reggio Calabria']},
      {nome:'Vibo V.',       cap:'Vibo V.',      citta:['Vibo Valentia']},
    ]},
    { id:'sic', nome:'Sicilia',         cap:'Palermo',    province:[
      {nome:'Palermo',       cap:'Palermo',      citta:['Palermo','Bagheria','Monreale']},
      {nome:'Agrigento',     cap:'Agrigento',    citta:['Agrigento']},
      {nome:'Caltanissetta', cap:'Caltanissetta',citta:['Caltanissetta','Gela']},
      {nome:'Catania',       cap:'Catania',      citta:['Catania','Acireale','Adrano']},
      {nome:'Enna',          cap:'Enna',         citta:['Enna']},
      {nome:'Messina',       cap:'Messina',      citta:['Messina','Milazzo']},
      {nome:'Ragusa',        cap:'Ragusa',       citta:['Ragusa','Modica','Vittoria']},
      {nome:'Siracusa',      cap:'Siracusa',     citta:['Siracusa','Augusta','Noto']},
      {nome:'Trapani',       cap:'Trapani',      citta:['Trapani','Marsala','Alcamo','Mazara']},
    ]},
    { id:'sar', nome:'Sardegna',        cap:'Cagliari',   province:[
      {nome:'Cagliari',      cap:'Cagliari',     citta:['Cagliari','Quartu S.E.','Selargius']},
      {nome:'Nuoro',         cap:'Nuoro',        citta:['Nuoro','Siniscola']},
      {nome:'Oristano',      cap:'Oristano',     citta:['Oristano']},
      {nome:'Sassari',       cap:'Sassari',      citta:['Sassari','Alghero','Porto Torres']},
      {nome:'Sud Sardegna',  cap:'Carbonia',     citta:['Carbonia','Iglesias']},
    ]},
  ],
};

// ─── Fase 1 — HTML template ───────────────────────────────────
function wmapBodyHTML(id) {
  return `
    <div class="wmap-wrap" id="wmapwrap${id}">
      <canvas class="wmap-canvas" id="wmapcanvas${id}"></canvas>
      <div class="wmap-ui">
        <div class="wmap-breadcrumb" id="wmapbread${id}">ITALIA</div>
        <div class="wmap-hub" id="wmaphub${id}">
          <svg class="wmap-svg" id="wmapsvg${id}" xmlns="http://www.w3.org/2000/svg"></svg>
        </div>
      </div>
    </div>`;
}

// ─── Fase 1 — Init ────────────────────────────────────────────
function initWMap(id) {
  const w = WINS[id];
  if (!w || w.type !== 'wmap') return;

  w.wmapState = { path: [], raf: null, canvasRo: null, hubRo: null };

  _wmapStartMatrix(id);
  _wmapRender(id);

  // Re-render hub-spoke su resize finestra
  const hub = document.getElementById('wmaphub' + id);
  if (hub) {
    const ro = new ResizeObserver(() => { if (WINS[id]) _wmapRender(id); });
    ro.observe(hub);
    w.wmapState.hubRo = ro;
  }

  w._wmapDispose = () => {
    const s = WINS[id]?.wmapState;
    if (!s) return;
    if (s.raf)      cancelAnimationFrame(s.raf);
    s.canvasRo?.disconnect();
    s.hubRo?.disconnect();
    WINS[id].wmapState = null;
  };
}

// ─── Matrix rain canvas ────────────────────────────────────────
function _wmapStartMatrix(id) {
  const canvas = document.getElementById('wmapcanvas' + id);
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  const wrap = document.getElementById('wmapwrap' + id);

  const CHARS = '0123456789ABCDEF:/\\|<>=!#';
  const FS    = 11;
  let drops   = [];

  function resize() {
    canvas.width  = wrap.offsetWidth  || 820;
    canvas.height = wrap.offsetHeight || 500;
    const cols = Math.floor(canvas.width / FS);
    drops = Array.from({ length: cols },
      () => Math.random() * -(canvas.height / FS));
  }
  resize();

  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  const w = WINS[id];
  if (w?.wmapState) w.wmapState.canvasRo = ro;

  let last = 0;
  function tick(ts) {
    if (!WINS[id]) { ro.disconnect(); return; }
    const raf = requestAnimationFrame(tick);
    if (WINS[id]?.wmapState) WINS[id].wmapState.raf = raf;
    if (ts - last < 45) return;   // ~22 fps
    last = ts;

    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = FS + 'px "Space Mono",monospace';

    for (let i = 0; i < drops.length; i++) {
      const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
      // corpo
      ctx.fillStyle = '#8b1a00';
      ctx.fillText(ch, i * FS, drops[i] * FS);
      // testa — più luminosa
      ctx.fillStyle = '#ff5533';
      ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * FS, (drops[i] - 1) * FS);

      drops[i]++;
      if (drops[i] * FS > canvas.height && Math.random() > 0.975)
        drops[i] = Math.random() * -(canvas.height / FS / 2);
    }
  }

  const raf = requestAnimationFrame(tick);
  if (w?.wmapState) w.wmapState.raf = raf;
}

// ─── Fase 3 — Hub-spoke render ────────────────────────────────
function _wmapRender(id) {
  const w = WINS[id];
  if (!w?.wmapState) return;

  const hub = document.getElementById('wmaphub' + id);
  const svg = document.getElementById('wmapsvg' + id);
  if (!hub || !svg) return;

  // Pulisce nodi precedenti (conserva svg)
  [...hub.children].forEach(c => { if (c !== svg) c.remove(); });
  svg.innerHTML = '';

  const W    = hub.offsetWidth  || 820;
  const H    = hub.offsetHeight || 460;
  const cx   = W / 2;
  const cy   = H / 2;
  const path = w.wmapState.path;

  // ── Dati del livello corrente ──
  let centerLabel, centerSub, items, canDrill;

  if (path.length === 0) {
    // Italia → 20 regioni
    centerLabel = 'ITALIA';
    centerSub   = '20 regioni · click per espandere';
    items       = ITALIA_DATA.regioni.map(r => ({
      label: r.nome, sub: r.cap, key: r.id,
    }));
    canDrill = true;

  } else if (path.length === 1) {
    // Regione → province
    const reg   = ITALIA_DATA.regioni.find(r => r.id === path[0]);
    centerLabel = reg.nome.toUpperCase();
    centerSub   = 'cap. ' + reg.cap;
    items       = reg.province.map((p, i) => ({
      label: p.nome, sub: p.cap, key: i,
    }));
    canDrill = true;

  } else {
    // Provincia → città
    const reg   = ITALIA_DATA.regioni.find(r => r.id === path[0]);
    const prov  = reg.province[path[1]];
    centerLabel = prov.nome.toUpperCase();
    centerSub   = 'prov. ' + prov.cap;
    items       = prov.citta.map(c => ({ label: c, sub: '', key: null }));
    canDrill = false;
  }

  const n = items.length;
  // Raggio adattivo: più nodi → cerchio più grande, con limiti
  const R = Math.max(100, Math.min(cx * 0.80, cy * 0.80, 200 + n * 3));

  const NS = 'http://www.w3.org/2000/svg';

  // ── Satelliti + linee ──
  items.forEach((item, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const sx    = cx + R * Math.cos(angle);
    const sy    = cy + R * Math.sin(angle);

    // Linea SVG centro→satellite
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', cx); line.setAttribute('y1', cy);
    line.setAttribute('x2', sx); line.setAttribute('y2', sy);
    line.setAttribute('stroke', '#2a0000');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);

    // Nodo satellite
    const nd = document.createElement('div');
    nd.className = 'wmap-node' + (canDrill && item.key !== null ? ' clickable' : '');
    nd.style.cssText = `left:${sx}px;top:${sy}px`;
    nd.innerHTML =
      `<div class="wmap-node-box">${item.label}</div>` +
      (item.sub ? `<div class="wmap-node-sub">${item.sub}</div>` : '');
    if (canDrill && item.key !== null)
      nd.addEventListener('click', () => _wmapDrillDown(id, item.key));
    hub.appendChild(nd);
  });

  // ── Nodo centrale ──
  const cd = document.createElement('div');
  cd.className = 'wmap-node' + (path.length > 0 ? ' clickable' : '');
  cd.style.cssText = `left:${cx}px;top:${cy}px`;
  cd.innerHTML =
    `<div class="wmap-node-box center">${centerLabel}</div>` +
    `<div class="wmap-node-sub">${centerSub}</div>`;
  if (path.length > 0) {
    cd.title = '← torna su';
    cd.addEventListener('click', () => _wmapGoUp(id));
  }
  hub.appendChild(cd);

  _wmapUpdateBreadcrumb(id);
}

// ─── Navigazione ──────────────────────────────────────────────
function _wmapDrillDown(id, key) {
  const w = WINS[id];
  if (!w?.wmapState) return;
  w.wmapState.path.push(key);
  _wmapRender(id);
}

function _wmapGoUp(id) {
  const w = WINS[id];
  if (!w?.wmapState || w.wmapState.path.length === 0) return;
  w.wmapState.path.pop();
  _wmapRender(id);
}

// ─── Breadcrumb ───────────────────────────────────────────────
function _wmapUpdateBreadcrumb(id) {
  const w  = WINS[id];
  const el = document.getElementById('wmapbread' + id);
  if (!el || !w?.wmapState) return;
  const path  = w.wmapState.path;
  const parts = ['ITALIA'];
  if (path.length >= 1) {
    const reg = ITALIA_DATA.regioni.find(r => r.id === path[0]);
    if (reg) parts.push(reg.nome.toUpperCase());
  }
  if (path.length >= 2) {
    const reg  = ITALIA_DATA.regioni.find(r => r.id === path[0]);
    const prov = reg?.province[path[1]];
    if (prov) parts.push(prov.nome);
  }
  el.textContent = parts.join(' › ');
}
