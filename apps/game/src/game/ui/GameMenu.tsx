import type { ReactNode } from 'react';
import GamePanel from './GamePanel';

interface GameMenuProps {
  eyebrow: string;
  title: string;
  description: string;
  variant?: 'light' | 'dark' | 'soft' | 'warm';
  className?: string;
  children?: ReactNode;
}

export default function GameMenu({
  eyebrow,
  title,
  description,
  variant = 'light',
  className = '',
  children
}: GameMenuProps) {
  return (
    <GamePanel variant={variant} className={`game-menu ${className}`.trim()}>
      <p className="game-panel__label">{eyebrow}</p>
      <h2 className="game-panel__title">{title}</h2>
      <p className="game-panel__description">{description}</p>
      {children && <div className="game-panel__content">{children}</div>}
    </GamePanel>
  );
}
