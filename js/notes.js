'use strict';
/* ═══════════════════════════════════════════════════════════
   NOTES — Notebook con sezioni, editor contenteditable,
           immagini inline ridimensionabili, export per sezione
   Dipende da: window-manager.js (WINS)
   ═══════════════════════════════════════════════════════════ */

function notesBodyHTML(id) {
  return `
    <div class="note-app" id="noteApp${id}">
      <div class="note-sidebar" id="noteSidebar${id}"></div>
      <div class="note-content" id="noteContent${id}"></div>
    </div>
    <input type="file" id="noteImgInp${id}" accept="image/*" style="display:none">`;
}

// ── Init ─────────────────────────────────────────────────────

function initNotes(id) {
  const w = WINS[id];
  if (!w || w.type !== 'notes') return;
  if (!w.notes) {
    w.notes = [
      { id: 'n1', title: 'Sezione 1', content: '' },
      { id: 'n2', title: 'Sezione 2', content: '' },
      { id: 'n3', title: 'Sezione 3', content: '' },
    ];
  }
  w.currentNoteId = w.currentNoteId || w.notes[0]?.id;
  renderNotes(id);
}

// ── Save current editor HTML back to notes array ─────────────

function _saveEditorContent(id) {
  const w = WINS[id]; if (!w) return;
  const editor = document.getElementById('noteEditor' + id);
  if (!editor) return;
  const curr = w.notes?.find(n => n.id === w.currentNoteId);
  if (curr) curr.content = editor.innerHTML;
}

// ── Render sidebar + editor ───────────────────────────────────

function renderNotes(id, focusContent) {
  const w = WINS[id]; if (!w) return;
  const sidebar = document.getElementById('noteSidebar' + id);
  const content = document.getElementById('noteContent' + id);
  if (!sidebar || !content) return;

  sidebar.style.width = (w.noteSidebarWidth || 170) + 'px';

  // ── sidebar ─────────────────────────────────────────────────
  sidebar.innerHTML = '';

  // "+ sezione" button
  const addBtn = document.createElement('button');
  addBtn.className = 'note-add-sec-btn';
  addBtn.textContent = '+ sezione';
  addBtn.onmousedown = e => e.stopPropagation();
  addBtn.onclick = () => {
    _saveEditorContent(id);
    const ns = { id: 'n' + Date.now(), title: 'Nuova sezione', content: '' };
    w.notes.push(ns);
    w.currentNoteId = ns.id;
    renderNotes(id, true);
    if (window.persistState) window.persistState();
  };
  sidebar.appendChild(addBtn);

  w.notes.forEach(sec => {
    const item = document.createElement('div');
    item.className = 'note-sidebar-item' + (w.currentNoteId === sec.id ? ' active' : '');

    const lbl = document.createElement('span');
    lbl.className = 'note-sidebar-label';
    lbl.textContent = sec.title;

    // single click → switch
    lbl.onclick = e => {
      e.stopPropagation();
      _saveEditorContent(id);
      w.currentNoteId = sec.id;
      renderNotes(id, true);
    };

    // double-click → rename
    lbl.ondblclick = e => {
      e.stopPropagation();
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.className = 'note-sidebar-rename';
      inp.value = sec.title;
      inp.onmousedown = ev => ev.stopPropagation();
      const commit = () => {
        const v = inp.value.trim();
        if (v) sec.title = v;
        if (window.persistState) window.persistState();
        renderNotes(id);
      };
      inp.onkeydown = ev => {
        ev.stopPropagation();
        if (ev.key === 'Enter')  commit();
        if (ev.key === 'Escape') renderNotes(id);
      };
      inp.onblur = commit;
      item.replaceChild(inp, lbl);
      inp.focus(); inp.select();
    };

    // export button (↓)
    const expBtn = document.createElement('button');
    expBtn.className = 'note-sec-export';
    expBtn.title = 'Esporta sezione come HTML';
    expBtn.textContent = '↓';
    expBtn.onmousedown = e => e.stopPropagation();
    expBtn.onclick = e => {
      e.stopPropagation();
      _saveEditorContent(id);
      const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>${sec.title}</title>
  <style>
    body { font-family: monospace; max-width: 820px; margin: 48px auto;
           line-height: 1.8; color: #d1d5db; background: #0a0e1a; padding: 0 24px; }
    img  { max-width: 100%; border-radius: 4px; }
    h1   { font-size: 1.3rem; margin-bottom: 24px; color: #fff; }
  </style>
</head>
<body>
  <h1>${sec.title}</h1>
  <div>${sec.content || ''}</div>
</body>
</html>`;
      const blob = new Blob([html], { type: 'text/html' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = (sec.title.replace(/\s+/g, '-') || 'sezione') + '.html';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    };

    item.appendChild(lbl);
    item.appendChild(expBtn);
    sidebar.appendChild(item);
  });

  // sidebar ↔ content resizer
  let resizer = document.getElementById('note-resizer-' + id);
  if (!resizer) {
    resizer = document.createElement('div');
    resizer.id = 'note-resizer-' + id;
    resizer.className = 'note-sidebar-resizer';
    sidebar.parentNode.insertBefore(resizer, content);
  }

  // ── content area ────────────────────────────────────────────
  const curr = w.notes.find(n => n.id === w.currentNoteId) || w.notes[0] || null;
  content.innerHTML = '';

  if (!curr) return;

  // toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'note-content-toolbar';

  const imgBtn = document.createElement('button');
  imgBtn.className = 'note-toolbar-btn';
  imgBtn.textContent = '+ Immagine';
  imgBtn.title = 'Inserisci immagine (o incolla da clipboard)';
  imgBtn.onmousedown = e => e.stopPropagation();
  imgBtn.onclick = e => {
    e.stopPropagation();
    document.getElementById('noteImgInp' + id)?.click();
  };
  toolbar.appendChild(imgBtn);
  content.appendChild(toolbar);

  // contenteditable editor
  const editor = document.createElement('div');
  editor.id = 'noteEditor' + id;
  editor.className = 'note-content-editable';
  editor.contentEditable = 'true';
  editor.spellcheck = true;
  editor.dataset.wid = id;
  editor.innerHTML = curr.content || '';

  editor.onmousedown = e => e.stopPropagation();
  editor.onkeydown   = e => e.stopPropagation();

  editor.oninput = () => {
    curr.content = editor.innerHTML;
    if (window.persistState) window.persistState();
  };

  // click on img → show resize handles
  editor.addEventListener('mousedown', e => {
    if (e.target.tagName === 'IMG') {
      // don't prevent default here — let contenteditable handle cursor
      setTimeout(() => showNoteImgResizer(id, e.target, editor, curr), 0);
    } else {
      hideNoteImgResizer();
    }
  });

  // paste image from clipboard
  editor.addEventListener('paste', e => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const blob   = item.getAsFile();
        const reader = new FileReader();
        reader.onload = ev => _noteInsertImage(id, ev.target.result, editor, curr);
        reader.readAsDataURL(blob);
        break;
      }
    }
  });

  content.appendChild(editor);

  // file input → insert image
  const fileInp = document.getElementById('noteImgInp' + id);
  if (fileInp) {
    fileInp.onchange = e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => _noteInsertImage(id, ev.target.result, editor, curr);
      reader.readAsDataURL(file);
      e.target.value = '';
    };
  }

  if (focusContent) {
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  attachNoteResizer(id);
}

// ── Insert image at cursor ────────────────────────────────────

function _noteInsertImage(id, src, editor, sec) {
  const img = document.createElement('img');
  img.src       = src;
  img.className = 'note-inline-img';
  img.style.width   = '280px';
  img.style.height  = 'auto';
  img.draggable     = false;

  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(img);
    range.setStartAfter(img);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    editor.appendChild(img);
  }

  sec.content = editor.innerHTML;
  if (window.persistState) window.persistState();
  showNoteImgResizer(id, img, editor, sec);
}

// ── Image resize overlay (position:fixed, appended to body) ──

let _nrImg    = null;  // currently selected img
let _nrEditor = null;
let _nrSec    = null;
let _nrWinId  = null;

function showNoteImgResizer(winId, img, editor, sec) {
  hideNoteImgResizer();

  _nrImg    = img;
  _nrEditor = editor;
  _nrSec    = sec;
  _nrWinId  = winId;

  let ov = document.getElementById('note-global-resizer');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'note-global-resizer';
    ov.className = 'note-img-resizer-overlay';
    ['nw', 'ne', 'sw', 'se'].forEach(c => {
      const h = document.createElement('div');
      h.className = 'note-img-handle';
      h.dataset.c = c;
      ov.appendChild(h);
    });
    document.body.appendChild(ov);
  }

  _positionNoteResizer(ov, img);
  ov.style.display = 'block';

  ov.querySelectorAll('.note-img-handle').forEach(h => {
    h.onmousedown = e => {
      e.preventDefault();
      e.stopPropagation();

      const corner = h.dataset.c;
      const startX = e.clientX;
      const startW = img.offsetWidth;
      const aspect = (img.naturalWidth || img.offsetWidth) / (img.naturalHeight || img.offsetHeight || 1);
      const isLeft = corner[1] === 'w';

      function onMove(e2) {
        const dx   = e2.clientX - startX;
        const newW = Math.max(40, startW + (isLeft ? -dx : dx));
        img.style.width  = newW + 'px';
        img.style.height = 'auto';          // keep auto so browser scales height proportionally
        _positionNoteResizer(ov, img);
      }

      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
        if (_nrEditor && _nrSec) {
          _nrSec.content = _nrEditor.innerHTML;
          if (window.persistState) window.persistState();
        }
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    };
  });

  // hide when clicking outside
  setTimeout(() => {
    const onOut = e => {
      const ov2 = document.getElementById('note-global-resizer');
      if (ov2 && !ov2.contains(e.target) && e.target !== _nrImg) {
        hideNoteImgResizer();
        document.removeEventListener('mousedown', onOut);
      }
    };
    document.addEventListener('mousedown', onOut);
  }, 50);
}

function hideNoteImgResizer() {
  const ov = document.getElementById('note-global-resizer');
  if (ov) ov.style.display = 'none';
  _nrImg = _nrEditor = _nrSec = _nrWinId = null;
}

function _positionNoteResizer(ov, img) {
  const r = img.getBoundingClientRect();
  ov.style.left   = r.left   + 'px';
  ov.style.top    = r.top    + 'px';
  ov.style.width  = r.width  + 'px';
  ov.style.height = r.height + 'px';
}

// ── Sidebar width resizer ─────────────────────────────────────

function attachNoteResizer(id) {
  const sidebar = document.getElementById('noteSidebar' + id);
  const resizer = document.getElementById('note-resizer-' + id);
  const content = document.getElementById('noteContent' + id);
  if (!sidebar || !resizer || !content) return;

  let dragging = false, startX = 0, startW = 0;

  resizer.onmousedown = e => {
    dragging = true; startX = e.clientX; startW = sidebar.offsetWidth;
    e.preventDefault();
  };

  const onMove = e => {
    if (!dragging) return;
    sidebar.style.width = Math.max(120, startW + e.clientX - startX) + 'px';
  };

  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    const wobj = WINS[id];
    if (wobj) wobj.noteSidebarWidth = sidebar.offsetWidth;
    if (window.persistState) window.persistState();
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   onUp);
}
