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
  if (!areVectorsEqual(a.look, b.look)) return false;

  return (
    areButtonStatesEqual(a.buttons.toprock, b.buttons.toprock) &&
    areButtonStatesEqual(a.buttons.footwork, b.buttons.footwork) &&
    areButtonStatesEqual(a.buttons.freeze, b.buttons.freeze) &&
    areButtonStatesEqual(a.buttons.powermove, b.buttons.powermove) &&
    areButtonStatesEqual(a.buttons.l1, b.buttons.l1) &&
    areButtonStatesEqual(a.buttons.l2, b.buttons.l2) &&
    areButtonStatesEqual(a.buttons.r1, b.buttons.r1) &&
    areButtonStatesEqual(a.buttons.r2, b.buttons.r2) &&
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

  updateLook(source: ActiveInputSource, vector: GameInputVector): void {
    this.commitSnapshot({
      ...this.snapshot,
      source,
      look: normalizeInputVector(vector),
      updatedAt: this.getTimestamp()
    });
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
