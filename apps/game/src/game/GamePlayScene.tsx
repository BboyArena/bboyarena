import { useEffect, useMemo, useRef, useState } from 'react';
import { useMachine } from '@xstate/react';
import { gameMachine } from './state/gameMachine';
import { useGameStore, type GamePlayMode } from './state/useGameStore';
import CanvasScene from './CanvasScene';
import GamePlayHUD from './ui/GamePlayHUD';
import GameCanvasErrorBoundary from './ui/GameCanvasErrorBoundary';
import type { GameCopy } from './copy';
import { GameInputProvider, useGameInputSnapshot } from './input/GameInputProvider';
import GamepadInputAdapter from './input/GamepadInputAdapter';
import KeyboardMouseInputAdapter from './input/KeyboardMouseInputAdapter';
import { useResolveActiveInputSource } from './input/useResolveActiveInputSource';
import {
  playerMotionMachine,
  selectPlayerMotionSnapshot
} from './motion/playerMotionMachine';
import { createAnimationCatalogSources } from './animation/animationCatalogLoader';
import { animationPlaybackMachine } from './animation/animationPlaybackMachine';
import { PlayerMoveHistory } from './motion/playerMoveHistory';
import { useRhythmClock, useRhythmClockSnapshot } from './rhythm/RhythmClockProvider';
import { moveCatalog } from './move/moveCatalog';
import { sampleStickCueStep } from './move/stickCueTracks';
import { getMoveQueueFamilyForButton, MoveQueueController } from './move/MoveQueueController';
import type { GameInputButtonId } from './input/gameInputTypes';
import {
  accuracyToMoveScore,
  sampleMoveInputAccuracy,
  scoreToStaminaReward
} from './move/moveScoring';

const MAXIMUM_STAMINA = 100;
const MINIMUM_TRAINING_STAMINA = 5;
const MOVE_STAMINA_COST = 3;

function resolveToleranceMultiplier(mode: 'assisted' | 'adaptive' | 'expert', skillRating: number) {
  if (mode === 'assisted') return 1.75;
  if (mode === 'expert') return 1;
  return 1.75 - Math.max(0, Math.min(1, skillRating)) * 0.75;
}

function resolveTimingWindowBeats(mode: 'assisted' | 'adaptive' | 'expert', skillRating: number) {
  if (mode === 'assisted') return 0.45;
  if (mode === 'expert') return 0.2;
  return 0.45 - Math.max(0, Math.min(1, skillRating)) * 0.25;
}

interface GamePlaySceneProps {
  mode: GamePlayMode;
  copy: GameCopy;
}

function GameInputSceneBindings({ gameState, send }: { gameState: string; send: (event: { type: string }) => void }) {
  const resolvedInputSource = useResolveActiveInputSource();
  const preferredInputMode = useGameStore((store) => store.preferredInputMode);
  const setActiveInputSource = useGameStore((store) => store.setActiveInputSource);
  const snapshot = useGameInputSnapshot();
  const previousSnapshotRef = useRef(snapshot);

  useEffect(() => {
    setActiveInputSource(snapshot.source);
  }, [setActiveInputSource, snapshot.source]);

  useEffect(() => {
    const previousSnapshot = previousSnapshotRef.current;
    const startPressed = snapshot.buttons.start.pressed;
    const pausePressed = snapshot.buttons.pause.pressed;

    if (startPressed && !previousSnapshot.buttons.start.pressed && (gameState === 'idle' || gameState === 'gameOver')) {
      send({ type: 'START' });
    }

    if (pausePressed && !previousSnapshot.buttons.pause.pressed && gameState === 'playing') {
      send({ type: 'PAUSE' });
    }

    if (pausePressed && !previousSnapshot.buttons.pause.pressed && gameState === 'paused') {
      send({ type: 'RESUME' });
    }

    previousSnapshotRef.current = snapshot;
  }, [gameState, send, snapshot]);

  return (
    <>
      {preferredInputMode === 'auto' || resolvedInputSource === 'gamepad' ? <GamepadInputAdapter /> : null}
      {preferredInputMode === 'auto' || resolvedInputSource === 'keyboardMouse' ? <KeyboardMouseInputAdapter /> : null}
    </>
  );
}

function GamePlaySceneContent({ mode, copy }: GamePlaySceneProps) {
  const [state, send] = useMachine(gameMachine);
  const openMainMenu = useGameStore((store) => store.openMainMenu);
  const snapshot = useGameInputSnapshot();
  const rhythmClock = useRhythmClock();
  const rhythmSnapshot = useRhythmClockSnapshot();
  const difficultyMode = useGameStore((store) => store.difficultyMode);
  const adaptiveSkillRating = useGameStore((store) => store.adaptiveSkillRating);
  const recordAdaptivePerformance = useGameStore((store) => store.recordAdaptivePerformance);
  const toleranceMultiplier = resolveToleranceMultiplier(difficultyMode, adaptiveSkillRating);
  const timingWindowBeats = resolveTimingWindowBeats(difficultyMode, adaptiveSkillRating);
  const gameState = typeof state.value === 'string' ? state.value : 'idle';
  const animationSources = useMemo(
    () => createAnimationCatalogSources({
      remoteUrl: import.meta.env.PUBLIC_ANIMATION_CATALOG_URL
    }),
    []
  );
  const [motionActorState, motionSend] = useMachine(playerMotionMachine);
  const [animationActorState, animationSend] = useMachine(animationPlaybackMachine, {
    input: { sources: animationSources }
  });
  const motionSnapshot = selectPlayerMotionSnapshot(motionActorState.context);
  const previousMotionInputRef = useRef(snapshot);
  const liveInputRef = useRef(snapshot);
  liveInputRef.current = snapshot;
  const previousGameStateRef = useRef(gameState);
  const requestSequenceRef = useRef(0);
  const lastAnimationIntentRef = useRef<string | null>(null);
  const moveHistoryRef = useRef(new PlayerMoveHistory());
  const [moveHistory, setMoveHistory] = useState(() => moveHistoryRef.current.getSnapshot());
  const moveQueueRef = useRef(new MoveQueueController());
  const [moveQueue, setMoveQueue] = useState(() => moveQueueRef.current.getSnapshot());
  const [diagnosticsVisible, setDiagnosticsVisible] = useState(import.meta.env.DEV);
  const staminaRef = useRef(MAXIMUM_STAMINA);
  const [stamina, setStamina] = useState(MAXIMUM_STAMINA);
  const [moveScore, setMoveScore] = useState<number | null>(null);
  const staminaRewardSequenceRef = useRef(0);
  const [staminaRewardFeedback, setStaminaRewardFeedback] = useState<{ amount: number; sequence: number } | null>(null);
  const scoreAccumulatorRef = useRef<{ moveId: number; total: number; samples: number } | null>(null);

  useEffect(() => {
    if (mode === 'training' && gameState === 'idle') {
      send({ type: 'START' });
    }
  }, [gameState, mode, send]);

  useEffect(() => {
    const previousGameState = previousGameStateRef.current;
    const currentTick = rhythmClock.getSnapshot().tick;

    if (gameState === 'playing') {
      motionSend({ type: previousGameState === 'paused' ? 'RESUME' : 'ENABLE' });
      if (previousGameState === 'paused') {
        animationSend({ type: 'animation.resume', issuedAtTick: currentTick });
      }
    } else if (gameState === 'paused') {
      motionSend({ type: 'PAUSE' });
      animationSend({ type: 'animation.pause', issuedAtTick: currentTick });
    } else {
      motionSend({ type: 'DISABLE' });
      animationSend({ type: 'animation.reset', issuedAtTick: currentTick });
      moveQueueRef.current.reset();
      setMoveQueue(moveQueueRef.current.getSnapshot());
      staminaRef.current = MAXIMUM_STAMINA;
      setStamina(MAXIMUM_STAMINA);
      setMoveScore(null);
      setStaminaRewardFeedback(null);
      scoreAccumulatorRef.current = null;
      lastAnimationIntentRef.current = null;
      if (moveHistoryRef.current.reset(currentTick)) {
        setMoveHistory(moveHistoryRef.current.getSnapshot());
      }
    }

    previousGameStateRef.current = gameState;
  }, [animationSend, gameState, motionSend, rhythmClock]);

  useEffect(() => {
    if (gameState === 'playing') {
      motionSend({ type: 'TICK', tick: rhythmSnapshot.tick });
      const activeBeforeAdvance = moveQueueRef.current.getSnapshot().active;
      if (mode === 'training' && activeBeforeAdvance) {
        const accuracy = sampleMoveInputAccuracy(
          activeBeforeAdvance,
          rhythmSnapshot.beat,
          liveInputRef.current,
          { toleranceMultiplier, timingWindowBeats }
        );
        if (accuracy !== null) {
          const accumulator = scoreAccumulatorRef.current?.moveId === activeBeforeAdvance.id
            ? scoreAccumulatorRef.current
            : { moveId: activeBeforeAdvance.id, total: 0, samples: 0 };
          accumulator.total += accuracy;
          accumulator.samples += 1;
          scoreAccumulatorRef.current = accumulator;
          setMoveScore(accuracyToMoveScore(accumulator.total / accumulator.samples));
        }
      }
      const transition = moveQueueRef.current.advance(rhythmSnapshot.beat);
      if (transition) {
        const accumulator = scoreAccumulatorRef.current;
        const completedScore = mode === 'training' && accumulator?.moveId === transition.completed.id
          ? accuracyToMoveScore(accumulator.total / Math.max(1, accumulator.samples))
          : undefined;
        scoreAccumulatorRef.current = null;
        if (mode === 'training' && completedScore !== undefined && difficultyMode === 'adaptive') {
          recordAdaptivePerformance(completedScore);
        }

        if (moveHistoryRef.current.completeActive(rhythmSnapshot.tick, completedScore)) {
          setMoveHistory(moveHistoryRef.current.getSnapshot());
        }
        let started = transition.started;
        if (mode === 'training') {
          const staminaReward = scoreToStaminaReward(completedScore ?? 20);
          const nextStamina = Math.max(
            MINIMUM_TRAINING_STAMINA,
            Math.min(MAXIMUM_STAMINA, staminaRef.current - MOVE_STAMINA_COST + staminaReward)
          );
          staminaRef.current = nextStamina;
          setStamina(nextStamina);
          setMoveScore(completedScore ?? 20);
          if (staminaReward > 0.01) {
            staminaRewardSequenceRef.current += 1;
            setStaminaRewardFeedback({
              amount: staminaReward,
              sequence: staminaRewardSequenceRef.current
            });
          }

          if (!started) {
            started = moveQueueRef.current.enqueue(
              transition.completed.family,
              transition.completed.startedAtBeat + transition.completed.durationBeats
            );
          }
        }
        animationSend({ type: 'animation.complete', completedAtTick: rhythmSnapshot.tick });
        motionSend({
          type: 'INTENT',
          intent: { type: 'motion.release', intentId: transition.completed.intentId },
          tick: rhythmSnapshot.tick
        });
        lastAnimationIntentRef.current = null;
        if (started) {
          motionSend({
            type: 'INTENT',
            intent: { type: 'motion.perform', intentId: started.intentId },
            tick: rhythmSnapshot.tick
          });
        }
        setMoveQueue(moveQueueRef.current.getSnapshot());
      }
    }
  }, [animationSend, difficultyMode, gameState, mode, motionSend, recordAdaptivePerformance, rhythmSnapshot.beat, rhythmSnapshot.tick, timingWindowBeats, toleranceMultiplier]);

  useEffect(() => {
    const previousSnapshot = previousMotionInputRef.current;
    previousMotionInputRef.current = snapshot;

    if (gameState !== 'playing') return;

    const clock = rhythmClock.getSnapshot();
    if (previousSnapshot.move.x !== snapshot.move.x || previousSnapshot.move.y !== snapshot.move.y) {
      motionSend({
        type: 'INTENT',
        intent: { type: 'motion.move', movement: { ...snapshot.move } },
        tick: clock.tick
      });
    }

    const moveButtons: GameInputButtonId[] = ['toprock', 'footwork', 'freeze', 'powermove'];
    for (const button of moveButtons) {
      if (previousSnapshot.buttons[button].pressed || !snapshot.buttons[button].pressed) continue;
      const family = getMoveQueueFamilyForButton(button);
      if (!family) continue;
      const started = moveQueueRef.current.enqueue(family, clock.beat);
      if (started) {
        lastAnimationIntentRef.current = null;
        motionSend({
          type: 'INTENT',
          intent: { type: 'motion.perform', intentId: started.intentId },
          tick: clock.tick
        });
      }
      setMoveQueue(moveQueueRef.current.getSnapshot());
    }
  }, [gameState, mode, motionSend, rhythmClock, snapshot]);

  useEffect(() => {
    const intentId = motionSnapshot.activeIntentId;
    if (
      gameState !== 'playing' ||
      intentId === null ||
      !animationActorState.matches('ready') ||
      lastAnimationIntentRef.current === intentId
    ) {
      return;
    }

    requestSequenceRef.current += 1;
    animationSend({
      type: 'animation.play',
      requestId: `motion-${requestSequenceRef.current}`,
      intentId,
      issuedAtTick: motionSnapshot.tick
    });
    lastAnimationIntentRef.current = intentId;
  }, [
    animationActorState,
    animationSend,
    gameState,
    motionSnapshot.activeIntentId,
    motionSnapshot.tick
  ]);

  const animationStateLabel = JSON.stringify(animationActorState.value);
  const animationDefinition = animationActorState.context.current?.definition ?? null;
  const stickCueDiagnostics = useMemo(() => {
    const activeMove = moveQueue.active;
    if (activeMove === null) return [];

    const move = moveCatalog.moves.find(
      (definition) => definition.intentId === activeMove.intentId
    );
    if (!move?.stickCueTracks?.length) return [];

    const progress = activeMove.durationBeats > 0
      ? (rhythmSnapshot.beat - activeMove.startedAtBeat) / activeMove.durationBeats
      : 0;

    return move.stickCueTracks.map((track) => ({
      id: track.id,
      label: track.label,
      stick: track.stick,
      controllerRole: track.controllerRole,
      targetInput: track.targetInput ?? 'movement',
      points: track.points,
      progress: track.loop ? ((progress % 1) + 1) % 1 : Math.min(1, Math.max(0, progress)),
      sample: sampleStickCueStep(track, progress, activeMove.durationBeats, timingWindowBeats)
    }));
  }, [
    moveQueue.active,
    rhythmSnapshot.beat,
    timingWindowBeats
  ]);

  useEffect(() => {
    if (
      moveHistoryRef.current.observe(
        motionSnapshot.activeIntentId,
        motionSnapshot.tick,
        animationActorState.context.catalog
      )
    ) {
      setMoveHistory(moveHistoryRef.current.getSnapshot());
    }
  }, [
    animationActorState.context.catalog,
    motionSnapshot.activeIntentId,
    motionSnapshot.tick
  ]);

  return (
    <>
      <GameInputSceneBindings gameState={gameState} send={send} />
      <div className="game-play-status-controls">
        <button
          type="button"
          className="game-status-pill game-status-pill--interactive"
          onClick={openMainMenu}
          aria-label={copy.backToMenu}
        >
          {copy.playStatus} / {mode} / {gameState}
        </button>
        {import.meta.env.DEV && mode === 'training' ? (
          <button
            type="button"
            className="game-training-input-hud__toggle"
            aria-pressed={diagnosticsVisible}
            onClick={() => setDiagnosticsVisible((visible) => !visible)}
          >
            Debug HUD {diagnosticsVisible ? 'On' : 'Off'}
          </button>
        ) : null}
      </div>
      <GameCanvasErrorBoundary>
        <CanvasScene
          gameState={gameState}
          playerMotionState={motionSnapshot}
          animationDefinition={animationDefinition}
        />
      </GameCanvasErrorBoundary>
      <GamePlayHUD
        mode={mode}
        gameState={gameState}
        send={send}
        onExit={openMainMenu}
        copy={copy}
        motionState={motionSnapshot}
        animationStateLabel={animationStateLabel}
        animationContext={animationActorState.context}
        moveHistory={moveHistory}
        rhythmState={rhythmSnapshot}
        diagnosticsVisible={diagnosticsVisible}
        stickCueDiagnostics={stickCueDiagnostics}
        moveQueue={moveQueue}
        stamina={stamina}
        moveScore={moveScore}
        staminaRewardFeedback={staminaRewardFeedback}
      />
    </>
  );
}

export default function GamePlayScene(props: GamePlaySceneProps) {
  return (
    <GameInputProvider>
      <GamePlaySceneContent {...props} />
    </GameInputProvider>
  );
}
