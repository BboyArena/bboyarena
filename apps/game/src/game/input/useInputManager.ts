import { useEffect, useRef, type RefObject } from 'react';
import { InputManager } from './InputManager';
import { useInputStore } from '../state/useInputStore';

interface UseInputManagerOptions {
  enabled?: boolean;
  rootRef: RefObject<HTMLElement | null>;
  joystickZoneRef: RefObject<HTMLElement | null>;
}

export function useInputManager({ enabled = true, rootRef, joystickZoneRef }: UseInputManagerOptions) {
  const managerRef = useRef<InputManager | null>(null);
  const snapshot = useInputStore((state) => state.snapshot);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;
    const inputStore = useInputStore.getState();

    const inputManager = new InputManager({
      keyboardTarget: window,
      pointerTarget: rootRef.current ?? undefined,
      gestureTarget: rootRef.current ?? undefined,
      joystickZone: joystickZoneRef.current
    });

    managerRef.current = inputManager;
    const unsubscribe = inputManager.subscribe(inputStore.setSnapshot);
    inputManager.start();

    return () => {
      unsubscribe();
      inputManager.dispose();
      managerRef.current = null;
      useInputStore.getState().resetSnapshot();
    };
  }, [enabled, rootRef, joystickZoneRef]);

  return { manager: managerRef.current, snapshot };
}
