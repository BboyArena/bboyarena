# Three.js e architettura scene

Questa nota spiega come funziona oggi la parte game in `apps/game`, con focus su Three.js, React Three Fiber, scene di menu/play e sul dubbio: conviene usare React Router per selezionare le scene?

## Mappa rapida

File principali:

- `src/main.tsx`: entry React standalone. Monta `GameApp` dentro `#bboyarena-game-standalone`.
- `src/game/GameApp.tsx`: decide quale scena mostrare in base allo stato globale `scene`.
- `src/game/state/useGameStore.ts`: store Zustand per navigazione interna game, mode selezionata, score, bpm, mute e dati condivisi.
- `src/game/GamePlayScene.tsx`: wrapper della scena giocabile. Qui entra XState per lo stato del round.
- `src/game/state/gameMachine.ts`: macchina XState del round: `idle`, `playing`, `paused`, `gameOver`.
- `src/game/CanvasScene.tsx`: scena React Three Fiber/Three.js.
- `src/game/Player.tsx`: oggetto 3D animato con `useFrame`.
- `src/game/ui/GameHUD.tsx`: menu 2D, splash, settings e credits.
- `src/game/ui/GamePlayHUD.tsx`: HUD 2D sopra il canvas 3D durante il gameplay.
- `src/game/game.css`: layout 16:9, background delle scene, canvas assoluto e overlay HUD.

## Il flusso attuale

Il game ha due livelli di stato:

1. Stato di scena/app, gestito con Zustand.
2. Stato del round giocabile, gestito con XState.

Lo stato di scena vive in `useGameStore`:

```ts
export type GameMenuScene = 'splashscreen' | 'mainMenu' | 'settings' | 'credits';
export type GamePlayMode = 'career' | 'training';
export type GameScene = GameMenuScene | GamePlayMode;
```

`GameApp` legge `scene` e decide il ramo principale:

```tsx
{scene === 'career' || scene === 'training' ? (
  <GamePlayScene mode={selectedMode} locale={locale} rootRef={rootRef} />
) : (
  <>
    <GameHUD locale={locale} />
    <GameFullscreenToggle targetRef={rootRef} />
  </>
)}
```

Quindi:

- `splashscreen`, `mainMenu`, `settings`, `credits` sono scene 2D.
- `career` e `training` sono scene playable e montano Three.js.
- Three.js non gira nei menu: il canvas viene creato solo dentro `GamePlayScene`.

Questa scelta è importante perché un canvas WebGL costa memoria/GPU. Tenerlo spento nei menu riduce lavoro inutile e rende più chiara la separazione tra lobby 2D e gameplay 3D.

## Cosa fa il scene selector

Il pulsante:

```tsx
Scene selector / {scene}
```

in `GameApp.tsx` cicla solo tra:

```ts
['splashscreen', 'mainMenu', 'settings', 'credits']
```

È quindi più un controllo/debug provvisorio che un sistema completo di routing. Non seleziona direttamente `career` o `training`; quelle partono dal menu con:

```ts
startMode: (selectedMode) => set({ scene: selectedMode, selectedMode })
```

Nel prodotto finale probabilmente quel pulsante va rimosso o sostituito con una UI di dev visibile solo in development.

## Come funziona la scena Three.js

`CanvasScene.tsx` usa `@react-three/fiber`, cioè un renderer React per Three.js.

Il componente principale è:

```tsx
<Canvas
  className="game-canvas__surface"
  shadows
  camera={{ position: [0, 3.1, 8.2], fov: 42 }}
  gl={{ antialias: true, alpha: false }}
>
```

Dentro il canvas vengono dichiarati oggetti Three.js come componenti React:

- `<color attach="background" />` imposta il colore di background.
- `<fog attach="fog" />` aggiunge profondità atmosferica.
- `<ambientLight />`, `<hemisphereLight />`, `<directionalLight />`, `<pointLight />` illuminano la scena.
- `<mesh />` rappresenta un oggetto renderizzabile.
- `<boxGeometry />`, `<planeGeometry />`, `<ringGeometry />`, `<torusGeometry />`, `<capsuleGeometry />` definiscono forme.
- `<meshStandardMaterial />` definisce colore, roughness, metalness e risposta alla luce.
- `<OrbitControls />` permette di orbitare la camera durante il prototipo.

Esempio:

```tsx
<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
  <planeGeometry args={[30, 30]} />
  <meshStandardMaterial color="#9d907d" roughness={1} metalness={0} />
</mesh>
```

Questo crea il pavimento: un piano ruotato di 90 gradi, largo 30x30, con materiale opaco.

## Componenti 3D locali

In `CanvasScene.tsx` ci sono componenti 3D piccoli:

- `GraffitiWall`
- `Bench`
- `Boombox`
- `Hoop`

Sono normali componenti React che ritornano `<group>` e `<mesh>`. Non sono scene separate: sono pezzi della stessa arena.

Questa è una buona impostazione per il prototipo perché:

- ogni prop controlla posizione, rotazione, dimensione o colore;
- gli oggetti sono riutilizzabili;
- la scena resta leggibile;
- si può poi spostare ogni oggetto in un file dedicato quando cresce.

## Player e animazione

`Player.tsx` usa `useFrame`:

```tsx
useFrame((state) => {
  const time = state.clock.getElapsedTime();
  const bps = bpm / 60;
  const rhythm = Math.sin(time * bps * Math.PI * 2);
});
```

`useFrame` viene chiamato a ogni frame renderizzato. Qui serve ad animare il mesh principale del player in base a:

- `gameState`, ricevuto da `GamePlayScene`;
- `bpm`, letto dallo store Zustand;
- tempo trascorso del clock R3F.

Quando `gameState === 'playing'`, il player:

- rimbalza in verticale;
- ruota più velocemente;
- inclina asse X/Z;
- pulsa leggermente in scala;
- aumenta un po' l'emissive del materiale.

Quando è `paused`, entra in freeze leggero. Negli altri stati fa solo una piccola animazione idle.

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
- comandi gameplay via XState/store.

## Perché usare Zustand e XState insieme

Zustand contiene stato globale e trasversale:

- scena corrente;
- mode selezionata;
- personaggio;
- score;
- bpm;
- mute.

XState contiene lo stato finito del round:

- `idle`;
- `playing`;
- `paused`;
- `gameOver`.

Sono due responsabilità diverse. Zustand risponde alla domanda "dove siamo nell'app e quali dati globali abbiamo?". XState risponde alla domanda "in quale fase esatta del round siamo e quali transizioni sono valide?".

Esempio: da `playing` posso andare a `paused`, `gameOver` o `idle` tramite reset. Da `idle` posso solo fare `START`. Questa logica è più sicura in una macchina a stati rispetto a booleani sparsi tipo `isPlaying`, `isPaused`, `isGameOver`.

## React Router per selezionare le scene?

Risposta breve: per questo livello di scena, non è obbligatorio. Può avere senso più avanti, ma non sostituirei automaticamente lo store con React Router.

### Quando NON conviene React Router

Per scene interne al runtime di gioco:

- `splashscreen`
- `mainMenu`
- `settings`
- `credits`
- `career`
- `training`
- stati di round come `playing` o `paused`

lo store è più naturale. Sono stati interattivi, spesso temporanei, e non sempre devono diventare URL.

Esempio: non è detto che `paused` debba essere `/paused`. È uno stato del round, non una pagina.

In più, il game è pensato come app standalone embeddabile dalla website tramite boundary/iframe/URL. Dentro quel boundary può comportarsi come runtime unico, senza trasformare ogni schermata in route.

### Quando conviene React Router

React Router diventerebbe utile se vuoi:

- deep link condivisibili, tipo `/game/settings` o `/game/training`;
- back/forward del browser coerente con le schermate menu;
- pagine game più indipendenti, con loader o layout diversi;
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

- Zustand per le scene game interne.
- XState per il round.
- React Three Fiber solo nelle scene playable.
- HUD e menu in DOM/CSS.
- `Scene selector` come dev tool temporaneo, non come architettura finale.

Poi farei una piccola pulizia:

1. Rinominare mentalmente `scene` in `screen` o `gameScreen`, se il termine "scene" confonde con "Three.js scene".
2. Rimuovere o proteggere il pulsante `Scene selector` in produzione.
3. Introdurre React Router solo quando serve davvero URL/deep-link/back-button.

Il punto più importante: in Three.js "scene" significa grafo 3D renderizzato. In questo codice `scene` nello store significa schermata del game. Sono due concetti diversi con lo stesso nome, ed è probabilmente da qui che nasce buona parte della confusione.

## Come aggiungere una nuova scena

Per una nuova schermata 2D, ad esempio `inventory`:

1. Aggiungi il valore al tipo in `useGameStore.ts`.
2. Aggiungi un'action tipo `openInventory`.
3. Gestisci il rendering in `GameHUD.tsx`.
4. Aggiungi lo styling in `game.css` con `data-scene="inventory"` se serve un background dedicato.

Per una nuova scena playable, ad esempio `battle`:

1. Aggiungi il mode o la scene nello store.
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

- Scene store: valore Zustand che indica la schermata corrente del game.
- Three.js scene: mondo 3D interno a `<Canvas>`.
- R3F: React Three Fiber, bridge tra React e Three.js.
- Canvas: superficie WebGL in cui viene renderizzata la scena 3D.
- Mesh: oggetto visibile composto da geometry e material.
- Geometry: forma dell'oggetto.
- Material: aspetto dell'oggetto.
- Group: contenitore trasformabile per più mesh.
- useFrame: callback eseguita a ogni frame per animazioni e update.
- HUD: interfaccia HTML/CSS sopra il canvas.
