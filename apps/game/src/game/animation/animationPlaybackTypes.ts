import type { PlayerMotionIntentId } from '../motion/playerMotionTypes';

export type AnimationPlaybackRequest =
  | {
      type: 'animation.play';
      requestId: string;
      intentId: PlayerMotionIntentId;
      issuedAtTick: number;
    }
  | {
      type: 'animation.stop';
      requestId: string;
      issuedAtTick: number;
    }
  | { type: 'animation.pause'; issuedAtTick: number }
  | { type: 'animation.resume'; issuedAtTick: number }
  | { type: 'animation.reset'; issuedAtTick: number };

export type AnimationPlaybackEvent =
  | {
      type: 'animation.started';
      requestId: string;
      intentId: PlayerMotionIntentId;
      animationId: string;
      startedAtTick: number;
    }
  | {
      type: 'animation.completed';
      requestId: string;
      intentId: PlayerMotionIntentId;
      animationId: string;
      completedAtTick: number;
    }
  | {
      type: 'animation.interrupted';
      requestId: string;
      intentId: PlayerMotionIntentId;
      animationId: string;
      interruptedAtTick: number;
    }
  | {
      type: 'animation.failed';
      requestId: string;
      intentId: PlayerMotionIntentId;
      reason: string;
      failedAtTick: number;
    };
