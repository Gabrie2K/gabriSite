'use strict';
/* ═══════════════════════════════════════════════════════════
   BACKGROUND — canvas 2D con stelle animate
   QUICK EDIT: cambia `length:220` per più/meno stelle
   ═══════════════════════════════════════════════════════════ */

const bgC = document.getElementById('bg');
const bgX = bgC.getContext('2d');
let bgW, bgH, bgS = [];

function initBg() {
  bgC.width  = bgW = innerWidth;
  bgC.height = bgH = innerHeight;
  bgS = Array.from({ length: 220 }, () => ({
    x:  Math.random() * bgW,
    y:  Math.random() * bgH,
    r:  Math.random() * 1.1 + .15,
    a:  Math.random() * .5  + .1,
    sp: Math.random() * .002 + .001,
    ph: Math.random() * Math.PI * 2,
  }));
}

function drawBg(t) {
  bgX.clearRect(0, 0, bgW, bgH);
  bgS.forEach(s => {
    bgX.beginPath();
    bgX.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    bgX.fillStyle = `rgba(200,220,255,${s.a + Math.sin(t * s.sp + s.ph) * .1})`;
    bgX.fill();
  });
}

initBg();
window.addEventListener('resize', initBg);
(function loop(t) { drawBg(t * .001); requestAnimationFrame(loop); })();
