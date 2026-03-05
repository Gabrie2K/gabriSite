/* Storage helpers: esporta/importa stato dell'app e persistenza in localStorage
   Fornisce API globali:
   - window.persistState()      -> salva nello storage locale
   - window.exportStateToFile() -> scarica file JSON
   - window.importStateFromFile(file) -> importa JSON
   - window.loadStateFromLocal() -> carica da localStorage
*/
'use strict';

function _cleanTPL(origTPL) {
  const out = {};
  Object.keys(origTPL || {}).forEach(k => {
    const t = origTPL[k];
    out[k] = { color: t.color, nodes: [] };
    (t.nodes || []).forEach(n => {
      out[k].nodes.push({ id: n.id, label: n.label, main: !!n.main, attrs: n.attrs || [], note: n.note || '' });
    });
  });
  return out;
}

function _serializeWins() {
  const wins = [];
  Object.keys(WINS).forEach(id => {
    const w = WINS[id];
    const rect = w.win?.style || {};
    const pos = { left: rect.left || null, top: rect.top || null, width: rect.width || null, height: rect.height || null };
    const item = { id: Number(id), tpl: w.tpl, type: w.type, pos };
    if (w.nodes) item.nodes = JSON.parse(JSON.stringify(w.nodes));
    if (w.pins)  item.pins  = JSON.parse(JSON.stringify(w.pins));
    if (w.events) item.events = JSON.parse(JSON.stringify(w.events));
    if (w.treeData) item.treeData = JSON.parse(JSON.stringify(w.treeData));
    if (w.blocks) item.blocks = JSON.parse(JSON.stringify(w.blocks));
    if (w.calState) item.calState = JSON.parse(JSON.stringify(w.calState));
    if (w.mapLayers) item.mapLayers = JSON.parse(JSON.stringify(w.mapLayers));
    if (w.mapState) item.mapState = JSON.parse(JSON.stringify(w.mapState));
    if (w.notes) item.notes = JSON.parse(JSON.stringify(w.notes));
    if (w.currentNoteId) item.currentNoteId = w.currentNoteId;
    if (w.noteSidebarWidth) item.noteSidebarWidth = w.noteSidebarWidth;
    if (w.thoughts) item.thoughts = JSON.parse(JSON.stringify(w.thoughts));
    wins.push(item);
  });
  return wins;
}

function getAppState() {
  return {
    schemaVersion: 2,
    meta: { wc: WC, tz: TZ, exportedAt: new Date().toISOString() },
    wins: _serializeWins(),
  };
}

function saveStateToLocal() {
  try {
    const s = JSON.stringify(getAppState());
    localStorage.setItem('spatium_state', s);
    return true;
  } catch (e) {
    console.warn('[storage] Save failed', e);
    return false;
  }
}

function loadStateFromLocal() {
  try {
    const raw = localStorage.getItem('spatium_state');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    importState(parsed);
    return parsed;
  } catch (e) {
    console.warn('[storage] Load failed', e);
    return null;
  }
}

function exportStateToFile() {
  const state = getAppState();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const name = 'spatium-state-' + new Date().toISOString().slice(0,19).replace(/:/g,'') + '.json';
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function importStateFromFile(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const parsed = JSON.parse(r.result);
      importState(parsed);
    } catch (e) { console.warn('[storage] import file parse error', e); }
  };
  r.readAsText(file);
}

function importState(state) {
  if (!state) return;

  // Stato vecchio (pre-v2): scarta silenziosamente per evitare
  // di sovrascrivere i template con versioni minimali dal localStorage.
  if ((state.schemaVersion || 1) < 2) {
    console.info('[storage] Stato obsoleto (v1), ignorato. Ripartenza con template freschi.');
    localStorage.removeItem('spatium_state');
    return;
  }

  // chiudi finestre correnti
  Object.keys(WINS).map(k => Number(k)).forEach(id => closeW(id));
  // restore counters
  WC = state.meta?.wc || 0; TZ = state.meta?.tz || 100;

  // NON ripristinare TPL dal file salvato: i template vengono sempre da templates.js

  // recreate wins
  (state.wins || []).forEach(w => {
    try {
      const pos = {
        x: w.pos?.left ? parseInt(String(w.pos.left).replace('px','')) : undefined,
        y: w.pos?.top  ? parseInt(String(w.pos.top ).replace('px','')) : undefined,
      };
      const newId = createWin(w.tpl || (w.type === 'map' ? 'Mappa' : 'Computer'), pos);
      setTimeout(() => {
        const target = WINS[newId];
        if (!target) return;

        if (target.type === 'constellation') {
          // Usa sempre la struttura fresca da TPL + assignPositions.
          // Sovrapponi solo attrs/note modificati dall'utente (match per id).
          const currentTpl = TPL[target.tpl];
          if (currentTpl) {
            const fresh = JSON.parse(JSON.stringify(currentTpl));
            const savedById = {};
            (w.nodes || []).forEach(n => { savedById[n.id] = n; });
            fresh.nodes.forEach(n => {
              const sv = savedById[n.id];
              if (sv) {
                if (sv.attrs && sv.attrs.length) n.attrs = sv.attrs;
                if (sv.note) n.note = sv.note;
              }
            });
            assignPositions(fresh.nodes);
            target.nodes = fresh.nodes;
          }
          target.scene3d?.dispose();
          target.scene3d = create3DScene(
            newId, target.nodes,
            TPL[target.tpl]?.color || 0x63b3ff,
            node => openSP(newId, node, 'node')
          );
        }

        if (w.pins) {
          target.pins = w.pins;
          renderPinList(newId);
          (target.pins || []).forEach(p => addPinMesh(newId, p));
        }
        if (w.events)   target.events   = w.events;
        if (w.treeData) target.treeData = w.treeData;
        if (w.calState) target.calState = w.calState;
        if (w.mapState) target.mapState = w.mapState;
        if (w.notes) {
          target.notes = w.notes;
          target.currentNoteId = w.currentNoteId;
          if (w.noteSidebarWidth) target.noteSidebarWidth = w.noteSidebarWidth;
          requestAnimationFrame(() => initNotes(newId));
        }
        if (w.thoughts && target.type === 'brain') {
          target.thoughts = w.thoughts;
        }
      }, 150);
    } catch (e) { console.warn('[storage] failed to recreate win', e); }
  });

  // salva nello storage locale la versione importata
  saveStateToLocal();
}

// API pubbliche
window.persistState = saveStateToLocal;
window.exportStateToFile = exportStateToFile;
window.importStateFromFile = importStateFromFile;
window.loadStateFromLocal = loadStateFromLocal;

// Utility per aggiungere/rimuovere nodi in una finestra (constellation)
window.addNodeToWin = function(winId, node) {
  const w = WINS[winId]; if (!w) return false;
  if (!w.nodes) w.nodes = [];
  w.nodes.push(node);
  // ricrea la scena 3D per includere il nuovo nodo
  if (w.scene3d) { w.scene3d.dispose(); }
  w.scene3d = create3DScene(winId, w.nodes, TPL[w.tpl]?.color || 0x63b3ff, n => openSP(winId, n, 'node'));
  if (window.persistState) window.persistState();
  return true;
};

window.removeNodeFromWin = function(winId, nodeId) {
  const w = WINS[winId]; if (!w || !w.nodes) return false;
  w.nodes = w.nodes.filter(n => n.id !== nodeId);
  if (w.scene3d) { w.scene3d.dispose(); }
  w.scene3d = create3DScene(winId, w.nodes, TPL[w.tpl]?.color || 0x63b3ff, n => openSP(winId, n, 'node'));
  if (window.persistState) window.persistState();
  return true;
};

// auto-load on startup if found
window.addEventListener('DOMContentLoaded', () => {
  // non forzare il caricamento automatico se non esiste uno stato
  // ma lasciare l'opzione: carica se presente
  if (localStorage.getItem('spatium_state')) {
    // carica dopo un tick per permettere init base
    setTimeout(() => { loadStateFromLocal(); }, 200);
  }
});
