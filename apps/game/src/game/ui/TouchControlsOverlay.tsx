import { useMemo, useRef } from 'react';
import { useGameInputController } from '../input/GameInputProvider';
import TouchInputAdapter from '../input/TouchInputAdapter';
import { useGameStore } from '../state/useGameStore';
import type { GameInputButtonId } from '../input/gameInputTypes';

function getButtonLabel(buttonId: GameInputButtonId) {
  switch (buttonId) {
    case 'primary':
      return 'A';
    case 'secondary':
      return 'B';
    case 'modifierLeft':
      return 'L';
    case 'modifierRight':
      return 'R';
    case 'start':
      return 'Start';
    case 'pause':
    default:
      return 'Pause';
  }
}

interface TouchButtonProps {
  buttonId: GameInputButtonId;
  className: string;
}

function TouchButton({ buttonId, className }: TouchButtonProps) {
  const controller = useGameInputController();

  const release = () => {
    controller.updateButton('touch', buttonId, false);
  };

  return (
    <button
      type="button"
      className={className}
      aria-label={buttonId}
      onPointerDown={(event) => {
        event.preventDefault();
        controller.updateButton('touch', buttonId, true);
      }}
      onPointerUp={(event) => {
        event.preventDefault();
        release();
      }}
      onPointerLeave={release}
      onPointerCancel={release}
    >
      {getButtonLabel(buttonId)}
    </button>
  );
}

export default function TouchControlsOverlay() {
  const touchControlsVisible = useGameStore((state) => state.touchControlsVisible);
  const activeInputSource = useGameStore((state) => state.activeInputSource);
  const joystickZoneRef = useRef<HTMLDivElement | null>(null);

  const shouldMountJoystick = useMemo(
    () => touchControlsVisible && activeInputSource === 'touch',
    [activeInputSource, touchControlsVisible]
  );

  if (!touchControlsVisible) return null;

  return (
    <div className="touch-controls" data-input-source={activeInputSource}>
      <div className="touch-controls__joystick-zone" ref={joystickZoneRef}>
        {shouldMountJoystick ? <TouchInputAdapter joystickZoneRef={joystickZoneRef} /> : null}
      </div>

      <div className="touch-controls__actions">
        <div className="touch-controls__action-row">
          <TouchButton buttonId="modifierLeft" className="touch-controls__button touch-controls__button--modifier" />
          <TouchButton buttonId="modifierRight" className="touch-controls__button touch-controls__button--modifier" />
        </div>
        <div className="touch-controls__action-row touch-controls__action-row--primary">
          <TouchButton buttonId="secondary" className="touch-controls__button touch-controls__button--secondary" />
          <TouchButton buttonId="primary" className="touch-controls__button touch-controls__button--primary" />
        </div>
        <div className="touch-controls__action-row touch-controls__action-row--system">
          <TouchButton buttonId="pause" className="touch-controls__button touch-controls__button--system" />
          <TouchButton buttonId="start" className="touch-controls__button touch-controls__button--system" />
        </div>
      </div>
    </div>
  );
}
