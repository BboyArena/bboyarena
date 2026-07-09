import { useEffect, useMemo, useRef, useState } from 'react';
import { useMachine } from '@xstate/react';
import { gameMachine } from './state/gameMachine';
import { useGameStore, type GamePlayMode } from './state/useGameStore';
import CanvasScene, { type RenderingDiagnostics } from './CanvasScene';
import GamePlayHUD from './ui/GamePlayHUD';
import GameCanvasErrorBoundary from './ui/GameCanvasErrorBoundary';
import type { GameCopy } from './copy';
import { GameInputProvider, useGameInputController, useGameInputSnapshot } from './input/GameInputProvider';
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
import type { GameInputButtonId, GameInputSnapshot } from './input/gameInputTypes';
import { scoreToStaminaReward } from './move/moveScoring';
import type { TouchStickFeedback } from './ui/TouchControlsOverlay';
import { useTrainingTutorial } from './training/useTrainingTutorial';
import TrainingTutorialOverlay from './ui/TrainingTutorialOverlay';

const MAXIMUM_STAMINA = 100;
const MINIMUM_TRAINING_STAMINA = 5;
const MOVE_STAMINA_COST = 3;
const GOOD_STEP_POINTS = 50;
const PERFECT_STEP_POINTS = 100;
const movesByIntentId = new Map(moveCatalog.moves.map((move) => [move.intentId, move]));

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

function hasMeaningfulGameplayInput(input: GameInputSnapshot) {
  return Math.hypot(input.move.x, input.move.y) > 0.01
    || Math.hypot(input.look.x, input.look.y) > 0.01
    || input.buttons.toprock.pressed
    || input.buttons.footwork.pressed
    || input.buttons.freeze.pressed
    || input.buttons.powermove.pressed;
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
  const inputController = useGameInputController();
  const threeFingerGestureActiveRef = useRef(false);
  const rhythmClock = useRhythmClock();
  const rhythmSnapshot = useRhythmClockSnapshot();
  const difficultyMode = useGameStore((store) => store.difficultyMode);
  const adaptiveSkillRating = useGameStore((store) => store.adaptiveSkillRating);
  const cameraFeel = useGameStore((store) => store.cameraFeel);
  const bpm = useGameStore((store) => store.bpm);
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
  const [diagnosticsVisible, setDiagnosticsVisible] = useState(false);
  const staminaRef = useRef(MAXIMUM_STAMINA);
  const lastStaminaBeatRef = useRef(rhythmSnapshot.beat);
  const [stamina, setStamina] = useState(MAXIMUM_STAMINA);
  const [moveScore, setMoveScore] = useState<number | null>(null);
  const [loopPoints, setLoopPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const lastPlayTimeTickRef = useRef(rhythmSnapshot.tick);
  const [playTimeSeconds, setPlayTimeSeconds] = useState(0);
  const staminaRewardSequenceRef = useRef(0);
  const [staminaRewardFeedback, setStaminaRewardFeedback] = useState<{ amount: number; score: number; sequence: number } | null>(null);
  const scoreAccumulatorRef = useRef<{ moveId: number; earned: number; possible: number } | null>(null);
  const awardedStickStepsRef = useRef(new Set<string>());
  const stickFeedbackSequenceRef = useRef(0);
  const [stickFeedbacks, setStickFeedbacks] = useState<TouchStickFeedback[]>([]);
  const [renderingDiagnostics, setRenderingDiagnostics] = useState<RenderingDiagnostics | null>(null);
  const tutorial = useTrainingTutorial(mode === 'training', rhythmSnapshot, snapshot);

  useEffect(() => {
    const gameRoot = document.getElementById('bboyarena-game-root');
    if (!gameRoot) return undefined;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 3 || threeFingerGestureActiveRef.current) return;
      threeFingerGestureActiveRef.current = true;
      inputController.triggerSystemAction('touch', 'system.quickMenu');
    };
    const handleTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 3) threeFingerGestureActiveRef.current = false;
    };
    const handleTouchCancel = () => {
      threeFingerGestureActiveRef.current = false;
    };

    gameRoot.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
    gameRoot.addEventListener('touchend', handleTouchEnd, { capture: true, passive: true });
    gameRoot.addEventListener('touchcancel', handleTouchCancel, { capture: true, passive: true });
    return () => {
      gameRoot.removeEventListener('touchstart', handleTouchStart, { capture: true });
      gameRoot.removeEventListener('touchend', handleTouchEnd, { capture: true });
      gameRoot.removeEventListener('touchcancel', handleTouchCancel, { capture: true });
    };
  }, [inputController]);

  useEffect(() => {
    if (mode === 'training' && gameState === 'idle') {
      send({ type: 'START' });
    }
  }, [gameState, mode, send]);

  useEffect(() => {
    const previousGameState = previousGameStateRef.current;
    const currentRhythm = rhythmClock.getSnapshot();
    const currentTick = currentRhythm.tick;

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
      lastStaminaBeatRef.current = currentRhythm.beat;
      setStamina(MAXIMUM_STAMINA);
      setMoveScore(null);
      setLoopPoints(0);
      setTotalPoints(0);
      lastPlayTimeTickRef.current = currentTick;
      setPlayTimeSeconds(0);
      setStaminaRewardFeedback(null);
      scoreAccumulatorRef.current = null;
      awardedStickStepsRef.current.clear();
      setStickFeedbacks([]);
      lastAnimationIntentRef.current = null;
      if (moveHistoryRef.current.reset(currentTick)) {
        setMoveHistory(moveHistoryRef.current.getSnapshot());
      }
    }

    previousGameStateRef.current = gameState;
  }, [animationSend, gameState, motionSend, rhythmClock]);

  useEffect(() => {
    const elapsedTicks = Math.max(0, rhythmSnapshot.tick - lastPlayTimeTickRef.current);
    if (gameState === 'playing' && elapsedTicks > 0) {
      setPlayTimeSeconds((seconds) => seconds + elapsedTicks / rhythmSnapshot.tickRate);
    }
    lastPlayTimeTickRef.current = rhythmSnapshot.tick;

    if (gameState === 'playing') {
      motionSend({ type: 'TICK', tick: rhythmSnapshot.tick });
      const activeBeforeAdvance = moveQueueRef.current.getSnapshot().active;
      if (mode === 'training' && activeBeforeAdvance) {
        const definition = movesByIntentId.get(activeBeforeAdvance.intentId);
        const progress = activeBeforeAdvance.durationBeats > 0
          ? (rhythmSnapshot.beat - activeBeforeAdvance.startedAtBeat) / activeBeforeAdvance.durationBeats
          : 0;
        const possible = (definition?.stickCueTracks.reduce((sum, track) => sum + track.points.length, 0) ?? 1)
          * PERFECT_STEP_POINTS;
        const nextFeedbacks: TouchStickFeedback[] = [];

        for (const track of definition?.stickCueTracks ?? []) {
          const cue = sampleStickCueStep(track, progress, activeBeforeAdvance.durationBeats, timingWindowBeats);
          if (!cue.active) continue;
          const input = (track.targetInput ?? 'movement') === 'look'
            ? liveInputRef.current.look
            : liveInputRef.current.move;
          const tolerance = cue.tolerance * toleranceMultiplier;
          const distance = Math.hypot(input.x - cue.x, input.y - cue.y);
          if (distance > tolerance) continue;

          const stepKey = `${activeBeforeAdvance.id}:${track.id}:${cue.pointIndex}`;
          if (awardedStickStepsRef.current.has(stepKey)) continue;
          awardedStickStepsRef.current.add(stepKey);

          const distanceRatio = distance / Math.max(Number.EPSILON, tolerance);
          const timingRatio = Math.abs(cue.beatsUntilStep) / Math.max(Number.EPSILON, timingWindowBeats);
          const grade = distanceRatio <= 0.45 && timingRatio <= 0.35 ? 'perfect' : 'good';
          const accumulator = scoreAccumulatorRef.current?.moveId === activeBeforeAdvance.id
            ? scoreAccumulatorRef.current
            : { moveId: activeBeforeAdvance.id, earned: 0, possible };
          const awardedPoints = grade === 'perfect' ? PERFECT_STEP_POINTS : GOOD_STEP_POINTS;
          accumulator.earned += awardedPoints;
          scoreAccumulatorRef.current = accumulator;
          setLoopPoints(accumulator.earned);
          setTotalPoints((points) => points + awardedPoints);
          setMoveScore(Math.round((accumulator.earned / Math.max(1, accumulator.possible)) * 100));
          stickFeedbackSequenceRef.current += 1;
          nextFeedbacks.push({
            stick: track.stick,
            grade,
            sequence: stickFeedbackSequenceRef.current
          });
        }
        if (nextFeedbacks.length > 0) setStickFeedbacks(nextFeedbacks);

        const elapsedBeats = Math.max(0, rhythmSnapshot.beat - lastStaminaBeatRef.current);
        const staminaDrain = elapsedBeats * (
          MOVE_STAMINA_COST / Math.max(Number.EPSILON, activeBeforeAdvance.durationBeats)
        );
        if (staminaDrain > 0) {
          const nextStamina = Math.max(MINIMUM_TRAINING_STAMINA, staminaRef.current - staminaDrain);
          staminaRef.current = nextStamina;
          setStamina(nextStamina);
        }
      }
      lastStaminaBeatRef.current = rhythmSnapshot.beat;
      const transition = moveQueueRef.current.advance(rhythmSnapshot.beat);
      if (transition) {
        awardedStickStepsRef.current.clear();
        const accumulator = scoreAccumulatorRef.current;
        const completedScore = mode === 'training'
          ? (accumulator?.moveId === transition.completed.id
              ? Math.round((accumulator.earned / Math.max(1, accumulator.possible)) * 100)
              : 0)
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
          const staminaReward = scoreToStaminaReward(completedScore ?? 0);
          const nextStamina = Math.max(
            MINIMUM_TRAINING_STAMINA,
            Math.min(MAXIMUM_STAMINA, staminaRef.current + staminaReward)
          );
          staminaRef.current = nextStamina;
          setStamina(nextStamina);
          setLoopPoints(0);
          if (staminaReward > 0.01) {
            staminaRewardSequenceRef.current += 1;
            setStaminaRewardFeedback({
              amount: staminaReward,
              score: completedScore ?? 0,
              sequence: staminaRewardSequenceRef.current
            });
          }

          const shouldEnterStandby = nextStamina <= MINIMUM_TRAINING_STAMINA
            && !started
            && !hasMeaningfulGameplayInput(liveInputRef.current);

          if (!started && !shouldEnterStandby) {
            started = moveQueueRef.current.enqueue(
              transition.completed.family,
              transition.completed.startedAtBeat + transition.completed.durationBeats
            );
          }
          setMoveScore(started ? 0 : (completedScore ?? 0));
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

    const move = movesByIntentId.get(activeMove.intentId);
    if (!move?.stickCueTracks?.length) return [];

    const progress = activeMove.durationBeats > 0
      ? (rhythmSnapshot.beat - activeMove.startedAtBeat) / activeMove.durationBeats
      : 0;

    return move.stickCueTracks.map((track) => {
      const sample = sampleStickCueStep(track, progress, activeMove.durationBeats, timingWindowBeats);
      return {
        id: track.id,
        label: track.label,
        stick: track.stick,
        controllerRole: track.controllerRole,
        targetInput: track.targetInput ?? 'movement',
        points: track.points,
        progress: track.loop ? ((progress % 1) + 1) % 1 : Math.min(1, Math.max(0, progress)),
        sample: { ...sample, tolerance: sample.tolerance * toleranceMultiplier }
      };
    });
  }, [
    moveQueue.active,
    rhythmSnapshot.beat,
    timingWindowBeats,
    toleranceMultiplier
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
        {mode === 'training' ? (
          <button type="button" className="game-training-input-hud__toggle" onClick={tutorial.start}>
            {copy.tutorialButton}
          </button>
        ) : null}
      </div>
      <GameCanvasErrorBoundary>
        <CanvasScene
          gameState={gameState}
          playerMotionState={motionSnapshot}
          animationDefinition={animationDefinition}
          cameraFeel={cameraFeel}
          bpm={bpm}
          onPerformanceUpdate={diagnosticsVisible ? setRenderingDiagnostics : undefined}
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
        renderingDiagnostics={renderingDiagnostics}
        stickCueDiagnostics={stickCueDiagnostics}
        moveQueue={moveQueue}
        stamina={stamina}
        moveScore={moveScore}
        loopPoints={loopPoints}
        totalPoints={totalPoints}
        playTimeSeconds={playTimeSeconds}
        staminaRewardFeedback={staminaRewardFeedback}
        stickFeedbacks={stickFeedbacks}
        tutorialStep={tutorial.state.isActive ? tutorial.state.currentStep : null}
        leftStickTutorial={tutorial.leftStickChallenge}
      />
      {mode === 'training' ? (
        <TrainingTutorialOverlay
          tutorial={tutorial.state}
          copy={copy}
          onAdvance={tutorial.advance}
          onSkip={tutorial.skip}
          leftStickChallenge={tutorial.leftStickChallenge}
        />
      ) : null}
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
