import { useEffect, useMemo } from 'react';
import { useGameStore } from '../state/useGameStore';
import { useGamepadAvailability } from './useGamepadAvailability';
import { useHasTouchControls } from './useHasTouchControls';
import type { ActiveInputSource } from './gameInputTypes';

function getDevTouchOverride() {
  if (typeof window === 'undefined') return false;

  if (import.meta.env.DEV) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('touchControls') === '1' || params.get('inputDebug') === '1') return true;
    if (window.localStorage.getItem('bboyarena:touchControls') === '1') return true;
  }

  return false;
}

export function useResolveActiveInputSource(): ActiveInputSource {
  const preferredInputMode = useGameStore((state) => state.preferredInputMode);
  const hasTouchControls = useHasTouchControls();
  const hasGamepad = useGamepadAvailability();
  const setActiveInputSource = useGameStore((state) => state.setActiveInputSource);
  const setTouchControlsVisible = useGameStore((state) => state.setTouchControlsVisible);

  const activeInputSource = useMemo<ActiveInputSource>(() => {
    if (preferredInputMode !== 'auto') {
      return preferredInputMode;
    }

    if (hasTouchControls) {
      return 'touch';
    }

    if (hasGamepad) {
      return 'gamepad';
    }

    return 'keyboardMouse';
  }, [hasGamepad, hasTouchControls, preferredInputMode]);

  const touchControlsVisible = activeInputSource === 'touch' || getDevTouchOverride();

  useEffect(() => {
    setActiveInputSource(activeInputSource);
    setTouchControlsVisible(touchControlsVisible);
  }, [activeInputSource, setActiveInputSource, setTouchControlsVisible, touchControlsVisible]);

  return activeInputSource;
}
