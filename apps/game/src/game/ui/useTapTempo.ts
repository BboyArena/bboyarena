import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../state/useGameStore';

const FALLBACK_BPM = 100;
const RESET_AFTER_MS = 3_000;
const MIN_INTERVAL_MS = 60_000 / 180;

function normalizeBpm(value: number) {
  let bpm = value;
  while (bpm < 60) bpm *= 2;
  while (bpm > 180) bpm /= 2;
  return Math.round(bpm);
}

export function useTapTempo(enabled: boolean) {
  const bpm = useGameStore((state) => state.bpm);
  const setBpm = useGameStore((state) => state.setBpm);
  const firstTapRef = useRef<number | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isArmed, setIsArmed] = useState(false);
  const [isTooFast, setIsTooFast] = useState(false);

  const arm = (timestamp: number) => {
    firstTapRef.current = timestamp;
    setIsArmed(true);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      firstTapRef.current = null;
      resetTimerRef.current = null;
      setIsArmed(false);
      setIsTooFast(false);
      setBpm(FALLBACK_BPM);
    }, RESET_AFTER_MS);
  };

  useEffect(() => {
    if (!enabled) return;
    setBpm(FALLBACK_BPM);

    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
      firstTapRef.current = null;
      setIsArmed(false);
      setIsTooFast(false);
    };
  }, [enabled, setBpm]);

  const tap = () => {
    if (!enabled) return;
    const now = performance.now();

    if (firstTapRef.current === null || now - firstTapRef.current > RESET_AFTER_MS) {
      setIsTooFast(false);
      arm(now);
      return;
    }

    const interval = now - firstTapRef.current;
    if (interval < MIN_INTERVAL_MS) {
      setIsTooFast(true);
      arm(now);
      return;
    }

    firstTapRef.current = null;
    setIsArmed(false);
    setIsTooFast(false);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = null;
    setBpm(normalizeBpm(60_000 / interval));
  };

  return { bpm, isArmed, isTooFast, tap };
}
