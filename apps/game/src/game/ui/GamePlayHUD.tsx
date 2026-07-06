import { useGameStore } from '../state/useGameStore';
import { useGameInputSnapshot } from '../input/GameInputProvider';
import { useConnectedGamepads } from '../input/useConnectedGamepads';
import type { GameInputButtonId } from '../input/gameInputTypes';
import type { GamePlayMode } from '../state/useGameStore';
import TouchControlsOverlay from './TouchControlsOverlay';
import type { GameCopy } from '../copy';
import type { PlayerMotionSnapshot } from '../motion/playerMotionTypes';
import type { AnimationPlaybackMachineContext } from '../animation/animationPlaybackMachine';
import type { PlayerMoveHistoryEntry } from '../motion/playerMoveHistory';
import { PLAYER_MOTION_INTENT_LABELS } from '../motion/playerMotionTypes';
import type { RhythmClockSnapshot } from '../rhythm/RhythmClock';
import type { VariationSelectionSnapshot } from '../motion/playerIntentResolver';

interface GamePlayHudProps {
  mode: GamePlayMode;
  gameState: string;
  send: (event: { type: string }) => void;
  onExit: () => void;
  copy: GameCopy;
  motionState: PlayerMotionSnapshot;
  animationStateLabel: string;
  animationContext: AnimationPlaybackMachineContext;
  moveHistory: PlayerMoveHistoryEntry[];
  rhythmState: RhythmClockSnapshot;
  variationSelection: VariationSelectionSnapshot;
  diagnosticsVisible: boolean;
}

const intentButtons: Array<{ id: GameInputButtonId; label: string }> = [
  { id: 'toprock', label: 'Toprock' },
  { id: 'footwork', label: 'Footwork' },
  { id: 'freeze', label: 'Freeze' },
  { id: 'powermove', label: 'Powermove' }
];

export default function GamePlayHUD({
  mode,
  gameState,
  motionState,
  animationStateLabel,
  animationContext,
  moveHistory,
  rhythmState,
  variationSelection,
  diagnosticsVisible
}: GamePlayHudProps) {
  const touchControlsVisible = useGameStore((state) => state.touchControlsVisible);
  const activeInputSource = useGameStore((state) => state.activeInputSource);
  const selectedGamepadIndex = useGameStore((state) => state.selectedGamepadIndex);
  const connectedGamepads = useConnectedGamepads();
  const snapshot = useGameInputSnapshot();
  const pressedIntentButtons = intentButtons.filter(({ id }) => snapshot.buttons[id].pressed);
  const selectedGamepad = connectedGamepads.find((gamepad) => gamepad.index === selectedGamepadIndex)
    ?? (selectedGamepadIndex === null ? connectedGamepads[0] : undefined);

  return (
    <>
      {mode === 'training' && diagnosticsVisible ? (
        <aside className="game-training-input-hud" aria-label="Live input and motion monitor">
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

          <div className="game-training-input-hud__buttons">
            {pressedIntentButtons.length === 0 ? (
              <span className="game-training-input-hud__empty">No move input</span>
            ) : pressedIntentButtons.map((button) => (
              <div key={button.id} data-pressed="true">
                <span>{button.label}</span>
                <b>ON</b>
              </div>
            ))}
          </div>

          <section aria-label="Motion diagnostics">
            <strong>Motion diagnostics</strong>
            <div>Game: <output>{gameState}</output></div>
            <div>Accepting intents: <output>{gameState === 'playing' ? 'yes' : 'no'}</output></div>
            <div>BPM: <output>{rhythmState.bpm.toFixed(2)}</output></div>
            <div>Global tick: <output>{rhythmState.tick}</output></div>
            <div>Beat: <output>{rhythmState.beat.toFixed(3)}</output></div>
            <div>Beat phase: <output>{rhythmState.beatPhase.toFixed(3)}</output></div>
            <div>Subdivision: <output>{rhythmState.subdivision + 1}/{rhythmState.subdivisionsPerBeat}</output></div>
            <div>Motion: <output>{motionState.phase}</output></div>
            <div>Intent: <output>{motionState.activeIntentId ?? 'none'}</output></div>
            <div>Selection: <output>{variationSelection?.family ?? 'none'}</output></div>
            <div>Window: <output>{variationSelection ? Math.max(0, variationSelection.closesAtBeat - rhythmState.beat).toFixed(2) : '—'} beats</output></div>
            <div>Evidence: <output>{variationSelection?.evidence.map((item) => item.button).join(' → ') || 'none'}</output></div>
            <div>Tick: <output>{motionState.tick}</output></div>
            <div>Animation state: <output>{animationStateLabel}</output></div>
            <div>Animation: <output>{animationContext.current?.definition.id ?? 'none'}</output></div>
            <div>Catalog: <output>{animationContext.sourceId ?? 'loading'}</output></div>
            <div>Fallback: <output>{animationContext.usedFallback ? 'yes' : 'no'}</output></div>
            <div>Outcome: <output>{animationContext.lastEvent?.type ?? 'none'}</output></div>
          </section>

          <section aria-label="Accepted move history">
            <strong>Accepted move history</strong>
            {moveHistory.length === 0 ? (
              <div>No accepted synthetic moves yet.</div>
            ) : (
              <ol>
                {moveHistory.slice(-8).reverse().map((entry) => (
                  <li key={entry.id}>
                    <b>#{entry.sequence} {PLAYER_MOTION_INTENT_LABELS[entry.intentId]}</b>
                    {' — '}{entry.outcome}
                    {' — '}{entry.animationId ?? 'animation pending'}
                    {' — ticks '}{entry.startedAtTick}–{entry.endedAtTick ?? 'active'}
                    {' — score '}{entry.scoring.status}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      ) : null}

      {touchControlsVisible ? <TouchControlsOverlay /> : null}
    </>
  );
}
