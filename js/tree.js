'use strict';
/* ═══════════════════════════════════════════════════════════
   TREE — vista ad albero gerarchico
   Dipende da: window-manager.js (WINS)
   ═══════════════════════════════════════════════════════════ */

let treeNotePopupTarget = null; // { winId, nodeId }

// drag state for blocks view
let currentDraggingBlock = null; // { winId, block, el }
let dragOffsetX = 0, dragOffsetY = 0;

// ─── HTML struttura finestra albero ─────────────────────────

function treeBodyHTML(id) {
  return `
    <div class="tree-wrap" id="treewrap${id}">
      <div class="tree-toolbar">
        <button class="tree-add-root-btn" id="tree-addroot${id}">+ Nodo radice</button>
        <div class="tree-view-toggle" id="tree-toggle${id}">
          <button class="tree-view-btn active" data-view="list">Lista</button>
          <button class="tree-view-btn" data-view="graph">Grafo</button>
          <button class="tree-view-btn" data-view="blocks">Blocchi</button>
        </div>
        <span class="tree-toolbar-hint">drag → riordina · clic → espandi</span>
      </div>
      <div class="tree-view-container">
        <div class="tree-list-view" id="treelist${id}">
          <div class="tree-container" id="treecont${id}"></div>
        </div>
        <div class="tree-graph-view" id="treegraph${id}" style="display:none;"></div>
        <div class="tree-blocks-view" id="treeblocks${id}" style="display:none;position:relative;">
          <!-- blocks rendered dynamically -->
        </div>
      </div>
    </div>
    <!-- popup nota nodo (condiviso tra tutti gli alberi aperti) -->
    <div class="tree-note-popup" id="treenp${id}">
      <div class="tree-note-popup-hdr">
        <span class="tree-note-popup-name" id="treenp-name${id}">—</span>
        <button class="tree-note-popup-close" id="treenp-close${id}">✕</button>
      </div>
      <textarea class="tree-note-popup-ta" id="treenp-ta${id}" placeholder="Note libere…"></textarea>
    </div>`;
}

// ─── Init albero ─────────────────────────────────────────────

function initTree(id) {
  const w = WINS[id];
  if (!w || w.type !== 'tree') return;
  if (!w.treeData) w.treeData = { roots: [] };
  w.treeViewMode = 'list'; // 'list' o 'graph'

  document.getElementById('tree-addroot' + id).onclick = () => {
    const node = mkTreeNode('Nuovo nodo');
    w.treeData.roots.push(node);
    renderTree(id);
    if (w.treeGraphScene) w.treeGraphScene.updateFromTree(w.treeData);
    if (window.persistState) window.persistState();
  };

  document.getElementById('treenp-close' + id).onclick = () => closeTreeNotePopup(id);

  // toggle lista/grafo
  document.getElementById('tree-toggle' + id).addEventListener('click', e => {
    if (!e.target.classList.contains('tree-view-btn')) return;
    const view = e.target.dataset.view;
    switchTreeView(id, view);
  });

  renderTree(id);
  
  // crea scena grafo (lasciandola nascosta per ora)
  requestAnimationFrame(() => {
    w.treeGraphScene = createTreeGraphScene(id);
  });
  // nothing for blocks until needed
}

// ─── Toggle vista (Lista / Grafo) ────────────────────────────

function switchTreeView(id, view) {
  const w = WINS[id];
  if (!w) return;
  w.treeViewMode = view;

  const btns = document.getElementById('tree-toggle' + id)?.querySelectorAll('.tree-view-btn');
  if (btns) btns.forEach(b => b.classList.remove('active'));
  document.querySelector(`#tree-toggle${id} [data-view="${view}"]`)?.classList.add('active');

  const listView = document.getElementById('treelist' + id);
  const graphView = document.getElementById('treegraph' + id);
  
  if (view === 'list') {
    if (listView) listView.style.display = 'flex';
    if (graphView) graphView.style.display = 'none';
    const blocks = document.getElementById('treeblocks' + id);
    if (blocks) blocks.style.display = 'none';
  } else if (view === 'graph') {
    if (listView) listView.style.display = 'none';
    if (graphView) graphView.style.display = 'flex';
    const blocks = document.getElementById('treeblocks' + id);
    if (blocks) blocks.style.display = 'none';
    // assicura che la scena grafo sia inizializzata e aggiornata
    if (w.treeGraphScene) {
      w.treeGraphScene.updateFromTree(w.treeData);
      w.treeGraphScene.fit(); // ricentra la vista
    }
  } else if (view === 'blocks') {
    if (listView) listView.style.display = 'none';
    if (graphView) graphView.style.display = 'none';
    const blocks = document.getElementById('treeblocks' + id);
    if (blocks) blocks.style.display = 'flex';
    renderBlocks(id);
  }
}

// ─── Dati nodo ───────────────────────────────────────────────

function mkTreeNode(label) {
  return { id: 'tn-' + Date.now() + '-' + Math.random().toString(36).slice(2,7),
           label, children: [], note: '', collapsed: false };
}

// cerca nodo per id nell'albero (ricorsivo)
function findTreeNode(roots, id) {
  for (const n of roots) {
    if (n.id === id) return n;
    const found = findTreeNode(n.children, id);
    if (found) return found;
  }
  return null;
}

// rimuove nodo per id dall'array (ricorsivo)
function removeTreeNode(arr, id) {
  const idx = arr.findIndex(n => n.id === id);
  if (idx !== -1) { arr.splice(idx, 1); return true; }
  for (const n of arr) { if (removeTreeNode(n.children, id)) return true; }
  return false;
}

// ─── Render albero ───────────────────────────────────────────

function renderTree(id) {
  const w = WINS[id];
  if (!w?.treeData) return;
  const cont = document.getElementById('treecont' + id);
  if (!cont) return;

  cont.innerHTML = '';

  if (w.treeData.roots.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'tree-empty';
    empty.textContent = 'Albero vuoto.\nPremi "+ Nodo radice" per iniziare.';
    cont.appendChild(empty); return;
  }

  w.treeData.roots.forEach(root => {
    cont.appendChild(buildTreeNodeEl(id, root, w.treeData.roots, 0));
  });
}

// ─── Costruzione elemento DOM nodo ──────────────────────────

// ─── Blocchi (diagramma) ───────────────────────────────────
function renderBlocks(id) {
  const w = WINS[id];
  if (!w) return;
  const cont = document.getElementById('treeblocks' + id);
  if (!cont) return;

  // initialize blocks if absent
  if (!w.blocks) {
    w.blocks = [];
    for (let i=0;i<4;i++) {
      w.blocks.push({
        id: 'b' + Date.now() + '-' + i,
        x: 20 + i*120, y: 20,
        text: 'Blocco ' + (i+1)
      });
    }
  }

  cont.innerHTML = '';
  cont.style.position = 'relative';

  w.blocks.forEach(b => {
    const el = document.createElement('div');
    el.className = 'tree-block';
    el.style.position = 'absolute';
    el.style.left = b.x + 'px';
    el.style.top  = b.y + 'px';
    el.textContent = b.text;
    el.dataset.bid = b.id;
    // start drag
    el.onmousedown = e => {
      currentDraggingBlock = { winId: id, block: b, el };
      dragOffsetX = e.clientX;
      dragOffsetY = e.clientY;
      el.style.cursor = 'grabbing';
      e.stopPropagation();
    };
    // click to edit text
    el.onclick = e => {
      e.stopPropagation();
      const ta = document.createElement('textarea');
      ta.className = 'tree-block-ta';
      ta.value = b.text;
      ta.onmousedown = ev => ev.stopPropagation();
      ta.onblur = () => {
        b.text = ta.value;
        renderBlocks(id);
        if (window.persistState) window.persistState();
      };
      el.innerHTML = '';
      el.appendChild(ta);
      ta.focus();
    };
    cont.appendChild(el);
  });
}

// global listeners for dragging blocks
document.addEventListener('mousemove', e => {
  if (!currentDraggingBlock) return;
  const { block, el } = currentDraggingBlock;
  const dx = e.clientX - dragOffsetX;
  const dy = e.clientY - dragOffsetY;
  block.x += dx; block.y += dy;
  el.style.left = block.x + 'px';
  el.style.top  = block.y + 'px';
  dragOffsetX = e.clientX; dragOffsetY = e.clientY;
});
document.addEventListener('mouseup', e => {
  if (currentDraggingBlock) {
    currentDraggingBlock.el.style.cursor = 'grab';
    currentDraggingBlock = null;
    if (window.persistState) window.persistState();
  }
});

function buildTreeNodeEl(winId, node, siblingArr, depth) {
  // helper for blocks drag
  const wrap = document.createElement('div');
  wrap.className   = 'tree-node';
  wrap.dataset.nid = node.id;
  wrap.draggable   = true;

  // ── riga principale ──
  const row = document.createElement('div');
  row.className = 'tree-node-row';

  // toggle expand/collapse
  const toggle = document.createElement('button');
  toggle.className = node.children.length ? 'tree-toggle' : 'tree-toggle leaf';
  toggle.textContent = node.children.length ? (node.collapsed ? '▶' : '▼') : '·';
  toggle.onclick = () => {
    if (!node.children.length) return;
    node.collapsed = !node.collapsed;
    renderTree(winId);
  };

  // label
  const label = document.createElement('span');
  label.className = 'tree-node-label' + (node.note ? ' has-note' : '');
  label.textContent = node.label;
  label.title = node.note ? '📝 ' + node.note.slice(0, 60) : '';

  // pulsanti azioni
  const actions = document.createElement('div');
  actions.className = 'tree-node-actions';

  const btnAddChild = mkTreeBtn('+ Figlio', 'add', () => {
    node.children.push(mkTreeNode('Nuovo nodo'));
    node.collapsed = false;
    renderTree(winId);
    const w = WINS[winId];
    if (w?.treeGraphScene) w.treeGraphScene.updateFromTree(w.treeData);
    if (window.persistState) window.persistState();
  });
  const btnEdit = mkTreeBtn('Modifica', 'edit', () => openTreeNotePopup(winId, node));
  const btnRename = mkTreeBtn('Rinomina', 'rename', () => startInlineRename(winId, node, row, label));
  const btnDel = mkTreeBtn('Cancella', 'del', () => {
    
    const w = WINS[winId];
    removeTreeNode(w.treeData.roots, node.id);
    renderTree(winId);
    if (w?.treeGraphScene) w.treeGraphScene.updateFromTree(w.treeData);
    if (window.persistState) window.persistState();
  });

  actions.append(btnAddChild, btnEdit, btnRename, btnDel);
  row.append(toggle, label, actions);
  wrap.appendChild(row);

  // ── figli ──
  if (!node.collapsed && node.children.length) {
    const childWrap = document.createElement('div');
    childWrap.className = 'tree-children';
    node.children.forEach(child => {
      childWrap.appendChild(buildTreeNodeEl(winId, child, node.children, depth + 1));
    });
    wrap.appendChild(childWrap);
  }

  // ── drag-and-drop ──
  bindTreeDrag(winId, wrap, node, siblingArr);

  return wrap;
}

function mkTreeBtn(text, cls, fn) {
  const b = document.createElement('button');
  b.className = 'tree-act-btn ' + cls;
  b.textContent = text;
  b.onclick = e => { e.stopPropagation(); fn(); };
  return b;
}

// ─── Rename inline ───────────────────────────────────────────

function startInlineRename(winId, node, row, labelEl) {
  const inp = document.createElement('input');
  inp.className = 'tree-rename-inp';
  inp.value = node.label;
  inp.onmousedown = e => e.stopPropagation();
  inp.onkeydown = e => {
    e.stopPropagation();
    if (e.key === 'Enter')  { commit(); }
    if (e.key === 'Escape') { renderTree(winId); }
  };
  const commit = () => {
    const v = inp.value.trim();
    if (v) node.label = v;
    renderTree(winId);
  };
  inp.onblur = commit;
  row.replaceChild(inp, labelEl);
  inp.focus(); inp.select();
}

// ─── Popup nota nodo ─────────────────────────────────────────

function openTreeNotePopup(winId, node) {
  const popup = document.getElementById('treenp' + winId);
  if (!popup) return;

  document.getElementById('treenp-name' + winId).textContent = node.label;
  const ta = document.getElementById('treenp-ta' + winId);
  ta.value = node.note || '';
  ta.oninput = () => {
    node.note = ta.value;
    // aggiorna stile label (has-note) senza full re-render
    const labelEl = document.querySelector(`[data-nid="${node.id}"] .tree-node-label`);
    if (labelEl) {
      labelEl.classList.toggle('has-note', !!node.note);
      labelEl.title = node.note ? '📝 ' + node.note.slice(0, 60) : '';
    }
  };
  ta.onmousedown = e => e.stopPropagation();
  ta.onkeydown   = e => e.stopPropagation();

  // posiziona vicino al click — centrato nella finestra
  const wrap = document.getElementById('treewrap' + winId);
  if (wrap) {
    const r = wrap.getBoundingClientRect();
    popup.style.left = Math.max(10, r.width / 2 - 140) + 'px';
    popup.style.top  = '60px';
  }

  treeNotePopupTarget = { winId, nodeId: node.id };
  popup.classList.add('visible');
  ta.focus();
}

function closeTreeNotePopup(winId) {
  const popup = document.getElementById('treenp' + winId);
  if (popup) popup.classList.remove('visible');
  treeNotePopupTarget = null;
}

// ─── Grafo interattivo Three.js ────────────────────────────────

function createTreeGraphScene(winId) {
  const w = WINS[winId];
  if (!w || !window.THREE) return null;

  const container = document.getElementById('treegraph' + winId);
  if (!container) return null;

  const W = container.offsetWidth || 600;
  const H = container.offsetHeight || 400;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(200, 200, 200);
  scene.add(light);

  const camera = new THREE.PerspectiveCamera(45, W / H, 1, 3000);
  let camZ = 500, theta = 0, phi = 1.2;

  function setCamera() {
    camera.position.set(
      camZ * Math.sin(phi) * Math.cos(theta),
      camZ * Math.cos(phi),
      camZ * Math.sin(phi) * Math.sin(theta)
    );
    camera.lookAt(0, 0, 0);
  }
  setCamera();

  const nodeGroup = new THREE.Group();
  const lineGroup = new THREE.Group();
  scene.add(nodeGroup);
  scene.add(lineGroup);

  let nodeMeshMap = {}; // nodeId → mesh
  let dragging = false, lx = 0, ly = 0;

  // mouse drag for rotation
  renderer.domElement.addEventListener('mousedown', e => {
    dragging = true; lx = e.clientX; ly = e.clientY;
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    theta += (e.clientX - lx) * 0.01;
    phi = Math.max(0.2, Math.min(Math.PI - 0.2, phi - (e.clientY - ly) * 0.01));
    lx = e.clientX; ly = e.clientY;
    setCamera();
  });
  document.addEventListener('mouseup', () => { dragging = false; });

  // zoom con scroll
  renderer.domElement.addEventListener('wheel', e => {
    e.preventDefault();
    camZ = Math.max(100, Math.min(1200, camZ + e.deltaY * 0.5));
    setCamera();
  }, { passive: false });

  // resize
  const ro = new ResizeObserver(() => {
    if (!WINS[winId]) return;
    const nw = container.offsetWidth, nh = container.offsetHeight;
    if (!nw || !nh) return;
    renderer.setSize(nw, nh);
    camera.aspect = nw / nh; camera.updateProjectionMatrix();
  });
  ro.observe(container);

  // render loop
  let rafId;
  function animate() {
    if (!WINS[winId]) return;
    rafId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  rafId = requestAnimationFrame(animate);

  // build grafo da tree
  function buildGraph(treeData) {
    nodeGroup.clear();
    lineGroup.clear();
    nodeMeshMap = {};

    const nodes = [];
    function collectNodes(arr, depth = 0) {
      arr.forEach(n => {
        nodes.push({ data: n, depth });
        collectNodes(n.children, depth + 1);
      });
    }
    collectNodes(treeData.roots);

    if (nodes.length === 0) return;

    // posizionamento: fan circolare per radici, figli in layer sottostanti
    const posMap = {};
    const rootCount = treeData.roots.length;
    const angle = (2 * Math.PI) / Math.max(1, rootCount);
    let nodeIdx = 0;

    function positionNode(node, parentPos, depth, siblingIdx, siblingCount) {
      const r = 120 + depth * 100;
      let x, y, z;

      if (!parentPos) {
        // nodo radice
        const a = siblingIdx * angle;
        x = Math.cos(a) * 200;
        z = Math.sin(a) * 200;
        y = 0;
      } else {
        // figlio: distribuito attorno al padre
        const childIdx = node._childIdx || 0;
        const childCount = Math.max(1, siblingCount);
        const a = (childIdx / childCount) * Math.PI * 1.5 - Math.PI * 0.75;
        const dist = 120 + depth * 30;
        x = parentPos.x + Math.cos(a) * dist;
        y = parentPos.y - 80;
        z = parentPos.z + Math.sin(a) * dist;
      }

      posMap[node.id] = { x, y, z };
    }

    // posiziona nodi
    treeData.roots.forEach((root, idx) => {
      let childIdx = 0;
      function walk(n, parentPos, d, count) {
        n._childIdx = childIdx++;
        positionNode(n, parentPos, d, idx, rootCount);
        const pos = posMap[n.id];
        n.children.forEach(child => walk(child, pos, d + 1, n.children.length));
      }
      walk(root, null, 0, rootCount);
    });

    // crea mesh nodi
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x63b3ff });
    const nodeGeo = new THREE.SphereGeometry(8, 10, 10);
    
    nodes.forEach(({ data: n }) => {
      const pos = posMap[n.id];
      if (!pos) return;
      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.set(pos.x, pos.y, pos.z);
      mesh.userData.nodeId = n.id;
      mesh.userData.label = n.label;
      nodeGroup.add(mesh);
      nodeMeshMap[n.id] = mesh;
    });

    // crea linee padre-figlio
    const lineMat = new THREE.LineBasicMaterial({ color: 0x2d5499, transparent: true, opacity: 0.6 });
    nodes.forEach(({ data: n }) => {
      n.children.forEach(child => {
        const pPos = posMap[n.id], cPos = posMap[child.id];
        if (!pPos || !cPos) return;
        const pts = [
          new THREE.Vector3(pPos.x, pPos.y, pPos.z),
          new THREE.Vector3(cPos.x, cPos.y, cPos.z),
        ];
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat);
        lineGroup.add(line);
      });
    });
  }

  // tooltip al hover
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let tooltipEl = null;

  renderer.domElement.addEventListener('mousemove', e => {
    if (dragging) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([...Object.values(nodeMeshMap)]);

    // remove old tooltip
    if (tooltipEl) tooltipEl.remove();
    tooltipEl = null;

    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      const label = mesh.userData.label;
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'tree-graph-tooltip';
      tooltipEl.textContent = label;
      tooltipEl.style.position = 'fixed';
      tooltipEl.style.left = e.clientX + 10 + 'px';
      tooltipEl.style.top = e.clientY + 10 + 'px';
      tooltipEl.style.pointerEvents = 'none';
      tooltipEl.style.background = 'rgba(10,20,35,.9)';
      tooltipEl.style.color = '#63b3ff';
      tooltipEl.style.padding = '4px 8px';
      tooltipEl.style.borderRadius = '3px';
      tooltipEl.style.fontSize = '.65rem';
      tooltipEl.style.fontFamily = '"Space Mono", monospace';
      tooltipEl.style.zIndex = '9999';
      document.body.appendChild(tooltipEl);
    }
  });

  return {
    updateFromTree(treeData) {
      buildGraph(treeData);
    },
    fit() {
      // resetta view
      theta = 0; phi = 1.2; camZ = 500;
      setCamera();
    },
    dispose() {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      renderer.dispose();
      if (tooltipEl) tooltipEl.remove();
      renderer.domElement.remove();
    }
  };
}

// ─── Drag-and-drop riordino ───────────────────────────────────

function bindTreeDrag(winId, el, node, siblingArr) {
  let dragSrc = null;

  el.addEventListener('dragstart', e => {
    dragSrc = node.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', node.id);
    e.stopPropagation();
    setTimeout(() => el.style.opacity = '0.4', 0);
  });

  el.addEventListener('dragend', () => {
    el.style.opacity = '';
    document.querySelectorAll('.tree-node-row.drag-over')
      .forEach(r => r.classList.remove('drag-over'));
  });

  el.querySelector('.tree-node-row').addEventListener('dragover', e => {
    e.preventDefault(); e.stopPropagation();
    el.querySelector('.tree-node-row').classList.add('drag-over');
  });

  el.querySelector('.tree-node-row').addEventListener('dragleave', () => {
    el.querySelector('.tree-node-row').classList.remove('drag-over');
  });

  el.querySelector('.tree-node-row').addEventListener('drop', e => {
    e.preventDefault(); e.stopPropagation();
    el.querySelector('.tree-node-row').classList.remove('drag-over');

    const srcId = e.dataTransfer.getData('text/plain');
    if (!srcId || srcId === node.id) return;

    const w = WINS[winId];
    if (!w) return;

    // trova e rimuove il nodo sorgente dalla sua posizione attuale
    const srcNode = findTreeNode(w.treeData.roots, srcId);
    if (!srcNode) return;
    removeTreeNode(w.treeData.roots, srcId);

    // inserisce prima del nodo destinazione nel suo array fratelli
    const destIdx = siblingArr.findIndex(n => n.id === node.id);
    if (destIdx !== -1) {
      siblingArr.splice(destIdx, 0, srcNode);
    } else {
      siblingArr.push(srcNode);
    }
    renderTree(winId);
    if (w?.treeGraphScene) w.treeGraphScene.updateFromTree(w.treeData);
    if (window.persistState) window.persistState();
  });
}
