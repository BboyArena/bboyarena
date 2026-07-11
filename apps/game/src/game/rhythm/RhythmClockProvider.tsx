import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode
} from 'react';
import { useGameStore } from '../state/useGameStore';
import { RhythmClock, type RhythmClockSnapshot } from './RhythmClock';

const RhythmClockContext = createContext<RhythmClock | null>(null);

export function RhythmClockProvider({ children }: { children: ReactNode }) {
  const bpm = useGameStore((state) => state.bpm);
  const clockRef = useRef<RhythmClock | null>(null);

  if (clockRef.current === null) {
    clockRef.current = new RhythmClock(bpm);
  }

  useEffect(() => {
    clockRef.current?.setBpm(bpm);
  }, [bpm]);

  useEffect(() => {
    const clock = clockRef.current;
    if (clock === null || typeof window === 'undefined') return undefined;

    let frame = 0;
    let previousTime: number | null = null;

    const update = (time: number) => {
      if (previousTime !== null) {
        clock.advance(time - previousTime);
      }
      previousTime = time;
      frame = window.requestAnimationFrame(update);
    };

    frame = window.requestAnimationFrame(update);
    const resetFrameOrigin = () => {
      previousTime = null;
    };
    document.addEventListener('visibilitychange', resetFrameOrigin);
    window.addEventListener('pageshow', resetFrameOrigin);
    window.addEventListener('pagehide', resetFrameOrigin);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', resetFrameOrigin);
      window.removeEventListener('pageshow', resetFrameOrigin);
      window.removeEventListener('pagehide', resetFrameOrigin);
    };
  }, []);

  return (
    <RhythmClockContext.Provider value={clockRef.current}>
      {children}
    </RhythmClockContext.Provider>
  );
}

export function useRhythmClock(): RhythmClock {
  const clock = useContext(RhythmClockContext);
  if (clock === null) {
    throw new Error('useRhythmClock must be used within RhythmClockProvider.');
  }
  return clock;
}

export function useRhythmClockSnapshot(): RhythmClockSnapshot {
  const clock = useRhythmClock();
  return useSyncExternalStore(clock.subscribe, clock.getSnapshot, clock.getSnapshot);
}

export function useRhythmClockSnapshotAtFps(fps: number): RhythmClockSnapshot {
  const clock = useRhythmClock();
  const minimumFrameMs = 1000 / Math.max(1, fps);
  const lastNotifiedAtRef = useRef(0);

  const subscribe = useCallback((listener: () => void) => clock.subscribe(() => {
    const now = typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
    if (now - lastNotifiedAtRef.current < minimumFrameMs) return;

    lastNotifiedAtRef.current = now;
    listener();
  }), [clock, minimumFrameMs]);

  return useSyncExternalStore(subscribe, clock.getSnapshot, clock.getSnapshot);
}
