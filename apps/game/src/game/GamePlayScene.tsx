import { useRef, type RefObject } from 'react';
import { useMachine } from '@xstate/react';
import { gameMachine } from './state/gameMachine';
import { useGameStore, type GamePlayMode } from './state/useGameStore';
import CanvasScene from './CanvasScene';
import GameFullscreenToggle from './ui/GameFullscreenToggle';
import GamePlayHUD from './ui/GamePlayHUD';
import type { GameCopy } from './copy';
import { useInputManager } from './input/useInputManager';

interface GamePlaySceneProps {
  mode: GamePlayMode;
  copy: GameCopy;
  rootRef: RefObject<HTMLDivElement | null>;
}

function shouldShowTouchControls() {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  if (params.get('touchControls') === '1' || params.get('inputDebug') === '1') return true;
  if (window.localStorage.getItem('bboyarena:touchControls') === '1') return true;

  return window.matchMedia('(pointer: coarse)').matches;
}

export default function GamePlayScene({ mode, copy, rootRef }: GamePlaySceneProps) {
  const [state, send] = useMachine(gameMachine);
  const openMainMenu = useGameStore((store) => store.openMainMenu);
  const joystickZoneRef = useRef<HTMLDivElement | null>(null);
  const showTouchControls = shouldShowTouchControls();
  const { snapshot: input } = useInputManager({
    enabled: true,
    rootRef,
    joystickZoneRef
  });
  const activeInputSources = Array.from(input.activeSources).join(',');

  return (
    <>
      <button
        type="button"
        className="game-status-pill game-status-pill--interactive"
        onClick={openMainMenu}
        aria-label={copy.backToMenu}
      >
        {copy.playStatus} / {mode} / {typeof state.value === 'string' ? state.value : 'idle'}
      </button>
      <CanvasScene gameState={typeof state.value === 'string' ? state.value : 'idle'} />
      <div
        ref={joystickZoneRef}
        className="game-touch-joystick"
        data-input-ignore="true"
        data-touch-controls={showTouchControls ? 'visible' : 'hidden'}
        data-input-sources={activeInputSources}
        data-input-move-x={input.movement.x.toFixed(2)}
        data-input-move-y={input.movement.y.toFixed(2)}
        aria-hidden="true"
      />
      <GamePlayHUD
        gameState={typeof state.value === 'string' ? state.value : 'idle'}
        send={send}
        onExit={openMainMenu}
        copy={copy}
      />
      <GameFullscreenToggle targetRef={rootRef} />
    </>
  );
}
