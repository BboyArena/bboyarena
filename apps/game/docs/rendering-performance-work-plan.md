# Rendering and Gameplay Performance Work Plan

## Obiettivo

Portare il runtime di BboyArena a 60 FPS stabili nella scena attuale, mantenendo il gameplay deterministico e preparando l'architettura alla futura crescita del contenuto 3D.

Il rendering deve restare un consumer dello stato gameplay, non il proprietario della simulazione.

## Target misurabili

- 60 FPS sul dispositivo desktop di riferimento.
- Almeno 55 FPS al percentile 1% durante input continuo, tutorial e training.
- Frame time medio sotto 16,7 ms e percentile 95 sotto 20 ms.
- Nessun long task JavaScript superiore a 50 ms durante il gameplay ordinario.
- Nessun aumento progressivo di geometrie, texture, listener o memoria dopo 10 minuti.
- Input-to-visual latency non superiore a un frame rispetto alla baseline.
- Gameplay, scoring, cue ritmici e transizioni invariati.

## Regole di esecuzione

1. Eseguire uno step per volta.
2. Registrare baseline e risultato con lo stesso scenario.
3. Non combinare cambiamenti architetturali e cambiamenti visivi nello stesso step.
4. Fermarsi se scoring, input o sincronizzazione audio cambiano.
5. Ogni step deve compilare e lasciare il gioco utilizzabile.
6. Non modificare gameplay, scoring, timing, state machine, input mapping o comportamento dei controlli.
7. Le ottimizzazioni devono essere osservabilmente equivalenti per il giocatore.

## Scenari di benchmark

Usare sempre questi scenari:

1. Career, idle per 60 secondi.
2. Career, input continuo da tastiera per 60 secondi.
3. Training, move attiva e cue stick per 60 secondi.
4. Training tutorial, stick sinistro mosso continuamente per 60 secondi.
5. Gamepad collegato, entrambi gli stick e pulsanti attivi per 60 secondi.
6. Touch/mobile viewport, entrambi gli stick attivi per 60 secondi.
7. Pausa e ripresa ripetute dieci volte.
8. Sessione endurance di 10 minuti.

Per ogni scenario annotare FPS medio, 1% low, frame time p95, draw call, triangoli, geometrie, texture, heap e numero di commit React.

---

## Step 0 — Baseline e strumenti

### Scopo

Ottenere misure ripetibili prima di altre ottimizzazioni.

### Attività

- [ ] Aggiungere un pannello diagnostico leggero e disattivato di default.
- [ ] Separare tempo CPU, render React e frame WebGL.
- [ ] Registrare FPS medio, 1% low e p95 frame time.
- [ ] Registrare `gl.info.render` e `gl.info.memory`.
- [ ] Usare React Profiler sul training e sul tutorial.
- [ ] Salvare i risultati iniziali nella sezione "Registro misure".
- [ ] Confermare che il test production non usa React Strict Mode o strumenti dev.

### Definition of done

Le otto prove sono ripetibili e la baseline è documentata.

---

## Step 1 — Separare simulazione e React

### Scopo

Impedire che il clock a 60 Hz ridisegni l'intero gameplay DOM.

### Attività

- [ ] Spostare l'avanzamento gameplay in una sottoscrizione imperativa al `RhythmClock`.
- [ ] Conservare tick, beat, stamina e tempo continuo in ref o store esterno.
- [ ] Pubblicare in React soltanto transizioni ed eventi gameplay reali.
- [ ] Pubblicare lo snapshot HUD a frequenza limitata, inizialmente 15 Hz.
- [ ] Mantenere cue e scoring sul fixed timestep originale.
- [ ] Verificare pausa, resume e recupero dopo tab nascosta.
- [ ] Verificare che il canvas continui a renderizzare indipendentemente dai commit React.

### File candidati

- `GamePlayScene.tsx`
- `rhythm/RhythmClock.ts`
- `rhythm/RhythmClockProvider.tsx`
- nuovo hook/store per lo snapshot gameplay UI

### Definition of done

Il componente radice gameplay non effettua più circa 60 commit React al secondo quando il giocatore è idle.

### Rischi

- Divergenza tra stato visuale e scoring.
- Eventi persi durante pause o frame lunghi.
- Ordine differente delle transizioni XState.

---

## Step 2 — Ridurre il lavoro XState per tick

### Scopo

Usare le state machine per transizioni, non come contatore per-frame.

### Attività

- [ ] Rimuovere il `TICK` continuo dalla motion machine se non causa transizioni.
- [ ] Passare il tick soltanto con intent, start, stop e completion.
- [ ] Evitare copie di vettori quando i valori non cambiano.
- [ ] Creare selettori stabili per i soli dati consumati dal renderer.
- [ ] Verificare interrupt, release, pause, resume e move queue.

### File candidati

- `motion/playerMotionMachine.ts`
- `motion/playerMotionTypes.ts`
- `GamePlayScene.tsx`

### Definition of done

La motion machine non produce nuovi snapshot quando non cambia uno stato gameplay osservabile.

---

## Step 3 — Input gamepad atomico

### Scopo

Eliminare snapshot e notifiche multiple per ogni frame di polling.

### Attività

- [ ] Aggiungere un aggiornamento atomico dell'intero gamepad.
- [ ] Confrontare assi e pulsanti prima di allocare snapshot e timestamp.
- [ ] Emettere al massimo una notifica per frame e solo se qualcosa cambia.
- [ ] Evitare `Array.from()` e `Object.entries()` nel loop RAF.
- [ ] Precalcolare la mappa dei pulsanti quando cambia il binding.
- [ ] Unificare availability e connected-gamepads in un registry condiviso.
- [ ] Verificare deadzone, cambio sorgente e disconnessione.

### File candidati

- `input/GamepadInputAdapter.tsx`
- `input/GameInputController.ts`
- `input/useConnectedGamepads.ts`
- `input/useGamepadAvailability.ts`

### Definition of done

Con un gamepad fermo non vengono prodotti snapshot; durante input continuo viene emessa al massimo una notifica per frame.

---

## Step 4 — Segmentare e rallentare l'HUD

### Scopo

Aggiornare ogni elemento UI soltanto quando la sua informazione cambia visibilmente.

### Attività

- [ ] Separare rhythm, score, move, coach, cue e diagnostica in componenti memoizzati.
- [ ] Aggiornare tempo mostrato una volta al secondo.
- [ ] Quantizzare stamina e progress alle variazioni visivamente utili.
- [ ] Portare le barre da `width` a `transform: scaleX()`.
- [ ] Evitare la ricostruzione completa degli SVG cue a ogni tick.
- [ ] Indicizzare move e animation catalog con `Map`.
- [ ] Tenere il debug HUD fuori dall'albero production.
- [ ] Verificare annunci ARIA senza aggiornamenti continui inutili.

### File candidati

- `ui/GamePlayHUD.tsx`
- `ui/TrainingCoachPanel.tsx`
- `ui/TouchControlsOverlay.tsx`
- `GamePlayScene.tsx`

### Definition of done

Durante gameplay continuo i commit dei singoli blocchi HUD corrispondono alla loro frequenza visiva, non al tick di simulazione.

---

## Step 5 — Audio e metronomo fuori dal render loop React

### Scopo

Evitare render React per eventi audio che avvengono una volta per beat.

### Attività

- [ ] Sottoscrivere il metronomo direttamente al clock.
- [ ] Generare click soltanto al cambio di `beatIndex`.
- [ ] Disconnettere oscillator e gain dopo `onended`.
- [ ] Verificare reset del clock quando parte la musica.
- [ ] Verificare autoplay unlock senza listener duplicati.

### File candidati

- `audio/ManualMetronome.tsx`
- `audio/GameMusic.tsx`
- `rhythm/RhythmClock.ts`

### Definition of done

Il metronomo non effettua commit React a 60 Hz e resta sincronizzato dopo pausa e resume.

---

## Step 6 — CSS gameplay mobile-safe

### Scopo

Ridurre rasterizzazione e compositing degli overlay sopra WebGL.

### Attività

- [ ] Classificare i 57 `box-shadow` tra menu e gameplay.
- [ ] Rimuovere `filter: drop-shadow()` dagli elementi animati durante il gioco.
- [ ] Eliminare `backdrop-filter` dagli overlay gameplay.
- [ ] Sostituire glow animati con outline, border o opacity.
- [ ] Limitare le animazioni infinite e rispettare `prefers-reduced-motion`.
- [ ] Evitare animazioni di `width`, shadow e filter.
- [ ] Verificare layer/compositing su viewport mobile.

### File candidati

- `game.css`
- componenti HUD che applicano attributi di stato

### Definition of done

Gli overlay gameplay animano soltanto transform e opacity e non provocano repaint estesi del canvas.

---

## Step 7 — Semplificare il rendering 3D

### Scopo

Definire un budget grafico mobile sostenibile prima di aggiungere personaggi e ambienti reali.

### Attività

- [ ] Misurare costo separato di luci, ombre, texture e antialiasing.
- [ ] Provare una sola luce direzionale più hemisphere.
- [ ] Valutare Lambert o materiali baked per ambiente e props.
- [ ] Conservare al massimo una shadow-casting light.
- [ ] Attivare ombre soltanto per oggetti che ne beneficiano.
- [ ] Definire DPR per tier dispositivo.
- [ ] Rimuovere OrbitControls dalla build gameplay se non necessario.
- [ ] Stabilire budget massimo per draw call, triangoli, materiali e texture.

### Budget iniziale proposto

- 100 draw call massime su mobile.
- 100.000 triangoli visibili su mobile.
- Una shadow map 512², opzionale sui tier bassi.
- DPR 1 sui tier bassi, massimo 1,25 sui tier medi.
- Massimo 64 MB di texture residenti nella scena gameplay iniziale.

### File candidati

- `CanvasScene.tsx`
- `Player.tsx`
- futura configurazione quality tier

### Definition of done

La scena soddisfa il target su ogni quality tier senza cambiare regole o input.

---

## Step 8 — Asset e risorse GPU

### Scopo

Ridurre caricamento, memoria e rischio di context loss.

### Attività

- [ ] Ridimensionare parquet da 1254² a una dimensione appropriata, idealmente 1024².
- [ ] Confrontare WebP e KTX2/Basis per le texture future.
- [ ] Verificare dispose di geometrie, materiali e texture al cambio scena.
- [ ] Precaricare soltanto asset richiesti dalla scena successiva.
- [ ] Aggiungere controllo crescita `gl.info.memory` nella prova endurance.

### Definition of done

Dopo dieci ingressi e uscite dal gameplay geometrie e texture tornano allo stesso valore iniziale.

---

## Step 9 — Pulizia del percorso caldo

### Scopo

Rimuovere lavoro piccolo ma frequente dopo le correzioni strutturali.

### Attività

- [ ] Rimuovere o proteggere i `console.log` di runtime.
- [ ] Eliminare array e oggetti temporanei nei loop RAF/useFrame.
- [ ] Stabilizzare callback e dipendenze degli effect.
- [ ] Rimuovere sistemi input legacy non utilizzati.
- [ ] Verificare listener e interval duplicati.

### Definition of done

Il profiler non mostra funzioni applicative minori come contributor significativi al frame time.

---

## Step 10 — Verifica finale e guardrail

### Attività

- [ ] Ripetere tutti gli scenari di benchmark.
- [ ] Confrontare baseline e risultato finale.
- [ ] Eseguire build production e typecheck.
- [ ] Testare tastiera, gamepad e touch.
- [ ] Testare career, training, tutorial, audio interno e metronomo.
- [ ] Eseguire endurance di 10 minuti.
- [ ] Documentare quality tier e budget grafico.
- [ ] Aggiungere una checklist performance alle future PR di rendering.

### Definition of done

Tutti i target misurabili sono soddisfatti oppure ogni eccezione è documentata con dispositivo, scenario e collo di bottiglia residuo.

---

## Registro misure

| Data | Commit/worktree | Dispositivo | Scenario | FPS medio | 1% low | p95 frame | Commit React/s | Draw call | Heap | Note |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---|
| Da compilare | locale | Da compilare | Baseline | — | — | — | — | — | — | — |

## Stato avanzamento

| Step | Stato | Risultato |
|---|---|---|
| 0 — Baseline | Non iniziato | — |
| 1 — Simulazione/React | Non iniziato | — |
| 2 — XState | Non iniziato | — |
| 3 — Gamepad | Non iniziato | — |
| 4 — HUD | Parzialmente avviato | Barre migrate da width a transform; lookup catalogo indicizzati |
| 5 — Audio | Non iniziato | — |
| 6 — CSS | Parzialmente avviato | Rimossi filtri e shadow animate dal percorso gameplay |
| 7 — Rendering 3D | Parzialmente avviato | DPR e shadow map ridotti, canvas memoizzato |
| 8 — Asset GPU | Non iniziato | — |
| 9 — Percorso caldo | Parzialmente avviato | Rimossi log runtime e stabilizzata callback WebGL |
| 10 — Verifica finale | Non iniziato | — |
