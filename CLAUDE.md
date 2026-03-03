# CLAUDE.md — gabriSite / Spatium

Guida per AI assistant (Claude Code e simili) che lavorano in questo repository.

---

## Panoramica progetto

**Spatium** è un'applicazione web desktop-in-browser con:

- **Window Manager** — finestre draggabili, ridimensionabili, minimizzabili/massimizzabili (stile macOS)
- **Vista Costellazione** — grafo 3D interattivo (Three.js) per rappresentare concetti e le loro relazioni. Ogni nodo ha attributi "Ho" / "Voglio" visualizzati come dot colorati
- **Vista Calendario** — calendario settimanale con drag-to-create eventi, mini-cal mensile, side panel per i dettagli
- **Sfondo stelle** — canvas 2D animato

**Stack**: HTML + CSS + JavaScript vanilla, nessun bundler, nessun framework.
**Dipendenza esterna**: Three.js r128 (CDN).
**Font**: Space Mono, Syne (Google Fonts CDN).

---

## Struttura del repository

```
gabriSite/
├── index.html                # Entry point — carica CSS e JS nell'ordine corretto
│
├── css/
│   ├── base.css              # CSS custom properties (:root), reset, body, canvas, #desktop
│   ├── taskbar.css           # Barra inferiore fissa (#taskbar, .tb-btn, .tb-new)
│   ├── window.css            # Finestre (.win, .win-title, .dots, .win-tabs, .rh)
│   ├── graph.css             # Contenitore Three.js (.g3d, .g3d-hint)
│   ├── sidebar.css           # Pannello laterale (.sp, attributi, note, form evento)
│   └── calendar.css          # Calendario settimanale (.cal-*, .mday, .cal-event, ecc.)
│
├── js/
│   ├── templates.js          # Dati TPL: template costellazioni (nodi, attributi, colori)
│   ├── three-helpers.js      # Utility Three.js: assignPositions(), makeLabel(), SPHERE_R, CAM_START
│   ├── background.js         # Animazione stelle canvas 2D (loop rAF)
│   ├── window-manager.js     # WINS, createWin(), focusW(), toggleMin(), closeW(), maxW(), switchLayer(), setupWinEvents()
│   ├── scene3d.js            # create3DScene() — crea e gestisce la scena Three.js per un nodo finestra
│   ├── calendar.js           # initCalendar(), renderMiniCal(), renderWeekGrid(), renderAllEvents(), scrollToNow()
│   ├── sidepanel.js          # openSP(), renderSPNode(), renderSPEvent(), mkDiv(), mkLbl()
│   └── main.js               # Entry point JS: pulsante "+ Nuova", finestre iniziali
│
└── assets/
    ├── graphics/             # Elementi grafici UI: SVG, icone, immagini decorative della mappa/costellazione
    └── uploads/              # Immagini caricate dagli utenti a runtime (NON mescolare con graphics/)
```

---

## Ordine di caricamento degli script

**Critico** — l'ordine in `index.html` deve restare questo:

```
Three.js (CDN)
  → templates.js      (define TPL)
  → three-helpers.js  (define SPHERE_R, CAM_START, assignPositions, makeLabel)
  → background.js     (indipendente, usa solo DOM)
  → window-manager.js (define WINS, createWin — usa TPL e three-helpers)
  → scene3d.js        (define create3DScene — usa THREE e makeLabel)
  → calendar.js       (define initCalendar, renderAllEvents — usa WINS, openSP)
  → sidepanel.js      (define openSP — usa WINS, renderAllEvents)
  → main.js           (entry point — usa createWin, scrollToNow)
```

Le dipendenze "lazy" (chiamate dentro funzioni) non necessitano di essere definite prima del file che le referenzia, solo prima che vengano effettivamente *invocate* a runtime.

---

## Stato globale

| Variabile | File | Descrizione |
|---|---|---|
| `TPL` | `templates.js` | Oggetto con tutti i template costellazione |
| `WINS` | `window-manager.js` | Registro di tutte le finestre aperte `{id → winData}` |
| `WC` | `window-manager.js` | Contatore progressivo finestre |
| `TZ` | `window-manager.js` | z-index progressivo per il focus |
| `EV_COLORS` | `calendar.js` | Palette colori eventi (cicla) |
| `evColorIdx` | `calendar.js` | Indice corrente della palette |
| `SPHERE_R` | `three-helpers.js` | Raggio sfera distribuzione nodi 3D |
| `CAM_START` | `three-helpers.js` | Distanza iniziale camera 3D |

---

## Struttura dati chiave

### Template costellazione (`TPL`)
```js
TPL.NomeTemplate = {
  color: 0x63b3ff,  // colore Three.js (hex)
  nodes: [
    {
      id:    'uid',            // identificatore unico nel template
      label: 'Testo visibile', // label 3D
      main:  true,             // true = nodo centrale (uno solo)
      attrs: [
        { name: 'Nome attributo', s: 'have' | 'want' }
      ],
      note: '',                // testo libero (textarea)
      _v:   THREE.Vector3,     // assegnato da assignPositions()
    }
  ]
};
```

### Evento calendario
```js
{
  id:       'ev-1234567890',     // univoco (Date.now())
  title:    'Nome evento',
  date:     'YYYY-MM-DD',
  startMin: 540,                 // minuti dall'inizio giornata
  endMin:   600,
  note:     '',
  color:    'rgba(99,179,255,.85)',
}
```

### Oggetto finestra (`WINS[id]`)
```js
{
  win:      HTMLElement,         // elemento .win
  tpl:      'Computer',          // nome tab attivo
  type:     'constellation' | 'calendar',
  scene3d:  { renderer, scene, refreshDots, dispose } | null,
  nodes:    [...],               // solo type='constellation'
  events:   [...],               // solo type='calendar'
  calState: { viewYear, viewMonth, weekStart, today, ghostEl } | null,
}
```

---

## Quick Edit — modifiche frequenti

### Colori e dimensioni UI
Tutto in `css/base.css` → sezione `:root`:
```css
--win-w:      820px;   /* larghezza default finestre */
--win-h:      560px;   /* altezza default finestre */
--cal-hour-h: 64px;    /* altezza 1 ora nel calendario */
--accent:     #63b3ff; /* colore principale */
```

### Numero di stelle sfondo
In `js/background.js`:
```js
Array.from({ length: 220 }, …)  // ← cambia 220
```

### Aggiungere un template costellazione
In `js/templates.js`, aggiungere una chiave a `TPL`:
```js
TPL.MioTemplate = {
  color: 0xf59e0b,
  nodes: [
    { id: 'root', label: 'Radice', main: true, attrs: [], note: '' },
    { id: 'n1',   label: 'Figlio', main: false, attrs: [], note: '' },
  ]
};
```
Il tab apparirà automaticamente in tutte le finestre.

### Aggiungere colori eventi calendario
In `js/calendar.js`, aggiungere a `EV_COLORS`:
```js
const EV_COLORS = ['rgba(99,179,255,.85)', /* ... */, 'rgba(X,Y,Z,.85)'];
```

---

## Convenzioni per AI assistant

1. **Leggi prima di modificare** — usa sempre Read prima di Edit
2. **Modifiche minimali** — solo ciò che viene richiesto, niente refactor collaterali
3. **Nessun segreto nei commit** — non committare `.env`, chiavi API, credenziali
4. **Nessun bundler** — il progetto è vanilla; non introdurre npm/webpack/vite senza consenso esplicito
5. **Ordine script** — se aggiungi un file JS, rispetta l'ordine di caricamento in `index.html`
6. **assets/graphics vs assets/uploads** — non mescolare le due directory:
   - `graphics/` → immagini statiche dell'UI (SVG, icone, texture mappa)
   - `uploads/`  → file caricati dall'utente a runtime
7. **Sicurezza** — il contenuto dei nodi/eventi viene inserito come `innerHTML` solo in contesti controllati (dati locali, nessun input da URL/server); se in futuro arriva da server, usa textContent o sanitizza

---

## Git workflow

```bash
# Sviluppo su branch dedicato
git checkout -b feature/<nome>

# Staging selettivo (mai git add -A per evitare file sensibili)
git add css/base.css js/templates.js

# Commit con messaggio convenzionale
git commit -m "feat: aggiungi template Fisica al grafo costellazione"

# Push con tracking
git push -u origin <branch>
```

### Formato commit messages

| Prefisso | Uso |
|---|---|
| `feat:` | Nuova funzionalità |
| `fix:` | Correzione bug |
| `style:` | Solo CSS/formattazione, nessuna logica |
| `refactor:` | Ristrutturazione senza cambio comportamento |
| `docs:` | Documentazione |
| `chore:` | Config, tooling, manutenzione |

### Branch AI-assisted
I branch per sessioni Claude devono seguire il pattern:
```
claude/<descrizione>-<session-id>
```

---

## Sviluppo locale

Nessun build step richiesto. Apri `index.html` direttamente nel browser oppure usa un server locale per evitare problemi CORS con le font:

```bash
# Python
python3 -m http.server 8080

# Node (npx)
npx serve .
```

Poi apri `http://localhost:8080`.

---

## Aggiornare questo file

Aggiornare `CLAUDE.md` ogni volta che:
- Si aggiunge un file JS o CSS (aggiornare struttura e ordine caricamento)
- Si cambia il formato dei dati (`TPL`, eventi, `WINS`)
- Si introducono dipendenze esterne
- Si aggiunge una directory in `assets/`
- Le convenzioni di sviluppo cambiano
