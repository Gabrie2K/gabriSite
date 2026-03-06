'use strict';
/* ═══════════════════════════════════════════════════════════
   NOTES — Notebook con sezioni ad albero (children illimitati),
           editor contenteditable, immagini inline ridimensionabili,
           export/import HTML per sezione
   Dipende da: window-manager.js (WINS)
   ═══════════════════════════════════════════════════════════ */

function notesBodyHTML(id) {
  return `
    <div class="note-app" id="noteApp${id}">
      <div class="note-sidebar" id="noteSidebar${id}"></div>
      <div class="note-content" id="noteContent${id}"></div>
    </div>
    <input type="file" id="noteImgInp${id}"  accept="image/*"          style="display:none">
    <input type="file" id="noteHtmlInp${id}" accept=".html,text/html"  style="display:none">`;
}

// ── Init ─────────────────────────────────────────────────────

function initNotes(id) {
  const w = WINS[id];
  if (!w || w.type !== 'notes') return;
  if (!w.notes) {
    w.notes = [
      { id: 'n1', title: 'Sezione 1', content: '', children: [] },
      { id: 'n2', title: 'Sezione 2', content: '', children: [] },
      { id: 'n3', title: 'Sezione 3', content: '', children: [] },
    ];
  }
  // backward-compat: ensure children on every node
  _migrateNotes(w.notes);
  w.currentNoteId     = w.currentNoteId     || w.notes[0]?.id;
  w.collapsedSections = w.collapsedSections || {};
  renderNotes(id);
}

function _migrateNotes(sections) {
  (sections || []).forEach(s => {
    if (!s.children) s.children = [];
    _migrateNotes(s.children);
  });
}

// ── Recursive helpers ────────────────────────────────────────

function _findNote(sections, id) {
  for (const s of sections) {
    if (s.id === id) return s;
    const found = _findNote(s.children || [], id);
    if (found) return found;
  }
  return null;
}

// ── Save current editor content ───────────────────────────────

function _saveEditorContent(id) {
  const w = WINS[id]; if (!w) return;
  const editor = document.getElementById('noteEditor' + id);
  if (!editor) return;
  const curr = _findNote(w.notes, w.currentNoteId);
  if (curr) curr.content = editor.innerHTML;
}

// ── Main render ───────────────────────────────────────────────

function renderNotes(id, focusContent) {
  const w = WINS[id]; if (!w) return;
  const sidebar = document.getElementById('noteSidebar' + id);
  const content = document.getElementById('noteContent' + id);
  if (!sidebar || !content) return;

  sidebar.style.width = (w.noteSidebarWidth || 170) + 'px';
  w.collapsedSections = w.collapsedSections || {};

  // ── sidebar ──────────────────────────────────────────────────
  sidebar.innerHTML = '';

  const addRootBtn = document.createElement('button');
  addRootBtn.className = 'note-add-sec-btn';
  addRootBtn.textContent = '+ sezione';
  addRootBtn.onmousedown = e => e.stopPropagation();
  addRootBtn.onclick = () => {
    _saveEditorContent(id);
    const ns = { id: 'n' + Date.now(), title: 'Nuova sezione', content: '', children: [] };
    w.notes.push(ns);
    w.currentNoteId = ns.id;
    renderNotes(id, true);
    if (window.persistState) window.persistState();
  };
  sidebar.appendChild(addRootBtn);

  _renderSidebarTree(w.notes, 0, sidebar, id, w);

  // sidebar resizer
  let resizer = document.getElementById('note-resizer-' + id);
  if (!resizer) {
    resizer = document.createElement('div');
    resizer.id = 'note-resizer-' + id;
    resizer.className = 'note-sidebar-resizer';
    sidebar.parentNode.insertBefore(resizer, content);
  }

  // ── content ───────────────────────────────────────────────────
  const curr = _findNote(w.notes, w.currentNoteId) || null;
  content.innerHTML = '';
  if (!curr) return;

  // toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'note-content-toolbar';
  const imgBtn = document.createElement('button');
  imgBtn.className = 'note-toolbar-btn';
  imgBtn.textContent = '+ Immagine';
  imgBtn.onmousedown = e => e.stopPropagation();
  imgBtn.onclick = e => { e.stopPropagation(); document.getElementById('noteImgInp' + id)?.click(); };
  toolbar.appendChild(imgBtn);
  content.appendChild(toolbar);

  // editor
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

  // click on img → resize handles
  editor.addEventListener('mousedown', e => {
    if (e.target.tagName === 'IMG') {
      setTimeout(() => showNoteImgResizer(id, e.target, editor, curr), 0);
    } else {
      hideNoteImgResizer();
    }
  });

  // paste image
  editor.addEventListener('paste', e => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = ev => _noteInsertImage(id, ev.target.result, editor, curr);
        reader.readAsDataURL(item.getAsFile());
        break;
      }
    }
  });

  content.appendChild(editor);

  // image file input
  const imgInp = document.getElementById('noteImgInp' + id);
  if (imgInp) {
    imgInp.onchange = e => {
      const file = e.target.files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => _noteInsertImage(id, ev.target.result, editor, curr);
      reader.readAsDataURL(file);
      e.target.value = '';
    };
  }

  // HTML upload input — restores section content from an exported .html file
  const htmlInp = document.getElementById('noteHtmlInp' + id);
  if (htmlInp) {
    htmlInp.onchange = e => {
      const file = e.target.files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const parser = new DOMParser();
        const doc    = parser.parseFromString(ev.target.result, 'text/html');
        // exported Spatium HTML: <body><h1>Title</h1><div>content</div></body>
        const div  = doc.querySelector('body > div');
        const html = div ? div.innerHTML : doc.body.innerHTML;
        const target = _findNote(w.notes, w._noteUploadTargetId);
        if (target) {
          target.content = html;
          if (w.currentNoteId === target.id) {
            editor.innerHTML = html;
            curr.content     = html;
          }
          if (window.persistState) window.persistState();
        }
      };
      reader.readAsText(file);
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

// ── Recursive sidebar tree builder ───────────────────────────

function _renderSidebarTree(sections, depth, container, id, w) {
  sections.forEach(sec => {
    sec.children = sec.children || [];
    const hasChildren = sec.children.length > 0;
    const isCollapsed = !!w.collapsedSections?.[sec.id];

    const item = document.createElement('div');
    item.className = 'note-sidebar-item' + (w.currentNoteId === sec.id ? ' active' : '');
    item.style.paddingLeft = (8 + depth * 14) + 'px';

    // ▶/▼ toggle (or spacer)
    if (hasChildren) {
      const tog = document.createElement('button');
      tog.className = 'note-sec-toggle';
      tog.textContent = isCollapsed ? '▶' : '▼';
      tog.onmousedown = e => e.stopPropagation();
      tog.onclick = e => {
        e.stopPropagation();
        if (!w.collapsedSections) w.collapsedSections = {};
        if (isCollapsed) delete w.collapsedSections[sec.id];
        else w.collapsedSections[sec.id] = true;
        renderNotes(id);
        if (window.persistState) window.persistState();
      };
      item.appendChild(tog);
    } else {
      const ph = document.createElement('span');
      ph.className = 'note-sec-toggle-ph';
      item.appendChild(ph);
    }

    // label
    const lbl = document.createElement('span');
    lbl.className = 'note-sidebar-label';
    lbl.textContent = sec.title;

    lbl.onclick = e => {
      e.stopPropagation();
      _saveEditorContent(id);
      w.currentNoteId = sec.id;
      renderNotes(id, true);
    };

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

    item.appendChild(lbl);

    // + add child
    const addChild = document.createElement('button');
    addChild.className = 'note-sec-addchild';
    addChild.title = 'Aggiungi sezione figlia';
    addChild.textContent = '+';
    addChild.onmousedown = e => e.stopPropagation();
    addChild.onclick = e => {
      e.stopPropagation();
      _saveEditorContent(id);
      const ns = { id: 'n' + Date.now(), title: 'Nuova sezione', content: '', children: [] };
      sec.children.push(ns);
      if (w.collapsedSections?.[sec.id]) delete w.collapsedSections[sec.id]; // auto-expand
      w.currentNoteId = ns.id;
      renderNotes(id, true);
      if (window.persistState) window.persistState();
    };

    // ↑ import HTML
    const upBtn = document.createElement('button');
    upBtn.className = 'note-sec-upload';
    upBtn.title = 'Importa contenuto da file HTML';
    upBtn.textContent = '↑';
    upBtn.onmousedown = e => e.stopPropagation();
    upBtn.onclick = e => {
      e.stopPropagation();
      w._noteUploadTargetId = sec.id;
      document.getElementById('noteHtmlInp' + id)?.click();
    };

    // ↓ export HTML
    const expBtn = document.createElement('button');
    expBtn.className = 'note-sec-export';
    expBtn.title = 'Esporta sezione come HTML';
    expBtn.textContent = '↓';
    expBtn.onmousedown = e => e.stopPropagation();
    expBtn.onclick = e => {
      e.stopPropagation();
      _saveEditorContent(id);
      const s = _findNote(w.notes, sec.id);
      const html = `<!DOCTYPE html>\n<html lang="it">\n<head>\n  <meta charset="UTF-8">\n  <title>${sec.title}</title>\n  <style>\n    body { font-family: monospace; max-width: 820px; margin: 48px auto;\n           line-height: 1.8; color: #d1d5db; background: #0a0e1a; padding: 0 24px; }\n    img  { max-width: 100%; border-radius: 4px; }\n    h1   { font-size: 1.3rem; margin-bottom: 24px; color: #fff; }\n  </style>\n</head>\n<body>\n  <h1>${sec.title}</h1>\n  <div>${s?.content || ''}</div>\n</body>\n</html>`;
      const blob = new Blob([html], { type: 'text/html' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = (sec.title.replace(/\s+/g, '-') || 'sezione') + '.html';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    };

    item.appendChild(addChild);
    item.appendChild(upBtn);
    item.appendChild(expBtn);
    container.appendChild(item);

    // recurse into children (unless collapsed)
    if (!isCollapsed && sec.children.length > 0) {
      _renderSidebarTree(sec.children, depth + 1, container, id, w);
    }
  });
}

// ── Insert image ──────────────────────────────────────────────

function _noteInsertImage(id, src, editor, sec) {
  const img = document.createElement('img');
  img.src       = src;
  img.className = 'note-inline-img';
  img.style.width  = '280px';
  img.style.height = 'auto';
  img.draggable    = false;

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

// ── Image resize overlay ──────────────────────────────────────

let _nrImg = null, _nrEditor = null, _nrSec = null, _nrWinId = null;

function showNoteImgResizer(winId, img, editor, sec) {
  hideNoteImgResizer();
  _nrImg = img; _nrEditor = editor; _nrSec = sec; _nrWinId = winId;

  let ov = document.getElementById('note-global-resizer');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'note-global-resizer';
    ov.className = 'note-img-resizer-overlay';
    ['nw', 'ne', 'sw', 'se'].forEach(c => {
      const h = document.createElement('div');
      h.className = 'note-img-handle'; h.dataset.c = c;
      ov.appendChild(h);
    });
    document.body.appendChild(ov);
  }

  _positionNoteResizer(ov, img);
  ov.style.display = 'block';

  ov.querySelectorAll('.note-img-handle').forEach(h => {
    h.onmousedown = e => {
      e.preventDefault(); e.stopPropagation();
      const isLeft = h.dataset.c[1] === 'w';
      const startX = e.clientX, startW = img.offsetWidth;
      const onMove = e2 => {
        img.style.width = Math.max(40, startW + (isLeft ? -(e2.clientX - startX) : (e2.clientX - startX))) + 'px';
        _positionNoteResizer(ov, img);
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
        if (_nrEditor && _nrSec) { _nrSec.content = _nrEditor.innerHTML; if (window.persistState) window.persistState(); }
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    };
  });

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
  ov.style.left = r.left + 'px'; ov.style.top    = r.top    + 'px';
  ov.style.width = r.width + 'px'; ov.style.height = r.height + 'px';
}

// ── Sidebar width resizer ─────────────────────────────────────

function attachNoteResizer(id) {
  const sidebar = document.getElementById('noteSidebar' + id);
  const resizer = document.getElementById('note-resizer-' + id);
  const content = document.getElementById('noteContent' + id);
  if (!sidebar || !resizer || !content) return;
  let dragging = false, startX = 0, startW = 0;
  resizer.onmousedown = e => { dragging = true; startX = e.clientX; startW = sidebar.offsetWidth; e.preventDefault(); };
  const onMove = e => { if (!dragging) return; sidebar.style.width = Math.max(120, startW + e.clientX - startX) + 'px'; };
  const onUp   = () => {
    if (!dragging) return; dragging = false;
    const wobj = WINS[id]; if (wobj) wobj.noteSidebarWidth = sidebar.offsetWidth;
    if (window.persistState) window.persistState();
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   onUp);
}
