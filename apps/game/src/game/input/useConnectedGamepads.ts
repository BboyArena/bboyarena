import { useEffect, useState } from 'react';

export type ConnectedGamepad = {
  index: number;
  id: string;
  mapping: string;
};

function readGamepads(): ConnectedGamepad[] {
  if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') return [];

  return Array.from(navigator.getGamepads())
    .filter((gamepad): gamepad is Gamepad => Boolean(gamepad))
    .map(({ index, id, mapping }) => ({ index, id, mapping }));
}

export function useConnectedGamepads() {
  const [gamepads, setGamepads] = useState<ConnectedGamepad[]>(readGamepads);

  useEffect(() => {
    const sync = () => setGamepads(readGamepads());
    window.addEventListener('gamepadconnected', sync);
    window.addEventListener('gamepaddisconnected', sync);
    const interval = window.setInterval(sync, 1000);
    sync();

    return () => {
      window.removeEventListener('gamepadconnected', sync);
      window.removeEventListener('gamepaddisconnected', sync);
      window.clearInterval(interval);
    };
  }, []);

  return gamepads;
}
