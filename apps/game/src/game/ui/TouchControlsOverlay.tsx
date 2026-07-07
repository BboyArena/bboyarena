import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useGameInputController } from '../input/GameInputProvider';
import TouchInputAdapter from '../input/TouchInputAdapter';
import { useGameStore } from '../state/useGameStore';
import { normalizeInputVector, type GameInputButtonId } from '../input/gameInputTypes';

const labels: Record<GameInputButtonId, string> = {
  toprock: 'A', footwork: 'B', freeze: 'X', powermove: 'Y',
  l1: 'L1', l2: 'L2', r1: 'R1', r2: 'R2', start: 'Options', pause: 'Esc'
};

function capturePointer(target: Element & { setPointerCapture(pointerId: number): void }, pointerId: number) {
  try {
    target.setPointerCapture(pointerId);
  } catch {
    // Some embedded/mobile browsers can cancel the pointer before capture.
  }
}

function TouchButton({ buttonId, className }: { buttonId: GameInputButtonId; className: string }) {
  const controller = useGameInputController();
  const [pressed, setPressed] = useState(false);
  const release = () => {
    setPressed(false);
    controller.updateButton('touch', buttonId, false);
  };

  return (
    <button type="button" className={className} aria-label={`${labels[buttonId]}: ${buttonId}`} aria-pressed={pressed}
      onPointerDown={(event) => {
        event.preventDefault();
        if (typeof event.currentTarget.setPointerCapture === 'function') {
          capturePointer(event.currentTarget, event.pointerId);
        }
        setPressed(true);
        controller.updateButton('touch', buttonId, true);
      }}
      onPointerUp={(event) => { event.preventDefault(); release(); }}
      onPointerCancel={release}
      onLostPointerCapture={release}
    >{labels[buttonId]}</button>
  );
}

type Direction = 'up' | 'down' | 'left' | 'right';

export type TouchStickTarget = {
  x: number;
  y: number;
  tolerance: number;
  onTarget: boolean;
  step: string;
};

const touchDeadzone = 0.18;
const touchResponseExponent = 1.35;

function JoystickTarget({ target }: { target?: TouchStickTarget }) {
  if (!target) return null;
  const magnitude = Math.min(1, Math.hypot(target.x, target.y));
  const physicalMagnitude = magnitude === 0
    ? 0
    : touchDeadzone + (1 - touchDeadzone) * Math.pow(magnitude, 1 / touchResponseExponent);
  const physicalX = magnitude > 0 ? (target.x / magnitude) * physicalMagnitude : 0;
  const physicalY = magnitude > 0 ? (target.y / magnitude) * physicalMagnitude : 0;
  const targetSize = Math.max(20, Math.min(40, 18 + target.tolerance * 48));
  const style = {
    left: `${50 + physicalX * 30}%`,
    top: `${50 - physicalY * 30}%`,
    '--target-size': `${targetSize}px`
  } as CSSProperties;

  return <span className="touch-controls__joystick-target" data-on-target={target.onTarget} data-step={target.step} style={style} aria-hidden="true" />;
}

function DirectionPad() {
  const controller = useGameInputController();
  const active = useRef(new Set<Direction>());
  const [, render] = useState(0);
  const sync = () => {
    const x = Number(active.current.has('right')) - Number(active.current.has('left'));
    const y = Number(active.current.has('up')) - Number(active.current.has('down'));
    controller.updateMove('touch', normalizeInputVector({ x, y }));
    render((value) => value + 1);
  };
  const setDirection = (direction: Direction, pressed: boolean) => {
    if (pressed) active.current.add(direction); else active.current.delete(direction);
    sync();
  };

  return <div className="touch-controls__dpad" aria-label="Directional pad">
    {(['up', 'left', 'right', 'down'] as const).map((direction) => (
      <button key={direction} type="button" className={`touch-controls__dpad-button touch-controls__dpad-button--${direction}`}
        aria-label={direction} aria-pressed={active.current.has(direction)}
        onPointerDown={(event) => { event.preventDefault(); if (typeof event.currentTarget.setPointerCapture === 'function') capturePointer(event.currentTarget, event.pointerId); setDirection(direction, true); }}
        onPointerUp={() => setDirection(direction, false)} onPointerCancel={() => setDirection(direction, false)}
        onLostPointerCapture={() => setDirection(direction, false)}
      ><span className={`touch-controls__dpad-icon touch-controls__dpad-icon--${direction}`} aria-hidden="true" /></button>
    ))}
  </div>;
}

export default function TouchControlsOverlay({ targets = {} }: { targets?: Partial<Record<'left' | 'right', TouchStickTarget>> }) {
  const controller = useGameInputController();
  const [resetVersion, setResetVersion] = useState(0);
  const touchControlsVisible = useGameStore((state) => state.touchControlsVisible);
  const activeInputSource = useGameStore((state) => state.activeInputSource);
  const leftStickRef = useRef<HTMLDivElement | null>(null);
  const rightStickRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const resetTouch = () => {
      controller.resetSource('touch');
      setResetVersion((version) => version + 1);
    };
    const resetWhenHidden = () => {
      if (document.visibilityState !== 'visible') resetTouch();
    };
    window.addEventListener('blur', resetTouch);
    window.addEventListener('pagehide', resetTouch);
    document.addEventListener('visibilitychange', resetWhenHidden);
    return () => {
      window.removeEventListener('blur', resetTouch);
      window.removeEventListener('pagehide', resetTouch);
      document.removeEventListener('visibilitychange', resetWhenHidden);
      controller.resetSource('touch');
    };
  }, [controller]);
  if (!touchControlsVisible) return null;

  return <div key={resetVersion} className="touch-controls" data-input-source={activeInputSource}>
    <div className="touch-controls__shoulders touch-controls__shoulders--left">
      <TouchButton buttonId="l1" className="touch-controls__shoulder" />
      <TouchButton buttonId="l2" className="touch-controls__shoulder" />
    </div>
    <div className="touch-controls__shoulders touch-controls__shoulders--right">
      <TouchButton buttonId="r2" className="touch-controls__shoulder" />
      <TouchButton buttonId="r1" className="touch-controls__shoulder" />
    </div>

    <div className="touch-controls__side touch-controls__side--left">
      <DirectionPad />
      <div className="touch-controls__joystick-group">
        <span className="touch-controls__joystick-label"><b>L · Upper body</b><small>Torso + shoulders</small></span>
        <div className="touch-controls__joystick-zone" ref={leftStickRef} aria-label="Left analog stick: upper body, torso and shoulders">
          <JoystickTarget target={targets.left} />
          <span className="touch-controls__joystick-visual" aria-hidden="true" />
          <TouchInputAdapter joystickZoneRef={leftStickRef} channel="move" />
        </div>
      </div>
    </div>

    <div className="touch-controls__system">
      <TouchButton buttonId="pause" className="touch-controls__system-button" />
      <TouchButton buttonId="start" className="touch-controls__system-button" />
    </div>

    <div className="touch-controls__side touch-controls__side--right">
      <div className="touch-controls__face" aria-label="Move family buttons">
        <TouchButton buttonId="powermove" className="touch-controls__face-button touch-controls__face-button--y" />
        <TouchButton buttonId="freeze" className="touch-controls__face-button touch-controls__face-button--x" />
        <TouchButton buttonId="footwork" className="touch-controls__face-button touch-controls__face-button--b" />
        <TouchButton buttonId="toprock" className="touch-controls__face-button touch-controls__face-button--a" />
      </div>
      <div className="touch-controls__joystick-group">
        <span className="touch-controls__joystick-label"><b>R · Lower body</b><small>Hips + legs</small></span>
        <div className="touch-controls__joystick-zone" ref={rightStickRef} aria-label="Right analog stick: lower body, hips and legs">
          <JoystickTarget target={targets.right} />
          <span className="touch-controls__joystick-visual" aria-hidden="true" />
          <TouchInputAdapter joystickZoneRef={rightStickRef} channel="look" />
        </div>
      </div>
    </div>
  </div>;
}
