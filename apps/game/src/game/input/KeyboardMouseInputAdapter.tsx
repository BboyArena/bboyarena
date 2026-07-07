import { useEffect } from 'react';
import { useGameInputController } from './GameInputProvider';
import { useGameStore } from '../state/useGameStore';
import { normalizeInputVector, type GameInputButtonId, type GameInputVector } from './gameInputTypes';

const keyToDirection: Record<string, Partial<GameInputVector>> = {
  KeyW: { y: 1 },
  ArrowUp: { y: 1 },
  KeyS: { y: -1 },
  ArrowDown: { y: -1 },
  KeyA: { x: -1 },
  ArrowLeft: { x: -1 },
  KeyD: { x: 1 },
  ArrowRight: { x: 1 }
};

export default function KeyboardMouseInputAdapter() {
  const controller = useGameInputController();
  const keyboardInputMap = useGameStore((state) => state.keyboardInputMap);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const pressedKeys = new Set<string>();
    const pressedButtons = new Set<GameInputButtonId>();

    const syncMove = () => {
      const vector: GameInputVector = { x: 0, y: 0 };

      pressedKeys.forEach((code) => {
        const direction = keyToDirection[code];
        if (!direction) return;

        vector.x += direction.x ?? 0;
        vector.y += direction.y ?? 0;
      });

      controller.updateMove('keyboardMouse', normalizeInputVector(vector));
    };

    const syncButton = (button: GameInputButtonId, pressed: boolean) => {
      if (pressed) {
        pressedButtons.add(button);
      } else {
        pressedButtons.delete(button);
      }

      controller.updateButton('keyboardMouse', button, pressed);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const button = Object.entries(keyboardInputMap).find(([, code]) => code === event.code)?.[0] as GameInputButtonId | undefined;
      if (button) {
        if (!pressedButtons.has(button)) {
          syncButton(button, true);
        }
        event.preventDefault();
      }

      if (!pressedKeys.has(event.code) && keyToDirection[event.code]) {
        pressedKeys.add(event.code);
        syncMove();
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const button = Object.entries(keyboardInputMap).find(([, code]) => code === event.code)?.[0] as GameInputButtonId | undefined;
      if (button && pressedButtons.has(button)) {
        syncButton(button, false);
        event.preventDefault();
      }

      if (pressedKeys.delete(event.code)) {
        syncMove();
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    const reset = () => {
      pressedKeys.clear();
      pressedButtons.clear();
      controller.resetSource('keyboardMouse');
    };
    const resetWhenHidden = () => {
      if (document.visibilityState !== 'visible') reset();
    };
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', resetWhenHidden);
    syncMove();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', resetWhenHidden);
      reset();
    };
  }, [controller, keyboardInputMap]);

  return null;
}
