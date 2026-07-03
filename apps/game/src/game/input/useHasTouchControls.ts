import { useEffect, useState } from 'react';

function detectTouchControls() {
  if (typeof window === 'undefined') return false;

  if (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches) {
    return true;
  }

  return 'ontouchstart' in window;
}

export function useHasTouchControls(): boolean {
  const [hasTouchControls, setHasTouchControls] = useState(() => detectTouchControls());

  useEffect(() => {
    setHasTouchControls(detectTouchControls());
  }, []);

  return hasTouchControls;
}
