import type { GameInputButtonId } from '../input/gameInputTypes';
import type { PlayerMotionIntentId } from '../motion/playerMotionTypes';
import { moveCatalog } from './moveCatalog';

export type MoveQueueFamily = 'toprock' | 'footwork' | 'freeze' | 'powermove';

export type MoveQueueEntry = {
  id: number;
  family: MoveQueueFamily;
  intentId: PlayerMotionIntentId;
  label: string;
  durationBeats: number;
};

export type ActiveMoveQueueEntry = MoveQueueEntry & { startedAtBeat: number };
export type MoveQueueSnapshot = { active: ActiveMoveQueueEntry | null; queued: MoveQueueEntry[] };

const buttonFamilies: Partial<Record<GameInputButtonId, MoveQueueFamily>> = {
  toprock: 'toprock', footwork: 'footwork', freeze: 'freeze', powermove: 'powermove'
};
const defaultIntentByFamily: Record<MoveQueueFamily, PlayerMotionIntentId> = {
  toprock: 'move.toprock.default',
  footwork: 'move.footwork.threestep',
  freeze: 'move.freeze.default',
  powermove: 'move.powermove.default'
};

export const getMoveQueueFamilyForButton = (button: GameInputButtonId) => buttonFamilies[button] ?? null;

export class MoveQueueController {
  private readonly maximumQueuedMoves: number;
  private active: ActiveMoveQueueEntry | null = null;
  private queued: MoveQueueEntry[] = [];
  private sequence = 0;

  constructor(maximumQueuedMoves = 8) {
    this.maximumQueuedMoves = Math.max(1, Math.floor(maximumQueuedMoves));
  }

  enqueue(family: MoveQueueFamily, beat: number): ActiveMoveQueueEntry | null {
    const intentId = defaultIntentByFamily[family];
    const definition = moveCatalog.moves.find((move) => move.intentId === intentId);
    if (!definition) throw new Error(`No default move definition exists for ${family}.`);
    const entry: MoveQueueEntry = {
      id: ++this.sequence,
      family,
      intentId,
      label: definition.label,
      durationBeats: definition.durationBeats
    };
    if (this.active === null) {
      this.active = { ...entry, startedAtBeat: beat };
      return this.active;
    }
    if (this.queued.length < this.maximumQueuedMoves) this.queued.push(entry);
    return null;
  }

  advance(beat: number): { completed: ActiveMoveQueueEntry; started: ActiveMoveQueueEntry | null } | null {
    if (this.active === null || beat - this.active.startedAtBeat < this.active.durationBeats) return null;
    const completed = this.active;
    const next = this.queued.shift() ?? null;
    this.active = next ? { ...next, startedAtBeat: beat } : null;
    return { completed, started: this.active };
  }

  reset(): void {
    this.active = null;
    this.queued = [];
  }

  getSnapshot(): MoveQueueSnapshot {
    return {
      active: this.active ? { ...this.active } : null,
      queued: this.queued.map((entry) => ({ ...entry }))
    };
  }
}
