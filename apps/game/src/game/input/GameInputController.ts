import {
  clampInputValue,
  createDefaultGameInputSnapshot,
  normalizeInputVector,
  type ActiveInputSource,
  type GameInputButtonId,
  type GameInputButtonState,
  type GameInputSnapshot,
  type GameInputSystemAction,
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
  if (a.active.move !== b.active.move || a.active.look !== b.active.look) return false;
  if (a.lastSystemEvent?.sequence !== b.lastSystemEvent?.sequence) return false;

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
  private systemEventSequence = 0;

  subscribe = (listener: GameInputListener) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot(): GameInputSnapshot {
    return this.snapshot;
  }

  updateMove(source: ActiveInputSource, vector: GameInputVector, active?: boolean): void {
    const normalizedVector = normalizeInputVector(vector);
    const hasActiveInput = active ?? (normalizedVector.x !== 0 || normalizedVector.y !== 0);
    if (!this.activateSource(source, hasActiveInput)) return;

    const nextSnapshot: GameInputSnapshot = {
      ...this.snapshot,
      source,
      move: normalizedVector,
      active: {
        ...this.snapshot.active,
        move: hasActiveInput
      },
      updatedAt: this.getTimestamp()
    };

    this.commitSnapshot(nextSnapshot);
  }

  updateLook(source: ActiveInputSource, vector: GameInputVector, active?: boolean): void {
    const normalizedVector = normalizeInputVector(vector);
    const hasActiveInput = active ?? (normalizedVector.x !== 0 || normalizedVector.y !== 0);
    if (!this.activateSource(source, hasActiveInput)) return;

    this.commitSnapshot({
      ...this.snapshot,
      source,
      look: normalizedVector,
      active: {
        ...this.snapshot.active,
        look: hasActiveInput
      },
      updatedAt: this.getTimestamp()
    });
  }

  updateButton(
    source: ActiveInputSource,
    button: GameInputButtonId,
    pressed: boolean,
    value = pressed ? 1 : 0
  ): void {
    if (!this.activateSource(source, pressed || value > 0)) return;

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

  triggerSystemAction(source: ActiveInputSource, action: GameInputSystemAction): void {
    const timestamp = this.getTimestamp();

    this.commitSnapshot({
      ...this.snapshot,
      source,
      lastSystemEvent: {
        action,
        sequence: ++this.systemEventSequence,
        timestamp
      },
      updatedAt: timestamp
    });
  }

  resetSource(source: ActiveInputSource): void {
    if (this.snapshot.source !== source) return;

    this.commitSnapshot(createDefaultGameInputSnapshot(source));
  }

  private activateSource(source: ActiveInputSource, hasMeaningfulInput: boolean) {
    if (this.snapshot.source === source) return true;
    if (!hasMeaningfulInput) return false;

    this.snapshot = createDefaultGameInputSnapshot(source);
    return true;
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
