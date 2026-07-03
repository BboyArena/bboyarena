import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useMachine } from '@xstate/react';
import { gameMachine } from './state/gameMachine';
import { useGameStore, type GamePlayMode } from './state/useGameStore';
import CanvasScene from './CanvasScene';
import GamePlayHUD from './ui/GamePlayHUD';
import type { GameCopy } from './copy';
import { GameInputProvider, useGameInputSnapshot } from './input/GameInputProvider';
import GamepadInputAdapter from './input/GamepadInputAdapter';
import KeyboardMouseInputAdapter from './input/KeyboardMouseInputAdapter';
import { useResolveActiveInputSource } from './input/useResolveActiveInputSource';
import { createDefaultPlayerMotionState, type PlayerMotionState } from './state/playerMotionState';

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
  const bpm = useGameStore((store) => store.bpm);
  const snapshot = useGameInputSnapshot();
  const gameState = typeof state.value === 'string' ? state.value : 'idle';

  const playerMotionState: PlayerMotionState = useMemo(() => {
    const motionState = createDefaultPlayerMotionState();
    const moveAxis = new THREE.Vector3(snapshot.move.x, 1, snapshot.move.y);

    motionState.moveIntent = {
      x: snapshot.move.x,
      y: snapshot.move.y
    };
    motionState.rotationAxis = snapshot.move.x !== 0 || snapshot.move.y !== 0 ? moveAxis.normalize() : motionState.rotationAxis;
    motionState.balance = gameState === 'paused' ? 0.92 : gameState === 'playing' ? 0.98 : 1;
    motionState.spinSpeed = gameState === 'playing' ? bpm / 34 : gameState === 'paused' ? 0.18 : 0.3;
    motionState.currentMove =
      gameState === 'playing'
        ? snapshot.buttons.primary.pressed
          ? 'spinStart'
          : 'toprock'
        : gameState === 'paused'
          ? 'freeze'
          : 'idle';

    return motionState;
  }, [bpm, gameState, snapshot.buttons.primary.pressed, snapshot.move.x, snapshot.move.y]);

  return (
    <>
      <GameInputSceneBindings gameState={gameState} send={send} />
      <button
        type="button"
        className="game-status-pill game-status-pill--interactive"
        onClick={openMainMenu}
        aria-label={copy.backToMenu}
      >
        {copy.playStatus} / {mode} / {gameState}
      </button>
      <CanvasScene gameState={gameState} playerMotionState={playerMotionState} />
      <GamePlayHUD mode={mode} gameState={gameState} send={send} onExit={openMainMenu} copy={copy} />
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
