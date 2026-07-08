import { useEffect, useState } from 'react';
import { useGameStore } from '../state/useGameStore';
import { useGameInputSnapshot } from '../input/GameInputProvider';
import { useConnectedGamepads } from '../input/useConnectedGamepads';
import type { GameInputButtonId } from '../input/gameInputTypes';
import type { GamePlayMode } from '../state/useGameStore';
import TouchControlsOverlay, { type TouchStickFeedback, type TouchStickTarget } from './TouchControlsOverlay';
import type { GameCopy } from '../copy';
import type { PlayerMotionSnapshot } from '../motion/playerMotionTypes';
import type { AnimationPlaybackMachineContext } from '../animation/animationPlaybackMachine';
import type { PlayerMoveHistoryEntry } from '../motion/playerMoveHistory';
import { PLAYER_MOTION_INTENT_LABELS } from '../motion/playerMotionTypes';
import type { RhythmClockSnapshot } from '../rhythm/RhythmClock';
import type { StickCueStepSample } from '../move/stickCueTracks';
import { moveCatalog } from '../move/moveCatalog';
import type { MoveQueueSnapshot } from '../move/MoveQueueController';
import type { StickCuePoint } from '../move/moveDefinitionTypes';
import type { MoveFamilyId } from '../move/moveDefinitionTypes';
import TrainingCoachPanel from './TrainingCoachPanel';
import { useTapTempo } from './useTapTempo';

export type StickCueDiagnostic = {
  id: string;
  label: string;
  stick: 'left' | 'right';
  controllerRole: string;
  targetInput: 'movement' | 'look' | 'custom';
  points: StickCuePoint[];
  progress: number;
  sample: StickCueStepSample;
};

const stickGrammar = {
  left: { shortLabel: 'L', stickLabel: 'Left stick', bodyLabel: 'Upper body', inputLabel: 'torso + shoulders' },
  right: { shortLabel: 'R', stickLabel: 'Right stick', bodyLabel: 'Lower body', inputLabel: 'hips + legs' }
} as const;

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
  diagnosticsVisible: boolean;
  stickCueDiagnostics: StickCueDiagnostic[];
  moveQueue: MoveQueueSnapshot;
  stamina: number;
  moveScore: number | null;
  loopPoints: number;
  totalPoints: number;
  playTimeSeconds: number;
  staminaRewardFeedback: { amount: number; score: number; sequence: number } | null;
  stickFeedbacks: TouchStickFeedback[];
}

const intentButtons: Array<{ id: GameInputButtonId; label: string }> = [
  { id: 'toprock', label: 'Toprock' },
  { id: 'footwork', label: 'Footwork' },
  { id: 'freeze', label: 'Freeze' },
  { id: 'powermove', label: 'Powermove' }
];

const getMoveFamilyLabel = (intentId: PlayerMotionSnapshot['activeIntentId']) => {
  if (intentId?.includes('.toprock')) return 'Toprock';
  if (intentId?.includes('.footwork')) return 'Footwork';
  if (intentId?.includes('.freeze')) return 'Freeze';
  if (intentId?.includes('.powermove')) return 'Powermove';
  return 'Ready';
};

export default function GamePlayHUD({
  mode,
  gameState,
  copy,
  motionState,
  animationStateLabel,
  animationContext,
  moveHistory,
  rhythmState,
  diagnosticsVisible,
  stickCueDiagnostics,
  moveQueue,
  stamina,
  moveScore,
  loopPoints,
  totalPoints,
  playTimeSeconds,
  staminaRewardFeedback,
  stickFeedbacks
}: GamePlayHudProps) {
  const [compactTraining, setCompactTraining] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 640px), (max-height: 520px)').matches
  ));
  const [learning, setLearning] = useState(() => (
    mode === 'training'
    && typeof window !== 'undefined'
    && window.matchMedia('(max-width: 640px), (max-height: 520px)').matches
  ));
  const touchControlsVisible = useGameStore((state) => state.touchControlsVisible);
  const trainingAudioMode = useGameStore((state) => state.trainingAudioMode);
  const activeInputSource = useGameStore((state) => state.activeInputSource);
  const selectedGamepadIndex = useGameStore((state) => state.selectedGamepadIndex);
  const connectedGamepads = useConnectedGamepads();
  const snapshot = useGameInputSnapshot();
  const pressedIntentButtons = intentButtons.filter(({ id }) => snapshot.buttons[id].pressed);
  const selectedGamepad = connectedGamepads.find((gamepad) => gamepad.index === selectedGamepadIndex)
    ?? (selectedGamepadIndex === null ? connectedGamepads[0] : undefined);
  const activeMove = moveCatalog.moves.find((move) => move.intentId === moveQueue.active?.intentId);
  const documentedMove = activeMove
    ?? moveCatalog.moves.find((move) => move.intentId === motionState.activeIntentId)
    ?? null;
  const moveFamilyLabel = moveQueue.active?.family ?? getMoveFamilyLabel(motionState.activeIntentId);
  const moveStyleLabel = moveQueue.active?.label ?? activeMove?.label
    ?? (motionState.activeIntentId ? PLAYER_MOTION_INTENT_LABELS[motionState.activeIntentId] : 'Waiting for move');
  const activeProgress = moveQueue.active
    ? Math.min(1, Math.max(0, (rhythmState.beat - moveQueue.active.startedAtBeat) / moveQueue.active.durationBeats))
    : 0;
  const nextMove = moveQueue.queued[0] ?? null;
  const activeStickCues = stickCueDiagnostics.filter((cue) => cue.sample.active);
  const coachFeedback = activeStickCues.length > 0
    ? (activeStickCues.every((cue) => {
        const input = cue.targetInput === 'look' ? snapshot.look : snapshot.move;
        return Math.hypot(input.x - cue.sample.x, input.y - cue.sample.y) <= cue.sample.tolerance;
      }) ? 'Step locked — keep the rhythm.' : 'Hit the gold checkpoint now.')
    : (stickCueDiagnostics.length > 0 ? 'Get ready for the next checkpoint.' : undefined);
  const touchStickTargets = Object.fromEntries(stickCueDiagnostics.map((cue) => {
    const input = cue.targetInput === 'look' ? snapshot.look : snapshot.move;
    return [cue.stick, {
      x: cue.sample.x,
      y: cue.sample.y,
      tolerance: cue.sample.tolerance,
      onTarget: cue.sample.active && Math.hypot(input.x - cue.sample.x, input.y - cue.sample.y) <= cue.sample.tolerance,
      active: cue.sample.active,
      step: `${cue.sample.pointIndex + 1}/${cue.points.length}`
    }];
  })) as Partial<Record<'left' | 'right', TouchStickTarget>>;

  useEffect(() => {
    const compactViewport = window.matchMedia('(max-width: 640px), (max-height: 520px)');
    const syncTrainingLayout = (matches: boolean) => {
      setCompactTraining(matches);
      setLearning(mode === 'training' && matches);
    };
    const handleChange = (event: MediaQueryListEvent) => syncTrainingLayout(event.matches);
    compactViewport.addEventListener('change', handleChange);
    return () => compactViewport.removeEventListener('change', handleChange);
  }, [mode]);

  const learningActive = mode === 'training' && compactTraining && learning;
  const bringYourMusicActive = mode === 'training' && trainingAudioMode === 'bring-your-music';
  const tapTempo = useTapTempo(bringYourMusicActive);
  const wholePlaySeconds = Math.max(0, Math.floor(playTimeSeconds));
  const playMinutes = Math.floor(wholePlaySeconds / 60);
  const playSeconds = wholePlaySeconds % 60;
  const formattedPlayTime = `${String(playMinutes).padStart(2, '0')}:${String(playSeconds).padStart(2, '0')}`;

  return (
    <>
      <aside className="game-session-stats" aria-label={`Total score ${totalPoints}, play time ${formattedPlayTime}`}>
        <div><span>Total score</span><strong>{totalPoints}</strong></div>
        <div><span>Play time</span><strong>{formattedPlayTime}</strong></div>
      </aside>

      {staminaRewardFeedback && !learningActive ? (
        <div
          key={staminaRewardFeedback.sequence}
          className="game-stamina-reward"
          role="status"
          aria-live="polite"
        >
          <span>Loop score {staminaRewardFeedback.score}%</span>
          <strong>+{staminaRewardFeedback.amount.toFixed(1)} stamina</strong>
        </div>
      ) : null}

      {!learningActive ? <div
        className="game-beat-pad"
        data-active={rhythmState.beatPhase < 0.18}
        aria-label={`Beat ${(rhythmState.beatIndex % 4) + 1} of 4`}
      >
        <i />
        <span>{(rhythmState.beatIndex % 4) + 1}/4</span>
      </div> : null}

      {!learningActive ? <aside className="game-active-move-hud" data-training={mode === 'training'} aria-live="polite" aria-label="Active move">
        <span>Move</span>
        <strong>{moveFamilyLabel}</strong>
        <small>Style: {moveStyleLabel}</small>
        <div className="game-active-move-hud__progress" aria-label={`Loop ${Math.round(activeProgress * 100)}% complete`}>
          <i style={{ width: `${activeProgress * 100}%` }} />
        </div>
        <ol className="game-active-move-hud__queue" aria-label="Queued moves">
          {moveQueue.queued.length === 0 ? (
            <li className="is-empty">Queue empty</li>
          ) : moveQueue.queued.map((move, index) => (
            <li key={move.id} data-next={index === 0}>
              <b>{index + 1}</b> {move.family} <small>{move.label}</small>
            </li>
          ))}
        </ol>
      </aside> : null}

      {mode === 'training' ? (
        <TrainingCoachPanel
          move={documentedMove}
          family={(moveQueue.active?.family ?? (documentedMove?.intentId.split('.')[1] ?? null)) as MoveFamilyId | null}
          progress={activeProgress}
          feedback={coachFeedback}
          compact={compactTraining}
          learning={learningActive}
          onLearningChange={setLearning}
          stamina={stamina}
          score={moveScore}
          loopPoints={loopPoints}
          totalPoints={totalPoints}
        />
      ) : null}

      {!learningActive && nextMove ? (
        <div className="game-next-move-ghost" aria-hidden="true">
          <span>Next</span>
          <strong>{nextMove.family}</strong>
        </div>
      ) : null}

      {!learningActive && stickCueDiagnostics.length > 0 ? (
        <aside className="game-stick-cue-hud" data-training={mode === 'training'} aria-label="Timed stick step instructions">
          {stickCueDiagnostics.map((cue) => {
            const input = cue.targetInput === 'look' ? snapshot.look : snapshot.move;
            const grammar = stickGrammar[cue.stick];
            const distance = Math.hypot(input.x - cue.sample.x, input.y - cue.sample.y);
            const onTarget = cue.sample.active && distance <= cue.sample.tolerance;
            return (
              <section key={cue.id} data-stick={cue.stick} data-on-target={onTarget} data-step-active={cue.sample.active}>
                <header>
                  <b aria-hidden="true">{grammar.shortLabel}</b>
                  <span><strong>{grammar.stickLabel} · {grammar.bodyLabel}</strong><small>{grammar.inputLabel}</small></span>
                </header>
                <svg viewBox="0 0 100 100" role="img" aria-label={`${cue.label} timed step`}>
                  <line x1="50" y1="7" x2="50" y2="93" />
                  <line x1="7" y1="50" x2="93" y2="50" />
                  {cue.points.map((point, index) => (
                    <circle key={index} cx={50 + point.x * 42} cy={50 - point.y * 42} r="2" opacity={index === cue.sample.pointIndex ? 1 : 0.28} />
                  ))}
                  <circle className="game-stick-cue-hud__target" cx={50 + cue.sample.x * 42} cy={50 - cue.sample.y * 42} r="6" />
                  <circle className="game-stick-cue-hud__input" cx={50 + input.x * 42} cy={50 - input.y * 42} r="4" />
                </svg>
                <footer>
                  <span>Step {cue.sample.pointIndex + 1}/{cue.points.length}</span>
                  <strong>{cue.sample.active ? (onTarget ? 'Step locked' : 'Hit gold now') : 'Get ready'}</strong>
                </footer>
              </section>
            );
          })}
        </aside>
      ) : null}

      {mode === 'training' && diagnosticsVisible && !learningActive ? (
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
            <div>Tempo source: <output>{trainingAudioMode}</output></div>
            {trainingAudioMode === 'bring-your-music' ? <div>Tempo authority: <output>touch tap</output></div> : null}
            <div>Global tick: <output>{rhythmState.tick}</output></div>
            <div>Beat: <output>{rhythmState.beat.toFixed(3)}</output></div>
            <div>Beat phase: <output>{rhythmState.beatPhase.toFixed(3)}</output></div>
            <div>Subdivision: <output>{rhythmState.subdivision + 1}/{rhythmState.subdivisionsPerBeat}</output></div>
            <div>Motion: <output>{motionState.phase}</output></div>
            <div>Intent: <output>{motionState.activeIntentId ?? 'none'}</output></div>
            <div>Queue: <output>{moveQueue.queued.length} move(s)</output></div>
            <div>Tick: <output>{motionState.tick}</output></div>
            <div>Animation state: <output>{animationStateLabel}</output></div>
            <div>Animation: <output>{animationContext.current?.definition.id ?? 'none'}</output></div>
            <div>Catalog: <output>{animationContext.sourceId ?? 'loading'}</output></div>
            <div>Fallback: <output>{animationContext.usedFallback ? 'yes' : 'no'}</output></div>
            <div>Outcome: <output>{animationContext.lastEvent?.type ?? 'none'}</output></div>
            <div>
              Special event:{' '}
              <output>
                {snapshot.lastSystemEvent?.action === 'system.quickMenu'
                  ? `Quick Menu #${snapshot.lastSystemEvent.sequence}`
                  : 'none'}
              </output>
            </div>
          </section>

          <section aria-label="Stick cue diagnostics">
            <strong>Stick cue targets (diagnostic only)</strong>
            {stickCueDiagnostics.length === 0 ? (
              <div>No cue tracks for the active move.</div>
            ) : stickCueDiagnostics.map((cue) => (
              <div key={cue.id}>
                {cue.label} [{cue.controllerRole}]:{' '}
                <output>
                  ({cue.sample.x.toFixed(2)}, {cue.sample.y.toFixed(2)}) ±{cue.sample.tolerance.toFixed(2)}
                  {' — '}{(cue.progress * 100).toFixed(0)}%
                  {' — step #'}{cue.sample.pointIndex + 1}
                  {' — '}{cue.sample.active ? 'ACTIVE' : `in ${Math.max(0, cue.sample.beatsUntilStep).toFixed(2)} beats`}
                </output>
              </div>
            ))}
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
                    {' — score '}{entry.scoring.status === 'evaluated' ? `${entry.scoring.score}%` : entry.scoring.status}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      ) : null}

      {touchControlsVisible && (!learningActive || bringYourMusicActive) ? (
        <TouchControlsOverlay
          targets={touchStickTargets}
          feedbacks={stickFeedbacks}
          tapTempo={bringYourMusicActive ? tapTempo : undefined}
        />
      ) : null}
    </>
  );
}
