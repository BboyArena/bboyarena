import { useEffect } from 'react';
import { useGameStore } from '../state/useGameStore';
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
  const currentInputSource = useGameStore((state) => state.activeInputSource);
  const hasTouchControls = useHasTouchControls();
  const setActiveInputSource = useGameStore((state) => state.setActiveInputSource);
  const setTouchControlsVisible = useGameStore((state) => state.setTouchControlsVisible);

  const activeInputSource: ActiveInputSource = preferredInputMode === 'auto'
    ? currentInputSource
    : preferredInputMode;

  const touchControlsVisible = (
    (preferredInputMode === 'auto' && hasTouchControls) || preferredInputMode === 'touch'
  ) || getDevTouchOverride();

  useEffect(() => {
    if (preferredInputMode !== 'auto') setActiveInputSource(activeInputSource);
    setTouchControlsVisible(touchControlsVisible);
  }, [activeInputSource, preferredInputMode, setActiveInputSource, setTouchControlsVisible, touchControlsVisible]);

  return activeInputSource;
}
