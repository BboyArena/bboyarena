# Three.js e architettura schermate

Questa nota spiega come funziona oggi la parte game in `apps/game`, con focus su Three.js, React Three Fiber, schermate menu/play e sul dubbio: conviene usare React Router per selezionare le schermate?

## Mappa rapida

File principali:

- `src/main.tsx`: entry React standalone. Monta `GameApp` dentro `#bboyarena-game-standalone`.
- `src/game/GameApp.tsx`: decide quale schermata mostrare in base allo stato globale `screen`.
- `src/game/state/useGameStore.ts`: store Zustand per navigazione interna, mode, dati condivisi e preferenze input.
- `src/game/GamePlayScene.tsx`: wrapper della scena giocabile. Qui entrano XState, provider input e costruzione del `PlayerMotionState`.
- `src/game/state/gameMachine.ts`: macchina XState del round: `idle`, `playing`, `paused`, `gameOver`.
- `src/game/state/playerMotionState.ts`: stato intermedio minimale che prepara il passaggio da input/gameplay a player controllabile.
- `src/game/input/gameInputTypes.ts`: contratto comune per sorgenti, movimento, pulsanti, snapshot e mapping.
- `src/game/input/GameInputController.ts`: normalizza gli aggiornamenti degli adapter in un solo snapshot osservabile.
- `src/game/input/GameInputProvider.tsx`: espone controller e snapshot input al ramo gameplay.
- `src/game/input/KeyboardMouseInputAdapter.tsx`, `GamepadInputAdapter.tsx`, `TouchInputAdapter.tsx`: traducono i dispositivi fisici nel contratto comune.
- `src/game/input/useResolveActiveInputSource.ts`: risolve la sorgente attiva in base alla preferenza e ai dispositivi disponibili.
- `src/game/input/useConnectedGamepads.ts`: mantiene l'elenco dei gamepad esposti dalla Gamepad API.
- `src/game/CanvasScene.tsx`: scena React Three Fiber/Three.js.
- `src/game/Player.tsx`: oggetto 3D animato con `useFrame`.
- `src/game/ui/GameHUD.tsx`: menu 2D, splash, settings e credits.
- `src/game/ui/GamePlayHUD.tsx`: HUD 2D sopra il canvas 3D durante il gameplay.
- `src/game/ui/GameCanvasErrorBoundary.tsx`: isola gli errori Three.js/R3F e mantiene viva l'interfaccia DOM.
- `src/game/ui/GameFullscreenToggle.tsx`: controllo fullscreen persistente per l'intero runtime.
- `src/game/ui/GameFullscreenReticle.tsx`: reticolo DOM mostrato durante il fullscreen.
- `src/game/game.css`: layout 16:9, background delle schermate, canvas assoluto e overlay HUD.

## Il flusso attuale

Il game ha due livelli di stato:

1. Stato di schermata/app, gestito con Zustand.
2. Stato del round giocabile, gestito con XState.

Lo stato di schermata vive in `useGameStore`:

```ts
export type GameMenuScreen = 'splashscreen' | 'mainMenu' | 'settings' | 'credits';
export type GamePlayMode = 'career' | 'training';
export type GameScreen = GameMenuScreen | GamePlayMode;
```

`GameApp` legge `screen` e decide il ramo principale. Fullscreen toggle e reticolo restano fuori dai due rami, così non vengono smontati quando si entra o si esce dal gameplay:

```tsx
{isPlayableScreen ? (
  <GamePlayScene mode={selectedMode} copy={copy} />
) : (
  <GameHUD copy={copy} />
)}

<GameFullscreenToggle targetRef={rootRef} />
<GameFullscreenReticle targetRef={rootRef} />
```

Quindi:

- `splashscreen`, `mainMenu`, `settings`, `credits` sono schermate 2D.
- `career` e `training` sono schermate playable e montano Three.js.
- Three.js non gira nei menu: il canvas viene creato solo dentro `GamePlayScene`.

Questa scelta è importante perché un canvas WebGL costa memoria e GPU. Tenerlo spento nei menu riduce lavoro inutile e rende più chiara la separazione tra lobby 2D e gameplay 3D.

## Cosa fa il selector

Il pulsante:

```tsx
Scene selector / {screen}
```

in `GameApp.tsx` cicla solo tra:

```ts
['splashscreen', 'mainMenu', 'settings', 'credits']
```

È quindi più un controllo/debug provvisorio che un sistema completo di routing. Non seleziona direttamente `career` o `training`; quelle partono dal menu con:

```ts
startMode: (selectedMode) => set({ screen: selectedMode, selectedMode })
```

Oggi quel pulsante è visibile solo in development con `import.meta.env.DEV`.

## Come funziona la scena Three.js

`CanvasScene.tsx` usa `@react-three/fiber`, cioè un renderer React per Three.js.

Il componente principale è:

```tsx
<Canvas
  className="game-canvas__surface"
  shadows
  dpr={[1, 1.5]}
  camera={{ position: [0, 3.4, 8.5], fov: 42 }}
  gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
>
```

Dentro il canvas vengono dichiarati oggetti Three.js come componenti React:

- `<color attach="background" />` imposta il colore di background.
- `<fog attach="fog" />` aggiunge profondità atmosferica.
- `<ambientLight />`, `<hemisphereLight />`, `<directionalLight />`, `<pointLight />` illuminano la scena.
- `<mesh />` rappresenta un oggetto renderizzabile.
- `<planeGeometry />` definisce il pavimento.
- `<meshStandardMaterial />` definisce colore, roughness, metalness e risposta alla luce.
- `<OrbitControls />` permette di orbitare la camera durante il prototipo.

Esempio:

```tsx
<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
  <planeGeometry args={[40, 40]} />
  <meshStandardMaterial map={parquetTexture} roughness={0.96} metalness={0.02} />
</mesh>
```

Questo crea il pavimento: un piano ruotato di 90 gradi, largo 40x40, con texture parquet.

La texture usa il base path Vite invece di un URL assoluto:

```ts
useTexture(`${import.meta.env.BASE_URL}parquet.png`)
```

Questo dettaglio è necessario perché in sviluppo il game vive su `/`, mentre nel deploy GitHub Pages viene copiato sotto `/game/`. Con `PUBLIC_GAME_BASE=/game/`, il bundle deve richiedere `/game/parquet.png`, non `/parquet.png` dalla root del sito.

## Componenti 3D locali

La scena 3D è ancora piccola e intenzionalmente semplice: `CanvasScene.tsx` ospita il setup della stanza, il pavimento e il `Player`.

Gli oggetti sono normali componenti React che ritornano `<group>` e `<mesh>`. Non sono scene separate: sono pezzi della stessa arena.

Questa è una buona impostazione per il prototipo perché:

- ogni prop controlla posizione, rotazione, dimensione o colore;
- gli oggetti sono riutilizzabili;
- la scena resta leggibile;
- si può poi spostare ogni oggetto in un file dedicato quando cresce.

## Resilienza WebGL e mobile

Il mount del canvas è il punto più costoso del passaggio da menu 2D a schermata playable. Per ridurre pressione su memoria e GPU, soprattutto su mobile, la configurazione corrente:

- limita il device pixel ratio a `1–1.5`;
- usa `powerPreference: 'high-performance'`;
- limita l'anisotropia del parquet a `4`;
- usa shadow map `512x512` per la directional light;
- usa shadow map `1024x1024` per lo spotlight.

`WebGLContextGuard` osserva l'evento `webglcontextlost` sul canvas. Se il browser perde il contesto, `CanvasScene` smonta il renderer e mostra un fallback DOM leggibile invece di lasciare una superficie nera.

Inoltre `GamePlayScene` limita un eventuale errore R3F, Three.js, texture o shader al solo canvas:

```tsx
<GameCanvasErrorBoundary>
  <CanvasScene gameState={gameState} playerMotionState={playerMotionState} />
</GameCanvasErrorBoundary>
```

Il boundary non avvolge l'intera scena gameplay. Di conseguenza restano montati:

- `GameInputProvider` e adapter;
- pulsante di ritorno al menu;
- `GamePlayHUD` e controlli touch;
- root fullscreen persistente.

Il fallback evita quindi che un problema WebGL elimini anche l'interfaccia necessaria per uscire o diagnosticare il problema.

## Player e animazione

`Player.tsx` usa `useFrame` e legge anche `playerMotionState`:

```tsx
useFrame((state) => {
  const time = state.clock.getElapsedTime();
  const bps = bpm / 60;
  const rhythm = Math.sin(time * bps * Math.PI * 2);
  const { currentMove, spinSpeed, balance, rotationAxis } = playerMotionState;
});
```

`useFrame` viene chiamato a ogni frame renderizzato. Qui serve ad animare il mesh principale del player in base a:

- `gameState`, ricevuto da `GamePlayScene`;
- `playerMotionState`, calcolato nel wrapper gameplay;
- `bpm`, letto dallo store Zustand;
- tempo trascorso del clock R3F.

Quando `gameState === 'playing'`, il player:

- rimbalza in verticale;
- ruota in base a `spinSpeed` e `rotationAxis`;
- inclina asse X/Z;
- pulsa leggermente in scala;
- aumenta un po' l'emissive del materiale.

Quando `currentMove === 'freeze'` o `gameState === 'paused'`, entra in freeze leggero. Negli altri stati fa solo una piccola animazione idle.

Il punto importante è che il `Player` non legge direttamente tastiera, gamepad o touch. Riceve invece un `PlayerMotionState` derivato dallo snapshot input normalizzato:

```txt
touch / gamepad / keyboard
↓
input adapter
↓
GameInputController snapshot
↓
GamePlayScene
↓
PlayerMotionState
↓
CanvasScene
↓
Player
```

Questa separazione evita di legare il componente Three.js a un dispositivo specifico. Per esempio, `snapshot.move` alimenta `moveIntent` e `rotationAxis`, mentre il pulsante logico `primary` seleziona la move `spinStart`: il risultato è identico qualunque sia il tasto o pulsante fisico associato.

## Architettura input

Il gameplay usa un contratto input unico. Ogni snapshot contiene:

```ts
type GameInputSnapshot = {
  source: 'touch' | 'gamepad' | 'keyboardMouse';
  move: { x: number; y: number };
  buttons: Record<GameInputButtonId, {
    pressed: boolean;
    value: number;
  }>;
  updatedAt: number;
};
```

Le azioni logiche disponibili sono:

- `primary` e `secondary`;
- `modifierLeft` e `modifierRight`;
- `start` e `pause`;
- il vettore bidimensionale `move`.

`GameInputProvider` crea una sola istanza di `GameInputController` per la scena giocabile. Gli adapter scrivono nel controller, mentre `GamePlayScene` e `GamePlayHUD` leggono lo stesso snapshot tramite `useGameInputSnapshot()`.

```txt
KeyboardMouseInputAdapter ─┐
GamepadInputAdapter       ─┼─> GameInputController ─> GameInputSnapshot
TouchInputAdapter         ─┘              ├─> GamePlayScene / PlayerMotionState
                                          └─> Training input HUD
```

### Risoluzione della sorgente

La preferenza `preferredInputMode` può essere:

- `auto`;
- `touch`;
- `gamepad`;
- `keyboardMouse`.

In modalità `auto`, `useResolveActiveInputSource` applica questo ordine:

1. touch, se il dispositivo espone un puntatore coarse o supporto touch;
2. gamepad, se la Gamepad API rileva almeno un controller;
3. mouse e tastiera come fallback.

Se l'utente sceglie esplicitamente una sorgente, quella preferenza ha precedenza sul rilevamento automatico. L'overlay touch viene mostrato solo quando la sorgente attiva è `touch`, salvo gli override di debug disponibili in development.

### Selezione del gamepad e input map

La schermata `Options > Controls > Input map` gestisce tre impostazioni distinte:

1. famiglia di input preferita;
2. gamepad preferito, identificato dal suo `Gamepad.index`;
3. mapping delle azioni logiche per tastiera e gamepad.

Lo store conserva:

```ts
selectedGamepadIndex: number | null;
keyboardInputMap: Record<GameInputButtonId, string>;
gamepadInputMap: Record<GameInputButtonId, number>;
```

`null` indica selezione automatica del primo gamepad disponibile. `useConnectedGamepads` aggiorna l'elenco quando un controller viene collegato o scollegato e mantiene anche un polling leggero, utile per browser che non emettono sempre gli eventi in modo affidabile.

Il mapping non è soltanto descrittivo: `KeyboardMouseInputAdapter` risolve i `KeyboardEvent.code` usando `keyboardInputMap`, mentre `GamepadInputAdapter` legge gli indici configurati in `gamepadInputMap`. Cambiare un'associazione in Options modifica quindi il comportamento effettivo durante il gameplay.

Il movimento conserva per ora mapping standard:

- tastiera: WASD e frecce;
- gamepad: assi `0` e `1`, con deadzone e normalizzazione;
- touch: joystick virtuale basato su `nipplejs`.

## HUD sopra il canvas

Il layout è sovrapposto:

```txt
game-stage
├─ CanvasScene     z-index base, position absolute
├─ GamePlayHUD     z-index 10, position absolute
├─ Fullscreen UI
└─ Reticle
```

Nel CSS:

```css
.game-canvas {
  position: absolute;
  inset: 0;
}

.game-hud {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}
```

Il canvas occupa tutto lo stage 16:9. L'HUD è HTML/CSS sopra il canvas, quindi pulsanti, pannelli e testi restano facili da costruire e accessibili senza doverli fare in Three.js.

Questo approccio è corretto per un browser game:

- mondo 3D in WebGL;
- interfaccia in DOM;
- stato condiviso via store;
- comandi gameplay via XState e stato intermedio del player.

### HUD diagnostico Training

In modalità `training`, `GamePlayHUD` mostra sempre un monitor input live. Il pannello visualizza:

- sorgente attiva;
- nome del gamepad selezionato o stato di attesa;
- posizione normalizzata del direzionale;
- stato `ON/OFF` di tutte le azioni logiche.

Il monitor legge `GameInputSnapshot`, non gli eventi del dispositivo. Per questo funziona allo stesso modo con touch, gamepad e mouse/tastiera e riflette automaticamente il mapping configurato. In modalità touch resta inoltre montato `TouchControlsOverlay`, che scrive nello stesso controller degli altri adapter.

## Fullscreen persistente

Il target fullscreen è `#bboyarena-game-root`, conservato da `GameApp` tramite `rootRef`. Il controllo fullscreen è montato una sola volta come sibling del ramo menu/gameplay:

```txt
GameApp / #bboyarena-game-root
└─ game-stage
   ├─ GameHUD oppure GamePlayScene
   ├─ GameFullscreenToggle   sempre montato
   └─ GameFullscreenReticle sempre montato
```

Questa ownership è intenzionale. Il passaggio da `mainMenu` a `career` o `training` sostituisce il contenuto dello stage e monta il canvas R3F, ma non deve sostituire il componente che osserva `document.fullscreenElement`. Target DOM, listener `fullscreenchange` e controllo restano quindi stabili attraverso tutti i cambi di schermata.

`GameFullscreenToggle` è l'unico componente che invoca:

- `target.requestFullscreen()` per entrare;
- `document.exitFullscreen()` per uscire esplicitamente.

L'uscita resta inoltre disponibile tramite i controlli nativi del browser, per esempio `Esc` o Back. Il cambio di screen nello store non chiama mai `exitFullscreen()`.

### Standalone e iframe

Il runtime supporta due contesti:

- standalone: `document.fullscreenElement` è `#bboyarena-game-root`;
- website: il documento esterno porta l'`iframe` in fullscreen e il documento interno conserva `#bboyarena-game-root` come proprio fullscreen element.

La pagina website mantiene sul frame i permessi necessari:

```html
<iframe
  data-src="https://bboyarena.org/game/"
  allow="fullscreen; gamepad"
  allowfullscreen
  hidden
></iframe>
```

Il pulsante navbar che porta a `/play-the-game` è visibile sia nel browser sia nella PWA. L'accesso al runtime, invece, è PWA-only:

1. nel browser normale la pagina mostra un gate con istruzioni di installazione;
2. l'iframe nasce senza attributo `src`, quindi il game non viene scaricato o eseguito;
3. lo script rileva `display-mode: standalone`, con fallback iOS `navigator.standalone`;
4. solo nella PWA installata copia `data-src` in `src`, nasconde il gate e mostra iframe e link standalone.

Questa è una protezione di prodotto lato client, non un'autorizzazione di sicurezza: l'URL `/game/` rimane una risorsa statica pubblica e può essere aperto direttamente conoscendone l'indirizzo.

La transizione `fullscreen → training` è stata verificata in Chrome sia direttamente sia dentro l'iframe: dopo il mount del canvas il root resta connesso, il fullscreen element resta presente e il monitor Training rimane nel DOM.

In produzione, dopo un deploy, una PWA o una scheda già aperta può continuare temporaneamente a usare un vecchio HTML/service worker. Prima di diagnosticare una regressione già corretta conviene verificare la versione pubblicata, aggiornare la PWA e ricaricare senza cache.

### Build e pubblicazione

La pipeline GitHub Pages costruisce separatamente website e game:

```txt
npm run build       -> dist/
npm run game:build  -> dist-game/
copy dist-game/.    -> dist/game/
```

La variabile `PUBLIC_GAME_BASE` vale `/game/` in produzione. Asset importati o caricati a runtime devono quindi rispettare `import.meta.env.BASE_URL`; un path hardcoded come `/asset.png` cercherebbe erroneamente la risorsa nella root della website.

## Perché usare Zustand e XState insieme

Zustand contiene stato globale e trasversale:

- schermata corrente;
- mode selezionata;
- personaggio;
- score;
- bpm;
- mute.
- preferenza e sorgente input attiva;
- gamepad selezionato;
- mapping tastiera e gamepad.

XState contiene lo stato finito del round:

- `idle`;
- `playing`;
- `paused`;
- `gameOver`.

Sono due responsabilità diverse. Zustand risponde alla domanda "dove siamo nell'app e quali dati globali abbiamo?". XState risponde alla domanda "in quale fase esatta del round siamo e quali transizioni sono valide?".

Esempio: da `playing` posso andare a `paused`, `gameOver` o `idle` tramite reset. Da `idle` posso solo fare `START`. Questa logica è più sicura in una macchina a stati rispetto a booleani sparsi tipo `isPlaying`, `isPaused`, `isGameOver`.

## React Router per selezionare le schermate?

Risposta breve: per questo livello di schermata, non è obbligatorio. Può avere senso più avanti, ma non sostituirei automaticamente lo store con React Router.

### Quando NON conviene React Router

Per schermate interne al runtime di gioco:

- `splashscreen`
- `mainMenu`
- `settings`
- `credits`
- `career`
- `training`
- stati di round come `playing` o `paused`

lo store è più naturale. Sono stati interattivi, spesso temporanei, e non sempre devono diventare URL.

Esempio: non è detto che `paused` debba essere `/paused`. È uno stato del round, non una pagina.

In più, il game è pensato come app standalone embeddabile dalla website tramite boundary o iframe. Dentro quel boundary può comportarsi come runtime unico, senza trasformare ogni schermata in route.

### Quando conviene React Router

React Router diventerebbe utile se vuoi:

- deep link condivisibili, tipo `/game/settings` o `/game/training`;
- back/forward del browser coerente con le schermate menu;
- schermate game più indipendenti, con loader o layout diversi;
- separare aree grandi: lobby, editor, inventory, shop, match replay;
- analytics page-based;
- refresh della pagina che ripristina una schermata specifica.

In quel caso Router dovrebbe gestire solo le macro-pagine, non ogni micro-stato di gameplay.

Una possibile divisione futura:

```txt
/                 -> splashscreen o redirect lobby
/menu             -> main menu
/settings         -> settings
/credits          -> credits
/play/career      -> monta GamePlayScene mode="career"
/play/training    -> monta GamePlayScene mode="training"
```

Dentro `/play/:mode`, XState continuerebbe a gestire `idle/playing/paused/gameOver`.

## Raccomandazione per questo progetto

Per ora terrei l'approccio attuale:

- Zustand per le schermate game interne.
- XState per il round.
- React Three Fiber solo nelle schermate playable.
- HUD e menu in DOM/CSS.
- `Scene selector` come dev tool temporaneo visibile solo in development.

I passi futuri più naturali sono:

1. Persistenza delle preferenze input e dei mapping tra sessioni.
2. Rimappatura tramite cattura diretta del prossimo tasto o pulsante premuto.
3. Profili separati per controller diversi, invece di un solo mapping gamepad globale.
4. React Router solo quando servono davvero URL, deep link o back-button.

Il punto più importante: in Three.js "scene" significa grafo 3D renderizzato. In questo codice `screen` nello store significa schermata del game. Sono due concetti diversi e conviene tenerli separati.

## Come aggiungere una nuova schermata

Per una nuova schermata 2D, ad esempio `inventory`:

1. Aggiungi il valore al tipo in `useGameStore.ts`.
2. Aggiungi un'action tipo `openInventory`.
3. Gestisci il rendering in `GameHUD.tsx`.
4. Aggiungi lo styling in `game.css` con `data-scene="inventory"` se serve un background dedicato.

Per una nuova schermata playable, ad esempio `battle`:

1. Aggiungi il mode o la schermata nello store.
2. Fai montare `GamePlayScene` o un nuovo wrapper equivalente da `GameApp`.
3. Crea o parametrizza una `CanvasScene` diversa.
4. Mantieni XState per gli stati del round.

Se le playable scene diventano molte, conviene introdurre un registry:

```ts
const playScenes = {
  career: CareerScene,
  training: TrainingScene,
  battle: BattleScene
};
```

Così `GameApp` non cresce con troppi `if`.

## Glossario

- Screen store: valore Zustand che indica la schermata corrente del game.
- Three.js scene: mondo 3D interno a `<Canvas>`.
- R3F: React Three Fiber, bridge tra React e Three.js.
- Canvas: superficie WebGL in cui viene renderizzata la scena 3D.
- WebGL context loss: perdita del contesto grafico da parte del browser, gestita con fallback DOM.
- Error boundary canvas: confine React che impedisce a un errore 3D di smontare HUD e controlli.
- Mesh: oggetto visibile composto da geometry e material.
- Geometry: forma dell'oggetto.
- Material: aspetto dell'oggetto.
- Group: contenitore trasformabile per più mesh.
- useFrame: callback eseguita a ogni frame per animazioni e update.
- HUD: interfaccia HTML/CSS sopra il canvas.
- PlayerMotionState: stato intermedio minimale che prepara il player a diventare controllabile.
- Input adapter: traduttore tra API del dispositivo e azioni logiche del gioco.
- GameInputSnapshot: fotografia normalizzata e indipendente dal dispositivo dell'input corrente.
- Preferred input mode: scelta dell'utente tra risoluzione automatica, touch, gamepad e mouse/tastiera.
- PWA gate: controllo client che assegna il `src` all'iframe solo in display mode standalone.
