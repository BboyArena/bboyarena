import { useEffect, useRef } from 'react';
import { useGameStore } from '../state/useGameStore';
import { useRhythmClock } from '../rhythm/RhythmClockProvider';

const TRACK_URL = `${import.meta.env.BASE_URL}audio/saturday-afternoon-sole.mp3`;

export default function GameMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMuted = useGameStore((state) => state.isMuted);
  const rhythmClock = useRhythmClock();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const removeUnlockListeners = () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    const unlockAudio = () => {
      void audio.play().then(removeUnlockListeners).catch(() => undefined);
    };

    void audio.play().catch(() => {
      window.addEventListener('pointerdown', unlockAudio, { once: true });
      window.addEventListener('keydown', unlockAudio, { once: true });
    });

    return removeUnlockListeners;
  }, []);

  return (
    <audio
      ref={audioRef}
      src={TRACK_URL}
      autoPlay
      loop
      muted={isMuted}
      preload="auto"
      onPlay={() => rhythmClock.reset()}
    />
  );
}
