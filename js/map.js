'use strict';
/* ═══════════════════════════════════════════════════════════
   MAP — globo 3D interattivo con pin-coordinate
   Dipende da: Three.js (CDN), topojson-client (CDN), window-manager.js
   ═══════════════════════════════════════════════════════════ */

const MAP_R = 155; // raggio sfera globo
// Autoplay: dopo questo intervallo (ms) senza interazione il globo ruota
// Velocità è in radianti per millisecondo (usata in animate)
// Regolare per aumentare/diminuire velocità

// ── palette pin ──────────────────────────────────────────
const PIN_COLORS = [
  0x63b3ff, 0xa78bfa, 0x34d399,
  0xfbbf24, 0xfb923c, 0xec4899,
];
let pinColorIdx = 0;

// ── città principali per i 6 paesi target ─────────────────
// formato: [lat, lon, nome, paese]
const MAP_CITIES = [
  // ITALY
  [41.90, 12.49,'Roma','IT'],[45.46, 9.19,'Milano','IT'],[40.85,14.27,'Napoli','IT'],
  [45.07, 7.69,'Torino','IT'],[38.11,13.36,'Palermo','IT'],[44.41, 8.93,'Genova','IT'],
  [44.49,11.34,'Bologna','IT'],[43.77,11.25,'Firenze','IT'],[41.12,16.87,'Bari','IT'],
  [37.50,15.09,'Catania','IT'],[45.44,12.32,'Venezia','IT'],[45.44,10.99,'Verona','IT'],
  [38.19,15.55,'Messina','IT'],[45.41,11.88,'Padova','IT'],[45.65,13.78,'Trieste','IT'],
  [40.47,17.23,'Taranto','IT'],[45.54, 9.70,'Brescia','IT'],[38.11,15.65,'Reggio C.','IT'],
  [44.65,10.93,'Modena','IT'],[44.80,10.33,'Parma','IT'],[44.70,10.63,'Reggio E.','IT'],
  [43.88,11.10,'Prato','IT'],[43.11,12.39,'Perugia','IT'],[43.55, 10.31,'Livorno','IT'],
  [39.22, 9.12,'Cagliari','IT'],[44.42,12.20,'Ravenna','IT'],[44.06,12.57,'Rimini','IT'],
  [45.58, 9.27,'Monza','IT'],[37.08,15.29,'Siracusa','IT'],[40.68,14.76,'Salerno','IT'],
  [45.69, 9.67,'Bergamo','IT'],[42.46,14.22,'Pescara','IT'],[40.35,18.17,'Lecce','IT'],
  [44.22,12.04,'Forlì','IT'],[45.55,11.55,'Vicenza','IT'],[42.56,12.65,'Terni','IT'],
  [40.73, 8.56,'Sassari','IT'],[46.07,11.12,'Trento','IT'],[44.84,11.62,'Ferrara','IT'],
  [41.47,12.90,'Latina','IT'],[41.02,14.23,'Giugliano','IT'],[46.50,11.35,'Bolzano','IT'],
  [41.22,16.30,'Andria','IT'],[41.46,15.56,'Foggia','IT'],[44.51, 8.74,'La Spezia','IT'],
  [43.62,13.52,'Ancona','IT'],[43.46,11.88,'Arezzo','IT'],[45.45, 8.62,'Novara','IT'],

  // UK
  [51.51, -0.13,'London','GB'],[52.48, -1.90,'Birmingham','GB'],[53.80, -1.55,'Leeds','GB'],
  [55.86, -4.25,'Glasgow','GB'],[53.38, -1.47,'Sheffield','GB'],[53.80, -1.75,'Bradford','GB'],
  [55.95, -3.19,'Edinburgh','GB'],[53.41, -2.98,'Liverpool','GB'],[51.45, -2.59,'Bristol','GB'],
  [51.48, -3.18,'Cardiff','GB'],[52.41, -1.51,'Coventry','GB'],[52.95, -1.14,'Nottingham','GB'],
  [52.63, -1.13,'Leicester','GB'],[54.91, -1.38,'Sunderland','GB'],[54.60, -5.93,'Belfast','GB'],
  [50.83, -0.14,'Brighton','GB'],[53.74, -0.34,'Hull','GB'],[50.37, -4.14,'Plymouth','GB'],
  [53.00, -2.18,'Stoke','GB'],[52.59, -2.11,'Wolverhampton','GB'],[52.92, -1.48,'Derby','GB'],
  [50.90, -1.40,'Southampton','GB'],[54.97, -1.61,'Newcastle','GB'],[51.62, -3.94,'Swansea','GB'],
  [54.58, -1.23,'Middlesbrough','GB'],[51.56, -1.78,'Swindon','GB'],[50.80, -1.09,'Portsmouth','GB'],
  [52.04, -0.76,'Milton K.','GB'],[53.48, -2.24,'Manchester','GB'],[57.15, -2.11,'Aberdeen','GB'],
  [52.20, 0.12,'Cambridge','GB'],[50.72, -3.53,'Exeter','GB'],[51.75, -1.26,'Oxford','GB'],

  // GERMANY
  [52.52, 13.41,'Berlin','DE'],[53.55, 10.00,'Hamburg','DE'],[48.14, 11.58,'München','DE'],
  [50.94,  6.96,'Köln','DE'],[50.11,  8.68,'Frankfurt','DE'],[48.78,  9.18,'Stuttgart','DE'],
  [51.23,  6.79,'Düsseldorf','DE'],[51.34, 12.38,'Leipzig','DE'],[51.51,  7.46,'Dortmund','DE'],
  [51.45,  7.01,'Essen','DE'],[53.08,  8.81,'Bremen','DE'],[51.05, 13.74,'Dresden','DE'],
  [52.37,  9.74,'Hannover','DE'],[49.45, 11.08,'Nürnberg','DE'],[51.43,  6.76,'Duisburg','DE'],
  [51.48,  7.22,'Bochum','DE'],[51.27,  7.19,'Wuppertal','DE'],[52.02,  8.53,'Bielefeld','DE'],
  [50.74,  7.10,'Bonn','DE'],[51.96,  7.63,'Münster','DE'],[49.49,  8.47,'Mannheim','DE'],
  [49.00,  8.40,'Karlsruhe','DE'],[48.37, 10.90,'Augsburg','DE'],[50.08,  8.24,'Wiesbaden','DE'],
  [51.19,  6.44,'Mönchengladbach','DE'],[51.51,  7.10,'Gelsenkirchen','DE'],[50.78,  6.08,'Aachen','DE'],
  [52.27, 10.52,'Braunschweig','DE'],[54.32, 10.14,'Kiel','DE'],[50.83, 12.92,'Chemnitz','DE'],
  [52.13, 11.62,'Magdeburg','DE'],[51.48, 11.97,'Halle','DE'],[51.33,  6.59,'Krefeld','DE'],
  [47.99,  7.84,'Freiburg','DE'],[49.99,  8.27,'Mainz','DE'],[53.87, 10.69,'Lübeck','DE'],
  [50.98, 11.03,'Erfurt','DE'],[51.47,  6.86,'Oberhausen','DE'],[54.09, 12.14,'Rostock','DE'],
  [51.32,  9.50,'Kassel','DE'],[51.36,  7.47,'Hagen','DE'],[51.68,  7.82,'Hamm','DE'],
  [49.24,  7.00,'Saarbrücken','DE'],[51.43,  6.88,'Mülheim','DE'],[52.39, 13.06,'Potsdam','DE'],

  // FRANCE
  [48.85, 2.35,'Paris','FR'],[43.30, 5.37,'Marseille','FR'],[45.75, 4.83,'Lyon','FR'],
  [43.60, 1.44,'Toulouse','FR'],[43.71, 7.26,'Nice','FR'],[47.22,-1.55,'Nantes','FR'],
  [43.61, 3.88,'Montpellier','FR'],[48.58, 7.75,'Strasbourg','FR'],[44.84,-0.58,'Bordeaux','FR'],
  [50.63, 3.06,'Lille','FR'],[48.11,-1.68,'Rennes','FR'],[49.26, 4.03,'Reims','FR'],
  [45.43, 4.39,'Saint-Étienne','FR'],[49.49, 0.11,'Le Havre','FR'],[43.12, 5.93,'Toulon','FR'],
  [45.19, 5.72,'Grenoble','FR'],[47.32, 5.04,'Dijon','FR'],[47.47,-0.55,'Angers','FR'],
  [43.84, 4.36,'Nîmes','FR'],[45.77, 4.88,'Villeurbanne','FR'],[45.78, 3.08,'Clermont-F.','FR'],
  [47.99, 0.20,'Le Mans','FR'],[43.53, 5.45,'Aix-en-P.','FR'],[48.39,-4.49,'Brest','FR'],
  [47.39, 0.69,'Tours','FR'],[49.89, 2.30,'Amiens','FR'],[45.85, 1.26,'Limoges','FR'],
  [42.70, 2.90,'Perpignan','FR'],[49.12, 6.18,'Metz','FR'],[47.24, 6.02,'Besançon','FR'],

  // USA
  [40.71,-74.01,'New York','US'],[34.05,-118.24,'Los Angeles','US'],[41.85,-87.65,'Chicago','US'],
  [29.76,-95.37,'Houston','US'],[33.45,-112.07,'Phoenix','US'],[39.95,-75.17,'Philadelphia','US'],
  [29.42,-98.49,'San Antonio','US'],[32.72,-117.15,'San Diego','US'],[32.79,-96.80,'Dallas','US'],
  [37.34,-121.89,'San Jose','US'],[30.27,-97.74,'Austin','US'],[30.33,-81.66,'Jacksonville','US'],
  [37.77,-122.42,'San Francisco','US'],[39.96,-82.99,'Columbus','US'],[35.23,-80.84,'Charlotte','US'],
  [39.77,-86.16,'Indianapolis','US'],[47.61,-122.33,'Seattle','US'],[39.74,-104.98,'Denver','US'],
  [38.89,-77.03,'Washington','US'],[36.17,-86.78,'Nashville','US'],[35.47,-97.52,'Oklahoma C.','US'],
  [31.76,-106.49,'El Paso','US'],[42.36,-71.06,'Boston','US'],[45.52,-122.68,'Portland','US'],
  [36.17,-115.14,'Las Vegas','US'],[38.25,-85.76,'Louisville','US'],[35.15,-90.05,'Memphis','US'],
  [39.29,-76.61,'Baltimore','US'],[43.04,-76.14,'Milwaukee','US'],[35.08,-106.65,'Albuquerque','US'],
  [32.22,-110.97,'Tucson','US'],[36.74,-119.77,'Fresno','US'],[38.58,-121.49,'Sacramento','US'],
  [33.42,-111.82,'Mesa','US'],[39.10,-94.58,'Kansas City','US'],[33.75,-84.39,'Atlanta','US'],
  [41.26,-95.94,'Omaha','US'],[38.83,-104.82,'Colorado S.','US'],[35.77,-78.64,'Raleigh','US'],
  [33.77,-118.19,'Long Beach','US'],[36.85,-75.98,'Virginia Bch','US'],[44.98,-93.27,'Minneapolis','US'],
  [27.95,-82.46,'Tampa','US'],[29.95,-90.07,'New Orleans','US'],[32.70,-97.13,'Arlington','US'],
  [21.31,-157.86,'Honolulu','US'],[33.84,-117.91,'Anaheim','US'],[39.73,-104.83,'Aurora','US'],

  // CHINA
  [31.23,121.47,'Shanghai','CN'],[39.90,116.40,'Beijing','CN'],[23.13,113.27,'Guangzhou','CN'],
  [22.55,114.06,'Shenzhen','CN'],[39.13,117.20,'Tianjin','CN'],[30.59,114.31,'Wuhan','CN'],
  [23.02,113.75,'Dongguan','CN'],[30.66,104.07,'Chengdu','CN'],[32.05,118.77,'Nanjing','CN'],
  [29.56,106.55,'Chongqing','CN'],[34.27,108.93,'Xi\'an','CN'],[41.80,123.43,'Shenyang','CN'],
  [30.25,120.16,'Hangzhou','CN'],[45.75,126.63,'Harbin','CN'],[31.30,120.59,'Suzhou','CN'],
  [36.07,120.38,'Qingdao','CN'],[38.91,121.60,'Dalian','CN'],[34.76,113.67,'Zhengzhou','CN'],
  [36.67,116.99,'Jinan','CN'],[43.88,125.33,'Changchun','CN'],[25.05,102.71,'Kunming','CN'],
  [28.23,112.94,'Changsha','CN'],[28.00,120.67,'Wenzhou','CN'],[26.08,119.30,'Fuzhou','CN'],
  [28.68,115.88,'Nanchang','CN'],[38.04,114.47,'Shijiazhuang','CN'],[37.87,112.55,'Taiyuan','CN'],
  [26.57,106.71,'Guiyang','CN'],[43.82, 87.61,'Ürümqi','CN'],[40.84,111.75,'Hohhot','CN'],
  [22.82,108.32,'Nanning','CN'],[31.86,117.28,'Hefei','CN'],[31.57,120.29,'Wuxi','CN'],
  [23.02,113.13,'Foshan','CN'],[36.82,118.06,'Zibo','CN'],[29.86,121.55,'Ningbo','CN'],
  [37.46,121.45,'Yantai','CN'],[39.63,118.18,'Tangshan','CN'],[31.98,120.89,'Nantong','CN'],
  [34.26,117.19,'Xuzhou','CN'],[31.77,119.97,'Changzhou','CN'],[36.06,103.79,'Lanzhou','CN'],
];

// ─── HTML struttura finestra mappa ──────────────────────────

function mapBodyHTML(id) {
  /**
   * Restituisce l'HTML della finestra mappa per l'id fornito.
   * Usata da `createWin` per popolare il contenuto della finestra.
   */
  return `
    <div class="map-wrap" id="mapwrap${id}">
      <div class="map-left">
        <div class="map-layers">
          <div class="map-layers-lbl">Layer:</div>
          <select class="map-layers-select" id="map-layer-sel${id}"></select>
          <button class="map-layer-add-btn" id="map-layer-add${id}">+</button>
        </div>
        <div class="map-coord-form">
          <div class="map-coord-row">
            <span class="map-coord-lbl">LAT</span>
            <input class="map-coord-inp" id="maplat${id}" type="number"
              step="0.0001" min="-90" max="90" placeholder="0.0000">
          </div>
          <div class="map-coord-row">
            <span class="map-coord-lbl">LON</span>
            <input class="map-coord-inp" id="maplon${id}" type="number"
              step="0.0001" min="-180" max="180" placeholder="0.0000">
          </div>
          <button class="map-add-btn" id="mapadd${id}">+ Aggiungi pin</button>
        </div>
        <div class="map-pin-list" id="mappropins${id}"></div>
      </div>
      <div class="map-globe" id="mapglobe${id}">
        
        <div class="map-globe-hint">drag → ruota · scroll → zoom · click → pin</div>
        <div class="map-popup" id="mappopup${id}">
          <div class="map-popup-hdr">
            <input class="map-popup-title-inp" id="mapptitle${id}" placeholder="Titolo pin…">
            <button class="map-popup-close" id="mappclose${id}">✕</button>
          </div>
          <div class="map-popup-coords" id="mappcoords${id}"></div>
          <textarea class="map-popup-note" id="mappnote${id}" placeholder="Note…"></textarea>
        </div>
      </div>
    </div>`;
}

// ─── Init mappa ─────────────────────────────────────────────

function initMap(id) {
  /**
   * Inizializza la mappa per la finestra `id`:
   * - imposta stato iniziale
   * - collega i controlli DOM
   * - crea la scena 3D
   */
  const w = WINS[id];
  if (!w || w.type !== 'map') return;
  if (!w.pins) w.pins = [];
  w.mapState = { activePopupPin: null, activeLayer: 'Tutti' };
  
  // inizializza mapLayers se non esiste
  if (!w.mapLayers) {
    w.mapLayers = {
      'Tutti': { color: 0xcccccc, visible: true },
    };
  }

  // pulsante aggiungi pin
  document.getElementById('mapadd' + id).onclick = () => {
    const lat = parseFloat(document.getElementById('maplat' + id).value);
    const lon = parseFloat(document.getElementById('maplon' + id).value);
    if (isNaN(lat) || isNaN(lon)) return;
    addMapPin(id, lat, lon, 'Nuovo pin', '');
  };

  // chiudi popup
  document.getElementById('mappclose' + id).onclick = () => closeMapPopup(id);

  // layer dropdown: aggiorna quando cambia
  const layerSel = document.getElementById('map-layer-sel' + id);
  layerSel.addEventListener('change', () => switchMapLayer(id, layerSel.value));

  // bottone nuovo layer
  document.getElementById('map-layer-add' + id).onclick = () => {
    const name = prompt('Nome nuovo layer:', '');
    if (name && name.trim()) {
      addMapLayer(id, name.trim(), 0x63b3ff);
      renderLayerList(id);
    }
  };

  // renderizza lista layer
  renderLayerList(id);

  createGlobeScene(id);

  // pin di default se la lista è vuota
  if (w.pins.length === 0) {
    addMapPin(id, 41.90, 12.49, 'Roma', 'Pin di esempio — modifica o cancella.');
  }
}

// ─── Scena Three.js ─────────────────────────────────────────

/**
 * Crea la scena Three.js per il globo nella finestra `id`.
 * Imposta renderer, camera, luci, sfera oceano, atmosfera, gruppi per layer
 * e i listeners per interazione (drag/zoom/click). Inoltre gestisce il
 * loop di render e un meccanismo di autoplay che avvia la rotazione dopo
 * un periodo di inattività.
 */
function createGlobeScene(id) {
  const container = document.getElementById('mapglobe' + id);
  if (!container || !window.THREE) return;

  const W = container.offsetWidth  || 600;
  const H = container.offsetHeight || 400;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.insertBefore(renderer.domElement, container.firstChild);

  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const sun = new THREE.DirectionalLight(0x88bbff, 1.2);
  sun.position.set(300, 200, 400);
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(45, W / H, 1, 3000);
  let camR = 420, theta = 0.18, phi = 1.22; // mostra Europa

  // autoplay settings (locali alla scena)
  const AUTO_SPIN_DELAY = 120000; // 2 minuti
  const AUTO_SPIN_SPEED = 0.00001; // radianti per ms (~0.57°/s)

  function setCamera() {
    camera.position.set(
      camR * Math.sin(phi) * Math.cos(theta),
      camR * Math.cos(phi),
      camR * Math.sin(phi) * Math.sin(theta)
    );
    camera.lookAt(0, 0, 0);
  }
  setCamera();

  // ── sfera ocean ──
  // aumento dettaglio sfera per migliorare resa visiva
  const ocean = new THREE.Mesh(
    new THREE.SphereGeometry(MAP_R, 128, 128),
    new THREE.MeshPhongMaterial({ color: 0x07111e, shininess: 20, transparent: true, opacity: 0.92 })
  );
  scene.add(ocean);

  // ── atmosfera glow ──
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(MAP_R + 3, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x1a3a6a, transparent: true, opacity: 0.18, side: THREE.BackSide })
  );
  scene.add(atmo);

  // gruppo per i layer geografici + pin
  const geoGroup  = new THREE.Group();
  const pinGroup  = new THREE.Group();
  const cityGroup = new THREE.Group();
  scene.add(geoGroup);
  scene.add(cityGroup);
  scene.add(pinGroup);

  // salva refs per uso futuro
  const w = WINS[id];
  if (!w) return;
  w._mapScene   = { renderer, scene, camera, geoGroup, pinGroup, cityGroup, setCamera };
  w._pinMeshMap = {}; // pinId → { mesh, ring }

  // ── griglia lat/lon leggera ──
  const gridMat = new THREE.LineBasicMaterial({ color: 0x112244, transparent: true, opacity: 0.4 });
  for (let lat = -80; lat <= 80; lat += 20) {
    const pts = [];
    for (let lon = -180; lon <= 180; lon += 4) pts.push(latLonToVec3(lat, lon, MAP_R + 0.3));
    geoGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
  }
  for (let lon = -180; lon < 180; lon += 30) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += 4) pts.push(latLonToVec3(lat, lon, MAP_R + 0.3));
    geoGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
  }

  // ── carica bordi paesi da CDN ──
  // usa versione più dettagliata dei bordi (50m) per maggior risoluzione
  loadCountryBorders(geoGroup, 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');

  // ── punti città ──
  renderCities(cityGroup);

  // ── render pin già esistenti ──
  w.pins.forEach(pin => addPinMesh(id, pin));
  renderPinList(id);

  // ── controlli mouse ──
  const el = renderer.domElement;
  let dragging = false, lx = 0, ly = 0, moved = 0;

  el.addEventListener('mousedown', e => {
    dragging = true; lx = e.clientX; ly = e.clientY; moved = 0;
    container.classList.add('spinning'); e.stopPropagation();
    // interazione umana -> disabilita autoplay temporaneamente
    const w = WINS[id]; if (w?.mapState) { w.mapState.autoSpin = false; w.mapState.lastInteraction = Date.now(); disableAutoSpin(id); }
  });

  const onMove = e => {
    if (!dragging) return;
    const dx = e.clientX - lx, dy = e.clientY - ly;
    theta += dx * .005;
    phi = Math.max(0.08, Math.min(Math.PI - 0.08, phi - dy * .005));
    lx = e.clientX; ly = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    setCamera();
    const w = WINS[id]; if (w?.mapState) w.mapState.lastInteraction = Date.now();
  };

  const onUp = e => {
    if (!dragging) return;
    dragging = false; container.classList.remove('spinning');
    if (moved < 5) {
      handleGlobeClick(id, e, renderer.domElement, camera);
    }
    // riprogramma autoplay dopo interazione
    const w = WINS[id]; if (w?.mapState) { w.mapState.lastInteraction = Date.now(); scheduleAutoSpin(id); }
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);


  //zoom for the mouse, the .X is the mult, range: 0.6-0.1
  el.addEventListener('wheel', e => {
    e.preventDefault(); e.stopPropagation();
    camR = Math.max(180, Math.min(900, camR + e.deltaY * .2));
    setCamera();
    const w = WINS[id]; if (w?.mapState) { w.mapState.lastInteraction = Date.now(); w.mapState.autoSpin = false; disableAutoSpin(id); scheduleAutoSpin(id); }
  }, { passive: false });

  // ── resize ──
  const ro = new ResizeObserver(() => {
    if (!WINS[id]) return;
    const nw = container.offsetWidth, nh = container.offsetHeight;
    if (!nw || !nh) return;
    renderer.setSize(nw, nh);
    camera.aspect = nw / nh; camera.updateProjectionMatrix();
  });
  ro.observe(container);

  // ── loop render ──
  // time-based animate: gestisce anche autoplay incrementando `theta`
  let rafId;
  let firstFrame = true;
  let prevT = performance.now();
  function animate() {
    if (!WINS[id]) return;
    if (firstFrame) {
      firstFrame = false;
      const loadEl = document.getElementById('mapload' + id);
      if (loadEl) loadEl.style.display = 'none';
    }
    const now = performance.now();
    const dt = now - prevT; prevT = now;
    const w = WINS[id];
    // autoplay: ruota lentamente quando abilitato e l'utente non sta trascinando
    if (w?.mapState?.autoSpin && !dragging && !w.mapState.activePopupPin) {
      theta += dt * AUTO_SPIN_SPEED;
      setCamera();
      container.classList.add('autospin');
    } else {
      container.classList.remove('autospin');
    }
    rafId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  rafId = requestAnimationFrame(animate);

  // auto-spin management helpers
  function scheduleAutoSpin(winId) {
    const w2 = WINS[winId]; if (!w2) return;
    if (!w2.mapState) w2.mapState = {};
    if (w2._mapAutoSpinTimer) clearTimeout(w2._mapAutoSpinTimer);
    w2._mapAutoSpinTimer = setTimeout(() => {
      w2.mapState.autoSpin = true;
      w2.mapState.lastInteraction = Date.now();
    }, AUTO_SPIN_DELAY);
  }
  function disableAutoSpin(winId) {
    const w2 = WINS[winId]; if (!w2) return;
    w2.mapState.autoSpin = false;
    if (w2._mapAutoSpinTimer) { clearTimeout(w2._mapAutoSpinTimer); w2._mapAutoSpinTimer = null; }
  }
  // inizializza stato di autoplay
  const wState = WINS[id]; if (wState && !wState.mapState) wState.mapState = { activePopupPin: null };
  scheduleAutoSpin(id);

  // dispose
  w._mapDispose = () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    renderer.dispose();
    el.remove();
    // pulisci timer autoplay
    const w3 = WINS[id]; if (w3 && w3._mapAutoSpinTimer) { clearTimeout(w3._mapAutoSpinTimer); w3._mapAutoSpinTimer = null; }
  };
}

// ─── Coordinate math ────────────────────────────────────────

function latLonToVec3(lat, lon, r) {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = lon         * (Math.PI / 180);
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function vec3ToLatLon(v, r) {
  const lat = 90 - Math.acos(Math.max(-1, Math.min(1, v.y / r))) * (180 / Math.PI);
  const lon = Math.atan2(v.z, v.x) * (180 / Math.PI);
  return { lat: Math.round(lat * 10000) / 10000, lon: Math.round(lon * 10000) / 10000 };
}

// ─── Carica bordi paesi (TopoJSON da CDN) ───────────────────

// `url` opzionale permette di specificare la risoluzione (es. countries-50m.json)
async function loadCountryBorders(group, url = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json') {
  try {
    const [worldRes] = await Promise.all([
      fetch(url),
    ]);
    const world = await worldRes.json();
    if (typeof topojson === 'undefined') return;

    const borderMat  = new THREE.LineBasicMaterial({ color: 0x2d5499, transparent: true, opacity: 0.75 });
    const geojson    = topojson.mesh(world, world.objects.countries);

    // mesh ritorna un unico MultiLineString con tutti i bordi
    drawGeoLines(group, geojson, MAP_R + 0.5, borderMat);
  } catch (e) {
    console.warn('[map] Bordi paesi non caricati:', e.message);
  }
}

function drawGeoLines(group, geom, r, mat) {
  if (!geom) return;
  const process = coords => {
    const pts = coords.map(([lon, lat]) => latLonToVec3(lat, lon, r));
    // interrompe linee che attraversano l'antimeridiano
    const segments = [];
    let seg = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      if (pts[i].distanceTo(pts[i-1]) > r * 0.5) {
        segments.push(seg); seg = [];
      }
      seg.push(pts[i]);
    }
    segments.push(seg);
    segments.forEach(s => {
      if (s.length >= 2)
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(s), mat));
    });
  };

  if (geom.type === 'LineString') {
    process(geom.coordinates);
  } else if (geom.type === 'MultiLineString') {
    geom.coordinates.forEach(process);
  }
}

// ─── Punti città ─────────────────────────────────────────────

function renderCities(group) {
  const geo = new THREE.SphereGeometry(0.9, 5, 5);
  const mat = new THREE.MeshBasicMaterial({ color: 0x4a6fa5, transparent: true, opacity: 0.7 });
  
}

// ─── Gestione layer ─────────────────────────────────────────

function addMapLayer(id, name, color) {
  const w = WINS[id];
  if (!w) return;
  if (!w.mapLayers) w.mapLayers = { 'Tutti': { color: 0xcccccc, visible: true } };
  if (w.mapLayers[name]) return; // layer già esiste
  w.mapLayers[name] = { color, visible: true };
  if (window.persistState) window.persistState();
}

function removeMapLayer(id, name) {
  const w = WINS[id];
  if (!w || !w.mapLayers || name === 'Tutti') return; // non rimuovere "Tutti"
  delete w.mapLayers[name];
  // se era il layer attivo, torna a "Tutti"
  if (w.mapState?.activeLayer === name) {
    w.mapState.activeLayer = 'Tutti';
    renderPinList(id);
  }
  if (window.persistState) window.persistState();
}

function switchMapLayer(id, name) {
  const w = WINS[id];
  if (!w || !w.mapLayers || !w.mapLayers[name]) return;
  w.mapState.activeLayer = name;
  renderPinList(id);
  // mostra/nascondi pin mesh in base al layer
  if (w._pinMeshMap) {
    Object.keys(w._pinMeshMap).forEach(pinId => {
      const pin = w.pins.find(p => p.id === pinId);
      if (!pin) return;
      const visible = name === 'Tutti' || pin.layer === name;
      w._pinMeshMap[pinId].mesh.visible = visible;
      w._pinMeshMap[pinId].ring.visible = visible;
    });
  }
  if (window.persistState) window.persistState();
}

function renderLayerList(id) {
  const w = WINS[id];
  if (!w || !w.mapLayers) return;
  const sel = document.getElementById('map-layer-sel' + id);
  if (!sel) return;
  sel.innerHTML = '';
  Object.keys(w.mapLayers).forEach(layerName => {
    const opt = document.createElement('option');
    opt.value = layerName;
    opt.textContent = layerName;
    opt.selected = layerName === w.mapState?.activeLayer;
    sel.appendChild(opt);
  });
}

// ─── Click su globo ─────────────────────────────────────────

function handleGlobeClick(id, e, canvas, camera) {
  const rect  = canvas.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width)  * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  const ray = new THREE.Raycaster();
  ray.setFromCamera(mouse, camera);

  // controlla prima se si clicca un pin
  const w = WINS[id];
  if (!w) return;
  const pinMeshes = Object.values(w._pinMeshMap || {}).map(p => p.mesh);
  const pinHits = ray.intersectObjects(pinMeshes);
  if (pinHits.length > 0) {
    const mesh = pinHits[0].object;
    const pin  = w.pins.find(p => p.id === mesh.userData.pinId);
    if (pin) { openMapPopup(id, pin, e.clientX, e.clientY); return; }
  }

  // click sul globo → pre-compila coordinate
  const globeMesh = w._mapScene?.scene.children.find(
    c => c.type === 'Mesh' && c.geometry?.type === 'SphereGeometry'
  );
  if (!globeMesh) return;
  const globeHit = ray.intersectObject(globeMesh);
  if (globeHit?.length > 0) {
    const { lat, lon } = vec3ToLatLon(globeHit[0].point, MAP_R);
    document.getElementById('maplat' + id).value = lat.toFixed(4);
    document.getElementById('maplon' + id).value = lon.toFixed(4);
  }
}

// ─── Gestione pin ────────────────────────────────────────────

function addMapPin(id, lat, lon, title, note) {
  const w = WINS[id];
  if (!w) return;
  const pin = {
    id:    'pin-' + Date.now(),
    lat:   Math.max(-90,  Math.min(90,  lat)),
    lon:   Math.max(-180, Math.min(180, lon)),
    title: title || 'Pin',
    note:  note  || '',
    color: PIN_COLORS[pinColorIdx++ % PIN_COLORS.length],
    layer: w.mapState?.activeLayer || 'Tutti', // assegna al layer attivo
  };
  w.pins.push(pin);
  addPinMesh(id, pin);
  renderPinList(id);
  if (window.persistState) window.persistState();
}

function addPinMesh(id, pin) {
  const w = WINS[id];
  if (!w?._mapScene) return;
  const { pinGroup } = w._mapScene;

  const col = pin.color || 0x63b3ff;
  const pos = latLonToVec3(pin.lat, pin.lon, MAP_R + 3);

  // sfera pin
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 10, 10),
    new THREE.MeshBasicMaterial({ color: col })
  );
  mesh.position.copy(pos);
  mesh.userData.pinId = pin.id;
  mesh.userData.layer = pin.layer || 'Tutti';
  // visibilità: mostrato se il layer è "Tutti" oppure se è il layer attivo
  const activeLayer = w.mapState?.activeLayer || 'Tutti';
  mesh.visible = activeLayer === 'Tutti' || pin.layer === activeLayer;

  // anello glow
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(4, 6, 20),
    new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  );
  ring.position.copy(pos);
  ring.lookAt(0, 0, 0);
  ring.visible = mesh.visible;

  pinGroup.add(mesh); pinGroup.add(ring);
  if (!w._pinMeshMap) w._pinMeshMap = {};
  w._pinMeshMap[pin.id] = { mesh, ring };
}

function removeMapPin(id, pinId) {
  const w = WINS[id];
  if (!w) return;
  w.pins = w.pins.filter(p => p.id !== pinId);
  const objs = w._pinMeshMap?.[pinId];
  if (objs) {
    w._mapScene.pinGroup.remove(objs.mesh);
    w._mapScene.pinGroup.remove(objs.ring);
    delete w._pinMeshMap[pinId];
  }
  const popup = document.getElementById('mappopup' + id);
  if (popup && w.mapState?.activePopupPin === pinId) closeMapPopup(id);
  renderPinList(id);
  if (window.persistState) window.persistState();
}

// ─── Lista pin nel pannello sinistro ────────────────────────

function renderPinList(id) {
  const w = WINS[id];
  if (!w) return;
  const list = document.getElementById('mappropins' + id);
  if (!list) return;
  list.innerHTML = '';
  
  // filtra pin per layer attivo
  const activeLayer = w.mapState?.activeLayer || 'Tutti';
  const filteredPins = w.pins.filter(p => activeLayer === 'Tutti' || p.layer === activeLayer);
  
  if (filteredPins.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:16px 8px;font-family:Space Mono,monospace;font-size:.58rem;color:#4a5568;text-align:center;';
    empty.textContent = activeLayer === 'Tutti' ? 'Nessun pin.\nInserisci lat/lon\ne premi + Aggiungi.' : 'Nessun pin in questo layer.';
    list.appendChild(empty); return;
  }
  
  filteredPins.forEach(pin => {
    const item = document.createElement('div');
    item.className = 'map-pin-item';

    const dot = document.createElement('div');
    dot.className = 'map-pin-dot';
    dot.style.background = '#' + pin.color.toString(16).padStart(6,'0');

    const info = document.createElement('div');
    info.className = 'map-pin-info';
    const name = document.createElement('div');
    name.className = 'map-pin-name'; name.textContent = pin.title;
    const coords = document.createElement('div');
    coords.className = 'map-pin-coords';
    coords.textContent = `LAT ${pin.lat.toFixed(3)} | LON ${pin.lon.toFixed(3)} | ${pin.layer || 'Tutti'}`;
    info.append(name, coords);

    const del = document.createElement('button');
    del.className = 'map-pin-del'; del.textContent = '✕';
    del.onclick = e => { e.stopPropagation(); removeMapPin(id, pin.id); };

    item.append(dot, info, del);
    item.addEventListener('click', () => {
      // centra il globo sul pin
      const w2 = WINS[id];
      if (w2?._mapScene) {
        const pos = latLonToVec3(pin.lat, pin.lon, 420);
        w2._mapScene.camera.position.copy(pos);
        w2._mapScene.camera.lookAt(0,0,0);
      }
      openMapPopup(id, pin, null, null);
    });
    list.appendChild(item);
  });
}

// ─── Popup popup pin ─────────────────────────────────────────

function openMapPopup(id, pin, screenX, screenY) {
  const popup  = document.getElementById('mappopup' + id);
  const globe  = document.getElementById('mapglobe' + id);
  if (!popup || !globe) return;

  // posizione
  if (screenX !== null && screenY !== null) {
    const gRect = globe.getBoundingClientRect();
    let px = screenX - gRect.left + 12;
    let py = screenY - gRect.top  - 20;
    // evita che esca fuori
    px = Math.min(px, gRect.width  - 240);
    py = Math.max(py, 10);
    popup.style.left = px + 'px';
    popup.style.top  = py + 'px';
  } else {
    popup.style.left = '12px';
    popup.style.top  = '12px';
  }

  document.getElementById('mapptitle' + id).value = pin.title;
  document.getElementById('mapptitle' + id).oninput = () => {
    pin.title = document.getElementById('mapptitle' + id).value;
    renderPinList(id);
    if (window.persistState) window.persistState();
  };
  const noteEl = document.getElementById('mappnote' + id);
  noteEl.value = pin.note;
  noteEl.oninput = () => { pin.note = noteEl.value; if (window.persistState) window.persistState(); };
  document.getElementById('mappcoords' + id).textContent =
    `LAT: ${pin.lat.toFixed(4)}  |  LON: ${pin.lon.toFixed(4)}`;

  // stopPropagation su inputs
  ['mapptitle','mappnote'].forEach(pfx => {
    const el = document.getElementById(pfx + id);
    if (el) { el.onmousedown = e => e.stopPropagation(); el.onkeydown = e => e.stopPropagation(); }
  });

  const w = WINS[id];
  if (w?.mapState) w.mapState.activePopupPin = pin.id;
  popup.classList.add('visible');
}

function closeMapPopup(id) {
  const popup = document.getElementById('mappopup' + id);
  if (popup) popup.classList.remove('visible');
  const w = WINS[id];
  if (w?.mapState) w.mapState.activePopupPin = null;
}
