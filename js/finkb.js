'use strict';
/* ═══════════════════════════════════════════════════════════
   EMBED FIN DOCS — iframe wrapper per fin_kb_v5.html (1.7MB)
   Dipende da: window-manager.js (WINS)
   ═══════════════════════════════════════════════════════════ */

function findocsBodyHTML(id) {
  return `<iframe id="emb-findocs-${id}" class="win-embed-frame"
    src="assets/uploads/fin_kb_v5.html"
    frameborder="0" allowfullscreen></iframe>`;
}

function initFindocs(_id) { /* iframe auto-loads */ }
