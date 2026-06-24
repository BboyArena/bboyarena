import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'warm' | 'ghost';
  fullWidth?: boolean;
  active?: boolean;
  children: ReactNode;
}

export default function GameButton({
  variant = 'secondary',
  fullWidth = false,
  active = false,
  className = '',
  type = 'button',
  children,
  ...rest
}: GameButtonProps) {
  const classes = [
    'game-button',
    'font-game motion-reduce:transition-none',
    `game-button--${variant}`,
    fullWidth ? 'game-button--full' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button {...rest} type={type} className={classes} data-active={active ? 'true' : undefined}>
      {children}
    </button>
  );
}
