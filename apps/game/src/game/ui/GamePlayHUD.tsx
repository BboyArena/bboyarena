import { useGameStore } from '../state/useGameStore';
import { useGameInputSnapshot } from '../input/GameInputProvider';
import { useConnectedGamepads } from '../input/useConnectedGamepads';
import type { GameInputButtonId } from '../input/gameInputTypes';
import type { GamePlayMode } from '../state/useGameStore';
import TouchControlsOverlay from './TouchControlsOverlay';
import type { GameCopy } from '../copy';

interface GamePlayHudProps {
  mode: GamePlayMode;
  gameState: string;
  send: (event: { type: string }) => void;
  onExit: () => void;
  copy: GameCopy;
}

const displayedButtons: Array<{ id: GameInputButtonId; label: string }> = [
  { id: 'primary', label: 'Primary' },
  { id: 'secondary', label: 'Secondary' },
  { id: 'modifierLeft', label: 'L Mod' },
  { id: 'modifierRight', label: 'R Mod' },
  { id: 'start', label: 'Start' },
  { id: 'pause', label: 'Pause' }
];

export default function GamePlayHUD({ mode }: GamePlayHudProps) {
  const touchControlsVisible = useGameStore((state) => state.touchControlsVisible);
  const activeInputSource = useGameStore((state) => state.activeInputSource);
  const selectedGamepadIndex = useGameStore((state) => state.selectedGamepadIndex);
  const connectedGamepads = useConnectedGamepads();
  const snapshot = useGameInputSnapshot();
  const selectedGamepad = connectedGamepads.find((gamepad) => gamepad.index === selectedGamepadIndex)
    ?? (selectedGamepadIndex === null ? connectedGamepads[0] : undefined);

  return (
    <>
      {mode === 'training' ? (
        <aside className="game-training-input-hud" aria-label="Live input monitor">
          <div className="game-training-input-hud__header">
            <div>
              <span>Live input</span>
              <strong>{activeInputSource === 'keyboardMouse' ? 'Keyboard + Mouse' : activeInputSource}</strong>
            </div>
            <i data-connected={activeInputSource !== 'gamepad' || Boolean(selectedGamepad)} />
          </div>

          {activeInputSource === 'gamepad' ? (
            <p className="game-training-input-hud__device">
              {selectedGamepad?.id ?? 'Waiting for selected controller'}
            </p>
          ) : null}

          <div className="game-training-input-hud__stick">
            <span
              style={{
                transform: `translate(calc(-50% + ${snapshot.move.x * 1.35}rem), calc(-50% + ${-snapshot.move.y * 1.35}rem))`
              }}
            />
            <output>{snapshot.move.x.toFixed(2)} / {snapshot.move.y.toFixed(2)}</output>
          </div>

          <div className="game-training-input-hud__buttons">
            {displayedButtons.map((button) => (
              <div key={button.id} data-pressed={snapshot.buttons[button.id].pressed}>
                <span>{button.label}</span>
                <b>{snapshot.buttons[button.id].pressed ? 'ON' : 'OFF'}</b>
              </div>
            ))}
          </div>
        </aside>
      ) : null}

      {touchControlsVisible ? <TouchControlsOverlay /> : null}
    </>
  );
}
