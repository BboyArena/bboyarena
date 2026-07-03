import { Component, type ErrorInfo, type ReactNode } from 'react';

interface GameCanvasErrorBoundaryProps {
  children: ReactNode;
}

interface GameCanvasErrorBoundaryState {
  hasError: boolean;
}

export default class GameCanvasErrorBoundary extends Component<
  GameCanvasErrorBoundaryProps,
  GameCanvasErrorBoundaryState
> {
  state: GameCanvasErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): GameCanvasErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Game canvas failed to render', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="game-canvas game-canvas--fallback" role="alert">
          <strong>3D scene unavailable</strong>
          <span>The game interface is still active. Return to the menu and try loading the scene again.</span>
        </div>
      );
    }

    return this.props.children;
  }
}
