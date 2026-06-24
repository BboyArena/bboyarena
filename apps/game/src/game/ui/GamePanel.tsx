import type { ReactNode } from 'react';

interface GamePanelProps {
  variant?: 'light' | 'dark' | 'soft' | 'warm';
  className?: string;
  children: ReactNode;
}

export default function GamePanel({ variant = 'light', className = '', children }: GamePanelProps) {
  const classes = ['game-panel', 'font-game', `game-panel--${variant}`, className].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
}
