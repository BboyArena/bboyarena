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
import { sampleStickCueTrack } from './move/stickCueTracks';
import { getMoveQueueFamilyForButton, MoveQueueController } from './move/MoveQueueController';
import type { GameInputButtonId } from './input/gameInputTypes';

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
  const previousGameStateRef = useRef(gameState);
  const requestSequenceRef = useRef(0);
  const lastAnimationIntentRef = useRef<string | null>(null);
  const moveHistoryRef = useRef(new PlayerMoveHistory());
  const [moveHistory, setMoveHistory] = useState(() => moveHistoryRef.current.getSnapshot());
  const moveQueueRef = useRef(new MoveQueueController());
  const [moveQueue, setMoveQueue] = useState(() => moveQueueRef.current.getSnapshot());
  const [diagnosticsVisible, setDiagnosticsVisible] = useState(import.meta.env.DEV);

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
      const transition = moveQueueRef.current.advance(rhythmSnapshot.beat);
      if (transition) {
        if (moveHistoryRef.current.completeActive(rhythmSnapshot.tick)) {
          setMoveHistory(moveHistoryRef.current.getSnapshot());
        }
        animationSend({ type: 'animation.complete', completedAtTick: rhythmSnapshot.tick });
        motionSend({
          type: 'INTENT',
          intent: { type: 'motion.release', intentId: transition.completed.intentId },
          tick: rhythmSnapshot.tick
        });
        lastAnimationIntentRef.current = null;
        if (transition.started) {
          motionSend({
            type: 'INTENT',
            intent: { type: 'motion.perform', intentId: transition.started.intentId },
            tick: rhythmSnapshot.tick
          });
        }
        setMoveQueue(moveQueueRef.current.getSnapshot());
      }
    }
  }, [animationSend, gameState, motionSend, rhythmSnapshot.beat, rhythmSnapshot.tick]);

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
  }, [gameState, motionSend, rhythmClock, snapshot]);

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
      sample: sampleStickCueTrack(track, progress)
    }));
  }, [
    moveQueue.active,
    rhythmSnapshot.beat
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
