import { useEffect, useState, type RefObject } from 'react';
import GameButton from './GameButton';

interface GameFullscreenToggleProps {
  targetRef: RefObject<HTMLElement | null>;
}

export default function GameFullscreenToggle({ targetRef }: GameFullscreenToggleProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const syncFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement && document.fullscreenElement === targetRef.current));
    };

    setIsSupported(Boolean(document.fullscreenEnabled) && Boolean(targetRef.current?.requestFullscreen));
    syncFullscreen();
    document.addEventListener('fullscreenchange', syncFullscreen);

    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, [targetRef]);

  const toggleFullscreen = async () => {
    const target = targetRef.current;
    if (!target) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    if (target.requestFullscreen) {
      await target.requestFullscreen();
    }
  };

  return (
    <div className="game-fullscreen-toggle">
      <GameButton
        variant="ghost"
        className="game-fullscreen-toggle__button"
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        aria-disabled={!isSupported}
        disabled={!isSupported}
        onClick={toggleFullscreen}
      >
        <span aria-hidden="true">{isFullscreen ? '⤡' : '⤢'}</span>
      </GameButton>
    </div>
  );
}
