'use strict';
/* ═══════════════════════════════════════════════════════════
   MAIN — entry point, avvio applicazione
   Dipende da: tutti gli altri moduli JS
   ═══════════════════════════════════════════════════════════ */

// Pulsante "+ Nuova" nella taskbar:
// apre il prossimo template disponibile (o cicla se tutti aperti)
document.getElementById('btn-new').onclick = () => {
  const all  = [...Object.keys(TPL), 'Calendario'];
  const used = Object.values(WINS).map(w => w.tpl);
  const avail = all.filter(l => !used.includes(l));
  const pick  = avail[0] || all[WC % all.length];
  createWin(pick, { x: 50 + WC * 22, y: 30 + WC * 22 });
};

// ── finestre iniziali ──────────────────────────────────────
createWin('Computer', { x: 30, y: 20 });

setTimeout(() => {
  createWin('Calendario', { x: 100, y: 65 });
  // scrolla verso l'ora corrente dopo il render
  setTimeout(() => scrollToNow(2), 300);
}, 180);
