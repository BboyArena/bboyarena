export type PreferredInputMode = 'auto' | 'touch' | 'gamepad' | 'keyboardMouse';

export type ActiveInputSource = 'touch' | 'gamepad' | 'keyboardMouse';

export type GameInputAction =
  | 'move'
  | 'look'
  | 'action.toprock'
  | 'action.footwork'
  | 'action.freeze'
  | 'action.powermove'
  | 'action.l1'
  | 'action.l2'
  | 'action.r1'
  | 'action.r2'
  | 'system.start'
  | 'system.pause';

export type GameInputButtonId =
  | 'toprock'
  | 'footwork'
  | 'freeze'
  | 'powermove'
  | 'l1'
  | 'l2'
  | 'r1'
  | 'r2'
  | 'start'
  | 'pause';

export type KeyboardInputMap = Record<GameInputButtonId, string>;
export type GamepadInputMap = Record<GameInputButtonId, number>;

export const defaultKeyboardInputMap: KeyboardInputMap = {
  toprock: 'KeyJ',
  footwork: 'KeyK',
  freeze: 'KeyL',
  powermove: 'Space',
  l1: 'KeyQ',
  l2: 'KeyZ',
  r1: 'KeyE',
  r2: 'KeyC',
  start: 'Enter',
  pause: 'Escape'
};

export const defaultGamepadInputMap: GamepadInputMap = {
  toprock: 0,
  footwork: 1,
  freeze: 2,
  powermove: 3,
  l1: 4,
  r1: 5,
  l2: 6,
  r2: 7,
  pause: 8,
  start: 9
};

export type GameInputVector = {
  x: number;
  y: number;
};

export type GameInputButtonState = {
  pressed: boolean;
  value: number;
};

export type GameInputSnapshot = {
  source: ActiveInputSource;
  move: GameInputVector;
  look: GameInputVector;
  buttons: Record<GameInputButtonId, GameInputButtonState>;
  updatedAt: number;
};

export type GameInputEventPhase = 'press' | 'release' | 'change';

export type GameInputEvent = {
  source: ActiveInputSource;
  action: GameInputAction;
  phase: GameInputEventPhase;
  value?: number;
  vector?: GameInputVector;
  button?: GameInputButtonId;
  timestamp: number;
};

const buttonIds: GameInputButtonId[] = [
  'toprock',
  'footwork',
  'freeze',
  'powermove',
  'l1',
  'l2',
  'r1',
  'r2',
  'start',
  'pause'
];

export function createDefaultGameInputSnapshot(
  source: ActiveInputSource = 'keyboardMouse'
): GameInputSnapshot {
  return {
    source,
    move: { x: 0, y: 0 },
    look: { x: 0, y: 0 },
    buttons: Object.fromEntries(
      buttonIds.map((button) => [button, { pressed: false, value: 0 }])
    ) as Record<GameInputButtonId, GameInputButtonState>,
    updatedAt: typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now()
  };
}

export function clampInputValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeInputVector(vector: GameInputVector): GameInputVector {
  const x = clampInputValue(vector.x, -1, 1);
  const y = clampInputValue(vector.y, -1, 1);
  const magnitude = Math.hypot(x, y);

  if (magnitude > 1) {
    return { x: x / magnitude, y: y / magnitude };
  }

  return { x, y };
}
