import type { GameInputButtonId, GameInputSnapshot } from '../input/gameInputTypes';
import type { MoveFamilyId, MoveVariationFamilyDefinition } from '../move/moveDefinitionTypes';
import { moveCatalog } from '../move/moveCatalog';
import type { PlayerMotionIntent, PlayerMotionIntentId } from './playerMotionTypes';

type Evidence = { button: MoveFamilyId; beatOffset: number };

export type VariationSelectionSnapshot = {
  family: MoveFamilyId;
  openedAtBeat: number;
  closesAtBeat: number;
  evidence: Evidence[];
} | null;

const familyButtons: MoveFamilyId[] = ['toprock', 'footwork', 'freeze', 'powermove'];
const definitions = (moveCatalog.variationSelection ?? []) as MoveVariationFamilyDefinition[];

const movementChanged = (previous: GameInputSnapshot, current: GameInputSnapshot) =>
  previous.move.x !== current.move.x || previous.move.y !== current.move.y;

const wasPressed = (previous: GameInputSnapshot, current: GameInputSnapshot, button: GameInputButtonId) =>
  !previous.buttons[button].pressed && current.buttons[button].pressed;

function matchesVariation(evidence: Evidence[], definition: MoveVariationFamilyDefinition) {
  return definition.variations.find((variation) =>
    variation.steps.length === evidence.length && variation.steps.every((step, index) => {
      const input = evidence[index];
      return input?.button === step.button &&
        Math.abs(input.beatOffset - step.beatOffset) <= step.toleranceBeats;
    })
  );
}

export class PlayerIntentResolver {
  private selection: VariationSelectionSnapshot = null;
  private activeIntentId: PlayerMotionIntentId | null = null;

  getSelectionSnapshot(): VariationSelectionSnapshot {
    return this.selection ? { ...this.selection, evidence: [...this.selection.evidence] } : null;
  }

  resolve(previous: GameInputSnapshot, current: GameInputSnapshot, beat: number): PlayerMotionIntent[] {
    const intents: PlayerMotionIntent[] = [];
    if (movementChanged(previous, current)) {
      intents.push({ type: 'motion.move', movement: { x: current.move.x, y: current.move.y } });
    }

    for (const button of familyButtons) {
      if (!wasPressed(previous, current, button)) continue;
      if (!this.selection) {
        const definition = definitions.find((item) => item.family === button);
        if (definition) {
          this.selection = {
            family: button,
            openedAtBeat: beat,
            closesAtBeat: beat + definition.selectionWindowBeats,
            evidence: []
          };
        }
      } else if (beat <= this.selection.closesAtBeat) {
        this.selection.evidence.push({ button, beatOffset: beat - this.selection.openedAtBeat });
      }
    }

    return intents;
  }

  advance(beat: number): PlayerMotionIntent[] {
    if (!this.selection || beat < this.selection.closesAtBeat) return [];
    const definition = definitions.find((item) => item.family === this.selection?.family);
    if (!definition) {
      this.selection = null;
      return [];
    }

    const variation = matchesVariation(this.selection.evidence, definition);
    const intentId = variation?.intentId ?? definition.defaultIntentId;
    this.selection = null;
    this.activeIntentId = intentId;
    return [{ type: 'motion.perform', intentId }];
  }

  reset(): PlayerMotionIntent[] {
    const intents: PlayerMotionIntent[] = this.activeIntentId
      ? [{ type: 'motion.release', intentId: this.activeIntentId }]
      : [];
    this.selection = null;
    this.activeIntentId = null;
    return intents;
  }
}
