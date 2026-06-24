import type { ReactNode } from 'react';

interface GameScrollAreaProps {
  className?: string;
  children: ReactNode;
}

export default function GameScrollArea({ className = '', children }: GameScrollAreaProps) {
  const classes = ['game-scroll-area', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className="game-scroll-area__viewport">{children}</div>
    </div>
  );
}
