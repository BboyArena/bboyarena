import { useEffect, useState } from 'react';

function detectGamepadAvailability() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  if (typeof navigator.getGamepads !== 'function') return false;

  return Array.from(navigator.getGamepads()).some(Boolean);
}

export function useGamepadAvailability(): boolean {
  const [hasGamepad, setHasGamepad] = useState(() => detectGamepadAvailability());

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return undefined;

    let interval = 0;

    const syncAvailability = () => {
      const nextValue = detectGamepadAvailability();
      setHasGamepad((current) => (current === nextValue ? current : nextValue));
    };

    const handleGamepadChange = () => {
      syncAvailability();
    };

    window.addEventListener('gamepadconnected', handleGamepadChange);
    window.addEventListener('gamepaddisconnected', handleGamepadChange);
    syncAvailability();
    interval = window.setInterval(syncAvailability, 1000);

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadChange);
      window.removeEventListener('gamepaddisconnected', handleGamepadChange);
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, []);

  return hasGamepad;
}
