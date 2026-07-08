import { useEffect, useRef } from 'react';
import { useRhythmClock, useRhythmClockSnapshot } from '../rhythm/RhythmClockProvider';

function playClick(audioContext: AudioContext, accented: boolean) {
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(accented ? 1200 : 820, now);
  gain.gain.setValueAtTime(accented ? 0.2 : 0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.06);
}

export default function ManualMetronome() {
  const rhythmClock = useRhythmClock();
  const { beatIndex } = useRhythmClockSnapshot();
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastBeatRef = useRef<number | null>(null);

  useEffect(() => {
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    rhythmClock.reset();

    const unlock = () => {
      void audioContext.resume().then(() => {
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
      }).catch(() => undefined);
    };

    void audioContext.resume().catch(() => undefined);
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      audioContextRef.current = null;
      void audioContext.close();
    };
  }, [rhythmClock]);

  useEffect(() => {
    if (lastBeatRef.current === beatIndex) return;
    lastBeatRef.current = beatIndex;
    const audioContext = audioContextRef.current;
    if (!audioContext || audioContext.state !== 'running') return;
    playClick(audioContext, beatIndex % 4 === 0);
  }, [beatIndex]);

  return null;
}
