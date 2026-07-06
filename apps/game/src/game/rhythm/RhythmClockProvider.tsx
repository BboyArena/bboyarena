import {
  createContext,
  useContext,
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
    return () => window.cancelAnimationFrame(frame);
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
