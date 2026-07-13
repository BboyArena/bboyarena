import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { normalizeInputVector, type GameInputButtonId, type GameInputVector } from '../input/gameInputTypes';
import {
  creatorButtonLabels,
  creatorMoveLabels,
  type CreatorHudSnapshot,
  type CreatorStickSnapshot
} from './creatorTypes';

type CreatorControlsOverlayProps = {
  hud: CreatorHudSnapshot;
  systemControls?: ReactNode;
  onStickChange: (stick: 'left' | 'right', snapshot: CreatorStickSnapshot) => void;
  onButtonChange: (button: GameInputButtonId, pressed: boolean) => void;
  onBpmStep: (direction: 1 | -1) => void;
  onFilterStep: (direction: 1 | -1) => void;
};

const faceButtons: GameInputButtonId[] = ['powermove', 'freeze', 'footwork', 'toprock'];
const shoulderButtons: GameInputButtonId[] = ['l1', 'l2', 'r1', 'r2'];
type Direction = 'up' | 'down' | 'left' | 'right';

const faceButtonClass: Partial<Record<GameInputButtonId, string>> = {
  powermove: 'touch-controls__face-button--y',
  freeze: 'touch-controls__face-button--x',
  footwork: 'touch-controls__face-button--b',
  toprock: 'touch-controls__face-button--a'
};

function capturePointer(target: Element & { setPointerCapture(pointerId: number): void }, pointerId: number) {
  try {
    target.setPointerCapture(pointerId);
  } catch {
    // Embedded browsers can cancel pointer capture during fast touch gestures.
  }
}

function getStickVector(element: HTMLElement, clientX: number, clientY: number): GameInputVector {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const radius = Math.max(1, Math.min(rect.width, rect.height) / 2);
  return normalizeInputVector({
    x: (clientX - centerX) / radius,
    y: (centerY - clientY) / radius
  });
}

function CreatorStick({
  label,
  stick,
  value,
  onChange
}: {
  label: ReactNode;
  stick: 'left' | 'right';
  value: CreatorStickSnapshot;
  onChange: CreatorControlsOverlayProps['onStickChange'];
}) {
  const activePointerRef = useRef<number | null>(null);
  const knobStyle = {
    '--joystick-strength': Math.min(1, Math.hypot(value.x, value.y)).toString(),
    '--joystick-offset-x': `${value.x * 1.85}rem`,
    '--joystick-offset-y': `${value.y * -1.85}rem`
  } as CSSProperties;

  const updateFromPointer = (target: HTMLElement, clientX: number, clientY: number) => {
    const vector = getStickVector(target, clientX, clientY);
    onChange(stick, { ...vector, active: true });
  };

  const release = () => {
    activePointerRef.current = null;
    onChange(stick, { x: 0, y: 0, active: false });
  };

  return (
    <div className="touch-controls__joystick-group">
      <span className="touch-controls__joystick-label">{label}</span>
      <div
        className="touch-controls__joystick-zone"
        role="slider"
        aria-label={`${label} virtual stick`}
        aria-valuemin={-100}
        aria-valuemax={100}
        aria-valuenow={Math.round(Math.hypot(value.x, value.y) * 100)}
        data-joystick-active={value.active}
        data-joystick-level={Math.round(Math.hypot(value.x, value.y) * 100)}
        style={knobStyle}
        onPointerDown={(event) => {
          event.preventDefault();
          activePointerRef.current = event.pointerId;
          if (typeof event.currentTarget.setPointerCapture === 'function') {
            capturePointer(event.currentTarget, event.pointerId);
          }
          updateFromPointer(event.currentTarget, event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (activePointerRef.current !== event.pointerId) return;
          event.preventDefault();
          updateFromPointer(event.currentTarget, event.clientX, event.clientY);
        }}
        onPointerUp={(event) => {
          if (activePointerRef.current !== event.pointerId) return;
          event.preventDefault();
          release();
        }}
        onPointerCancel={release}
        onLostPointerCapture={release}
      >
        <span className="touch-controls__joystick-visual" aria-hidden="true" />
      </div>
    </div>
  );
}

function DirectionPad({
  onBpmStep,
  onFilterStep
}: {
  onBpmStep: CreatorControlsOverlayProps['onBpmStep'];
  onFilterStep: CreatorControlsOverlayProps['onFilterStep'];
}) {
  const active = useRef(new Set<Direction>());
  const [, render] = useState(0);
  const setDirection = (direction: Direction, pressed: boolean) => {
    if (pressed) {
      active.current.add(direction);
      if (direction === 'up') onBpmStep(1);
      if (direction === 'down') onBpmStep(-1);
      if (direction === 'right') onFilterStep(1);
      if (direction === 'left') onFilterStep(-1);
    } else {
      active.current.delete(direction);
    }
    render((value) => value + 1);
  };
  const directionLabel: Record<Direction, string> = {
    up: 'Increase BPM',
    down: 'Decrease BPM',
    left: 'Previous video filter',
    right: 'Next video filter'
  };

  return (
    <div className="touch-controls__dpad" aria-label="Creator BPM and filter pad">
      {(['up', 'left', 'right', 'down'] as const).map((direction) => (
        <button
          key={direction}
          type="button"
          className={`touch-controls__dpad-button touch-controls__dpad-button--${direction}`}
          aria-label={directionLabel[direction]}
          aria-pressed={active.current.has(direction)}
          onPointerDown={(event) => {
            event.preventDefault();
            if (typeof event.currentTarget.setPointerCapture === 'function') {
              capturePointer(event.currentTarget, event.pointerId);
            }
            setDirection(direction, true);
          }}
          onPointerUp={() => setDirection(direction, false)}
          onPointerCancel={() => setDirection(direction, false)}
          onLostPointerCapture={() => setDirection(direction, false)}
        >
          <span className={`touch-controls__dpad-icon touch-controls__dpad-icon--${direction}`} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

function CreatorButton({
  button,
  pressed,
  onButtonChange
}: {
  button: GameInputButtonId;
  pressed: boolean;
  onButtonChange: CreatorControlsOverlayProps['onButtonChange'];
}) {
  const label = creatorButtonLabels[button];
  const moveName = creatorMoveLabels[button] ?? button;

  const release = () => onButtonChange(button, false);

  return (
    <button
      type="button"
      className={[
        faceButtonClass[button] ? 'touch-controls__face-button' : 'touch-controls__shoulder',
        faceButtonClass[button] ?? ''
      ].join(' ').trim()}
      aria-label={`${label}: ${moveName}`}
      aria-pressed={pressed}
      data-button={button}
      onPointerDown={(event) => {
        event.preventDefault();
        if (typeof event.currentTarget.setPointerCapture === 'function') {
          capturePointer(event.currentTarget, event.pointerId);
        }
        onButtonChange(button, true);
      }}
      onPointerUp={(event) => {
        event.preventDefault();
        release();
      }}
      onPointerCancel={release}
      onLostPointerCapture={release}
    >
      {label}
    </button>
  );
}

export default function CreatorControlsOverlay({
  hud,
  systemControls,
  onStickChange,
  onButtonChange,
  onBpmStep,
  onFilterStep
}: CreatorControlsOverlayProps) {
  return (
    <div className="touch-controls creator-touch-controls" data-input-source="touch" aria-label="Creator virtual controls">
      <div className="touch-controls__shoulders touch-controls__shoulders--left">
        {shoulderButtons.slice(0, 2).map((button) => (
          <button
            key={button}
            type="button"
            className="touch-controls__shoulder"
            aria-label={`${creatorButtonLabels[button]}: ${creatorMoveLabels[button] ?? button}`}
            aria-pressed={hud.pressedButtons.includes(button)}
            onPointerDown={(event) => {
              event.preventDefault();
              if (typeof event.currentTarget.setPointerCapture === 'function') {
                capturePointer(event.currentTarget, event.pointerId);
              }
              onButtonChange(button, true);
            }}
            onPointerUp={(event) => {
              event.preventDefault();
              onButtonChange(button, false);
            }}
            onPointerCancel={() => onButtonChange(button, false)}
            onLostPointerCapture={() => onButtonChange(button, false)}
          >
            {creatorButtonLabels[button]}
          </button>
        ))}
      </div>

      <div className="touch-controls__shoulders touch-controls__shoulders--right">
        {shoulderButtons.slice(2).map((button) => (
          <button
            key={button}
            type="button"
            className="touch-controls__shoulder"
            aria-label={`${creatorButtonLabels[button]}: ${creatorMoveLabels[button] ?? button}`}
            aria-pressed={hud.pressedButtons.includes(button)}
            onPointerDown={(event) => {
              event.preventDefault();
              if (typeof event.currentTarget.setPointerCapture === 'function') {
                capturePointer(event.currentTarget, event.pointerId);
              }
              onButtonChange(button, true);
            }}
            onPointerUp={(event) => {
              event.preventDefault();
              onButtonChange(button, false);
            }}
            onPointerCancel={() => onButtonChange(button, false)}
            onLostPointerCapture={() => onButtonChange(button, false)}
          >
            {creatorButtonLabels[button]}
          </button>
        ))}
      </div>

      <div className="touch-controls__side touch-controls__side--left">
        <DirectionPad onBpmStep={onBpmStep} onFilterStep={onFilterStep} />
        <CreatorStick
          label={<><b>L · Upper body</b><small>Torso + shoulders</small></>}
          stick="left"
          value={hud.leftStick}
          onChange={onStickChange}
        />
      </div>

      {systemControls ?? <div className="touch-controls__system" aria-hidden="true" />}

      <div className="touch-controls__side touch-controls__side--right">
        <div className="touch-controls__face" aria-label="Move family buttons">
          {faceButtons.map((button) => (
            <CreatorButton
              key={button}
              button={button}
              pressed={hud.pressedButtons.includes(button)}
              onButtonChange={onButtonChange}
            />
          ))}
        </div>
        <CreatorStick
          label={<><b>R · Lower body</b><small>Hips + legs</small></>}
          stick="right"
          value={hud.rightStick}
          onChange={onStickChange}
        />
      </div>
    </div>
  );
}
