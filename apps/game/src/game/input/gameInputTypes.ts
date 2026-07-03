export type PreferredInputMode = 'auto' | 'touch' | 'gamepad' | 'keyboardMouse';

export type ActiveInputSource = 'touch' | 'gamepad' | 'keyboardMouse';

export type GameInputAction =
  | 'move'
  | 'action.primary'
  | 'action.secondary'
  | 'action.modifierLeft'
  | 'action.modifierRight'
  | 'system.start'
  | 'system.pause';

export type GameInputButtonId =
  | 'primary'
  | 'secondary'
  | 'modifierLeft'
  | 'modifierRight'
  | 'start'
  | 'pause';

export type KeyboardInputMap = Record<GameInputButtonId, string>;
export type GamepadInputMap = Record<GameInputButtonId, number>;

export const defaultKeyboardInputMap: KeyboardInputMap = {
  primary: 'Space',
  secondary: 'KeyK',
  modifierLeft: 'KeyQ',
  modifierRight: 'KeyE',
  start: 'Enter',
  pause: 'Escape'
};

export const defaultGamepadInputMap: GamepadInputMap = {
  primary: 0,
  secondary: 1,
  modifierLeft: 4,
  modifierRight: 5,
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
  'primary',
  'secondary',
  'modifierLeft',
  'modifierRight',
  'start',
  'pause'
];

export function createDefaultGameInputSnapshot(
  source: ActiveInputSource = 'keyboardMouse'
): GameInputSnapshot {
  return {
    source,
    move: { x: 0, y: 0 },
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
