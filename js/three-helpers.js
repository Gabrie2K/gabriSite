'use strict';
/* ═══════════════════════════════════════════════════════════
   THREE-HELPERS — utility Three.js condivise
   QUICK EDIT:
     SPHERE_R  : raggio della sfera su cui vengono distribuiti i nodi
     CAM_START : distanza iniziale della camera
   ═══════════════════════════════════════════════════════════ */

const SPHERE_R   = 155;
const CAM_START  = 340;

/**
 * Distribuisce i nodi sulla superficie di una sfera (golden angle).
 * Il nodo `main` viene posizionato al centro (0,0,0).
 * @param {Array} nodes  - array di nodi del template
 */
function assignPositions(nodes) {
  const subs = nodes.filter(n => !n.main);
  const phi  = Math.PI * (3 - Math.sqrt(5)); // golden angle

  subs.forEach((n, i) => {
    if (!subs.length) return;
    if (subs.length === 1) {
      n._v = new THREE.Vector3(SPHERE_R, 0, 0);
      return;
    }
    const y = 1 - (i / (subs.length - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const t = phi * i;
    n._v = new THREE.Vector3(r * Math.cos(t) * SPHERE_R, y * SPHERE_R, r * Math.sin(t) * SPHERE_R);
  });

  const main = nodes.find(n => n.main);
  if (main) main._v = new THREE.Vector3(0, 0, 0);
}

/**
 * Crea uno Sprite Three.js con testo renderizzato su canvas.
 * @param {string} text  - testo da visualizzare
 * @param {string} col   - colore CSS (default '#a8d4ff')
 * @returns {THREE.Sprite}
 */
function makeLabel(text, col) {
  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = 56;
  const cx = cv.getContext('2d');
  cx.font = '600 26px Syne,Arial,sans-serif';
  cx.fillStyle = col || '#a8d4ff';
  cx.textAlign = 'center';
  cx.fillText(text, 128, 36);

  const mat = new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(cv),
    transparent: true,
    depthWrite: false,
  });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(82, 18, 1);
  return sp;
}
