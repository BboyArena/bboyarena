import type { RefObject } from 'react';
import { useMachine } from '@xstate/react';
import { gameMachine } from './state/gameMachine';
import { useGameStore, type GamePlayMode } from './state/useGameStore';
import CanvasScene from './CanvasScene';
import GameFullscreenToggle from './ui/GameFullscreenToggle';
import GamePlayHUD from './ui/GamePlayHUD';
import type { GameCopy } from './copy';

interface GamePlaySceneProps {
  mode: GamePlayMode;
  copy: GameCopy;
  rootRef: RefObject<HTMLDivElement | null>;
}

export default function GamePlayScene({ mode, copy, rootRef }: GamePlaySceneProps) {
  const [state, send] = useMachine(gameMachine);
  const openMainMenu = useGameStore((store) => store.openMainMenu);

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
