import { useEffect, useRef } from 'react';
import { useGameStore } from '../state/useGameStore';
import { useRhythmClock } from '../rhythm/RhythmClockProvider';

const TRACK_URL = `${import.meta.env.BASE_URL}audio/saturday-afternoon-sole.mp3`;

export default function GameMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const internalMusicEnabled = useGameStore((state) => state.internalMusicEnabled);
  const selectedMode = useGameStore((state) => state.selectedMode);
  const trainingAudioMode = useGameStore((state) => state.trainingAudioMode);
  const rhythmClock = useRhythmClock();
  const shouldPlay = internalMusicEnabled && (selectedMode !== 'training' || trainingAudioMode === 'internal');

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

    if (!shouldPlay) {
      audio.pause();
      return removeUnlockListeners;
    }

    void audio.play().catch(() => {
      window.addEventListener('pointerdown', unlockAudio, { once: true });
      window.addEventListener('keydown', unlockAudio, { once: true });
    });

    return removeUnlockListeners;
  }, [shouldPlay]);

  return (
    <audio
      ref={audioRef}
      src={TRACK_URL}
      autoPlay
      loop
      muted={!shouldPlay}
      preload="auto"
      onPlay={() => rhythmClock.reset()}
    />
  );
}
