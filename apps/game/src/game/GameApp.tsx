import { useEffect, useRef, useState } from 'react';
import { useGameStore, type GameMenuScreen } from './state/useGameStore';
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
  const screen = useGameStore((state) => state.screen);
  const selectedMode = useGameStore((state) => state.selectedMode);
  const setScreen = useGameStore((state) => state.setScreen);
  const isDev = import.meta.env.DEV;

  const cycleScreen = () => {
    const menuScreens: GameMenuScreen[] = ['splashscreen', 'mainMenu', 'settings', 'credits'];
    const currentIndex = menuScreens.indexOf(screen as GameMenuScreen);
    const nextScreen = menuScreens[(currentIndex + 1) % menuScreens.length];
    setScreen(nextScreen);
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

  console.log('GameApp: rendering screen', screen, 'with mode', selectedMode, 'and locale', resolvedLocale);
  return (
    <div id="bboyarena-game-root" className="bboy-game-root" ref={rootRef}>
      <div className="game-shell">
        <div className="game-stage" data-scene={screen}>
          {screen === 'career' || screen === 'training' ? (
            <GamePlayScene mode={selectedMode} copy={copy} rootRef={rootRef} />
          ) : (
            <>
              {isDev ? (
                <button
                  type="button"
                  className="game-status-pill game-status-pill--interactive"
                  onClick={cycleScreen}
                  aria-label={copy.sceneSelector}
                >
                  {copy.sceneSelector} / {screen}
                </button>
              ) : null}
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
