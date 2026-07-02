# Breakdance 3D - Dev Notes

Documento interno di orientamento rapido per capire come funziona il progetto, dove si trovano i pezzi importanti e quali sono le attuali semplificazioni/limiti.

## Obiettivo del progetto

Breakdance 3D è un casual browser game in stile PWA con atmosfera street/PS2:

- homepage in stile menu da vecchia console
- pagina `play` con una scena 3D urbana e HUD interattivo
- pagina `leaderboard` al momento mockata
- integrazione predisposta per Supabase
- build statico pensato per deployment semplice, anche su GitHub Pages

L’idea attuale è quella di un boilerplate già presentabile, ma ancora leggero e facile da estendere.

## Stack

- Astro per routing, pagine statiche e layout
- React per l’isola client-side del gameplay
- TypeScript per tipizzazione
- Tailwind CSS v4 per lo styling
- `@react-three/fiber` + `three` + `@react-three/drei` per il rendering 3D
- XState per lo stato della partita
- Zustand per lo stato UI/gameplay condiviso
- `@vite-pwa/astro` per PWA, manifest e service worker
- Supabase client già predisposto in `src/lib/supabase.ts`

## Mappa mentale veloce

```
src/pages/index.astro
  -> landing page
  -> link a /play e /leaderboard

src/pages/play.astro
  -> Layout
  -> GameApp client-only React

src/components/game/GameApp.tsx
  -> useMachine(gameMachine)
  -> GameCanvas
  -> Hud

GameCanvas
  -> Canvas R3F
  -> piazza urbana, luci calde, props street, OrbitControls
  -> Player

Hud
  -> legge/scrive Zustand
  -> comandi XState via send()
  -> BPM, score, mute, start/pause/reset

src/pages/leaderboard.astro
  -> tabella mock statico

src/lib/supabase.ts
  -> client Supabase con env publiche

.env.example
  -> template locale delle variabili ambientali
```

## Routing

### `/`

File: `src/pages/index.astro`

- landing page introduttiva
- hero centrale
- due CTA:
  - `Inizia a Ballare` verso `/play`
  - `Classifica` verso `/leaderboard`
- tre card feature:
  - Dancers 3D
  - BPM reattivo
  - supporto PWA

### `/play`

File: `src/pages/play.astro`

- pagina di gioco
- usa `client:only="react"` per montare `GameApp` solo in browser
- include suggerimento d’uso:
  - drag della camera
  - pulsante `DANCE!`
  - slider BPM

### `/leaderboard`

File: `src/pages/leaderboard.astro`

- classifica finta con dati hardcoded
- struttura già pronta per sostituire il mock con query reale a Supabase

## Layout globale

File: `src/components/layout/Layout.astro`

Responsabilità:

- wrapper HTML globale
- meta tag base e title/description dinamici
- favicon
- sistema tipografico locale senza font esterni
- header sticky con navigazione
- main container centrato
- footer con note PWA/privacy/terms

Nota:

- `Layout.astro` importa `../../styles/global.css`, quindi è il punto centrale per lo stile globale.

## Styling

File: `src/styles/global.css`

Punti chiave:

- usa Tailwind v4 tramite `@import "tailwindcss"`
- definisce token custom con `@theme`
- font principale: stack locale sans/condensed
- animazioni custom:
  - flicker leggero
  - bob lento
- look complessivo:
  - palette beige/cemento/terra
  - accenti lime/arancio limitati
  - scrollbar sporca e consumata

Osservazione:

- il progetto ha un’identità visiva già decisa, molto street/urban/PS2.

## Gameplay architecture

### 1. Stato macchina

File: `src/components/game/state/gameMachine.ts`

Stati attuali:

- `idle`
- `ready`
- `playing`
- `paused`
- `gameOver`

Eventi:

- `SELECT`
- `START`
- `PAUSE`
- `RESUME`
- `GAME_OVER`
- `RESET`

Comportamento:

- `idle` -> selezione personaggio o start diretto
- `ready` -> stato intermedio dopo selezione
- `playing` -> gameplay attivo
- `paused` -> pausa
- `gameOver` -> fine performance

### 2. Stato condiviso UI/gameplay

File: `src/components/game/state/useGameStore.ts`

Contiene:

- `selectedCharacter`
- `score`
- `bpm`
- `isMuted`

Azioni:

- `setSelectedCharacter`
- `incrementScore`
- `setBpm`
- `toggleMute`
- `resetGame`

Nota importante:

- `resetGame()` oggi azzera solo lo score.
- non resetta personaggio, BPM o mute.
- questa è una scelta leggera, ma va tenuta presente quando si aggiungono retry o game over più complessi.

## GameApp

File: `src/components/game/GameApp.tsx`

Responsabilità:

- esegue `useMachine(gameMachine)`
- normalizza `state.value` in una stringa (`gameStateString`)
- compone:
  - `GameCanvas`
  - `Hud`

Scopo reale:

- fare da orchestratore tra 3D scene, UI e machine state

Nota:

- la conversione `state.value -> string` è una piccola protezione per stati non banali di XState, anche se al momento la macchina è lineare.

## GameCanvas

File: `src/components/game/GameCanvas.tsx`

Responsabilità:

- crea la scena Three.js con `Canvas`
- imposta camera e luci
- mostra:
  - `Player`
  - `Grid`
  - `Stars`
  - `OrbitControls`

Comportamento visivo:

- le luci cambiano intensità/colore in base allo stato di gioco
- `playing` rende la scena più “viva”
- `paused` e `idle` sono più morbidi e statici

Dettagli utili:

- `OrbitControls` abilita rotazione e zoom
- `enablePan={false}`
- `maxPolarAngle` limita la camera per non “girare sotto” la scena

## Player

File: `src/components/game/Player.tsx`

Responsabilità:

- renderizza il personaggio 3D
- anima posizione, rotazione e scala in funzione di:
  - stato gioco
  - BPM
  - tempo del frame

Scelte implementative:

- mesh principale: `capsuleGeometry`
- dettaglio visivo: piccolo visor frontale con `boxGeometry`
- colore del player dipende da `selectedCharacter`

Mappatura personaggio -> colore:

- `Brick Crew` -> brick
- `Lime Crew` -> lime
- default / `Dust Crew` -> cemento

Comportamento per stato:

- `playing`: bounce + spin + tilt + pulse
- `paused`: animazione ridotta
- `idle`: idle breathing

## HUD

File: `src/components/game/Hud.tsx`

Responsabilità:

- mostra stato, score, BPM e audio
- espone i comandi di gioco
- permette selezione personaggio

Funzioni principali:

- `handleTap()`
  - se lo stato è `playing`, aggiunge punti
- `handleStart()`
  - resetta lo score
  - invia `START` alla machine

Controlli:

- status box
- score box
- slider BPM tra `80` e `180`
- toggle mute
- selezione personaggio quando non si sta giocando
- pulsanti:
  - `Start Performance`
  - `Pause`
  - `Finish`
  - `Resume`
  - `Reset`
  - `Play Again`

Nota importante:

- `isMuted` è già presente nello store ma, allo stato attuale, non c’è ancora un vero motore audio collegato.
- quindi il toggle è UI-ready ma funzionalmente quasi “placeholder”.

## Supabase

File: `src/lib/supabase.ts`

Contiene un client creato con:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `PUBLIC_SITE_URL`

Fallback attuali:

- URL placeholder
- anon key placeholder

Variabili di supporto:

- `PUBLIC_SITE_URL` per configurare `site` in Astro
- `ASTRO_BASE_PATH` per forzare il path base nei deploy statici

Implicazione:

- il progetto non si rompe senza env reali, ma ovviamente la connessione a un backend vero richiede configurazione.

### Uso previsto

Al momento il file è pronto per:

- leaderboard vera
- salvataggio score
- eventuali profili/record

## Docker stack

File: `docker-compose.yml`

- Traefik fa da reverse proxy locale
- Supabase è esposto su `supabase.localhost`
- Colyseus è esposto su `ws.localhost`
- il frontend può restare fuori da Docker e girare con `npm run dev`
- il frontend container è opzionale tramite il profilo `frontend`

## PWA

Configurazione: `astro.config.mjs`

Impostazioni importanti:

- `registerType: 'autoUpdate'`
- manifest con:
  - nome app
  - short name
  - description
  - theme color
  - background color
  - display standalone
  - start_url `/`
  - icon SVG
- `workbox.globPatterns` include asset comuni

Obiettivo:

- rendere il gioco installabile e fruibile offline per ciò che è già statico/cached

### Escludere la propria attività da Umami

Per evitare che l'attività di sviluppo o amministrazione finisca nelle analytics di produzione, apri `bboyarena.org` nel browser che usi, apri la console degli strumenti per sviluppatori ed esegui:

```js
localStorage.setItem('umami.disabled', '1');
```

Ricarica la pagina. Umami smetterà di registrare sia le pageview sia gli eventi PWA personalizzati provenienti da quel browser. L'impostazione vale per il singolo sito e profilo browser, quindi va ripetuta su ogni browser o dispositivo da escludere. La PWA installata normalmente condivide questa preferenza quando usa lo stesso profilo browser e la stessa origine.

Per verificare lo stato:

```js
localStorage.getItem('umami.disabled');
```

Il risultato deve essere `"1"`. Per riattivare il tracciamento:

```js
localStorage.removeItem('umami.disabled');
```

La preferenza riguarda soltanto l'attività futura e non elimina dati già raccolti. La cancellazione dei dati locali del sito rimuove anche questa impostazione.

## Build e deployment

### Script npm

File: `package.json`

- `npm run dev` -> sviluppo
- `npm run build` -> build statico
- `npm run preview` -> preview della build

### Output

- build statico in `dist/`
- progetto configurato con `output: 'static'`

### GitHub Pages

Il README attuale suggerisce di:

- configurare `base` in `astro.config.mjs` se il sito vive in una sottodirectory
- pubblicare `dist/` o usare GitHub Actions

## Struttura file attuale

- `src/pages/index.astro`
- `src/pages/play.astro`
- `src/pages/leaderboard.astro`
- `src/components/layout/Layout.astro`
- `src/components/game/GameApp.tsx`
- `src/components/game/GameCanvas.tsx`
- `src/components/game/Hud.tsx`
- `src/components/game/Player.tsx`
- `src/components/game/state/gameMachine.ts`
- `src/components/game/state/useGameStore.ts`
- `src/lib/supabase.ts`
- `src/styles/global.css`

## Dipendenze principali e perché ci sono

- `astro`: framework base
- `@astrojs/react`: supporto componenti React
- `react`, `react-dom`: runtime UI
- `three`: rendering 3D
- `@react-three/fiber`: binding React per Three
- `@react-three/drei`: helper 3D
- `xstate`: state machine
- `@xstate/react`: hook React per XState
- `zustand`: store globale leggero
- `@supabase/supabase-js`: integrazione backend
- `@vite-pwa/astro`: PWA
- `tailwindcss`, `@tailwindcss/vite`: styling

## Limiti attuali / TODO impliciti

- leaderboard mockata, non ancora collegata a Supabase
- audio mute presente solo come stato UI
- nessun vero sistema di input ritmico o timing game loop con note/beat oggettivi
- `score` è semplice incremento manuale
- `resetGame()` è minimale
- nessun salvataggio persistente di sessione, record o profilo
- nessun test automatico visibile nel repository

## Punti da toccare con attenzione

- la composizione tra XState e Zustand:
  - XState governa il flusso della partita
  - Zustand governa dati UI/gameplay condivisi
- i componenti 3D dipendono da valori live di `bpm` e `selectedCharacter`
- il `client:only="react"` in `play.astro` è essenziale per evitare problemi SSR con `three`
- se aggiungi routing o sottodirectory, controlla `base` in Astro e le URL di asset/PWA

## Come ragionare sul progetto

Se devi intervenire qui, conviene pensarlo così:

1. prima il layout e le pagine Astro
2. poi la shell React del gioco
3. poi lo stato globale e la machine
4. infine il rendering 3D e le integrazioni backend

In pratica:

- `Astro` decide la struttura
- `React` gestisce l’interazione del gioco
- `XState` decide “in che fase siamo”
- `Zustand` conserva i dati della performance
- `Three.js` rende la scena
- `Supabase` sarà il backend dei record

## Note personali per manutenzione

- il progetto è già leggibile e non troppo frammentato
- il prossimo salto di qualità naturale è:
  - vera leaderboard
  - sistema audio
  - scoring più ricco
  - persistenza della sessione
- la base attuale è buona per iterare senza riscrivere tutto
