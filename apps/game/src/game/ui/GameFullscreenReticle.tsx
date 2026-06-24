import { useEffect, useState, type RefObject } from 'react';

interface GameFullscreenReticleProps {
  targetRef: RefObject<HTMLElement | null>;
}

export default function GameFullscreenReticle({ targetRef }: GameFullscreenReticleProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement && document.fullscreenElement === targetRef.current));
    };

    const updatePointer = (event: PointerEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    updateFullscreen();
    document.addEventListener('fullscreenchange', updateFullscreen);
    document.addEventListener('pointermove', updatePointer);

    return () => {
      document.removeEventListener('fullscreenchange', updateFullscreen);
      document.removeEventListener('pointermove', updatePointer);
    };
  }, [targetRef]);

  if (!isFullscreen) return null;

  return (
    <div
      className="game-fullscreen-reticle"
      style={{
        ['--reticle-x' as string]: `${position.x}px`,
        ['--reticle-y' as string]: `${position.y}px`
      }}
      aria-hidden="true"
    >
      <span className="game-fullscreen-reticle__ring" />
      <span className="game-fullscreen-reticle__dot" />
    </div>
  );
}
