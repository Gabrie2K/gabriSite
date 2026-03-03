'use strict';
/* ═══════════════════════════════════════════════════════════
   TREE — vista ad albero gerarchico
   Dipende da: window-manager.js (WINS)
   ═══════════════════════════════════════════════════════════ */

let treeNotePopupTarget = null; // { winId, nodeId }

// ─── HTML struttura finestra albero ─────────────────────────

function treeBodyHTML(id) {
  return `
    <div class="tree-wrap" id="treewrap${id}">
      <div class="tree-toolbar">
        <button class="tree-add-root-btn" id="tree-addroot${id}">+ Nodo radice</button>
        <span class="tree-toolbar-hint">drag → riordina · clic → espandi</span>
      </div>
      <div class="tree-container" id="treecont${id}"></div>
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

  document.getElementById('tree-addroot' + id).onclick = () => {
    const node = mkTreeNode('Nuovo nodo');
    w.treeData.roots.push(node);
    renderTree(id);
  };

  document.getElementById('treenp-close' + id).onclick = () => closeTreeNotePopup(id);

  renderTree(id);
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

function buildTreeNodeEl(winId, node, siblingArr, depth) {
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
  });
  const btnEdit = mkTreeBtn('Modifica', 'edit', () => openTreeNotePopup(winId, node));
  const btnRename = mkTreeBtn('Rinomina', 'rename', () => startInlineRename(winId, node, row, label));
  const btnDel = mkTreeBtn('Cancella', 'del', () => {
    if (!confirm(`Cancellare "${node.label}" e tutti i suoi figli?`)) return;
    const w = WINS[winId];
    removeTreeNode(w.treeData.roots, node.id);
    renderTree(winId);
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
  });
}
