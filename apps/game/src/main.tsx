import React from 'react';
import { createRoot } from 'react-dom/client';
import GameApp from './game/GameApp';
import './standalone.css';

const mountNode = document.getElementById('bboyarena-game-standalone');

if (!mountNode) {
  throw new Error('Missing #bboyarena-game-standalone mount node.');
}

const gameLocale = document.documentElement.lang || window.navigator.language || 'en-US';
const isEmbedded = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

createRoot(mountNode).render(
  <React.StrictMode>
    <GameApp locale={gameLocale} enableCreatorMode={!isEmbedded} />
  </React.StrictMode>
);
