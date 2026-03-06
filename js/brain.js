'use strict';
/* ═══════════════════════════════════════════════════════════
   BRAIN — cervello 3D interattivo con nodi-pensiero
   Dipende da: Three.js (CDN), window-manager.js
   ═══════════════════════════════════════════════════════════ */

const BRAIN_R = 110; // raggio base cervello

const THOUGHT_COLORS = [
  0x63b3ff, 0xa78bfa, 0x34d399,
  0xfbbf24, 0xfb923c, 0xec4899,
];

// ─── HTML struttura finestra cervello ──────────────────────

function brainBodyHTML(id) {
  return `
    <div class="brain-wrap" id="brainwrap${id}">
      <div class="brain-left">
        <div class="brain-left-title">Pensieri</div>
        <div class="brain-form" id="brainform${id}">
          <div class="brain-form-hint" id="brainhint${id}">
            Clicca sul cervello per posizionare un pensiero
          </div>
          <input class="brain-form-inp" id="braintitle${id}" placeholder="Titolo…" disabled>
          <textarea class="brain-form-ta" id="braincontent${id}" placeholder="Messaggio…" disabled></textarea>
          <button class="brain-form-add" id="brainadd${id}" disabled>+ Aggiungi pensiero</button>
        </div>
        <div class="brain-thought-list" id="brainlist${id}"></div>
      </div>
      <div class="brain-scene" id="brainscene${id}">
        <div class="brain-scene-hint">drag → ruota &nbsp;·&nbsp; scroll → zoom &nbsp;·&nbsp; click → pensiero</div>
        <div class="brain-popup" id="brainpopup${id}" style="display:none">
          <div class="brain-popup-hdr">
            <input class="brain-popup-title-inp" id="brainptitle${id}" placeholder="Titolo…">
            <button class="brain-popup-close" id="brainpclose${id}">✕</button>
          </div>
          <textarea class="brain-popup-note" id="brainpnote${id}" placeholder="Messaggio…"></textarea>
          <button class="brain-popup-del" id="brainpdel${id}">Elimina pensiero</button>
        </div>
      </div>
    </div>`;
}

// ─── Init ───────────────────────────────────────────────────

function initBrain(id) {
  const w = WINS[id];
  if (!w || w.type !== 'brain') return;
  if (!w.thoughts) w.thoughts = [];

  const addBtn    = document.getElementById('brainadd'     + id);
  const titleInp  = document.getElementById('braintitle'   + id);
  const contentTa = document.getElementById('braincontent' + id);
  const hintEl    = document.getElementById('brainhint'    + id);

  w._brainPendingPos = null;

  addBtn.onclick = () => {
    const t = titleInp.value.trim();
    if (!t || !w._brainPendingPos) return;
    const thought = {
      id:      'th-' + Date.now(),
      phi:     w._brainPendingPos.phi,
      theta:   w._brainPendingPos.theta,
      title:   t,
      content: contentTa.value.trim(),
      color:   THOUGHT_COLORS[w.thoughts.length % THOUGHT_COLORS.length],
    };
    w.thoughts.push(thought);
    addThoughtMesh(id, thought);
    renderThoughtList(id);

    // reset form
    titleInp.value  = '';
    contentTa.value = '';
    titleInp.disabled  = true;
    contentTa.disabled = true;
    addBtn.disabled    = true;
    hintEl.textContent = 'Clicca sul cervello per posizionare un pensiero';
    w._brainPendingPos = null;

    if (window.persistState) window.persistState();
  };

  document.getElementById('brainpclose' + id).onclick = () => closeThoughtPopup(id);

  renderThoughtList(id);
  createBrainScene(id);
}

// ─── Scena Three.js ─────────────────────────────────────────

function createBrainScene(id) {
  const container = document.getElementById('brainscene' + id);
  if (!container || !window.THREE) return;

  const W = container.offsetWidth  || 600;
  const H = container.offsetHeight || 400;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.insertBefore(renderer.domElement, container.firstChild);

  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xaaccff, 0.7));

  const sun = new THREE.DirectionalLight(0xddeeff, 1.2);
  sun.position.set(300, 250, 200);
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0x224488, 0.5);
  fill.position.set(-200, -100, -300);
  scene.add(fill);

  const camera = new THREE.PerspectiveCamera(45, W / H, 1, 3000);
  let camR = 370, theta = 0.3, phi = 1.25;

  function setCamera() {
    camera.position.set(
      camR * Math.sin(phi) * Math.cos(theta),
      camR * Math.cos(phi),
      camR * Math.sin(phi) * Math.sin(theta)
    );
    camera.lookAt(0, 0, 0);
  }
  setCamera();

  // ── Colori lobi (palette blu app) ───────────────────────
  // Camera è principalmente verso +X → "frontale" = +X, "occipitale" = -X
  function getLobeColor(nx, ny) {
    // Occipitale: lobo posteriore (lontano dalla camera)
    if (nx < -0.40)                      return new THREE.Color(0x0a2a50);
    // Parietale: lobo superiore posteriore
    if (ny > 0.20 && nx < 0.30)         return new THREE.Color(0x0f3464);
    // Frontale superiore: lobo frontale alto
    if (ny > 0.02 && nx >= 0.30)        return new THREE.Color(0x1a5090);
    // Frontale inferiore: lobo frontale basso
    if (nx > 0.12 && ny > -0.38)        return new THREE.Color(0x2870b8);
    // Temporale: lobo inferiore/laterale
    return new THREE.Color(0x1e5a8c);
  }

  // ── Cervello principale (non-indexed per vertex colors per-face) ──
  const brainGeoIdx = new THREE.SphereGeometry(BRAIN_R, 72, 72);
  const brainGeo    = brainGeoIdx.toNonIndexed(); // ogni triangolo ha 3 vertici propri
  const bpos        = brainGeo.attributes.position;

  // Step 1: assegna colore per-faccia PRIMA del displacement
  // (usiamo le posizioni originali sulla sfera unitaria)
  const colorArr = new Float32Array(bpos.count * 3);
  for (let i = 0; i < bpos.count; i += 3) {
    // centroide del triangolo
    const cx = (bpos.getX(i) + bpos.getX(i+1) + bpos.getX(i+2)) / 3;
    const cy = (bpos.getY(i) + bpos.getY(i+1) + bpos.getY(i+2)) / 3;
    const cr = Math.sqrt(
      cx*cx + cy*cy +
      ((bpos.getZ(i)+bpos.getZ(i+1)+bpos.getZ(i+2))/3)**2
    );
    const col = getLobeColor(cx / cr, cy / cr);
    for (let j = 0; j < 3; j++) {
      colorArr[(i+j)*3]   = col.r;
      colorArr[(i+j)*3+1] = col.g;
      colorArr[(i+j)*3+2] = col.b;
    }
  }
  brainGeo.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));

  // Step 2: displacement (sulci) dopo aver fissato i colori
  for (let i = 0; i < bpos.count; i++) {
    const x = bpos.getX(i), y = bpos.getY(i), z = bpos.getZ(i);
    const r  = Math.sqrt(x*x + y*y + z*z);
    const nx = x/r, ny = y/r, nz = z/r;
    const flatNy = ny * 0.84;
    const noise =
      Math.sin(nx * 8  + ny * 6)  * Math.cos(nz * 9)  * 7 +
      Math.sin(nx * 14 + nz * 11) * Math.cos(ny * 13) * 4 +
      Math.cos(nx * 20 + ny * 18  + nz * 15) * 2;
    const disp = BRAIN_R + noise;
    bpos.setXYZ(i, nx * disp, flatNy * disp, nz * disp);
  }
  brainGeo.computeVertexNormals();

  const brainMat  = new THREE.MeshPhongMaterial({
    vertexColors: true,
    shininess: 28, transparent: true, opacity: 0.94,
  });
  const brainMesh = new THREE.Mesh(brainGeo, brainMat);
  scene.add(brainMesh);

  // ── Cervelletto ──────────────────────────────────────────
  const cbGeoIdx = new THREE.SphereGeometry(BRAIN_R * 0.4, 32, 32);
  const cbGeo    = cbGeoIdx.toNonIndexed();
  const cpos     = cbGeo.attributes.position;

  // colore piatto per il cervelletto (navy scuro come occipitale)
  const cbColorArr = new Float32Array(cpos.count * 3);
  const cbCol = new THREE.Color(0x0c2a4a);
  for (let i = 0; i < cpos.count; i++) {
    cbColorArr[i*3] = cbCol.r; cbColorArr[i*3+1] = cbCol.g; cbColorArr[i*3+2] = cbCol.b;
  }
  cbGeo.setAttribute('color', new THREE.BufferAttribute(cbColorArr, 3));

  for (let i = 0; i < cpos.count; i++) {
    const x = cpos.getX(i), y = cpos.getY(i), z = cpos.getZ(i);
    const r  = Math.sqrt(x*x + y*y + z*z);
    const nx = x/r, ny = y/r, nz = z/r;
    const noise = Math.sin(nx * 22 + ny * 18) * Math.cos(nz * 24) * 3;
    const disp  = BRAIN_R * 0.4 + noise;
    cpos.setXYZ(i, nx * disp, ny * disp, nz * disp);
  }
  cbGeo.computeVertexNormals();
  const cbMesh = new THREE.Mesh(cbGeo, brainMat.clone());
  cbMesh.position.set(0, -BRAIN_R * 0.5, -BRAIN_R * 0.65);
  scene.add(cbMesh);

  // ── Tronco encefalico ────────────────────────────────────
  const stemGeo  = new THREE.CylinderGeometry(BRAIN_R * 0.11, BRAIN_R * 0.09, BRAIN_R * 0.42, 16);
  const stemMesh = new THREE.Mesh(
    stemGeo,
    new THREE.MeshPhongMaterial({ color: 0x0c2040, shininess: 14 })
  );
  stemMesh.position.set(0, -BRAIN_R * 0.9, -BRAIN_R * 0.28);
  stemMesh.rotation.z = 0.12;
  scene.add(stemMesh);

  // ── Gruppo pensieri ─────────────────────────────────────
  const thoughtGroup = new THREE.Group();
  scene.add(thoughtGroup);

  const w = WINS[id];
  if (!w) return;
  w._brainScene    = { renderer, scene, camera, thoughtGroup, setCamera };
  w._brainMeshes   = [brainMesh, cbMesh]; // per raycast click su superficie
  w._thoughtMeshMap = {};

  // aggiungi pensieri già esistenti
  (w.thoughts || []).forEach(t => addThoughtMesh(id, t));

  // ── Controlli mouse ─────────────────────────────────────
  const el = renderer.domElement;
  let dragging = false, lx = 0, ly = 0, moved = 0;

  el.addEventListener('mousedown', e => {
    dragging = true; lx = e.clientX; ly = e.clientY; moved = 0;
    container.classList.add('spinning'); e.stopPropagation();
  });

  const onMove = e => {
    if (!dragging) return;
    const dx = e.clientX - lx, dy = e.clientY - ly;
    theta -= dx * 0.005;
    phi    = Math.max(0.08, Math.min(Math.PI - 0.08, phi - dy * 0.005));
    lx = e.clientX; ly = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    setCamera();
  };

  const onUp = e => {
    if (!dragging) return;
    dragging = false; container.classList.remove('spinning');
    if (moved < 5) handleBrainClick(id, e, el, camera);
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   onUp);

  el.addEventListener('wheel', e => {
    e.preventDefault(); e.stopPropagation();
    camR = Math.max(170, Math.min(900, camR + e.deltaY * 0.3));
    setCamera();
  }, { passive: false });

  // ── Resize ───────────────────────────────────────────────
  const ro = new ResizeObserver(() => {
    if (!WINS[id]) return;
    const nw = container.offsetWidth, nh = container.offsetHeight;
    if (!nw || !nh) return;
    renderer.setSize(nw, nh);
    camera.aspect = nw / nh; camera.updateProjectionMatrix();
  });
  ro.observe(container);

  // ── Render loop ──────────────────────────────────────────
  let rafId;
  function animate() {
    if (!WINS[id]) return;
    rafId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  rafId = requestAnimationFrame(animate);

  // ── Dispose ──────────────────────────────────────────────
  w._brainDispose = () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup',   onUp);
    renderer.dispose();
    el.remove();
  };
}

// ─── Coordinate sferiche ────────────────────────────────────

function brainSphericalToVec3(phi, theta, r) {
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

// ─── Sprite pensiero (canvas bubble) ────────────────────────

function makeThoughtSprite(title, color) {
  const canvas = document.createElement('canvas');
  canvas.width  = 256;
  canvas.height = 88;
  const ctx = canvas.getContext('2d');

  const hexColor = '#' + (color || 0x63b3ff).toString(16).padStart(6, '0');

  // sfondo bubble arrotondato
  const rad = 14;
  ctx.fillStyle   = 'rgba(6,9,18,0.92)';
  ctx.strokeStyle = hexColor;
  ctx.lineWidth   = 3;

  ctx.beginPath();
  ctx.moveTo(rad, 0);
  ctx.lineTo(canvas.width - rad, 0);
  ctx.quadraticCurveTo(canvas.width, 0, canvas.width, rad);
  ctx.lineTo(canvas.width, canvas.height - rad);
  ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - rad, canvas.height);
  ctx.lineTo(rad, canvas.height);
  ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - rad);
  ctx.lineTo(0, rad);
  ctx.quadraticCurveTo(0, 0, rad, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // testo
  ctx.fillStyle    = hexColor;
  ctx.font         = 'bold 20px Space Mono, monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  const label = title.length > 16 ? title.slice(0, 14) + '…' : title;
  ctx.fillText(label, canvas.width / 2, canvas.height / 2);

  const tex    = new THREE.CanvasTexture(canvas);
  const mat    = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(78, 27, 1);
  return sprite;
}

// ─── Aggiunta / rimozione mesh pensiero ─────────────────────

function addThoughtMesh(id, thought) {
  const w = WINS[id];
  if (!w?._brainScene) return;

  const { thoughtGroup } = w._brainScene;
  if (!w._thoughtMeshMap) w._thoughtMeshMap = {};

  // rimuovi mesh vecchie se presenti
  const old = w._thoughtMeshMap[thought.id];
  if (old) {
    if (old.anchor) thoughtGroup.remove(old.anchor);
    if (old.line)   thoughtGroup.remove(old.line);
    if (old.sprite) thoughtGroup.remove(old.sprite);
  }

  const col       = thought.color || 0x63b3ff;
  const surfacePt = brainSphericalToVec3(thought.phi, thought.theta, BRAIN_R + 2);
  const floatPt   = brainSphericalToVec3(thought.phi, thought.theta, BRAIN_R + 58);

  // sfera di ancoraggio sulla superficie
  const anchor = new THREE.Mesh(
    new THREE.SphereGeometry(5.5, 12, 12),
    new THREE.MeshBasicMaterial({ color: col })
  );
  anchor.position.copy(surfacePt);
  thoughtGroup.add(anchor);

  // filo singolo
  const lineGeo = new THREE.BufferGeometry().setFromPoints([surfacePt.clone(), floatPt.clone()]);
  const line    = new THREE.Line(
    lineGeo,
    new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.55 })
  );
  thoughtGroup.add(line);

  // label bubble
  const sprite = makeThoughtSprite(thought.title, col);
  sprite.position.copy(floatPt);
  thoughtGroup.add(sprite);

  w._thoughtMeshMap[thought.id] = { anchor, line, sprite };
}

function removeThoughtMesh(id, thoughtId) {
  const w = WINS[id];
  if (!w?._brainScene || !w._thoughtMeshMap) return;
  const { thoughtGroup } = w._brainScene;
  const m = w._thoughtMeshMap[thoughtId];
  if (!m) return;
  if (m.anchor) thoughtGroup.remove(m.anchor);
  if (m.line)   thoughtGroup.remove(m.line);
  if (m.sprite) thoughtGroup.remove(m.sprite);
  delete w._thoughtMeshMap[thoughtId];
}

// ─── Gestione click su cervello ─────────────────────────────

function handleBrainClick(id, e, el, camera) {
  const w = WINS[id];
  if (!w) return;

  const rect  = el.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width)  *  2 - 1,
    ((e.clientY - rect.top)  / rect.height) * -2 + 1
  );
  const ray = new THREE.Raycaster();
  ray.setFromCamera(mouse, camera);

  // controlla prima gli anchor esistenti
  const anchors = [];
  const tmm = w._thoughtMeshMap || {};
  Object.keys(tmm).forEach(tid => {
    if (tmm[tid]?.anchor) anchors.push(tmm[tid].anchor);
  });

  if (anchors.length > 0) {
    const aHits = ray.intersectObjects(anchors);
    if (aHits.length > 0) {
      const hitAnchor = aHits[0].object;
      const thought   = (w.thoughts || []).find(t => tmm[t.id]?.anchor === hitAnchor);
      if (thought) {
        openThoughtPopup(id, thought, e.clientX, e.clientY);
        return;
      }
    }
  }

  // poi controlla superficie cervello
  const brainMeshes = w._brainMeshes || [];
  if (brainMeshes.length === 0) return;

  const hits = ray.intersectObjects(brainMeshes);
  if (hits.length === 0) return;

  const pt  = hits[0].point;
  const r   = pt.length();
  const phi = Math.acos(Math.max(-1, Math.min(1, pt.y / r)));
  const tht = Math.atan2(pt.z, pt.x);

  w._brainPendingPos = { phi, theta: tht };

  // abilita form
  const titleInp  = document.getElementById('braintitle'   + id);
  const contentTa = document.getElementById('braincontent' + id);
  const addBtn    = document.getElementById('brainadd'     + id);
  const hintEl    = document.getElementById('brainhint'    + id);

  if (titleInp)  titleInp.disabled  = false;
  if (contentTa) contentTa.disabled = false;
  if (addBtn)    addBtn.disabled    = false;
  if (hintEl)    hintEl.textContent = 'Posizione selezionata — compila e aggiungi';
  if (titleInp)  titleInp.focus();
}

// ─── Popup editing pensiero ─────────────────────────────────

function openThoughtPopup(id, thought, screenX, screenY) {
  const w = WINS[id];
  if (!w) return;
  w._brainActiveThought = thought.id;

  const popup    = document.getElementById('brainpopup'  + id);
  const titleInp = document.getElementById('brainptitle' + id);
  const noteTA   = document.getElementById('brainpnote'  + id);
  const delBtn   = document.getElementById('brainpdel'   + id);
  if (!popup) return;

  titleInp.value = thought.title;
  noteTA.value   = thought.content || '';

  // posiziona popup vicino al click
  const container = document.getElementById('brainscene' + id);
  if (container) {
    const rect = container.getBoundingClientRect();
    let px = screenX - rect.left + 14;
    let py = screenY - rect.top  - 10;
    if (px + 250 > rect.width)  px = rect.width  - 258;
    if (py + 180 > rect.height) py = rect.height - 188;
    popup.style.left = Math.max(4, px) + 'px';
    popup.style.top  = Math.max(4, py) + 'px';
  }
  popup.style.display = 'block';

  // aggiorna titolo in tempo reale
  titleInp.oninput = () => {
    thought.title = titleInp.value;
    // ricrea sprite
    const ms = w._thoughtMeshMap?.[thought.id];
    if (ms?.sprite && w._brainScene) {
      const { thoughtGroup } = w._brainScene;
      thoughtGroup.remove(ms.sprite);
      const newSprite = makeThoughtSprite(thought.title, thought.color || 0x63b3ff);
      newSprite.position.copy(ms.sprite.position);
      thoughtGroup.add(newSprite);
      ms.sprite = newSprite;
    }
    renderThoughtList(id);
    if (window.persistState) window.persistState();
  };

  noteTA.oninput = () => {
    thought.content = noteTA.value;
    if (window.persistState) window.persistState();
  };

  delBtn.onclick = () => {
    w.thoughts = (w.thoughts || []).filter(t => t.id !== thought.id);
    removeThoughtMesh(id, thought.id);
    renderThoughtList(id);
    closeThoughtPopup(id);
    if (window.persistState) window.persistState();
  };
}

function closeThoughtPopup(id) {
  const popup = document.getElementById('brainpopup' + id);
  if (popup) popup.style.display = 'none';
  const w = WINS[id];
  if (w) w._brainActiveThought = null;
}

// ─── Lista pensieri nel pannello sinistro ───────────────────

function renderThoughtList(id) {
  const w      = WINS[id];
  const listEl = document.getElementById('brainlist' + id);
  if (!w || !listEl) return;

  listEl.innerHTML = '';
  (w.thoughts || []).forEach(t => {
    const col  = '#' + (t.color || 0x63b3ff).toString(16).padStart(6, '0');
    const item = document.createElement('div');
    item.className = 'brain-thought-item';
    item.style.borderLeftColor = col;

    const preview = t.content ? t.content.slice(0, 55) + (t.content.length > 55 ? '…' : '') : '';
    item.innerHTML = `
      <div class="brain-thought-title" style="color:${col}">${t.title}</div>
      ${preview ? `<div class="brain-thought-preview">${preview}</div>` : ''}
    `;
    item.onclick = () => openThoughtPopup(id, t, 120, 120);
    listEl.appendChild(item);
  });
}
