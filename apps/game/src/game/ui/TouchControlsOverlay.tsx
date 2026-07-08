import { memo, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useGameInputController } from '../input/GameInputProvider';
import TouchInputAdapter from '../input/TouchInputAdapter';
import { useGameStore } from '../state/useGameStore';
import { normalizeInputVector, type GameInputButtonId } from '../input/gameInputTypes';
import type { TrainingTutorialStepId } from '../training/useTrainingTutorial';

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

function TouchButton({
  buttonId,
  className,
  onPress,
  children,
  tutorialControl
}: {
  buttonId: GameInputButtonId;
  className: string;
  onPress?: () => void;
  children?: React.ReactNode;
  tutorialControl?: TrainingTutorialStepId;
}) {
  const controller = useGameInputController();
  const [pressed, setPressed] = useState(false);
  const release = () => {
    setPressed(false);
    controller.updateButton('touch', buttonId, false);
  };

  return (
    <button type="button" className={className} aria-label={`${labels[buttonId]}: ${buttonId}`} aria-pressed={pressed} data-tutorial-control={tutorialControl}
      onPointerDown={(event) => {
        event.preventDefault();
        if (typeof event.currentTarget.setPointerCapture === 'function') {
          capturePointer(event.currentTarget, event.pointerId);
        }
        setPressed(true);
        controller.updateButton('touch', buttonId, true);
        onPress?.();
      }}
      onPointerUp={(event) => { event.preventDefault(); release(); }}
      onPointerCancel={release}
      onLostPointerCapture={release}
    >{children ?? labels[buttonId]}</button>
  );
}

type Direction = 'up' | 'down' | 'left' | 'right';

export type TouchStickTarget = {
  x: number;
  y: number;
  tolerance: number;
  onTarget: boolean;
  active: boolean;
  step: string;
};

export type TouchStickFeedback = {
  stick: 'left' | 'right';
  grade: 'good' | 'perfect';
  sequence: number;
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

  return <span className="touch-controls__joystick-target" data-on-target={target.onTarget} data-active={target.active} data-step={target.step} style={style} aria-hidden="true" />;
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

function TouchControlsOverlay({
  targets = {},
  feedbacks = [],
  tapTempo,
  tutorialStep
}: {
  targets?: Partial<Record<'left' | 'right', TouchStickTarget>>;
  feedbacks?: TouchStickFeedback[];
  tapTempo?: { bpm: number; isArmed: boolean; isTooFast: boolean; tap: () => void };
  tutorialStep?: TrainingTutorialStepId | null;
}) {
  const controller = useGameInputController();
  const [resetVersion, setResetVersion] = useState(0);
  const touchControlsVisible = useGameStore((state) => state.touchControlsVisible);
  const activeInputSource = useGameStore((state) => state.activeInputSource);
  const leftStickRef = useRef<HTMLDivElement | null>(null);
  const rightStickRef = useRef<HTMLDivElement | null>(null);
  const leftFeedback = feedbacks.find((feedback) => feedback.stick === 'left');
  const rightFeedback = feedbacks.find((feedback) => feedback.stick === 'right');

  useEffect(() => {
    if (feedbacks.length === 0 || typeof navigator.vibrate !== 'function') return;
    navigator.vibrate(feedbacks.some((feedback) => feedback.grade === 'perfect') ? 45 : 30);
  }, [feedbacks]);

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

  return <div key={resetVersion} className="touch-controls" data-input-source={activeInputSource} data-tutorial-step={tutorialStep ?? undefined}>
    <div className="touch-controls__shoulders touch-controls__shoulders--left">
      <TouchButton buttonId="l1" className="touch-controls__shoulder" />
      <TouchButton buttonId="l2" className="touch-controls__shoulder" />
    </div>
    <div className="touch-controls__shoulders touch-controls__shoulders--right">
      <TouchButton buttonId="r2" className="touch-controls__shoulder" />
      <TouchButton
        buttonId="r1"
        className={`touch-controls__shoulder${tapTempo ? ' touch-controls__shoulder--tap-tempo' : ''}`}
        onPress={tapTempo?.tap}
      >
        {tapTempo ? <>
          <span>R1 · {tapTempo.isTooFast ? 'TAP AGAIN' : tapTempo.isArmed ? 'TAP 2/2' : 'TAP BPM'}</span>
          <small>{tapTempo.isTooFast ? 'TOO FAST' : `${tapTempo.bpm} BPM${tapTempo.isArmed ? ' · 1/2' : ''}`}</small>
        </> : null}
      </TouchButton>
    </div>

    <div className="touch-controls__side touch-controls__side--left">
      <DirectionPad />
      <div className="touch-controls__joystick-group" data-tutorial-control="leftStick">
        <span className="touch-controls__joystick-label"><b>L · Upper body</b><small>Torso + shoulders</small></span>
        <div className="touch-controls__joystick-zone" ref={leftStickRef} data-feedback={leftFeedback?.grade} aria-label="Left analog stick: upper body, torso and shoulders">
          <JoystickTarget target={targets.left} />
          <span className="touch-controls__joystick-visual" aria-hidden="true" />
          {leftFeedback ? <span key={leftFeedback.sequence} className="touch-controls__joystick-feedback" role="status">{leftFeedback.grade}</span> : null}
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
        <TouchButton buttonId="freeze" className="touch-controls__face-button touch-controls__face-button--x" tutorialControl="pressX" />
        <TouchButton buttonId="footwork" className="touch-controls__face-button touch-controls__face-button--b" />
        <TouchButton buttonId="toprock" className="touch-controls__face-button touch-controls__face-button--a" tutorialControl="pressA" />
      </div>
      <div className="touch-controls__joystick-group" data-tutorial-control="rightStick">
        <span className="touch-controls__joystick-label"><b>R · Lower body</b><small>Hips + legs</small></span>
        <div className="touch-controls__joystick-zone" ref={rightStickRef} data-feedback={rightFeedback?.grade} aria-label="Right analog stick: lower body, hips and legs">
          <JoystickTarget target={targets.right} />
          <span className="touch-controls__joystick-visual" aria-hidden="true" />
          {rightFeedback ? <span key={rightFeedback.sequence} className="touch-controls__joystick-feedback" role="status">{rightFeedback.grade}</span> : null}
          <TouchInputAdapter joystickZoneRef={rightStickRef} channel="look" />
        </div>
      </div>
    </div>
  </div>;
}

export default memo(TouchControlsOverlay);
