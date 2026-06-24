import { useEffect, useRef, useState } from 'react';
import { useGameStore, type GameMenuScene } from './state/useGameStore';
import GameFullscreenToggle from './ui/GameFullscreenToggle';
import GameFullscreenReticle from './ui/GameFullscreenReticle';
import GameHUD from './ui/GameHUD';
import GamePlayScene from './GamePlayScene';
import { getDefaultGameCopy, loadGameCopy, type GameCopy, type LocaleCode } from './copy';
import './game.css';

interface GameAppProps {
  locale?: LocaleCode | string;
}

export default function GameApp({ locale = 'en-US' }: GameAppProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [copy, setCopy] = useState<GameCopy>(() => getDefaultGameCopy());
  const [resolvedLocale, setResolvedLocale] = useState<LocaleCode>('en-US');
  const scene = useGameStore((state) => state.scene);
  const selectedMode = useGameStore((state) => state.selectedMode);
  const setScene = useGameStore((state) => state.setScene);

  const cycleScene = () => {
    const menuScenes: GameMenuScene[] = ['splashscreen', 'mainMenu', 'settings', 'credits'];
    const currentIndex = menuScenes.indexOf(scene as GameMenuScene);
    const nextScene = menuScenes[(currentIndex + 1) % menuScenes.length];
    setScene(nextScene);
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const syncViewportHeight = () => {
      root.style.setProperty('--game-viewport-height', `${window.innerHeight}px`);
    };

    syncViewportHeight();
    window.addEventListener('resize', syncViewportHeight);

    return () => window.removeEventListener('resize', syncViewportHeight);
  }, []);

  useEffect(() => {
    let isMounted = true;

    loadGameCopy(locale).then((loadedCopy) => {
      if (!isMounted) return;
      setCopy(loadedCopy.copy);
      setResolvedLocale(loadedCopy.locale);
    });

    return () => {
      isMounted = false;
    };
  }, [locale]);

  console.log('GameApp: rendering scene', scene, 'with mode', selectedMode, 'and locale', resolvedLocale);
  return (
    <div id="bboyarena-game-root" className="bboy-game-root" ref={rootRef}>
      <div className="game-shell">
        <div className="game-stage" data-scene={scene}>
          {scene === 'career' || scene === 'training' ? (
            <GamePlayScene mode={selectedMode} copy={copy} rootRef={rootRef} />
          ) : (
            <>
              <button
                type="button"
                className="game-status-pill game-status-pill--interactive"
                onClick={cycleScene}
                aria-label={copy.sceneSelector}
              >
                {copy.sceneSelector} / {scene}
              </button>
              <GameHUD copy={copy} />
              <GameFullscreenToggle targetRef={rootRef} />
            </>
          )}
          <GameFullscreenReticle targetRef={rootRef} />
        </div>
      </div>
    </div>
  );
}
