import type { GameInputButtonId, GameInputSnapshot } from '../input/gameInputTypes';
import type { PlayerMotionIntent, PlayerMotionIntentId } from './playerMotionTypes';

type MoveFamilyButton = Extract<
  GameInputButtonId,
  'toprock' | 'footwork' | 'freeze' | 'powermove'
>;

const familyButtons: MoveFamilyButton[] = ['toprock', 'footwork', 'freeze', 'powermove'];

const defaultMoveByFamily: Record<MoveFamilyButton, PlayerMotionIntentId> = {
  toprock: 'move.toprock.default',
  footwork: 'move.footwork.default',
  freeze: 'move.freeze.default',
  powermove: 'move.powermove.default'
};

const movementChanged = (previous: GameInputSnapshot, current: GameInputSnapshot) =>
  previous.move.x !== current.move.x || previous.move.y !== current.move.y;

const wasPressed = (
  previous: GameInputSnapshot,
  current: GameInputSnapshot,
  button: GameInputButtonId
) => !previous.buttons[button].pressed && current.buttons[button].pressed;

const wasReleased = (
  previous: GameInputSnapshot,
  current: GameInputSnapshot,
  button: GameInputButtonId
) => previous.buttons[button].pressed && !current.buttons[button].pressed;

export class PlayerIntentResolver {
  private readonly activeMoves = new Map<MoveFamilyButton, PlayerMotionIntentId>();

  resolve(previous: GameInputSnapshot, current: GameInputSnapshot): PlayerMotionIntent[] {
    const intents: PlayerMotionIntent[] = [];

    if (movementChanged(previous, current)) {
      intents.push({
        type: 'motion.move',
        movement: { x: current.move.x, y: current.move.y }
      });
    }

    for (const button of familyButtons) {
      if (wasPressed(previous, current, button)) {
        const intentId = defaultMoveByFamily[button];
        this.activeMoves.set(button, intentId);
        intents.push({ type: 'motion.perform', intentId });
      }
    }

    for (const button of familyButtons) {
      if (!wasReleased(previous, current, button)) continue;
      const intentId = this.activeMoves.get(button);
      if (intentId) {
        intents.push({ type: 'motion.release', intentId });
        this.activeMoves.delete(button);
      }
    }

    return intents;
  }

  reset(): PlayerMotionIntent[] {
    const intents = [...this.activeMoves.values()].map<PlayerMotionIntent>((intentId) => ({
      type: 'motion.release',
      intentId
    }));
    this.activeMoves.clear();
    return intents;
  }
}
