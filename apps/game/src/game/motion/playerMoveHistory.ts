import type { AnimationCatalog } from '../animation/animationCatalogTypes';
import { isPerformingIntentId } from './playerMotionRules';
import type { PlayerMotionIntentId } from './playerMotionTypes';

export type PlayerMoveHistoryOutcome = 'active' | 'completed' | 'interrupted';

export type PlayerMoveScoreEvaluation = {
  status: 'not-evaluated';
  score: null;
};

export type PlayerMoveHistoryEntry = {
  id: string;
  sequence: number;
  intentId: PlayerMotionIntentId;
  animationId: string | null;
  startedAtTick: number;
  endedAtTick: number | null;
  durationTicks: number | null;
  outcome: PlayerMoveHistoryOutcome;
  scoring: PlayerMoveScoreEvaluation;
};

const resolveAnimationId = (
  catalog: AnimationCatalog | null,
  intentId: PlayerMotionIntentId
) => catalog?.animations.find((animation) => animation.intentId === intentId)?.id ?? null;

export class PlayerMoveHistory {
  private readonly maximumEntries: number;
  private entries: PlayerMoveHistoryEntry[] = [];
  private currentIntentId: PlayerMotionIntentId | null = null;
  private activeEntryId: string | null = null;
  private sequence = 0;

  constructor(maximumEntries = 24) {
    this.maximumEntries = Math.max(1, Math.floor(maximumEntries));
  }

  observe(
    nextIntentId: PlayerMotionIntentId | null,
    tick: number,
    catalog: AnimationCatalog | null
  ): boolean {
    if (nextIntentId === this.currentIntentId) {
      return this.attachAnimation(catalog);
    }

    const nextIsPerformance = nextIntentId !== null && isPerformingIntentId(nextIntentId);
    let changed = this.closeActiveEntry(tick, nextIsPerformance ? 'interrupted' : 'completed');

    this.currentIntentId = nextIntentId;

    if (nextIntentId !== null && nextIsPerformance) {
      this.sequence += 1;
      const entry: PlayerMoveHistoryEntry = {
        id: `move-${this.sequence}`,
        sequence: this.sequence,
        intentId: nextIntentId,
        animationId: resolveAnimationId(catalog, nextIntentId),
        startedAtTick: tick,
        endedAtTick: null,
        durationTicks: null,
        outcome: 'active',
        scoring: {
          status: 'not-evaluated',
          score: null
        }
      };

      this.entries = [...this.entries, entry].slice(-this.maximumEntries);
      this.activeEntryId = entry.id;
      changed = true;
    }

    return changed;
  }

  reset(tick: number, clearEntries = false): boolean {
    const changed = this.closeActiveEntry(tick, 'interrupted');
    this.currentIntentId = null;

    if (clearEntries && this.entries.length > 0) {
      this.entries = [];
      this.sequence = 0;
      return true;
    }

    return changed;
  }

  getSnapshot(): PlayerMoveHistoryEntry[] {
    return this.entries.map((entry) => ({
      ...entry,
      scoring: { ...entry.scoring }
    }));
  }

  private attachAnimation(catalog: AnimationCatalog | null): boolean {
    if (this.activeEntryId === null || this.currentIntentId === null) return false;
    const animationId = resolveAnimationId(catalog, this.currentIntentId);
    if (animationId === null) return false;

    const activeEntry = this.entries.find((entry) => entry.id === this.activeEntryId);
    if (!activeEntry || activeEntry.animationId === animationId) return false;

    this.entries = this.entries.map((entry) =>
      entry.id === this.activeEntryId ? { ...entry, animationId } : entry
    );
    return true;
  }

  private closeActiveEntry(
    tick: number,
    outcome: Exclude<PlayerMoveHistoryOutcome, 'active'>
  ): boolean {
    if (this.activeEntryId === null) return false;

    this.entries = this.entries.map((entry) =>
      entry.id === this.activeEntryId
        ? {
            ...entry,
            endedAtTick: tick,
            durationTicks: Math.max(0, tick - entry.startedAtTick),
            outcome
          }
        : entry
    );
    this.activeEntryId = null;
    return true;
  }
}
