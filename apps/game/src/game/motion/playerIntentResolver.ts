import type { GameInputSnapshot } from '../input/gameInputTypes';
import type { PlayerMotionIntent, PlayerMotionIntentId } from './playerMotionTypes';

const movementChanged = (previous: GameInputSnapshot, current: GameInputSnapshot) =>
  previous.move.x !== current.move.x || previous.move.y !== current.move.y;

const wasPressed = (
  previous: GameInputSnapshot,
  current: GameInputSnapshot,
  button: keyof GameInputSnapshot['buttons']
) => !previous.buttons[button].pressed && current.buttons[button].pressed;

const wasReleased = (
  previous: GameInputSnapshot,
  current: GameInputSnapshot,
  button: keyof GameInputSnapshot['buttons']
) => previous.buttons[button].pressed && !current.buttons[button].pressed;

const resolvePrimaryIntentId = (snapshot: GameInputSnapshot): PlayerMotionIntentId => {
  if (snapshot.buttons.modifierLeft.pressed) return 'move.comet.sweep';
  if (snapshot.buttons.modifierRight.pressed) return 'move.axis.break';
  return 'move.neon.pulse';
};

export class PlayerIntentResolver {
  private primaryIntentId: PlayerMotionIntentId | null = null;
  private secondaryIntentId: PlayerMotionIntentId | null = null;

  resolve(previous: GameInputSnapshot, current: GameInputSnapshot): PlayerMotionIntent[] {
    const intents: PlayerMotionIntent[] = [];

    if (movementChanged(previous, current)) {
      intents.push({
        type: 'motion.move',
        movement: { x: current.move.x, y: current.move.y }
      });
    }

    if (wasPressed(previous, current, 'primary')) {
      this.primaryIntentId = resolvePrimaryIntentId(current);
      intents.push({ type: 'motion.perform', intentId: this.primaryIntentId });
    }

    if (wasPressed(previous, current, 'secondary')) {
      this.secondaryIntentId = 'pose.signal.lock';
      intents.push({ type: 'motion.perform', intentId: this.secondaryIntentId });
    }

    if (wasReleased(previous, current, 'primary') && this.primaryIntentId !== null) {
      intents.push({ type: 'motion.release', intentId: this.primaryIntentId });
      this.primaryIntentId = null;
    }

    if (wasReleased(previous, current, 'secondary') && this.secondaryIntentId !== null) {
      intents.push({ type: 'motion.release', intentId: this.secondaryIntentId });
      this.secondaryIntentId = null;
    }

    return intents;
  }

  reset(): PlayerMotionIntent[] {
    const intents: PlayerMotionIntent[] = [];

    if (this.primaryIntentId !== null) {
      intents.push({ type: 'motion.release', intentId: this.primaryIntentId });
    }
    if (this.secondaryIntentId !== null) {
      intents.push({ type: 'motion.release', intentId: this.secondaryIntentId });
    }

    this.primaryIntentId = null;
    this.secondaryIntentId = null;
    return intents;
  }
}
