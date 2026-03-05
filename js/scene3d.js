'use strict';
/* ═══════════════════════════════════════════════════════════
   SCENE3D — scena Three.js per la vista costellazione
   Dipende da: three-helpers.js (makeLabel, SPHERE_R, CAM_START)
               Three.js (CDN, caricato prima)
   ═══════════════════════════════════════════════════════════ */

/**
 * Crea e avvia una scena 3D all'interno del contenitore g3d<winId>.
 * @param {number}   winId       - ID della finestra
 * @param {Array}    nodes       - nodi con posizioni già assegnate (_v)
 * @param {number}   layerColor  - colore hex Three.js del layer
 * @param {Function} onNodeClick - callback(node) al click su un nodo
 * @returns {{ renderer, scene, refreshDots, dispose }}
 */
function create3DScene(winId, nodes, layerColor, onNodeClick) {
  const container = document.getElementById('g3d' + winId);
  if (!container || !window.THREE) return null;

  const W = container.offsetWidth  || 500;
  const H = container.offsetHeight || 400;

  // renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.insertBefore(renderer.domElement, container.firstChild);

  // scena e luci
  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, .35));

  const pl1 = new THREE.PointLight(layerColor || 0x63b3ff, 2, 700);
  pl1.position.set(0, 150, 100);
  scene.add(pl1);

  const pl2 = new THREE.PointLight(0xa78bfa, 1, 450);
  pl2.position.set(-120, -80, -140);
  scene.add(pl2);

  // camera sferica
  const camera = new THREE.PerspectiveCamera(60, W / H, .1, 2000);
  let camR = CAM_START, theta = .4, phi = 1.2;

  function setCamera() {
    camera.position.set(
      camR * Math.sin(phi) * Math.sin(theta),
      camR * Math.cos(phi),
      camR * Math.sin(phi) * Math.cos(theta)
    );
    camera.lookAt(0, 0, 0);
  }
  setCamera();

  // gruppo nodi
  const nodeGroup = new THREE.Group();
  scene.add(nodeGroup);
  const meshList  = [];
  const dotGroups = {};
  const compGroups = {};

  // ── dots attributi sopra ogni nodo ──────────────────────
  function buildDots(node) {
    if (!node._v) return; // sicurezza
    if (dotGroups[node.id]) nodeGroup.remove(dotGroups[node.id]);
    const g      = new THREE.Group();
    const dr     = 3.5;
    const space  = 10;
    const total  = node.attrs.length;
    const startX = -(total - 1) * space / 2;
    const nr     = node.main ? 20 : 12;

    node.attrs.forEach((attr, i) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(dr, 8, 8),
        new THREE.MeshBasicMaterial({ color: attr.s === 'have' ? 0x34d399 : 0xfb923c })
      );
      m.position.set(node._v.x + startX + i * space, node._v.y + nr + dr + 5, node._v.z);
      g.add(m);
    });

    dotGroups[node.id] = g;
    nodeGroup.add(g);
  }

  // ── componenti (cerchi) accanto al nodo
  function buildComps(node) {
    if (compGroups[node.id]) nodeGroup.remove(compGroups[node.id]);
    if (!node.components || !node.components.length) return;
    const g = new THREE.Group();
    // compute local tangent basis
    const norm = node._v.clone().normalize();
    let t1 = new THREE.Vector3(0,1,0).cross(norm).normalize();
    if (t1.length() < 0.01) t1 = new THREE.Vector3(1,0,0);
    const t2 = new THREE.Vector3().crossVectors(norm, t1).normalize();
    node.components.forEach(c => {
      const rscale = Math.max(2, c.r); // visual scale
      const geo = new THREE.SphereGeometry(rscale, 16, 16);
      const mat = new THREE.MeshBasicMaterial({ color: 0x22ff22, transparent: true, opacity: 0.4 });
      const mesh = new THREE.Mesh(geo, mat);
      // base position slightly offset from sphere surface
      const base = norm.clone().multiplyScalar(SPHERE_R + 5);
      const pos = base.clone()
        .add(t1.clone().multiplyScalar(c.x))
        .add(t2.clone().multiplyScalar(c.y));
      mesh.position.copy(pos);
      g.add(mesh);
    });
    compGroups[node.id] = g;
    nodeGroup.add(g);
  }

  // ── costruzione nodi, label, connessioni ────────────────
  const main = nodes.find(n => n.main);

  nodes.forEach(n => {
    if (!n._v) return; // sicurezza: salta nodi senza posizione

    const r      = n.main ? 20 : 12;
    const col    = n.main ? (layerColor || 0x4499ff) : 0x7755cc;
    const emCol  = n.main ? (layerColor || 0x224488) : 0x331166;

    const mat = new THREE.MeshPhongMaterial({
      color: col, emissive: emCol, emissiveIntensity: .4,
      shininess: 90, transparent: true, opacity: .88,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), mat);
    mesh.position.set(n._v.x, n._v.y, n._v.z);
    mesh.userData.node = n;
    nodeGroup.add(mesh);
    meshList.push({ mesh, node: n });

    const lbl = makeLabel(n.label, n.main ? '#a8d4ff' : '#c4b5fd');
    lbl.position.set(n._v.x, n._v.y - r - 14, n._v.z);
    nodeGroup.add(lbl);

    buildDots(n);
    buildComps(n);
  });

  // linee dal nodo centrale verso i satelliti
  if (main?._v) {
    nodes.filter(n => !n.main && n._v).forEach(n => {
      const geo = new THREE.BufferGeometry().setFromPoints([main._v.clone(), n._v.clone()]);
      nodeGroup.add(new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({ color: layerColor || 0x63b3ff, transparent: true, opacity: .22 })
      ));
    });
  }

  // ── interazione mouse ───────────────────────────────────
  const el = renderer.domElement;
  let dragging = false, lx = 0, ly = 0, moved = 0;

  el.addEventListener('mousedown', e => {
    dragging = true; lx = e.clientX; ly = e.clientY; moved = 0;
    container.classList.add('spinning');
    e.stopPropagation();
  });

  const onMove = e => {
    if (!dragging) return;
    const dx = e.clientX - lx, dy = e.clientY - ly;
    theta -= dx * .006;
    phi    = Math.max(.06, Math.min(Math.PI - .06, phi - dy * .006));
    lx = e.clientX; ly = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    setCamera();
  };

  const onUp = e => {
    if (!dragging) return;
    dragging = false;
    container.classList.remove('spinning');
    // click (non drag) → apri pannello
    if (moved < 5) {
      const rect  = el.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width)  *  2 - 1,
        ((e.clientY - rect.top)  / rect.height) * -2 + 1
      );
      const ray = new THREE.Raycaster();
      ray.setFromCamera(mouse, camera);
      const hits = ray.intersectObjects(meshList.map(m => m.mesh));
      if (hits.length > 0) onNodeClick(hits[0].object.userData.node);
    }
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   onUp);

  // zoom con rotella
  el.addEventListener('wheel', e => {
    e.preventDefault(); e.stopPropagation();
    camR = Math.max(55, Math.min(720, camR + e.deltaY * .52));
    setCamera();
  }, { passive: false });

  // hover highlight
  el.addEventListener('mousemove', e => {
    if (dragging) return;
    const rect  = el.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width)  *  2 - 1,
      ((e.clientY - rect.top)  / rect.height) * -2 + 1
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects(meshList.map(m => m.mesh));
    const hov  = hits.length > 0 ? hits[0].object : null;
    meshList.forEach(({ mesh }) => {
      mesh.material.emissiveIntensity = mesh === hov ? 1.3 : .4;
    });
    el.style.cursor = hov ? 'pointer' : 'grab';
  });

  // ── resize observer ─────────────────────────────────────
  const ro = new ResizeObserver(() => {
    const w = container.offsetWidth, h = container.offsetHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  ro.observe(container);

  // ── render loop ─────────────────────────────────────────
  let rafId;
  function animate(t) {
    rafId = requestAnimationFrame(animate);
    // pulsazione nodo principale
    const me = meshList.find(m => m.node.main);
    if (me) me.mesh.scale.setScalar(1 + Math.sin(t * .0012) * .03);
    renderer.render(scene, camera);
  }
  rafId = requestAnimationFrame(animate);

  return {
    renderer,
    scene,
    /** Aggiorna i dot attributi di un nodo dopo una modifica */
    refreshDots: node => { buildDots(node); buildComps(node); },
    /** Smonta la scena e rimuove tutti i listener */
    dispose: () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      renderer.dispose();
      el.remove();
    },
  };
}
