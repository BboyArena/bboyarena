import {
  clampInputValue,
  createDefaultGameInputSnapshot,
  normalizeInputVector,
  type ActiveInputSource,
  type GameInputButtonId,
  type GameInputButtonState,
  type GameInputSnapshot,
  type GameInputVector
} from './gameInputTypes';

type GameInputListener = (snapshot: GameInputSnapshot) => void;

function areVectorsEqual(a: GameInputVector, b: GameInputVector) {
  return a.x === b.x && a.y === b.y;
}

function areButtonStatesEqual(
  a: GameInputButtonState,
  b: GameInputButtonState
) {
  return a.pressed === b.pressed && a.value === b.value;
}

function areSnapshotsEqual(a: GameInputSnapshot, b: GameInputSnapshot) {
  if (a.source !== b.source) return false;
  if (!areVectorsEqual(a.move, b.move)) return false;

  return (
    areButtonStatesEqual(a.buttons.primary, b.buttons.primary) &&
    areButtonStatesEqual(a.buttons.secondary, b.buttons.secondary) &&
    areButtonStatesEqual(a.buttons.modifierLeft, b.buttons.modifierLeft) &&
    areButtonStatesEqual(a.buttons.modifierRight, b.buttons.modifierRight) &&
    areButtonStatesEqual(a.buttons.start, b.buttons.start) &&
    areButtonStatesEqual(a.buttons.pause, b.buttons.pause)
  );
}

export class GameInputController {
  private snapshot: GameInputSnapshot = createDefaultGameInputSnapshot();
  private readonly listeners = new Set<GameInputListener>();

  subscribe = (listener: GameInputListener) => {
    this.listeners.add(listener);
    listener(this.getSnapshot());

    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot(): GameInputSnapshot {
    return this.snapshot;
  }

  updateMove(source: ActiveInputSource, vector: GameInputVector): void {
    const nextSnapshot: GameInputSnapshot = {
      ...this.snapshot,
      source,
      move: normalizeInputVector(vector),
      updatedAt: this.getTimestamp()
    };

    this.commitSnapshot(nextSnapshot);
  }

  updateButton(
    source: ActiveInputSource,
    button: GameInputButtonId,
    pressed: boolean,
    value = pressed ? 1 : 0
  ): void {
    const nextButtons = {
      ...this.snapshot.buttons,
      [button]: {
        pressed,
        value: clampInputValue(value, 0, 1)
      }
    };

    this.commitSnapshot({
      ...this.snapshot,
      source,
      buttons: nextButtons,
      updatedAt: this.getTimestamp()
    });
  }

  resetSource(source: ActiveInputSource): void {
    if (this.snapshot.source !== source) return;

    this.commitSnapshot(createDefaultGameInputSnapshot(source));
  }

  private commitSnapshot(nextSnapshot: GameInputSnapshot) {
    if (areSnapshotsEqual(this.snapshot, nextSnapshot)) return;

    this.snapshot = nextSnapshot;
    this.listeners.forEach((listener) => listener(this.getSnapshot()));
  }

  private getTimestamp() {
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
  }
}
