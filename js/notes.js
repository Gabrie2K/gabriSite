'use strict';
/* ═══════════════════════════════════════════════════════════
   NOTES — semplice "notebook" con sezioni testuali
   Dipende da: window-manager.js (WINS)
   ═══════════════════════════════════════════════════════════ */

/**
 * HTML usato all'interno di una finestra di tipo note/notebook.
 * Viene invocata da `getBodyHTML` in window-manager.js quando il
 * tipo della finestra è "notes".
 */
function notesBodyHTML(id) {
  return `
    <div class="note-app" id="noteApp${id}">
      <div class="note-sidebar" id="noteSidebar${id}"></div>
      <div class="note-content" id="noteContent${id}"></div>
    </div>`;
}

/**
 * Inizializza la vista notebook per la finestra `id`.
 * Crea alcune "sezioni" di testo di esempio e rende la prima
 * visibile.
 */
function initNotes(id) {
  const w = WINS[id];
  if (!w || w.type !== 'notes') return;
  if (!w.notes) {
    w.notes = [
      { id: 'n1', title: 'Sezione 1', content: 'Questo è il testo della sezione 1.\nPuoi usarla come nota personale.' },
      { id: 'n2', title: 'Sezione 2', content: 'Contenuto della sezione 2...\nAggiungi qui dettagli e riflessioni.' },
      { id: 'n3', title: 'Sezione 3', content: 'Altro testo di esempio per la sezione 3.\nOgni sezione può contenere più paragrafi.' }
    ];
  }
  w.currentNoteId = w.currentNoteId || w.notes[0]?.id;
  renderNotes(id);
}

/**
 * Costruisce l'interfaccia documento/side-bar e mostra la sezione
 * corrente. Se focusContent=true, mette il focus sulla textarea.
 */
function renderNotes(id, focusContent) {
  const w = WINS[id];
  if (!w) return;
  const sidebar = document.getElementById('noteSidebar' + id);
  const content = document.getElementById('noteContent' + id);
  if (!sidebar || !content) return;
  if (!w.noteSidebarWidth) w.noteSidebarWidth = 170;
  sidebar.style.width = w.noteSidebarWidth + 'px';

  sidebar.innerHTML = '';
  w.notes.forEach(sec => {
    const item = document.createElement('div');
    item.className = 'note-sidebar-item';
    item.dataset.nid = sec.id;

    const lbl = document.createElement('span');
    lbl.className = 'note-sidebar-label';
    lbl.textContent = sec.title;

    // click: salva contenuto corrente e passa alla sezione
    lbl.onclick = (e) => {
      e.stopPropagation();
      // salva testo attuale dalla textarea se presente
      const currTa = content.querySelector('.note-content-ta');
      if (currTa) {
        const curr = w.notes.find(n => n.id === w.currentNoteId);
        if (curr) curr.content = currTa.value;
      }
      w.currentNoteId = sec.id;
      renderNotes(id, true); // focus immediato
    };

    // doppio click: rinomina sezione
    lbl.ondblclick = (e) => {
      e.stopPropagation();
      const inp = document.createElement('input');
      inp.type = 'text'; inp.className = 'note-sidebar-rename'; inp.value = sec.title;
      inp.onmousedown = ev => ev.stopPropagation();
      const commit = () => {
        const v = inp.value.trim(); if (v) sec.title = v;
        if (window.persistState) window.persistState();
        renderNotes(id);
      };
      inp.onkeydown = ev => {
        ev.stopPropagation();
        if (ev.key === 'Enter') commit();
        if (ev.key === 'Escape') renderNotes(id);
      };
      inp.onblur = commit;
      item.replaceChild(inp, lbl);
      inp.focus(); inp.select();
    };

    item.appendChild(lbl);
    if (w.currentNoteId === sec.id) item.classList.add('active');
    sidebar.appendChild(item);
  });

  // resizer
  let resizer = document.getElementById('note-resizer-' + id);
  if (!resizer) {
    resizer = document.createElement('div');
    resizer.id = 'note-resizer-' + id;
    resizer.className = 'note-sidebar-resizer';
    sidebar.parentNode.insertBefore(resizer, content);
  }

  // contenuto: sempre textarea editabile direttamente
  const curr = w.notes.find(n => n.id === w.currentNoteId) || w.notes[0] || null;
  content.innerHTML = '';
  if (curr) {
    const ta = document.createElement('textarea');
    ta.className = 'note-content-ta';
    ta.value = curr.content || '';
    ta.onmousedown = ev => ev.stopPropagation();
    ta.onkeydown = ev => ev.stopPropagation();
    ta.oninput = () => {
      curr.content = ta.value;
      if (window.persistState) window.persistState();
    };
    content.appendChild(ta);
    if (focusContent) {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = ta.value.length;
    }
  }

  attachNoteResizer(id);
}

// resizer behaviour: drag horizontally to change sidebar width
function attachNoteResizer(id) {
  const sidebar = document.getElementById('noteSidebar' + id);
  const resizer = document.getElementById('note-resizer-' + id);
  const content = document.getElementById('noteContent' + id);
  if (!sidebar || !resizer || !content) return;
  let dragging = false; let startX = 0; let startW = 0;
  const onMouseDown = (e) => { dragging = true; startX = e.clientX; startW = sidebar.offsetWidth; e.preventDefault(); };
  const onMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX; const nw = Math.max(120, startW + dx);
    sidebar.style.width = nw + 'px';
  };
  const onMouseUp = (e) => {
    if (!dragging) return; dragging = false;
    const nw = sidebar.offsetWidth;
    const wobj = WINS[id]; if (wobj) { wobj.noteSidebarWidth = nw; }
    if (window.persistState) window.persistState();
  };
  // bind
  resizer.onmousedown = onMouseDown;
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}
