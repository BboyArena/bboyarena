import { useEffect } from 'react';
import { useGameInputController } from './GameInputProvider';
import { useGameStore } from '../state/useGameStore';
import { normalizeInputVector, type GameInputButtonId, type GameInputVector } from './gameInputTypes';

const keyToMoveDirection: Record<string, Partial<GameInputVector>> = {
  KeyW: { y: 1 },
  KeyS: { y: -1 },
  KeyA: { x: -1 },
  KeyD: { x: 1 }
};

const keyToLookDirection: Record<string, Partial<GameInputVector>> = {
  ArrowUp: { y: 1 },
  ArrowDown: { y: -1 },
  ArrowLeft: { x: -1 },
  ArrowRight: { x: 1 }
};

export default function KeyboardMouseInputAdapter() {
  const controller = useGameInputController();
  const keyboardInputMap = useGameStore((state) => state.keyboardInputMap);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const pressedKeys = new Set<string>();
    const pressedButtons = new Set<GameInputButtonId>();
    let mouseLookPointerId: number | null = null;
    let mouseLookVector: GameInputVector | null = null;

    const syncVector = (mapping: Record<string, Partial<GameInputVector>>, channel: 'move' | 'look') => {
      const vector: GameInputVector = { x: 0, y: 0 };

      pressedKeys.forEach((code) => {
        const direction = mapping[code];
        if (!direction) return;

        vector.x += direction.x ?? 0;
        vector.y += direction.y ?? 0;
      });

      const normalized = normalizeInputVector(vector);
      if (channel === 'move') controller.updateMove('keyboardMouse', normalized);
      else controller.updateLook('keyboardMouse', normalized);
    };
    const syncMove = () => syncVector(keyToMoveDirection, 'move');
    const syncLook = () => {
      if (mouseLookVector) {
        controller.updateLook('keyboardMouse', mouseLookVector);
        return;
      }
      syncVector(keyToLookDirection, 'look');
    };

    const updateMouseLook = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const canvas = target?.closest('.game-canvas__surface') ?? document.querySelector('.game-canvas__surface');
      if (!(canvas instanceof HTMLElement)) return;
      const rect = canvas.getBoundingClientRect();
      mouseLookVector = normalizeInputVector({
        x: ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
        y: 1 - ((event.clientY - rect.top) / Math.max(1, rect.height)) * 2
      });
      syncLook();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 2) return;
      const target = event.target instanceof Element ? event.target : null;
      if (!target?.closest('.game-canvas__surface')) return;
      event.preventDefault();
      mouseLookPointerId = event.pointerId;
      updateMouseLook(event);
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== mouseLookPointerId) return;
      event.preventDefault();
      updateMouseLook(event);
    };
    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerId !== mouseLookPointerId) return;
      mouseLookPointerId = null;
      mouseLookVector = null;
      syncLook();
    };
    const preventCanvasContextMenu = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('.game-canvas__surface')) event.preventDefault();
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

      if (!pressedKeys.has(event.code) && (keyToMoveDirection[event.code] || keyToLookDirection[event.code])) {
        pressedKeys.add(event.code);
        if (keyToMoveDirection[event.code]) syncMove();
        if (keyToLookDirection[event.code]) syncLook();
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
        if (keyToMoveDirection[event.code]) syncMove();
        if (keyToLookDirection[event.code]) syncLook();
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('contextmenu', preventCanvasContextMenu);
    const reset = () => {
      pressedKeys.clear();
      pressedButtons.clear();
      mouseLookPointerId = null;
      mouseLookVector = null;
      controller.resetSource('keyboardMouse');
    };
    const resetWhenHidden = () => {
      if (document.visibilityState !== 'visible') reset();
    };
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', resetWhenHidden);
    syncMove();
    syncLook();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('contextmenu', preventCanvasContextMenu);
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', resetWhenHidden);
      reset();
    };
  }, [controller, keyboardInputMap]);

  return null;
}
