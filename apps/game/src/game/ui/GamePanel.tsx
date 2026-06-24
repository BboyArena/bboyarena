import type { ReactNode } from 'react';

interface GamePanelProps {
  variant?: 'light' | 'dark' | 'soft' | 'warm';
  overflow?: 'hidden' | 'auto' | 'visible';
  className?: string;
  children: ReactNode;
}

export default function GamePanel({ variant = 'light', overflow = 'hidden', className = '', children }: GamePanelProps) {
  const classes = ['game-panel', 'font-game', `game-panel--${variant}`, className].filter(Boolean).join(' ');

  return (
    <div className={classes} data-overflow={overflow}>
      {children}
    </div>
  );
}
