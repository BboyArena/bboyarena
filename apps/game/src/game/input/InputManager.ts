import { create as createJoystick, type Collection } from 'nipplejs';

export type InputSource = 'keyboardMouse' | 'gamepad' | 'touchJoystick' | 'touchGesture';

export type InputAction =
  | 'confirm'
  | 'cancel'
  | 'pause'
  | 'primary'
  | 'secondary'
  | 'special'
  | 'run'
  | 'menu';

export type GestureKind = 'tap' | 'doubleTap' | 'swipe' | 'pinch';

export interface InputVector {
  x: number;
  y: number;
}

export interface InputGesture {
  kind: GestureKind;
  source: 'touchGesture';
  direction?: 'up' | 'down' | 'left' | 'right';
  position: InputVector;
  delta: InputVector;
  distance: number;
  scale?: number;
  timestamp: number;
}

export interface ConnectedGamepad {
  id: string;
  index: number;
  mapping: string;
}

export interface InputSnapshot {
  movement: InputVector;
  look: InputVector;
  pointer: InputVector;
  actions: ReadonlySet<InputAction>;
  activeSources: ReadonlySet<InputSource>;
  gamepads: ConnectedGamepad[];
  lastGesture: InputGesture | null;
  timestamp: number;
}

export interface InputManagerOptions {
  keyboardTarget?: Window;
  pointerTarget?: HTMLElement;
  gestureTarget?: HTMLElement;
  joystickZone?: HTMLElement | null;
  gamepadDeadzone?: number;
  pointerSensitivity?: number;
}

type InputListener = (snapshot: InputSnapshot) => void;

interface JoystickMoveData {
  vector: InputVector;
}

interface MutableInputState {
  movement: InputVector;
  keyboardMovement: InputVector;
  gamepadMovement: InputVector;
  joystickMovement: InputVector;
  look: InputVector;
  pointer: InputVector;
  actions: Set<InputAction>;
  activeSources: Set<InputSource>;
  gamepads: ConnectedGamepad[];
  lastGesture: InputGesture | null;
  timestamp: number;
}

const emptyVector = (): InputVector => ({ x: 0, y: 0 });

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeVector = (vector: InputVector): InputVector => {
  const magnitude = Math.hypot(vector.x, vector.y);
  if (magnitude <= 1) return vector;
  return { x: vector.x / magnitude, y: vector.y / magnitude };
};

const applyDeadzone = (value: number, deadzone: number) => {
  const abs = Math.abs(value);
  if (abs < deadzone) return 0;
  return Math.sign(value) * ((abs - deadzone) / (1 - deadzone));
};

const keyActionMap: Record<string, InputAction | undefined> = {
  Enter: 'confirm',
  Space: 'primary',
  Escape: 'pause',
  ShiftLeft: 'run',
  ShiftRight: 'run',
  KeyE: 'confirm',
  KeyQ: 'cancel',
  KeyZ: 'primary',
  KeyX: 'secondary',
  KeyC: 'special',
  KeyM: 'menu'
};

const gamepadButtonMap: Record<number, InputAction | undefined> = {
  0: 'primary',
  1: 'cancel',
  2: 'secondary',
  3: 'special',
  4: 'run',
  7: 'run',
  9: 'menu',
  12: 'confirm',
  13: 'cancel'
};

export class InputManager {
  private readonly keyboardTarget: Window;
  private readonly pointerTarget?: HTMLElement;
  private readonly gestureTarget?: HTMLElement;
  private readonly joystickZone?: HTMLElement | null;
  private readonly gamepadDeadzone: number;
  private readonly pointerSensitivity: number;
  private readonly listeners = new Set<InputListener>();
  private readonly pressedKeys = new Set<string>();
  private readonly keyboardActions = new Set<InputAction>();
  private readonly gamepadActions = new Set<InputAction>();
  private readonly state: MutableInputState = {
    movement: emptyVector(),
    keyboardMovement: emptyVector(),
    gamepadMovement: emptyVector(),
    joystickMovement: emptyVector(),
    look: emptyVector(),
    pointer: emptyVector(),
    actions: new Set<InputAction>(),
    activeSources: new Set<InputSource>(),
    gamepads: [],
    lastGesture: null,
    timestamp: 0
  };

  private joystick: Collection | null = null;
  private animationFrame = 0;
  private isStarted = false;
  private isPointerLooking = false;
  private lastTapAt = 0;
  private lastGamepadSignature = '';
  private gestureReleaseTimer = 0;
  private touchStart: { at: number; position: InputVector; distance: number | null } | null = null;

  constructor(options: InputManagerOptions = {}) {
    this.keyboardTarget = options.keyboardTarget ?? window;
    this.pointerTarget = options.pointerTarget;
    this.gestureTarget = options.gestureTarget;
    this.joystickZone = options.joystickZone;
    this.gamepadDeadzone = options.gamepadDeadzone ?? 0.18;
    this.pointerSensitivity = options.pointerSensitivity ?? 0.01;
  }

  start() {
    if (this.isStarted) return;
    this.isStarted = true;

    this.keyboardTarget.addEventListener('keydown', this.handleKeyDown);
    this.keyboardTarget.addEventListener('keyup', this.handleKeyUp);
    this.keyboardTarget.addEventListener('gamepadconnected', this.handleGamepadChange);
    this.keyboardTarget.addEventListener('gamepaddisconnected', this.handleGamepadChange);

    this.pointerTarget?.addEventListener('pointerdown', this.handlePointerDown);
    this.pointerTarget?.addEventListener('pointermove', this.handlePointerMove);
    this.pointerTarget?.addEventListener('pointerup', this.handlePointerUp);
    this.pointerTarget?.addEventListener('pointercancel', this.handlePointerUp);

    this.gestureTarget?.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    this.gestureTarget?.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    this.gestureTarget?.addEventListener('touchcancel', this.handleTouchCancel, { passive: true });

    this.setupJoystick();
    this.pollGamepads();
    this.emit();
  }

  stop() {
    if (!this.isStarted) return;
    this.isStarted = false;

    this.keyboardTarget.removeEventListener('keydown', this.handleKeyDown);
    this.keyboardTarget.removeEventListener('keyup', this.handleKeyUp);
    this.keyboardTarget.removeEventListener('gamepadconnected', this.handleGamepadChange);
    this.keyboardTarget.removeEventListener('gamepaddisconnected', this.handleGamepadChange);

    this.pointerTarget?.removeEventListener('pointerdown', this.handlePointerDown);
    this.pointerTarget?.removeEventListener('pointermove', this.handlePointerMove);
    this.pointerTarget?.removeEventListener('pointerup', this.handlePointerUp);
    this.pointerTarget?.removeEventListener('pointercancel', this.handlePointerUp);

    this.gestureTarget?.removeEventListener('touchstart', this.handleTouchStart);
    this.gestureTarget?.removeEventListener('touchend', this.handleTouchEnd);
    this.gestureTarget?.removeEventListener('touchcancel', this.handleTouchCancel);

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = 0;
    }
    if (this.gestureReleaseTimer) {
      window.clearTimeout(this.gestureReleaseTimer);
      this.gestureReleaseTimer = 0;
    }

    this.joystick?.destroy();
    this.joystick = null;
    this.pressedKeys.clear();
    this.keyboardActions.clear();
    this.gamepadActions.clear();
    this.state.actions.clear();
    this.state.activeSources.clear();
    this.state.keyboardMovement = emptyVector();
    this.state.gamepadMovement = emptyVector();
    this.state.joystickMovement = emptyVector();
    this.state.movement = emptyVector();
    this.state.look = emptyVector();
    this.emit();
  }

  dispose() {
    this.stop();
    this.listeners.clear();
  }

  subscribe(listener: InputListener) {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  getSnapshot(): InputSnapshot {
    return {
      movement: { ...this.state.movement },
      look: { ...this.state.look },
      pointer: { ...this.state.pointer },
      actions: new Set(this.state.actions),
      activeSources: new Set(this.state.activeSources),
      gamepads: this.state.gamepads.map((gamepad) => ({ ...gamepad })),
      lastGesture: this.state.lastGesture ? { ...this.state.lastGesture, position: { ...this.state.lastGesture.position }, delta: { ...this.state.lastGesture.delta } } : null,
      timestamp: this.state.timestamp
    };
  }

  private setupJoystick() {
    if (!this.joystickZone) return;

    this.joystick = createJoystick({
      zone: this.joystickZone,
      mode: 'dynamic',
      size: 112,
      threshold: 0.12,
      color: { front: '#ffd95c', back: 'rgba(5, 5, 5, 0.62)' },
      restOpacity: 0.58
    });

    this.joystick.on('move', (event) => {
      const data = event.data as JoystickMoveData;
      this.state.joystickMovement = normalizeVector({
        x: clamp(data.vector.x, -1, 1),
        y: clamp(-data.vector.y, -1, 1)
      });
      this.state.activeSources.add('touchJoystick');
      this.recomputeMovement();
      this.emit();
    });

    this.joystick.on('end', () => {
      this.state.joystickMovement = emptyVector();
      this.state.activeSources.delete('touchJoystick');
      this.recomputeMovement();
      this.emit();
    });
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.repeat) return;
    this.pressedKeys.add(event.code);
    const action = keyActionMap[event.code];
    if (action) {
      this.keyboardActions.add(action);
      this.recomputeActions();
    }
    this.state.activeSources.add('keyboardMouse');
    this.updateKeyboardMovement();
    this.emit();
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    this.pressedKeys.delete(event.code);
    const action = keyActionMap[event.code];
    if (action) {
      this.keyboardActions.delete(action);
      this.recomputeActions();
    }
    this.updateKeyboardMovement();
    if (!this.hasKeyboardMouseActivity()) {
      this.state.activeSources.delete('keyboardMouse');
    }
    this.emit();
  };

  private updateKeyboardMovement() {
    const x = Number(this.pressedKeys.has('KeyD') || this.pressedKeys.has('ArrowRight')) - Number(this.pressedKeys.has('KeyA') || this.pressedKeys.has('ArrowLeft'));
    const y = Number(this.pressedKeys.has('KeyW') || this.pressedKeys.has('ArrowUp')) - Number(this.pressedKeys.has('KeyS') || this.pressedKeys.has('ArrowDown'));
    this.state.keyboardMovement = normalizeVector({ x, y });
    this.recomputeMovement();
  }

  private hasKeyboardMouseActivity() {
    return this.pressedKeys.size > 0 || this.isPointerLooking;
  }

  private handlePointerDown = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || this.isInteractiveTarget(event.target)) return;
    this.isPointerLooking = true;
    this.pointerTarget?.setPointerCapture(event.pointerId);
    this.state.pointer = { x: event.clientX, y: event.clientY };
    this.state.activeSources.add('keyboardMouse');
    this.emit();
  };

  private handlePointerMove = (event: PointerEvent) => {
    this.state.pointer = { x: event.clientX, y: event.clientY };
    if (!this.isPointerLooking) return;
    this.state.look = normalizeVector({
      x: clamp(event.movementX * this.pointerSensitivity, -1, 1),
      y: clamp(event.movementY * this.pointerSensitivity, -1, 1)
    });
    this.emit();
  };

  private handlePointerUp = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    this.isPointerLooking = false;
    this.pointerTarget?.releasePointerCapture(event.pointerId);
    this.state.look = emptyVector();
    if (!this.hasKeyboardMouseActivity()) {
      this.state.activeSources.delete('keyboardMouse');
    }
    this.emit();
  };

  private handleTouchStart = (event: TouchEvent) => {
    if (this.isInteractiveTarget(event.target)) return;
    this.touchStart = {
      at: performance.now(),
      position: this.touchPosition(event),
      distance: this.touchDistance(event)
    };
  };

  private handleTouchEnd = (event: TouchEvent) => {
    if (!this.touchStart) return;

    const now = performance.now();
    const position = event.changedTouches.length > 0 ? { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY } : this.touchStart.position;
    const delta = { x: position.x - this.touchStart.position.x, y: position.y - this.touchStart.position.y };
    const distance = Math.hypot(delta.x, delta.y);
    const duration = now - this.touchStart.at;
    const endDistance = this.touchDistance(event);
    const pinchDelta = this.touchStart.distance !== null && endDistance !== null ? endDistance - this.touchStart.distance : 0;
    const kind = Math.abs(pinchDelta) > 24 ? 'pinch' : distance > 48 && duration < 520 ? 'swipe' : now - this.lastTapAt < 280 ? 'doubleTap' : 'tap';

    const gesture: InputGesture = {
      kind,
      source: 'touchGesture',
      direction: kind === 'swipe' ? this.swipeDirection(delta) : undefined,
      position,
      delta,
      distance,
      scale: kind === 'pinch' && this.touchStart.distance ? endDistance ? endDistance / this.touchStart.distance : undefined : undefined,
      timestamp: now
    };

    this.lastTapAt = kind === 'tap' ? now : 0;
    this.touchStart = null;
    this.state.lastGesture = gesture;
    this.state.activeSources.add('touchGesture');
    if (this.gestureReleaseTimer) {
      window.clearTimeout(this.gestureReleaseTimer);
    }
    this.gestureReleaseTimer = window.setTimeout(() => {
      this.state.activeSources.delete('touchGesture');
      this.emit();
    }, 160);
    this.emit();
  };

  private handleTouchCancel = () => {
    this.touchStart = null;
    this.state.activeSources.delete('touchGesture');
    this.emit();
  };

  private handleGamepadChange = () => {
    if (this.readGamepads()) {
      this.emit();
    }
  };

  private pollGamepads = () => {
    if (!this.isStarted) return;
    if (this.readGamepads()) {
      this.emit();
    }
    this.animationFrame = requestAnimationFrame(this.pollGamepads);
  };

  private readGamepads() {
    const gamepads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter((gamepad): gamepad is Gamepad => Boolean(gamepad)) : [];
    this.state.gamepads = gamepads.map((gamepad) => ({
      id: gamepad.id,
      index: gamepad.index,
      mapping: gamepad.mapping
    }));

    const firstGamepad = gamepads[0];
    if (!firstGamepad) {
      this.state.gamepadMovement = emptyVector();
      this.state.activeSources.delete('gamepad');
      this.gamepadActions.clear();
      this.recomputeActions();
      this.recomputeMovement();
      return this.updateGamepadSignature('none');
    }

    const movement = {
      x: applyDeadzone(firstGamepad.axes[0] ?? 0, this.gamepadDeadzone),
      y: -applyDeadzone(firstGamepad.axes[1] ?? 0, this.gamepadDeadzone)
    };
    const look = {
      x: applyDeadzone(firstGamepad.axes[2] ?? 0, this.gamepadDeadzone),
      y: applyDeadzone(firstGamepad.axes[3] ?? 0, this.gamepadDeadzone)
    };

    this.state.gamepadMovement = normalizeVector(movement);
    this.state.look = normalizeVector(look);
    firstGamepad.buttons.forEach((button, index) => {
      const action = gamepadButtonMap[index];
      if (!action) return;
      if (button.pressed) {
        this.gamepadActions.add(action);
      } else {
        this.gamepadActions.delete(action);
      }
    });
    this.recomputeActions();

    if (Math.hypot(this.state.gamepadMovement.x, this.state.gamepadMovement.y) > 0 || Math.hypot(this.state.look.x, this.state.look.y) > 0) {
      this.state.activeSources.add('gamepad');
    } else {
      this.state.activeSources.delete('gamepad');
    }
    this.recomputeMovement();
    return this.updateGamepadSignature(
      [
        this.state.gamepads.map((gamepad) => `${gamepad.index}:${gamepad.id}`).join('|'),
        this.state.gamepadMovement.x.toFixed(3),
        this.state.gamepadMovement.y.toFixed(3),
        this.state.look.x.toFixed(3),
        this.state.look.y.toFixed(3),
        Array.from(this.gamepadActions).sort().join(',')
      ].join(';')
    );
  }

  private updateGamepadSignature(signature: string) {
    if (signature === this.lastGamepadSignature) return false;
    this.lastGamepadSignature = signature;
    return true;
  }

  private recomputeMovement() {
    this.state.movement = normalizeVector({
      x: this.state.keyboardMovement.x + this.state.gamepadMovement.x + this.state.joystickMovement.x,
      y: this.state.keyboardMovement.y + this.state.gamepadMovement.y + this.state.joystickMovement.y
    });
  }

  private recomputeActions() {
    this.state.actions = new Set([...this.keyboardActions, ...this.gamepadActions]);
  }

  private emit() {
    this.state.timestamp = performance.now();
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  private touchPosition(event: TouchEvent): InputVector {
    const touch = event.touches[0] ?? event.changedTouches[0];
    return touch ? { x: touch.clientX, y: touch.clientY } : emptyVector();
  }

  private touchDistance(event: TouchEvent) {
    const touches = event.touches.length >= 2 ? event.touches : event.changedTouches;
    if (touches.length < 2) return null;
    return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
  }

  private swipeDirection(delta: InputVector) {
    if (Math.abs(delta.x) > Math.abs(delta.y)) {
      return delta.x > 0 ? 'right' : 'left';
    }
    return delta.y > 0 ? 'down' : 'up';
  }

  private isInteractiveTarget(target: EventTarget | null) {
    return target instanceof HTMLElement && Boolean(target.closest('button, a, input, select, textarea, [data-input-ignore="true"]'));
  }
}
