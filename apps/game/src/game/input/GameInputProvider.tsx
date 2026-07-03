import { createContext, useContext, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { GameInputController } from './GameInputController';
import type { GameInputSnapshot } from './gameInputTypes';

const GameInputControllerContext = createContext<GameInputController | null>(null);

interface GameInputProviderProps {
  children: ReactNode;
}

export function GameInputProvider({ children }: GameInputProviderProps) {
  const controllerRef = useRef<GameInputController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new GameInputController();
  }

  return (
    <GameInputControllerContext.Provider value={controllerRef.current}>
      {children}
    </GameInputControllerContext.Provider>
  );
}

export function useGameInputController(): GameInputController {
  const controller = useContext(GameInputControllerContext);

  if (!controller) {
    throw new Error('useGameInputController must be used within a GameInputProvider');
  }

  return controller;
}

export function useGameInputSnapshot(): GameInputSnapshot {
  const controller = useGameInputController();

  return useSyncExternalStore(controller.subscribe, () => controller.getSnapshot(), () =>
    controller.getSnapshot()
  );
}
