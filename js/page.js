'use strict';
/* ═══════════════════════════════════════════════════════════
   PAGINA — editor documento stile Loop
   Blocchi: testo (textarea auto-espandibile) + immagini (resize handles)
   Dipende da: window-manager.js (WINS)
   ═══════════════════════════════════════════════════════════ */

function pageBodyHTML(id) {
  return `
    <div class="page-wrap" id="pagewrap${id}">
      <div class="page-toolbar">
        <button class="page-btn" id="pageimgbtn${id}">+ Immagine</button>
        <input type="file" id="pagefileinp${id}" accept="image/*" style="display:none">
      </div>
      <div class="page-doc" id="pagedoc${id}">
        <div class="page-inner" id="pageinner${id}"></div>
      </div>
    </div>`;
}

// ── helpers ─────────────────────────────────────────────────

function pageSave(id) {
  if (window.persistState) window.persistState();
}

function pageNextId() {
  return 'pb-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
}

// ── auto-grow textarea ───────────────────────────────────────

function autoGrow(ta) {
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
}

// ── render one text block ────────────────────────────────────

function buildTextBlockEl(id, block) {
  const wrap = document.createElement('div');
  wrap.className = 'page-block-text';
  wrap.dataset.bid = block.id;

  const ta = document.createElement('textarea');
  ta.className = 'page-ta';
  ta.placeholder = 'Scrivi qui…';
  ta.value = block.content || '';
  ta.rows = 1;
  ta.spellcheck = true;

  ta.onmousedown = e => e.stopPropagation();
  ta.onkeydown   = e => e.stopPropagation();
  ta.oninput = () => {
    block.content = ta.value;
    autoGrow(ta);
    pageSave(id);
  };

  wrap.appendChild(ta);
  requestAnimationFrame(() => autoGrow(ta));
  return wrap;
}

// ── render one image block ───────────────────────────────────

function buildImageBlockEl(id, block, inner) {
  const w = WINS[id];
  const wrap = document.createElement('div');
  wrap.className = 'page-block-img';
  wrap.dataset.bid = block.id;
  wrap.style.width = (block.width || 400) + 'px';

  const img = document.createElement('img');
  img.src = block.src;
  img.style.width  = '100%';
  img.style.height = 'auto';
  img.draggable = false;
  wrap.appendChild(img);

  // delete button
  const del = document.createElement('div');
  del.className = 'page-img-del';
  del.textContent = '✕';
  del.title = 'Rimuovi immagine';
  del.addEventListener('click', e => {
    e.stopPropagation();
    const data = w.pageData;
    const idx  = data.blocks.findIndex(b => b.id === block.id);
    if (idx !== -1) data.blocks.splice(idx, 1);
    renderPage(id);
    pageSave(id);
  });
  wrap.appendChild(del);

  // corner resize handles
  ['nw', 'ne', 'sw', 'se'].forEach(corner => {
    const h = document.createElement('div');
    h.className = 'page-img-handle';
    h.dataset.c  = corner;
    wrap.appendChild(h);

    h.addEventListener('mousedown', e => {
      e.preventDefault();
      e.stopPropagation();
      const startX  = e.clientX;
      const startW  = wrap.offsetWidth;
      const isLeft  = corner[1] === 'w';

      function onMove(e2) {
        const dx   = e2.clientX - startX;
        const newW = Math.max(80, startW + (isLeft ? -dx : dx));
        wrap.style.width = newW + 'px';
        block.width = newW;
      }

      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
        pageSave(id);
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    });
  });

  return wrap;
}

// ── render add-zone between blocks ──────────────────────────

function buildAddZone(id, afterIdx) {
  const w = WINS[id];
  const zone = document.createElement('div');
  zone.className = 'page-add-zone';

  const lineL = document.createElement('div');
  lineL.className = 'page-add-line';

  const btn = document.createElement('button');
  btn.className = 'page-add-btn';
  btn.title = 'Inserisci immagine';
  btn.textContent = '+';
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const inp = document.getElementById('pagefileinp' + id);
    if (!inp) return;
    // store insertion index for the file-pick callback
    w._pageInsertAfter = afterIdx;
    inp.click();
  });

  const lineR = document.createElement('div');
  lineR.className = 'page-add-line';

  zone.appendChild(lineL);
  zone.appendChild(btn);
  zone.appendChild(lineR);
  return zone;
}

// ── full render ──────────────────────────────────────────────

function renderPage(id) {
  const w = WINS[id]; if (!w) return;
  const data  = w.pageData;
  const inner = document.getElementById('pageinner' + id);
  if (!inner) return;

  inner.innerHTML = '';

  data.blocks.forEach((block, idx) => {
    // add-zone before each block (and after last)
    inner.appendChild(buildAddZone(id, idx - 1));

    let el;
    if (block.type === 'text') {
      el = buildTextBlockEl(id, block);
    } else if (block.type === 'image') {
      el = buildImageBlockEl(id, block, inner);
    }
    if (el) inner.appendChild(el);
  });

  // add-zone after last block
  inner.appendChild(buildAddZone(id, data.blocks.length - 1));
}

// ── insert image at position ─────────────────────────────────

function pageInsertImage(id, src, afterIdx) {
  const w    = WINS[id]; if (!w) return;
  const data = w.pageData;

  const imgBlock = { type: 'image', id: pageNextId(), src, width: 400 };
  const insertAt = afterIdx + 1;
  data.blocks.splice(insertAt, 0, imgBlock);

  // ensure there's a text block after the image
  const nextBlock = data.blocks[insertAt + 1];
  if (!nextBlock || nextBlock.type !== 'text') {
    data.blocks.splice(insertAt + 1, 0, { type: 'text', id: pageNextId(), content: '' });
  }

  renderPage(id);
  pageSave(id);
}

// ── init ─────────────────────────────────────────────────────

function initPage(id) {
  const w = WINS[id]; if (!w) return;

  if (!w.pageData) {
    w.pageData = {
      blocks: [
        { type: 'text', id: pageNextId(), content: '' }
      ]
    };
  }

  renderPage(id);

  // toolbar: add image from file
  const imgBtn  = document.getElementById('pageimgbtn' + id);
  const fileInp = document.getElementById('pagefileinp' + id);

  imgBtn?.addEventListener('click', e => {
    e.stopPropagation();
    w._pageInsertAfter = w.pageData.blocks.length - 1;
    fileInp?.click();
  });

  fileInp?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const src      = ev.target.result;
      const afterIdx = w._pageInsertAfter ?? w.pageData.blocks.length - 1;
      pageInsertImage(id, src, afterIdx);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });
}
