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
import { PlayerIntentResolver, type VariationSelectionSnapshot } from './motion/playerIntentResolver';
import {
  playerMotionMachine,
  selectPlayerMotionSnapshot
} from './motion/playerMotionMachine';
import { createAnimationCatalogSources } from './animation/animationCatalogLoader';
import { animationPlaybackMachine } from './animation/animationPlaybackMachine';
import { PlayerMoveHistory } from './motion/playerMoveHistory';
import { useRhythmClock, useRhythmClockSnapshot } from './rhythm/RhythmClockProvider';

interface GamePlaySceneProps {
  mode: GamePlayMode;
  copy: GameCopy;
}

function GameInputSceneBindings({ gameState, send }: { gameState: string; send: (event: { type: string }) => void }) {
  const activeInputSource = useResolveActiveInputSource();
  const snapshot = useGameInputSnapshot();
  const previousSnapshotRef = useRef(snapshot);

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
      {activeInputSource === 'gamepad' ? <GamepadInputAdapter /> : null}
      {activeInputSource === 'keyboardMouse' ? <KeyboardMouseInputAdapter /> : null}
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
  const intentResolverRef = useRef(new PlayerIntentResolver());
  const previousMotionInputRef = useRef(snapshot);
  const previousGameStateRef = useRef(gameState);
  const requestSequenceRef = useRef(0);
  const lastAnimationIntentRef = useRef<string | null>(null);
  const moveHistoryRef = useRef(new PlayerMoveHistory());
  const [moveHistory, setMoveHistory] = useState(() => moveHistoryRef.current.getSnapshot());
  const [variationSelection, setVariationSelection] = useState<VariationSelectionSnapshot>(null);
  const [diagnosticsVisible, setDiagnosticsVisible] = useState(true);

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
      intentResolverRef.current.reset();
      setVariationSelection(null);
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
      for (const intent of intentResolverRef.current.advance(rhythmSnapshot.beat)) {
        motionSend({ type: 'INTENT', intent, tick: rhythmSnapshot.tick });
      }
      setVariationSelection(intentResolverRef.current.getSelectionSnapshot());
    }
  }, [gameState, motionSend, rhythmSnapshot.beat, rhythmSnapshot.tick]);

  useEffect(() => {
    const previousSnapshot = previousMotionInputRef.current;
    previousMotionInputRef.current = snapshot;

    if (gameState !== 'playing') return;

    for (const intent of intentResolverRef.current.resolve(previousSnapshot, snapshot, rhythmClock.getSnapshot().beat)) {
      motionSend({ type: 'INTENT', intent, tick: rhythmClock.getSnapshot().tick });
    }
    setVariationSelection(intentResolverRef.current.getSelectionSnapshot());
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
        {mode === 'training' ? (
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
        variationSelection={variationSelection}
        diagnosticsVisible={diagnosticsVisible}
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
