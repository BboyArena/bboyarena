# InputManager

`InputManager` centralizza gli input del gioco e produce uno snapshot normalizzato, indipendente dalla sorgente fisica usata dal player.

File principali:

- `apps/game/src/game/input/InputManager.ts`
- `apps/game/src/game/input/useInputManager.ts`
- `apps/game/src/game/state/useInputStore.ts`
- `apps/game/src/game/GamePlayScene.tsx`

## Sorgenti supportate

### Tastiera e mouse

La tastiera aggiorna il vettore `movement` e il set `actions`.

Mapping iniziale:

- `WASD` / frecce: movimento
- `Space` / `Z`: `primary`
- `X`: `secondary`
- `C`: `special`
- `E` / `Enter`: `confirm`
- `Q`: `cancel`
- `Shift`: `run`
- `Escape`: `pause`
- `M`: `menu`

Il mouse aggiorna `pointer`; quando si trascina su una zona non interattiva aggiorna anche `look`.

### Gamepad API

Il manager legge `navigator.getGamepads()` in un loop `requestAnimationFrame`.

Mapping iniziale:

- stick sinistro: `movement`
- stick destro: `look`
- pulsante 0: `primary`
- pulsante 1: `cancel`
- pulsante 2: `secondary`
- pulsante 3: `special`
- pulsanti 4 / 7: `run`
- pulsante 9: `menu`
- d-pad up: `confirm`
- d-pad down: `cancel`

La deadzone di default e' `0.18`.

### TouchJoystick con NippleJS

Dipendenza installata:

```bash
npm install nipplejs
```

`GamePlayScene` monta una zona DOM `.game-touch-joystick` e la passa a `InputManager` tramite `useInputManager`.

Il joystick usa:

- `mode: "dynamic"`
- `size: 112`
- `threshold: 0.12`

Il vettore NippleJS viene normalizzato in `movement`, con asse Y invertito per mantenere `up = 1`.

Su desktop i touch controls sono nascosti di default. Per provarli:

- apri il gioco con `?touchControls=1`
- oppure con `?inputDebug=1`
- oppure abilitali da console con:

```js
localStorage.setItem('bboyarena:touchControls', '1');
location.reload();
```

Per disabilitarli:

```js
localStorage.removeItem('bboyarena:touchControls');
location.reload();
```

NippleJS in modalita' `dynamic` disegna il joystick solo mentre premi o trascini dentro la zona `.game-touch-joystick`. Su desktop puoi usare il mouse sulla zona forzata.

### Touch gesture

Il manager ascolta gesture touch sulla root della scena e ignora target interattivi come bottoni, link, form control e `[data-input-ignore="true"]`.

Gesture iniziali:

- `tap`
- `doubleTap`
- `swipe`, con direzione `up`, `down`, `left`, `right`
- `pinch`, con `scale` quando disponibile

## Snapshot

Ogni listener riceve:

```ts
interface InputSnapshot {
  movement: { x: number; y: number };
  look: { x: number; y: number };
  pointer: { x: number; y: number };
  actions: ReadonlySet<InputAction>;
  activeSources: ReadonlySet<InputSource>;
  gamepads: ConnectedGamepad[];
  lastGesture: InputGesture | null;
  timestamp: number;
}
```

I vettori sono normalizzati nel range `-1..1`.

## Stato Zustand

Lo snapshot pubblico vive in Zustand:

```ts
const movement = useInputStore((state) => state.snapshot.movement);
const actions = useInputStore((state) => state.snapshot.actions);
```

`InputManager` resta un servizio headless: ascolta browser, gamepad e NippleJS, poi pubblica lo snapshot con `useInputStore.getState().setSnapshot(snapshot)`.

Per logica ad alta frequenza, come `useFrame`, preferire lettura imperativa per evitare render React inutili:

```ts
const { movement, actions } = useInputStore.getState().snapshot;
```

## Uso React

```tsx
const joystickZoneRef = useRef<HTMLDivElement | null>(null);
const { snapshot, manager } = useInputManager({
  rootRef,
  joystickZoneRef
});
```

`snapshot.movement` e `snapshot.actions` arrivano da Zustand e sono il punto di ingresso per gameplay, animazioni e state machine. `manager` serve solo quando una feature ha bisogno di subscribe manuali o lifecycle esplicito.

## Regole di integrazione

- Le UI interattive devono usare bottoni/link nativi quando possibile.
- Aggiungi `data-input-ignore="true"` alle zone touch dedicate o a superfici che non devono generare gesture.
- Non leggere direttamente tastiera, gamepad o touch dentro il gameplay: passa sempre da `InputManager`.
- Per azioni di gameplay nuove, estendi prima `InputAction`, poi aggiorna i mapping per sorgente.
- Per remapping futuro, spostare `keyActionMap` e `gamepadButtonMap` fuori dalla classe in un profilo serializzabile.
