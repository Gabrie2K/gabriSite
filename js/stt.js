'use strict';
/* ═══════════════════════════════════════════════════════════
   STT — ElevenLabs real-time speech-to-text (client-side)
   Dipende da: DOM pronto
   ═══════════════════════════════════════════════════════════ */

const STT_WS_BASE  = 'wss://api.elevenlabs.io/v1/speech-to-text/realtime';
const STT_MODEL    = 'scribe_v1_realtime';
const STT_RATE     = 16000;
const STT_BUF_SIZE = 4096;

let sttSocket    = null;
let sttAudioCtx  = null;
let sttProcessor = null;
let sttStream    = null;
let sttActive    = false;

// ─── Inizializza UI ──────────────────────────────────────

function initSTT() {
  const taskbar = document.getElementById('taskbar');
  if (!taskbar) return;

  // pulsante impostazioni
  const cfgBtn = document.createElement('button');
  cfgBtn.id        = 'stt-cfg';
  cfgBtn.className = 'stt-icon-btn';
  cfgBtn.title     = 'Configura ElevenLabs STT';
  cfgBtn.textContent = '⚙';
  cfgBtn.onclick   = openSTTSettings;

  // pulsante microfono
  const micBtn = document.createElement('button');
  micBtn.id        = 'stt-mic';
  micBtn.className = 'stt-mic-btn';
  micBtn.title     = 'Speech-to-Text (ElevenLabs)';
  micBtn.textContent = '🎙';
  micBtn.onclick   = toggleSTT;

  // inserisce prima di "+ Nuova"
  const btnNew = document.getElementById('btn-new');
  taskbar.insertBefore(micBtn, btnNew);
  taskbar.insertBefore(cfgBtn, micBtn);

  // pannello trascrizione
  const panel = document.createElement('div');
  panel.id        = 'stt-panel';
  panel.className = 'stt-panel';
  panel.innerHTML = `
    <div class="stt-panel-hdr">
      <span class="stt-panel-title">✦ Trascrizione</span>
      <button class="stt-panel-close" id="stt-panel-close">✕</button>
    </div>
    <div class="stt-transcript" id="stt-transcript">
      <span class="stt-hint">Premi 🎙 per iniziare…</span>
    </div>
    <div class="stt-actions">
      <button class="stt-act-btn" id="stt-clear">Cancella</button>
      <button class="stt-act-btn" id="stt-copy">Copia testo</button>
    </div>`;
  document.body.appendChild(panel);

  // modale impostazioni
  const modal = document.createElement('div');
  modal.id        = 'stt-settings';
  modal.className = 'stt-settings-overlay';
  modal.innerHTML = `
    <div class="stt-settings-box">
      <div class="stt-settings-hdr">
        <span>ElevenLabs STT</span>
        <button id="stt-settings-close">✕</button>
      </div>
      <label class="stt-settings-lbl">
        API Key
        <input class="stt-settings-inp" id="stt-apikey" type="password"
          placeholder="Incolla qui la tua xi-api-key…" autocomplete="off">
      </label>
      <label class="stt-settings-lbl">
        Lingua
        <select class="stt-settings-sel" id="stt-lang">
          <option value="">Auto-detect</option>
          <option value="it">Italiano</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
          <option value="fr">Français</option>
          <option value="zh">中文</option>
          <option value="es">Español</option>
          <option value="pt">Português</option>
          <option value="ja">日本語</option>
        </select>
      </label>
      <div class="stt-settings-note">
        La chiave viene salvata solo in localStorage del browser.
      </div>
      <button class="stt-settings-save" id="stt-settings-save">Salva</button>
    </div>`;
  document.body.appendChild(modal);

  // bind UI
  document.getElementById('stt-panel-close').onclick  = () => panel.classList.remove('visible');
  document.getElementById('stt-settings-close').onclick = () => modal.classList.remove('visible');
  document.getElementById('stt-settings-save').onclick  = saveSTTSettings;
  document.getElementById('stt-clear').onclick = clearTranscript;
  document.getElementById('stt-copy').onclick  = copyTranscript;

  // chiudi impostazioni cliccando fuori
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('visible'); });

  // ripristina impostazioni salvate
  const savedKey  = localStorage.getItem('stt_apikey') || '';
  const savedLang = localStorage.getItem('stt_lang')   || '';
  document.getElementById('stt-apikey').value = savedKey;
  document.getElementById('stt-lang').value   = savedLang;
}

// ─── Impostazioni ────────────────────────────────────────

function openSTTSettings() {
  document.getElementById('stt-settings')?.classList.add('visible');
}

function saveSTTSettings() {
  const key  = document.getElementById('stt-apikey')?.value.trim() || '';
  const lang = document.getElementById('stt-lang')?.value           || '';
  localStorage.setItem('stt_apikey', key);
  localStorage.setItem('stt_lang',   lang);
  document.getElementById('stt-settings')?.classList.remove('visible');
}

// ─── Toggle STT ──────────────────────────────────────────

async function toggleSTT() {
  if (sttActive) {
    stopSTT();
  } else {
    await startSTT();
  }
}

async function startSTT() {
  const apiKey = localStorage.getItem('stt_apikey') || '';
  if (!apiKey) {
    openSTTSettings();
    return;
  }

  // richiede accesso al microfono
  try {
    sttStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  } catch (err) {
    alert('Microfono non accessibile: ' + err.message);
    return;
  }

  // costruisce URL WebSocket
  const lang = localStorage.getItem('stt_lang') || '';
  let wsUrl = `${STT_WS_BASE}?xi-api-key=${encodeURIComponent(apiKey)}&model_id=${STT_MODEL}`;
  if (lang) wsUrl += `&language_code=${encodeURIComponent(lang)}`;

  sttSocket = new WebSocket(wsUrl);

  sttSocket.onopen = () => {
    sttActive = true;
    document.getElementById('stt-mic')?.classList.add('active');
    document.getElementById('stt-panel')?.classList.add('visible');
    const hint = document.querySelector('#stt-transcript .stt-hint');
    if (hint) hint.remove();
    startAudioCapture();
  };

  sttSocket.onmessage = e => {
    try { handleSTTMessage(JSON.parse(e.data)); } catch (_) {}
  };

  sttSocket.onerror = () => stopSTT();
  sttSocket.onclose = () => { if (sttActive) stopSTT(); };
}

function stopSTT() {
  sttActive = false;
  document.getElementById('stt-mic')?.classList.remove('active');

  sttProcessor?.disconnect();
  sttProcessor = null;

  sttAudioCtx?.close();
  sttAudioCtx = null;

  sttStream?.getTracks().forEach(t => t.stop());
  sttStream = null;

  if (sttSocket && sttSocket.readyState < 2) sttSocket.close();
  sttSocket = null;
}

// ─── Cattura audio PCM 16 kHz ─────────────────────────────

function startAudioCapture() {
  sttAudioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: STT_RATE });
  const src = sttAudioCtx.createMediaStreamSource(sttStream);
  sttProcessor = sttAudioCtx.createScriptProcessor(STT_BUF_SIZE, 1, 1);

  sttProcessor.onaudioprocess = e => {
    if (!sttSocket || sttSocket.readyState !== WebSocket.OPEN) return;
    const f32 = e.inputBuffer.getChannelData(0);
    const b64 = pcmToBase64(f32);
    sttSocket.send(JSON.stringify({ message_type: 'input_audio_chunk', audio_base_64: b64 }));
  };

  src.connect(sttProcessor);
  sttProcessor.connect(sttAudioCtx.destination);
}

// converte Float32 PCM → Int16 → base64 (chunked per evitare stack overflow)
function pcmToBase64(f32) {
  const i16  = new Int16Array(f32.length);
  for (let i = 0; i < f32.length; i++) {
    i16[i] = Math.max(-32768, Math.min(32767, Math.round(f32[i] * 32767)));
  }
  const bytes = new Uint8Array(i16.buffer);
  let bin = '';
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

// ─── Gestione messaggi WebSocket ─────────────────────────

function handleSTTMessage(msg) {
  const t = document.getElementById('stt-transcript');
  if (!t) return;

  if (msg.message_type === 'partial_transcript' && msg.text) {
    let partial = t.querySelector('.stt-partial');
    if (!partial) {
      partial = document.createElement('span');
      partial.className = 'stt-partial';
      t.appendChild(partial);
    }
    partial.textContent = msg.text;
    t.scrollTop = t.scrollHeight;

  } else if (msg.message_type === 'committed_transcript' && msg.text) {
    t.querySelector('.stt-partial')?.remove();
    const line = document.createElement('div');
    line.className = 'stt-line';
    line.textContent = msg.text;
    t.appendChild(line);
    t.scrollTop = t.scrollHeight;
  }
}

// ─── Azioni trascrizione ─────────────────────────────────

function clearTranscript() {
  const t = document.getElementById('stt-transcript');
  if (t) t.innerHTML = '';
}

function copyTranscript() {
  const t = document.getElementById('stt-transcript');
  if (!t) return;
  const text = [...t.querySelectorAll('.stt-line')].map(l => l.textContent).join('\n');
  if (!text) return;
  navigator.clipboard.writeText(text).catch(() => {
    // fallback per browser senza clipboard API
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

// ─── Auto-init ────────────────────────────────────────────

initSTT();
