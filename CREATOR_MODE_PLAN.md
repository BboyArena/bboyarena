# Piano di implementazione: BboyArena Creator Mode

## Obiettivo

Implementare una nuova schermata standalone, `Creator Mode`, dentro `apps/game`, che permetta di registrare video reali con camera del dispositivo, HUD e controlli in stile BboyArena sovrapposti.

La feature deve restare separata dal gameplay esistente. Non deve diventare un ramo di `GamePlayScene`, non deve montare Three.js o React Three Fiber, non deve usare le macchine di movimento, scoring, rhythm clock, training o career.

Il risultato atteso e':

```text
camera reale
+ controlli virtuali BboyArena
+ HUD con score/combo/BPM/mossa/feedback
+ registrazione locale scaricabile
```

## Vincoli critici

- Non modificare comportamento o aspetto del gameplay attuale.
- Non refactorare o riscrivere:
  - `GamePlayScene.tsx`
  - `CanvasScene.tsx`
  - `Player.tsx`
  - motion machines dei player
  - playback animazioni
  - move queue
  - scoring reale
  - rhythm clock
  - tutorial training
  - gameplay Three.js
  - career mode
  - training mode
  - input gameplay corrente
  - menu behavior, salvo aggiunta esplicita di una voce per aprire Creator Mode
- Non aggiungere Creator Mode a `GamePlayMode`.
- Non cambiare `selectedMode`.
- Non far credere al runtime di gioco che Creator Mode sia `career` o `training`.
- Non montare in Creator Mode:
  - `GamePlayScene`
  - `CanvasScene`
  - `GameMusic`
  - `ManualMetronome`
  - Three.js
  - React Three Fiber
- Non aggiungere dipendenze pesanti o librerie di recording/rendering.
- Non richiedere camera o recording automaticamente.
- Non richiedere microfono.
- Non fare upload: tutto resta locale nel browser.

## File e aree da ispezionare prima delle modifiche

Prima di editare codice applicativo:

1. Ispezionare `apps/game/src/game/GameApp.tsx`.
2. Ispezionare `apps/game/src/game/state/useGameStore.ts`.
3. Ispezionare il componente/menu che renderizza le azioni principali tramite `GameHUD` o componenti collegati.
4. Ispezionare `apps/game/src/game/ui/GameHUD.tsx`.
5. Ispezionare `apps/game/src/game/ui/GamePlayHUD.tsx`.
6. Ispezionare `apps/game/src/game/ui/TouchControlsOverlay.tsx`.
7. Ispezionare `apps/game/src/game/input/GameInputProvider.tsx`.
8. Ispezionare `apps/game/src/game/input/gameInputTypes.ts`.
9. Ispezionare `apps/game/src/game/game.css`.
10. Cercare copy/localization esistente, se presente, prima di hardcodare stringhe.
11. Verificare i comandi disponibili nel monorepo e in `apps/game` per typecheck, test e build.

Durante questa fase va annotato:

- quali token visuali, CSS custom properties, label, input id o asset possono essere riusati;
- quali componenti non vanno riusati perche' montano gameplay, registrano listener globali o producono side effect;
- quale ramo di routing monta oggi gameplay e menu.

## Architettura di routing prevista

Estendere i tipi in modo additivo, mantenendo separati menu, gameplay e utility screen.

Schema desiderato:

```ts
export type GameMenuScreen =
  | 'splashscreen'
  | 'mainMenu'
  | 'settings'
  | 'credits';

export type GamePlayMode =
  | 'career'
  | 'training';

export type GameUtilityScreen =
  | 'creator';

export type GameScreen =
  | GameMenuScreen
  | GamePlayMode
  | GameUtilityScreen;
```

Nel global store aggiungere una action minimale:

```ts
openCreator: () => void;
```

`openCreator` deve impostare `screen` a `creator` senza modificare `selectedMode`, progressione, score reale o impostazioni non correlate.

In `GameApp.tsx` aggiungere un branch esplicito prima del ramo playable:

```tsx
if (screen === 'creator') {
  return <CreatorMode copy={copy} />;
}
```

Il ramo `career`/`training` deve continuare a montare il gameplay come prima. Il ramo menu deve restare intatto salvo la nuova azione.

## Menu entry

Aggiungere una sola nuova voce nel menu principale:

```text
Creator Mode
```

oppure, se piu' coerente con copy esistenti:

```text
Create Video
```

La voce deve chiamare `openCreator`.

Non ridisegnare il menu, non riordinare le voci esistenti, non cambiare transizioni o layout oltre al minimo necessario.

Se il progetto usa copy/localization strutturata, aggiungere solo le chiavi minime:

English:

```text
Creator Mode
Record real videos with BboyArena controls and HUD.
```

Italiano:

```text
Modalita' Creator
Registra video reali con controlli e HUD di BboyArena.
```

## Nuova struttura file proposta

Creare una feature isolata:

```text
apps/game/src/game/creator/
├── CreatorMode.tsx
├── CreatorCameraPreview.tsx
├── CreatorControlsOverlay.tsx
├── CreatorRecordingCanvas.tsx
├── CreatorToolbar.tsx
├── useCreatorCamera.ts
├── useCreatorRecorder.ts
├── creatorHudRenderer.ts
├── creatorTypes.ts
└── creator.css
```

La divisione puo' essere adattata allo stile reale del repository, ma la logica camera/recorder non deve finire in `GameApp.tsx`.

## Strategia di riuso

Riusare elementi esistenti solo se sono puramente visuali o tipizzati e non causano side effect.

Candidati al riuso:

- asset/logo/branding BboyArena;
- CSS custom properties;
- font, spacing, border, colori;
- safe-area handling;
- label dei controlli;
- id degli input se compatibili con `GameInputButtonId`;
- primitive visuali di stick e button, se estraibili senza alterare gameplay.

Da non riusare direttamente se comportano side effect:

- componenti che montano `GamePlayScene`;
- componenti che dipendono da XState gameplay;
- componenti che mutano move queue;
- componenti che assegnano score reale;
- componenti che consumano stamina;
- componenti che dispatchano comandi gameplay;
- componenti che registrano listener globali di input;
- componenti che assumono stato training/career;
- componenti che dipendono da Three.js.

Se l'estrazione di una primitiva visuale rischia di destabilizzare il gioco, preferire duplicazione piccola e locale dentro `creator/`.

## Layout visuale Creator Mode

Usare solo DOM e Canvas 2D.

Struttura concettuale:

```tsx
<div className="creator-mode">
  <CreatorCameraPreview />
  <CreatorControlsOverlay />
  <CreatorToolbar />
  <canvas className="creator-recording-canvas" />
</div>
```

Layer:

1. `<video>` live preview a schermo, con `object-fit: cover`.
2. HUD DOM interattivo sopra il video.
3. Toolbar per camera, device, BPM, record, stop, download, exit.
4. Canvas nascosto/offscreen per composizione recording.

La camera frontale deve essere specchiata in preview per default. La camera posteriore non deve essere specchiata. La registrazione deve rispettare la stessa intenzione visiva senza doppio mirror.

## Hook camera: `useCreatorCamera`

Responsabilita':

- stato permessi;
- `MediaStream` corrente;
- disponibilita' camera;
- facing mode attivo;
- device id attivo;
- lista `videoinput` dopo permesso;
- avvio camera;
- stop camera;
- switch front/rear;
- selezione device specifico;
- errori recuperabili;
- cleanup completo.

Tipi previsti:

```ts
type CreatorCameraStatus =
  | 'idle'
  | 'requesting'
  | 'ready'
  | 'denied'
  | 'unavailable'
  | 'error';

type CreatorFacingMode =
  | 'user'
  | 'environment';
```

Regole:

- Usare `navigator.mediaDevices.getUserMedia`.
- Usare `playsInline`, `autoPlay`, `muted` sul video.
- Non richiedere la camera al load dell'app.
- Richiederla solo dopo ingresso in Creator Mode e click esplicito su `Enable camera`.
- Usare `audio: false`.
- Dopo permesso, chiamare `navigator.mediaDevices.enumerateDevices`.
- Fermare tutte le track quando si cambia camera, si esce, si smonta il componente o fallisce l'inizializzazione.
- Non lasciare la camera attiva tornando al menu.

Constraint iniziali:

```ts
{
  video: {
    facingMode: { ideal: 'user' }
  },
  audio: false
}
```

Posteriore:

```ts
{
  video: {
    facingMode: { ideal: 'environment' }
  },
  audio: false
}
```

## Stati errore camera

UI non bloccante per:

- API camera non disponibile;
- permesso negato;
- nessuna camera;
- camera occupata da altra app;
- contesto non sicuro;
- errore generico `getUserMedia`.

La schermata deve restare chiudibile anche in errore. Deve esserci un retry. Non mostrare stack trace all'utente; logging tecnico solo in sviluppo.

## Stato HUD locale

Il Creator HUD non usa scoring reale. Usa uno stato locale isolato.

Tipo guida:

```ts
export type CreatorHudSnapshot = {
  leftStick: {
    x: number;
    y: number;
    active: boolean;
  };
  rightStick: {
    x: number;
    y: number;
    active: boolean;
  };
  pressedButtons: string[];
  bpm: number;
  score: number;
  combo: number;
  moveName: string | null;
  timingFeedback: 'perfect' | 'good' | 'miss' | null;
  elapsedMs: number;
  recording: boolean;
};
```

Requisiti HUD:

- stick virtuale sinistro;
- stick virtuale destro se coerente con schema esistente;
- bottoni gameplay o move-family;
- pressed state visibile;
- timer;
- BPM;
- score;
- combo;
- move label;
- feedback `Perfect`, `Good`, `Miss`;
- watermark/branding BboyArena;
- indicatore recording.

Pointer/touch:

- usare Pointer Events quando possibile;
- touch e mouse devono condividere la stessa logica;
- i controlli devono muovere stick e bottoni in preview;
- non dispatchare input al gameplay reale.

## Scoring dimostrativo

Usare naming che eviti confusione con score reale:

```ts
creatorDisplayScore
creatorDisplayCombo
```

Comportamento iniziale sicuro:

- incrementare score locale su pressione di un bottone move-family;
- incrementare combo su pressioni valide consecutive;
- mostrare nome mossa in base al bottone;
- calcolare o ciclare feedback semplice;
- resettare combo con azione miss o timeout;
- permettere regolazione BPM dalla toolbar.

Non scrivere su store globale score, leaderboard, progression o achievements.

## Registrazione: architettura Canvas 2D

La registrazione deve includere camera e HUD. Il DOM overlay non viene registrato automaticamente, quindi serve composizione su canvas.

Pipeline:

```text
video live
    ↓
Canvas 2D composition
    ├── draw camera frame con cover crop
    └── draw Creator HUD da CreatorHudSnapshot
    ↓
canvas.captureStream(fps)
    ↓
MediaRecorder
    ↓
Blob + object URL
```

Non usare:

- screenshot DOM;
- `html2canvas`;
- Three.js;
- WebGL;
- FFmpeg;
- server processing;
- librerie di video editing.

Funzioni previste:

```ts
drawCameraFrame(ctx, video, layout);
drawCreatorHud(ctx, hudSnapshot, layout);
```

Lo stesso `CreatorHudSnapshot` deve pilotare sia HUD DOM live sia HUD Canvas registrato.

## Preset video

Tipo proposto:

```ts
type CreatorVideoPreset = {
  id: 'portrait-720' | 'portrait-1080' | 'landscape-720';
  width: number;
  height: number;
  fps: number;
  label: string;
};
```

Prima versione consigliata:

```text
portrait-720
720 x 1280
30 FPS
```

Motivo: formato social portrait, carico piu' sostenibile su mobile. L'API deve permettere di aggiungere `portrait-1080` in seguito.

Implementare un helper puro per crop `cover`:

- input: dimensioni sorgente video;
- input: dimensioni canvas output;
- output: rettangolo sorgente da disegnare;
- nessuno stretching.

## Hook recorder: `useCreatorRecorder`

Responsabilita':

- feature detection `MediaRecorder`;
- scelta MIME type supportato;
- gestione stato recorder;
- composizione canvas;
- start/stop/discard/download;
- generazione Blob;
- object URL;
- revoca URL;
- cleanup animation frame e riferimenti.

Stati previsti:

```ts
type CreatorRecorderStatus =
  | 'idle'
  | 'recording'
  | 'stopping'
  | 'ready'
  | 'unsupported'
  | 'error';
```

Ordine MIME type:

```ts
video/webm;codecs=vp9
video/webm;codecs=vp8
video/webm
```

Usare `MediaRecorder.isTypeSupported`. Non dichiarare supporto MP4 se il browser non lo espone.

Filename:

```text
bboyarena-creator-YYYY-MM-DD-HH-mm.webm
```

Estensione coerente col MIME type scelto.

## Audio

Out of scope per la prima versione.

Regole:

- `audio: false`;
- nessun permesso microfono;
- nessun system audio;
- nessun game music mix;
- possibile nota UI o documentazione: `Video-only recording in this first version.`

## Exit behavior

Creator Mode deve avere un'azione esplicita per uscire.

All'uscita:

1. se recording attivo, fermare o chiedere conferma secondo stile progetto;
2. fermare tutte le track della camera;
3. cancellare animation frame;
4. rilasciare `video.srcObject`;
5. revocare object URL temporanei quando appropriato;
6. liberare riferimenti `MediaRecorder`;
7. tornare a `mainMenu`.

Non resettare impostazioni, progressione, career/training o `selectedMode`.

## Fullscreen e iframe

Non assumere accesso top-level:

- non usare `window.top`;
- non controllare parent app;
- richiedere camera dentro `apps/game`.

Se l'app gira in iframe, documentare che il parent deve permettere:

```html
allow="camera; fullscreen"
```

Se l'iframe e' nello stesso repository e manca il permesso camera, si puo' fare una modifica minima preservando ogni valore `allow` esistente.

## Styling

Usare linguaggio visuale esistente BboyArena:

- typography;
- CSS custom properties;
- bordi;
- colori controlli;
- geometrie HUD;
- safe-area insets;
- pattern responsive.

Creator CSS deve essere isolato in `creator.css` o equivalente.

Requisiti responsive:

- narrow portrait mobile;
- landscape mobile;
- desktop;
- priorita' a portrait social video.

Toolbar e controlli non devono finire dietro:

```css
env(safe-area-inset-top)
env(safe-area-inset-right)
env(safe-area-inset-bottom)
env(safe-area-inset-left)
```

Niente CSS framework. Evitare inline style salvo valori dinamici gia' gestiti cosi' nel progetto.

## Accessibilita' e sicurezza utente

Includere:

- label accessibili su camera e recording controls;
- stato recording visibile;
- disabled states durante richiesta camera o stop recorder;
- toolbar keyboard-accessible;
- status text per errori;
- niente camera automatica;
- niente recording automatico;
- niente upload;
- indicazione che il processing e' locale.

## Lifecycle browser

Gestire almeno:

- unmount componente;
- page visibility changes;
- track che termina inaspettatamente;
- ingresso/uscita ripetuti;
- sessioni recording ripetute;
- switch camera dopo recording;
- permission denied seguito da retry;
- nessun listener stale;
- nessun object URL stale;
- nessun `MediaRecorder` ancora referenziato dopo cleanup.

Se il browser va in background durante recording, non promettere garanzie non supportate: preservare stato se possibile, oppure mostrare errore/stop pulito.

## Testing

Usare il test setup esistente, senza introdurre framework nuovi.

Priorita' a logica pura:

- selezione MIME type supportato;
- calcolo crop/cover camera;
- generazione filename;
- aggiornamenti HUD snapshot;
- transizioni stato recorder, se isolate;
- cleanup helpers, dove testabili.

Manual verification checklist:

1. Entrare in Creator Mode dal main menu.
2. Verificare che la camera non venga richiesta prima di `Enable camera`.
3. Concedere camera frontale.
4. Verificare mirror frontale in preview.
5. Passare a camera posteriore.
6. Muovere virtual stick.
7. Premere bottoni controllo.
8. Verificare update locale di score/combo/mossa/feedback.
9. Avviare registrazione.
10. Verificare che HUD compaia nel video salvato.
11. Fermare registrazione.
12. Aprire preview recording.
13. Scaricare recording.
14. Scartare e registrare di nuovo.
15. Uscire da Creator Mode.
16. Verificare che indicatore camera del dispositivo si spenga.
17. Entrare in training.
18. Verificare gameplay Three.js esistente invariato.
19. Entrare in career.
20. Verificare gameplay career invariato.

## Comandi di qualita'

Dopo implementazione, usare solo script realmente presenti nel repository.

Da verificare e poi eseguire dove disponibili:

```bash
npm run typecheck
npm run test
npm run build
```

Oppure equivalenti specifici di monorepo/app, se il progetto li definisce diversamente.

Correggere ogni errore TypeScript introdotto. Non usare `any` largo per nascondere problemi. Non committare build artifacts o file generati.

## Sequenza di implementazione

### Fase 1 - Inspect

- Leggere routing, store, menu, input, HUD, CSS.
- Identificare elementi riusabili.
- Annotare componenti gameplay da non montare.
- Verificare script disponibili.

### Fase 2 - Navigazione minima

- Aggiungere tipo `creator`.
- Aggiungere action `openCreator`.
- Aggiungere voce menu.
- Creare `CreatorMode` placeholder.
- Implementare back-to-menu.
- Verificare che career/training/menu restino raggiungibili.

### Fase 3 - Camera preview

- Implementare `useCreatorCamera`.
- Aggiungere `Enable camera`.
- Aggiungere front/rear switch.
- Aggiungere device select dove disponibile.
- Gestire errori e retry.
- Pulire stream all'uscita.

### Fase 4 - HUD locale

- Implementare `CreatorHudSnapshot`.
- Implementare controlli virtuali DOM.
- Aggiornare pressed state e stick movement via Pointer Events.
- Aggiungere display timer, BPM, score, combo, move, feedback, branding.
- Tenere tutto locale a Creator Mode.

### Fase 5 - Canvas recording

- Implementare helper crop/cover.
- Implementare `creatorHudRenderer`.
- Implementare `useCreatorRecorder`.
- Collegare `canvas.captureStream`.
- Gestire MediaRecorder, preview, download, discard.
- Pulire animation frame, URL, recorder.

### Fase 6 - Validazione

- Eseguire typecheck/test/build disponibili.
- Fare checklist manuale minima.
- Controllare diff per assicurarsi che file gameplay critici non siano stati toccati inutilmente.

## Non-goals espliciti

Non implementare:

- pose detection;
- skeleton tracking;
- AI movement recognition;
- riconoscimento automatico mosse;
- augmented reality;
- Three.js overlay;
- personaggio 3D;
- multiplayer;
- auth;
- upload;
- social publishing;
- storage server;
- microfono;
- music capture;
- system audio;
- timeline editing;
- filtri video;
- chroma key;
- transcodifica MP4;
- scoring gameplay autorevole;
- leaderboard submission.

## Definition of Done

La feature sara' completa quando:

- il main menu espone Creator Mode;
- Creator Mode e' una schermata separata;
- l'ingresso in Creator Mode non monta gameplay o WebGL;
- accesso camera e recording richiedono azione esplicita;
- front/rear switch funziona dove supportato;
- device selection funziona dove supportato;
- i controlli virtuali sono manipolabili;
- score/combo/BPM/mossa/feedback locali sono visibili;
- lo stesso `CreatorHudSnapshot` guida live HUD e recorded HUD;
- il video composto puo' essere registrato;
- il risultato puo' essere previewed e scaricato localmente;
- camera, recorder, animation frame e object URL vengono puliti;
- exit torna a `mainMenu`;
- career e training restano invariati;
- TypeScript e build passano;
- nessuna dipendenza non necessaria viene introdotta.

## Report finale richiesto dopo implementazione

La risposta finale dell'implementazione dovra' includere:

1. stato repository ispezionato;
2. file creati;
3. file esistenti modificati;
4. elementi esistenti riusati;
5. elementi esistenti non riusati intenzionalmente e motivo;
6. architettura camera;
7. architettura recording;
8. limitazioni browser scoperte;
9. MIME type selezionato nell'ambiente di test corrente;
10. comandi test/build eseguiti;
11. risultati;
12. conferma esplicita che i path career/training normali non sono stati cambiati;
13. follow-up rimanenti.

Regola guida:

```text
Creator Mode puo' riusare linguaggio visuale e vocabolario input di BboyArena,
ma non deve alterare o dipendere dal runtime gameplay corrente.
```
