'use strict';
/* ═══════════════════════════════════════════════════════════
   EMBED V3 / V5 — iframe wrappers per i file HTML originali
   Dipende da: window-manager.js (WINS)
   ═══════════════════════════════════════════════════════════ */

function v3BodyHTML(id) {
  return `<iframe id="emb-v3-${id}" class="win-embed-frame"
    src="assets/uploads/coster_tektelic_v3 (1).html"
    frameborder="0" allowfullscreen></iframe>`;
}

function v5BodyHTML(id) {
  return `<iframe id="emb-v5-${id}" class="win-embed-frame"
    src="assets/uploads/coster_tektelic_v5.html"
    frameborder="0" allowfullscreen></iframe>`;
}

function initV3(_id) { /* iframe auto-loads */ }
function initV5(_id) { /* iframe auto-loads */ }
