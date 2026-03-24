'use strict';
/* ═══════════════════════════════════════════════════════════
   W-MAP — Mappa geografica Italia SVG con drill-down
   Italia → Regione (province colorate) → info provincia
   Dati: GeoJSON openpolis/geojson-italy via jsDelivr CDN
   Dipende da: window-manager.js (WINS)
   ═══════════════════════════════════════════════════════════ */

// ─── Cache GeoJSON (caricati lazy, modulo-scoped) ─────────────
let _WMAP_REGIONS   = null;   // GeoJSON regioni (caricato all'apertura)
let _WMAP_PROVINCES = null;   // GeoJSON province (caricato al click)

// Regions: stefanocudini/leaflet-geojson-selector (363KB, verificato OK, prop: id + name lowercase)
const _WMAP_URL_REG = 'https://raw.githubusercontent.com/stefanocudini/leaflet-geojson-selector/master/examples/italy-regions.json';
// Provinces: openpolis/geojson-italy master (prop: prov_name, reg_name, reg_istat_code)
const _WMAP_URL_PRO = 'https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_provinces.geojson';

// ─── Palette 20 colori regioni (distinguibili su sfondo scuro) ─
const WMAP_REG_COLORS = [
  '#1f5c96','#1a8050','#6a3a9a','#9a5e20','#1a8090',
  '#9a2050','#4a8a20','#9a6a20','#8a2820','#206a2a',
  '#5a1a8a','#8a1a6a','#1a6a8a','#7a7a18','#4a1a40',
  '#1a5a3a','#3a5a18','#5a2a18','#2a4a9a','#5a3a18',
];

// ─── Display names (chiave = name lowercase da stefanocudini) ──
const _WMAP_DISPLAY = {
  "piemonte":              "Piemonte",
  "valle d'aosta":         "Valle d'Aosta",
  "lombardia":             "Lombardia",
  "trentino-alto adige":   "Trentino-A.A.",
  "veneto":                "Veneto",
  "friuli venezia giulia": "Friuli-V.G.",
  "liguria":               "Liguria",
  "emilia romagna":        "Emilia-Romagna",
  "toscana":               "Toscana",
  "umbria":                "Umbria",
  "marche":                "Marche",
  "lazio":                 "Lazio",
  "abruzzo":               "Abruzzo",
  "molise":                "Molise",
  "campania":              "Campania",
  "puglia":                "Puglia",
  "basilicata":            "Basilicata",
  "calabria":              "Calabria",
  "sicilia":               "Sicilia",
  "sardegna":              "Sardegna",
};

// Normalizza per confronto fuzzy tra sorgenti diverse
// (rimuove trattini, slash, apostrofi, mette tutto lowercase)
function _wmapNorm(s) {
  return (s || '').toLowerCase().replace(/[-\/''']/g, ' ').replace(/\s+/g, ' ').trim();
}

// ─── Dati statici (per il pannello info) ─────────────────────
const ITALIA_DATA = {
  regioni: [
    { geo:"Piemonte",           cap:"Torino",    province:[
      {nome:"Torino",         cap:"Torino",   citta:["Torino","Moncalieri","Pinerolo","Nichelino"]},
      {nome:"Vercelli",       cap:"Vercelli", citta:["Vercelli"]},
      {nome:"Novara",         cap:"Novara",   citta:["Novara"]},
      {nome:"Cuneo",          cap:"Cuneo",    citta:["Cuneo","Alba","Fossano"]},
      {nome:"Asti",           cap:"Asti",     citta:["Asti"]},
      {nome:"Alessandria",    cap:"Alessandria", citta:["Alessandria","Casale M."]},
      {nome:"Biella",         cap:"Biella",   citta:["Biella"]},
      {nome:"VCO",            cap:"Verbania", citta:["Verbania","Domodossola"]},
    ]},
    { geo:"Valle d'Aosta/Vallée d'Aoste", cap:"Aosta", province:[
      {nome:"Aosta", cap:"Aosta", citta:["Aosta"]},
    ]},
    { geo:"Lombardia",          cap:"Milano",   province:[
      {nome:"Milano",         cap:"Milano",    citta:["Milano","Sesto S.G.","Cinisello B.","Rho"]},
      {nome:"Bergamo",        cap:"Bergamo",   citta:["Bergamo","Treviglio","Dalmine"]},
      {nome:"Brescia",        cap:"Brescia",   citta:["Brescia","Desenzano"]},
      {nome:"Como",           cap:"Como",      citta:["Como","Cantù"]},
      {nome:"Cremona",        cap:"Cremona",   citta:["Cremona","Crema"]},
      {nome:"Lecco",          cap:"Lecco",     citta:["Lecco"]},
      {nome:"Lodi",           cap:"Lodi",      citta:["Lodi"]},
      {nome:"Mantova",        cap:"Mantova",   citta:["Mantova"]},
      {nome:"Monza-Brianza",  cap:"Monza",     citta:["Monza","Seregno","Desio"]},
      {nome:"Pavia",          cap:"Pavia",     citta:["Pavia","Vigevano"]},
      {nome:"Sondrio",        cap:"Sondrio",   citta:["Sondrio"]},
      {nome:"Varese",         cap:"Varese",    citta:["Varese","Busto A.","Gallarate"]},
    ]},
    { geo:"Trentino-Alto Adige/Südtirol", cap:"Trento", province:[
      {nome:"Trento",  cap:"Trento",  citta:["Trento","Rovereto"]},
      {nome:"Bolzano", cap:"Bolzano", citta:["Bolzano","Merano","Bressanone"]},
    ]},
    { geo:"Veneto",             cap:"Venezia",  province:[
      {nome:"Venezia",  cap:"Venezia",  citta:["Venezia","Mestre","Chioggia"]},
      {nome:"Padova",   cap:"Padova",   citta:["Padova"]},
      {nome:"Vicenza",  cap:"Vicenza",  citta:["Vicenza","Bassano del G."]},
      {nome:"Verona",   cap:"Verona",   citta:["Verona"]},
      {nome:"Treviso",  cap:"Treviso",  citta:["Treviso","Vittorio V."]},
      {nome:"Belluno",  cap:"Belluno",  citta:["Belluno"]},
      {nome:"Rovigo",   cap:"Rovigo",   citta:["Rovigo"]},
    ]},
    { geo:"Friuli-Venezia Giulia", cap:"Trieste", province:[
      {nome:"Trieste",    cap:"Trieste",    citta:["Trieste"]},
      {nome:"Udine",      cap:"Udine",      citta:["Udine"]},
      {nome:"Pordenone",  cap:"Pordenone",  citta:["Pordenone"]},
      {nome:"Gorizia",    cap:"Gorizia",    citta:["Gorizia","Monfalcone"]},
    ]},
    { geo:"Liguria",            cap:"Genova",   province:[
      {nome:"Genova",    cap:"Genova",    citta:["Genova"]},
      {nome:"Savona",    cap:"Savona",    citta:["Savona","Albenga"]},
      {nome:"La Spezia", cap:"La Spezia", citta:["La Spezia"]},
      {nome:"Imperia",   cap:"Imperia",   citta:["Imperia","Sanremo"]},
    ]},
    { geo:"Emilia-Romagna",     cap:"Bologna",  province:[
      {nome:"Bologna",       cap:"Bologna",   citta:["Bologna","Imola"]},
      {nome:"Ferrara",       cap:"Ferrara",   citta:["Ferrara"]},
      {nome:"Forlì-Cesena",  cap:"Forlì",    citta:["Forlì","Cesena"]},
      {nome:"Modena",        cap:"Modena",    citta:["Modena","Carpi","Sassuolo"]},
      {nome:"Parma",         cap:"Parma",     citta:["Parma"]},
      {nome:"Piacenza",      cap:"Piacenza",  citta:["Piacenza"]},
      {nome:"Ravenna",       cap:"Ravenna",   citta:["Ravenna","Faenza"]},
      {nome:"Reggio E.",     cap:"Reggio E.", citta:["Reggio E.","Correggio"]},
      {nome:"Rimini",        cap:"Rimini",    citta:["Rimini","Riccione"]},
    ]},
    { geo:"Toscana",            cap:"Firenze",  province:[
      {nome:"Firenze",       cap:"Firenze",  citta:["Firenze","Scandicci"]},
      {nome:"Arezzo",        cap:"Arezzo",   citta:["Arezzo"]},
      {nome:"Grosseto",      cap:"Grosseto", citta:["Grosseto"]},
      {nome:"Livorno",       cap:"Livorno",  citta:["Livorno"]},
      {nome:"Lucca",         cap:"Lucca",    citta:["Lucca","Viareggio"]},
      {nome:"Massa-Carrara", cap:"Massa",    citta:["Massa","Carrara"]},
      {nome:"Pisa",          cap:"Pisa",     citta:["Pisa"]},
      {nome:"Pistoia",       cap:"Pistoia",  citta:["Pistoia"]},
      {nome:"Prato",         cap:"Prato",    citta:["Prato"]},
      {nome:"Siena",         cap:"Siena",    citta:["Siena"]},
    ]},
    { geo:"Umbria",             cap:"Perugia",  province:[
      {nome:"Perugia", cap:"Perugia", citta:["Perugia","Foligno"]},
      {nome:"Terni",   cap:"Terni",   citta:["Terni"]},
    ]},
    { geo:"Marche",             cap:"Ancona",   province:[
      {nome:"Ancona",        cap:"Ancona",    citta:["Ancona","Senigallia"]},
      {nome:"Ascoli P.",     cap:"Ascoli P.", citta:["Ascoli Piceno"]},
      {nome:"Fermo",         cap:"Fermo",     citta:["Fermo"]},
      {nome:"Macerata",      cap:"Macerata",  citta:["Macerata","Civitanova M."]},
      {nome:"Pesaro-Urbino", cap:"Pesaro",    citta:["Pesaro","Fano"]},
    ]},
    { geo:"Lazio",              cap:"Roma",     province:[
      {nome:"Roma",      cap:"Roma",      citta:["Roma","Guidonia","Fiumicino","Tivoli"]},
      {nome:"Frosinone", cap:"Frosinone", citta:["Frosinone","Cassino"]},
      {nome:"Latina",    cap:"Latina",    citta:["Latina","Aprilia"]},
      {nome:"Rieti",     cap:"Rieti",     citta:["Rieti"]},
      {nome:"Viterbo",   cap:"Viterbo",   citta:["Viterbo"]},
    ]},
    { geo:"Abruzzo",            cap:"L'Aquila", province:[
      {nome:"L'Aquila", cap:"L'Aquila", citta:["L'Aquila"]},
      {nome:"Chieti",   cap:"Chieti",   citta:["Chieti","Lanciano","Vasto"]},
      {nome:"Pescara",  cap:"Pescara",  citta:["Pescara","Montesilvano"]},
      {nome:"Teramo",   cap:"Teramo",   citta:["Teramo"]},
    ]},
    { geo:"Molise",             cap:"Campobasso", province:[
      {nome:"Campobasso", cap:"Campobasso", citta:["Campobasso","Termoli"]},
      {nome:"Isernia",    cap:"Isernia",    citta:["Isernia"]},
    ]},
    { geo:"Campania",           cap:"Napoli",   province:[
      {nome:"Napoli",    cap:"Napoli",    citta:["Napoli","Giugliano","Castellammare"]},
      {nome:"Avellino",  cap:"Avellino",  citta:["Avellino"]},
      {nome:"Benevento", cap:"Benevento", citta:["Benevento"]},
      {nome:"Caserta",   cap:"Caserta",   citta:["Caserta","Aversa"]},
      {nome:"Salerno",   cap:"Salerno",   citta:["Salerno","Battipaglia"]},
    ]},
    { geo:"Puglia",             cap:"Bari",     province:[
      {nome:"Bari",    cap:"Bari",    citta:["Bari","Altamura","Molfetta"]},
      {nome:"BAT",     cap:"Andria",  citta:["Andria","Barletta","Trani"]},
      {nome:"Brindisi",cap:"Brindisi",citta:["Brindisi"]},
      {nome:"Foggia",  cap:"Foggia",  citta:["Foggia","Manfredonia"]},
      {nome:"Lecce",   cap:"Lecce",   citta:["Lecce"]},
      {nome:"Taranto", cap:"Taranto", citta:["Taranto"]},
    ]},
    { geo:"Basilicata",         cap:"Potenza",  province:[
      {nome:"Potenza", cap:"Potenza", citta:["Potenza"]},
      {nome:"Matera",  cap:"Matera",  citta:["Matera"]},
    ]},
    { geo:"Calabria",           cap:"Catanzaro",province:[
      {nome:"Catanzaro",  cap:"Catanzaro",  citta:["Catanzaro","Lamezia T."]},
      {nome:"Cosenza",    cap:"Cosenza",    citta:["Cosenza","Rende"]},
      {nome:"Crotone",    cap:"Crotone",    citta:["Crotone"]},
      {nome:"Reggio C.",  cap:"Reggio C.",  citta:["Reggio Calabria"]},
      {nome:"Vibo V.",    cap:"Vibo V.",    citta:["Vibo Valentia"]},
    ]},
    { geo:"Sicilia",            cap:"Palermo",  province:[
      {nome:"Palermo",      cap:"Palermo",      citta:["Palermo","Bagheria"]},
      {nome:"Agrigento",    cap:"Agrigento",    citta:["Agrigento"]},
      {nome:"Caltanissetta",cap:"Caltanissetta",citta:["Caltanissetta","Gela"]},
      {nome:"Catania",      cap:"Catania",      citta:["Catania","Acireale"]},
      {nome:"Enna",         cap:"Enna",         citta:["Enna"]},
      {nome:"Messina",      cap:"Messina",      citta:["Messina"]},
      {nome:"Ragusa",       cap:"Ragusa",       citta:["Ragusa","Modica"]},
      {nome:"Siracusa",     cap:"Siracusa",     citta:["Siracusa","Augusta"]},
      {nome:"Trapani",      cap:"Trapani",      citta:["Trapani","Marsala","Alcamo"]},
    ]},
    { geo:"Sardegna",           cap:"Cagliari", province:[
      {nome:"Cagliari",     cap:"Cagliari",  citta:["Cagliari","Quartu S.E."]},
      {nome:"Nuoro",        cap:"Nuoro",     citta:["Nuoro"]},
      {nome:"Oristano",     cap:"Oristano",  citta:["Oristano"]},
      {nome:"Sassari",      cap:"Sassari",   citta:["Sassari","Alghero","Porto Torres"]},
      {nome:"Sud Sardegna", cap:"Carbonia",  citta:["Carbonia","Iglesias"]},
    ]},
  ],
};

// ─── HTML ────────────────────────────────────────────────────
function wmapBodyHTML(id) {
  return `
    <div class="wmap-wrap" id="wmapwrap${id}">
      <div class="wmap-left" id="wmapleft${id}">
        <div class="wmap-info-top">
          <div class="wmap-info-hint" id="wmaphint${id}">
            Clicca su una regione per i dettagli
          </div>
          <div class="wmap-info-content" id="wmapinfo${id}" style="display:none"></div>
        </div>
      </div>
      <div class="wmap-right" id="wmapright${id}">
        <div class="wmap-topbar">
          <div class="wmap-breadcrumb" id="wmapbread${id}">ITALIA</div>
          <button class="wmap-back-btn" id="wmapback${id}" style="display:none">← Indietro</button>
        </div>
        <div class="wmap-area" id="wmaparea${id}">
          <svg class="wmap-svg" id="wmapsvg${id}" xmlns="http://www.w3.org/2000/svg"></svg>
          <div class="wmap-loading" id="wmapload${id}">
            <span class="wmap-loading-text">Caricamento mappa…</span>
          </div>
        </div>
      </div>
    </div>`;
}

// ─── Init ────────────────────────────────────────────────────
function initWMap(id) {
  const w = WINS[id];
  if (!w || w.type !== 'wmap') return;

  w.wmapState = {
    level:    'italia',  // 'italia' | 'regione'
    regName:  null,      // name lowercase da stefanocudini
    regColor: null,      // hex color della regione
  };

  document.getElementById('wmapback' + id)
    ?.addEventListener('click', () => _wmapGoBack(id));

  const area = document.getElementById('wmaparea' + id);
  if (area) {
    const ro = new ResizeObserver(() => { if (WINS[id]) _wmapRender(id); });
    ro.observe(area);
    w._wmapRo = ro;
  }

  w._wmapDispose = () => {
    w._wmapRo?.disconnect();
    w._wmapRo  = null;
    w.wmapState = null;
  };

  _wmapLoadItalia(id);
}

// ─── Caricamento dati Italia (regioni) ───────────────────────
async function _wmapLoadItalia(id) {
  const loadEl = document.getElementById('wmapload' + id);
  if (loadEl) loadEl.style.display = 'flex';

  try {
    if (!_WMAP_REGIONS) {
      const r = await fetch(_WMAP_URL_REG);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      _WMAP_REGIONS = await r.json();
    }
  } catch (e) {
    if (loadEl) {
      loadEl.style.display = 'flex';
      loadEl.innerHTML = '<span class="wmap-loading-text">⚠ Mappa non disponibile — verifica la connessione.</span>';
    }
    return;
  }

  if (!WINS[id]) return;
  if (loadEl) loadEl.style.display = 'none';
  _wmapRender(id);
}

// ─── Render principale ───────────────────────────────────────
function _wmapRender(id) {
  const w = WINS[id];
  if (!w?.wmapState) return;

  const svg  = document.getElementById('wmapsvg' + id);
  const area = document.getElementById('wmaparea' + id);
  if (!svg || !area) return;

  const W = area.offsetWidth  || 580;
  const H = area.offsetHeight || 480;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width',  W);
  svg.setAttribute('height', H);
  svg.innerHTML = '';

  const { level, regName } = w.wmapState;

  if (level === 'italia' && _WMAP_REGIONS) {
    _wmapDrawItalia(id, svg, W, H);
  } else if (level === 'regione' && _WMAP_PROVINCES && regName) {
    _wmapDrawRegione(id, svg, W, H);
  }
}

// ─── Disegna Italia con 20 regioni ───────────────────────────
function _wmapDrawItalia(id, svg, W, H) {
  const features = _WMAP_REGIONS.features;
  const proj = _wmapMakeProj(features, W, H, 16);

  features.forEach((feat, i) => {
    const color   = WMAP_REG_COLORS[i % WMAP_REG_COLORS.length];
    // stefanocudini: feat.properties.name = "piemonte" (lowercase)
    const regName = feat.properties.name || feat.properties.reg_name || String(i);
    const label   = _WMAP_DISPLAY[regName] || regName;

    const d = _wmapGeoToPath(feat.geometry, proj);
    if (!d) return;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', color);
    path.setAttribute('stroke', 'var(--win-bg)');
    path.setAttribute('stroke-width', '1.2');
    path.setAttribute('class', 'wmap-region');
    path.style.cursor = 'pointer';
    path.style.transition = 'filter .12s';

    path.addEventListener('mouseenter', () => {
      path.style.filter = 'brightness(1.55)';
    });
    path.addEventListener('mouseleave', () => {
      path.style.filter = '';
    });
    path.addEventListener('click', () =>
      _wmapClickRegion(id, regName, color)
    );
    svg.appendChild(path);

    // Label regione (nome breve centrato)
    const c = _wmapCentroid(feat.geometry, proj);
    if (c) {
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', c[0]);
      txt.setAttribute('y', c[1] + 4);
      txt.setAttribute('class', 'wmap-label');
      txt.setAttribute('pointer-events', 'none');
      txt.textContent = _wmapShortName(label, 11);
      svg.appendChild(txt);
    }
  });
}

// ─── Click su regione: carica province e fa drill-down ───────
async function _wmapClickRegion(id, regName, regColor) {
  const w = WINS[id];
  if (!w?.wmapState) return;

  // Mostra info regione nel pannello sinistro
  _wmapShowRegInfo(id, regName);

  const loadEl = document.getElementById('wmapload' + id);

  if (!_WMAP_PROVINCES) {
    if (loadEl) { loadEl.innerHTML = '<span class="wmap-loading-text">Caricamento province…</span>'; loadEl.style.display = 'flex'; }
    try {
      const r = await fetch(_WMAP_URL_PRO);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      _WMAP_PROVINCES = await r.json();
    } catch (e) {
      if (loadEl) { loadEl.innerHTML = '<span class="wmap-loading-text">⚠ Province non disponibili.</span>'; }
      setTimeout(() => { if (loadEl) loadEl.style.display = 'none'; }, 3000);
      return;
    }
    if (!WINS[id]) return;
    if (loadEl) loadEl.style.display = 'none';
  }

  w.wmapState.level    = 'regione';
  w.wmapState.regName  = regName;
  w.wmapState.regColor = regColor;

  const backBtn = document.getElementById('wmapback' + id);
  if (backBtn) backBtn.style.display = 'inline-block';

  _wmapUpdateBreadcrumb(id);
  _wmapRender(id);
}

// ─── Disegna province della regione selezionata ──────────────
function _wmapDrawRegione(id, svg, W, H) {
  const w         = WINS[id];
  const regName   = w.wmapState.regName;
  const baseColor = w.wmapState.regColor || '#1f5c96';

  // Fuzzy match: normalizza sia il nome stefanocudini che il reg_name openpolis
  const normReg = _wmapNorm(regName);
  const features = _WMAP_PROVINCES.features.filter(f => {
    const pn = _wmapNorm(f.properties.reg_name);
    return pn === normReg || pn.startsWith(normReg) || normReg.startsWith(pn);
  });
  if (features.length === 0) return;

  const proj = _wmapMakeProj(features, W, H, 24);
  const n    = features.length;

  features.forEach((feat, i) => {
    const color   = _wmapShade(baseColor, i, n);
    const provName = feat.properties.prov_name || feat.properties.name || 'Provincia';

    const d = _wmapGeoToPath(feat.geometry, proj);
    if (!d) return;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', color);
    path.setAttribute('stroke', 'var(--win-bg)');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('class', 'wmap-province');
    path.style.cursor = 'pointer';
    path.style.transition = 'filter .12s';

    path.addEventListener('mouseenter', () => { path.style.filter = 'brightness(1.6)'; });
    path.addEventListener('mouseleave', () => { path.style.filter = ''; });
    path.addEventListener('click', () => _wmapShowProvInfo(id, provName));
    svg.appendChild(path);

    const c = _wmapCentroid(feat.geometry, proj);
    if (c) {
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', c[0]);
      txt.setAttribute('y', c[1] + 4);
      txt.setAttribute('class', 'wmap-label');
      txt.setAttribute('pointer-events', 'none');
      txt.textContent = _wmapShortName(provName, 10);
      svg.appendChild(txt);
    }
  });
}

// ─── Torna alla vista Italia ─────────────────────────────────
function _wmapGoBack(id) {
  const w = WINS[id];
  if (!w?.wmapState) return;
  w.wmapState.level    = 'italia';
  w.wmapState.regName  = null;
  w.wmapState.regColor = null;

  document.getElementById('wmapback' + id).style.display = 'none';

  // Reset pannello info
  document.getElementById('wmaphint' + id).style.display = 'block';
  const infoEl = document.getElementById('wmapinfo' + id);
  if (infoEl) { infoEl.style.display = 'none'; infoEl.innerHTML = ''; }

  _wmapUpdateBreadcrumb(id);
  _wmapRender(id);
}

// ─── Pannello info — Regione ──────────────────────────────────
function _wmapShowRegInfo(id, regName) {
  const hint   = document.getElementById('wmaphint' + id);
  const infoEl = document.getElementById('wmapinfo' + id);
  if (!infoEl) return;

  if (hint) hint.style.display = 'none';

  // regName è lowercase (stefanocudini); ITALIA_DATA.geo è proper-case → match fuzzy
  const normKey = _wmapNorm(regName);
  const data  = ITALIA_DATA.regioni.find(r => _wmapNorm(r.geo).startsWith(normKey) || normKey.startsWith(_wmapNorm(r.geo)));
  const label = _WMAP_DISPLAY[regName] || regName;

  let html = `<div class="wmap-info-name">${label}</div>`;
  if (data) {
    html += `<div class="wmap-info-cap">Capoluogo: <strong>${data.cap}</strong></div>`;
    html += `<div class="wmap-info-sec">Province (${data.province.length})</div>`;
    html += '<ul class="wmap-info-list">';
    data.province.forEach(p => {
      html += `<li class="wmap-info-item">
        <span class="wmap-info-prov">${p.nome}</span>
        <span class="wmap-info-subcap">${p.cap}</span>
      </li>`;
    });
    html += '</ul>';
  }
  html += `<div class="wmap-info-hint-small">← Clicca una provincia per i dettagli</div>`;

  infoEl.innerHTML = html;
  infoEl.style.display = 'block';
}

// ─── Pannello info — Provincia ────────────────────────────────
function _wmapShowProvInfo(id, provName) {
  const infoEl = document.getElementById('wmapinfo' + id);
  if (!infoEl) return;

  const w       = WINS[id];
  const regName = w?.wmapState?.regName || '';
  const normKey = _wmapNorm(regName);
  const regData = ITALIA_DATA.regioni.find(r =>
    _wmapNorm(r.geo).startsWith(normKey) || normKey.startsWith(_wmapNorm(r.geo))
  );
  const provData = regData?.province.find(p =>
    provName.toLowerCase().includes(p.nome.toLowerCase()) ||
    p.nome.toLowerCase().includes(provName.toLowerCase().split(/[\s\-]/)[0])
  );

  const label = _WMAP_DISPLAY[regName] || regName;
  let html = `<div class="wmap-info-name">${provName}</div>`;
  html += `<div class="wmap-info-cap wmap-info-region-back" id="wmapregback${id}">↩ ${label}</div>`;
  if (provData) {
    html += `<div class="wmap-info-cap">Capoluogo: <strong>${provData.cap}</strong></div>`;
    html += `<div class="wmap-info-sec">Comuni principali</div>`;
    html += '<ul class="wmap-info-list">';
    provData.citta.forEach(c => { html += `<li class="wmap-info-item">${c}</li>`; });
    html += '</ul>';
  }

  infoEl.innerHTML = html;

  // Click "↩ RegioneName" → mostra di nuovo info regione
  document.getElementById('wmapregback' + id)?.addEventListener('click', () =>
    _wmapShowRegInfo(id, regName)
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────
function _wmapUpdateBreadcrumb(id) {
  const w  = WINS[id];
  const el = document.getElementById('wmapbread' + id);
  if (!el || !w?.wmapState) return;
  const { level, regName } = w.wmapState;
  if (level === 'italia') {
    el.textContent = 'ITALIA';
  } else {
    const label = _WMAP_DISPLAY[regName] || regName || '';
    el.textContent = 'ITALIA › ' + label.toUpperCase();
  }
}

// ─── Proiezione equirettangolare ─────────────────────────────
function _wmapMakeProj(features, W, H, padding) {
  let x0 =  Infinity, x1 = -Infinity;
  let y0 =  Infinity, y1 = -Infinity;

  function scan(c) {
    if (!Array.isArray(c)) return;
    if (typeof c[0] === 'number') {
      x0 = Math.min(x0, c[0]); x1 = Math.max(x1, c[0]);
      y0 = Math.min(y0, c[1]); y1 = Math.max(y1, c[1]);
    } else { c.forEach(scan); }
  }

  features.forEach(f => { if (f.geometry?.coordinates) scan(f.geometry.coordinates); });

  if (!isFinite(x0)) return (lon, lat) => [0, 0];

  const P  = padding;
  const kx = (W - 2 * P) / (x1 - x0 || 1);
  const ky = (H - 2 * P) / (y1 - y0 || 1);
  const k  = Math.min(kx, ky);
  const dx = (W - 2 * P - (x1 - x0) * k) / 2;
  const dy = (H - 2 * P - (y1 - y0) * k) / 2;

  return (lon, lat) => [
    P + dx + (lon - x0) * k,
    H - P - dy - (lat - y0) * k,
  ];
}

// ─── GeoJSON geometry → SVG path d ───────────────────────────
function _wmapGeoToPath(geometry, proj) {
  if (!geometry) return '';
  const ringToD = ring =>
    ring.map((c, i) => {
      const [x, y] = proj(c[0], c[1]);
      return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
    }).join(' ') + ' Z';

  if (geometry.type === 'Polygon')
    return geometry.coordinates.map(ringToD).join(' ');
  if (geometry.type === 'MultiPolygon')
    return geometry.coordinates.map(p => p.map(ringToD).join(' ')).join(' ');
  return '';
}

// ─── Centroide del poligono più grande ───────────────────────
function _wmapCentroid(geometry, proj) {
  if (!geometry) return null;
  let ring;
  if (geometry.type === 'Polygon') {
    ring = geometry.coordinates[0];
  } else if (geometry.type === 'MultiPolygon') {
    ring = geometry.coordinates.reduce(
      (best, p) => p[0].length > best.length ? p[0] : best,
      geometry.coordinates[0][0]
    );
  } else return null;

  let sx = 0, sy = 0;
  ring.forEach(c => { const [x, y] = proj(c[0], c[1]); sx += x; sy += y; });
  return [sx / ring.length, sy / ring.length];
}

// ─── Utilità ─────────────────────────────────────────────────
function _wmapShortName(name, maxLen) {
  if (name.length <= maxLen) return name;
  return name.split(/[\s\/\-]/)[0];
}

function _wmapShade(hex, idx, total) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const f = 0.65 + (idx / Math.max(total - 1, 1)) * 0.7;
  const clamp = v => Math.min(255, Math.max(0, Math.round(v * f)));
  return `#${clamp(r).toString(16).padStart(2,'0')}${clamp(g).toString(16).padStart(2,'0')}${clamp(b).toString(16).padStart(2,'0')}`;
}
