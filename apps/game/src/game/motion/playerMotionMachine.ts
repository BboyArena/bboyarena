import { assign, setup } from 'xstate';
import {
  canInterruptMotion,
  hasMovement,
  isMoveIntent,
  isPerformIntent,
  isPerformingIntentId,
  isReleaseIntent,
  resolveGroundedIntentId
} from './playerMotionRules';
import {
  createInitialPlayerMotionSnapshot,
  type PlayerMotionMachineEvent,
  type PlayerMotionSnapshot
} from './playerMotionTypes';

type PlayerMotionMachineContext = PlayerMotionSnapshot;

const resetContext = (phase: PlayerMotionSnapshot['phase']): PlayerMotionMachineContext => ({
  ...createInitialPlayerMotionSnapshot(),
  phase
});

const playerMotionSetup = setup({
  types: {
    context: {} as PlayerMotionMachineContext,
    events: {} as PlayerMotionMachineEvent
  },
  guards: {
    receivesMoveIntent: ({ event }) => event.type === 'INTENT' && isMoveIntent(event.intent),
    hasMoveVector: ({ event }) =>
      event.type === 'INTENT' && isMoveIntent(event.intent) && hasMovement(event.intent.movement),
    hasNoMoveVector: ({ event }) =>
      event.type === 'INTENT' && isMoveIntent(event.intent) && !hasMovement(event.intent.movement),
    requestsGroundedIdle: ({ event }) =>
      event.type === 'INTENT' &&
      isPerformIntent(event.intent) &&
      event.intent.intentId === 'movement.idle',
    requestsGroundedMovement: ({ event }) =>
      event.type === 'INTENT' &&
      isPerformIntent(event.intent) &&
      event.intent.intentId === 'movement.toprock',
    requestsAllowedPerformance: ({ context, event }) =>
      event.type === 'INTENT' &&
      isPerformIntent(event.intent) &&
      isPerformingIntentId(event.intent.intentId) &&
      canInterruptMotion(context.activeIntentId, event.intent.intentId),
    releasesActivePerformance: ({ context, event }) =>
      event.type === 'INTENT' &&
      isReleaseIntent(event.intent) &&
      event.intent.intentId === context.activeIntentId,
    requestsStop: ({ event }) => event.type === 'INTENT' && event.intent.type === 'motion.stop',
    contextHasMovement: ({ context }) => hasMovement(context.movement)
  },
  actions: {
    resetInactive: assign(() => resetContext('inactive')),
    resetIdle: assign(() => resetContext('idle')),
    markPaused: assign({ phase: 'paused' }),
    restoreGroundedIdle: assign(({ context }) => ({
      phase: 'idle' as const,
      activeIntentId: 'movement.idle' as const,
      angularVelocity: 0,
      movement: context.movement
    })),
    restoreGroundedMovement: assign(({ context }) => ({
      phase: 'moving' as const,
      activeIntentId: 'movement.toprock' as const,
      angularVelocity: 0,
      movement: context.movement
    })),
    restorePerformance: assign({ phase: 'active' }),
    updateTick: assign(({ context, event }) => ({
      tick: event.type === 'TICK' ? Math.max(context.tick, event.tick) : context.tick
    })),
    applyMoveIntent: assign(({ event }) => {
      if (event.type !== 'INTENT' || !isMoveIntent(event.intent)) return {};
      const movement = event.intent.movement;
      return {
        movement,
        facing: hasMovement(movement)
          ? { x: movement.x, y: 0, z: movement.y }
          : undefined,
        activeIntentId: resolveGroundedIntentId(movement),
        angularVelocity: 0,
        tick: event.tick
      };
    }),
    updateMovementWhilePerforming: assign(({ context, event }) => {
      if (event.type !== 'INTENT' || !isMoveIntent(event.intent)) return {};
      const movement = event.intent.movement;
      return {
        movement,
        facing: hasMovement(movement)
          ? { x: movement.x, y: 0, z: movement.y }
          : context.facing,
        tick: event.tick
      };
    }),
    applyIdleIntent: assign(({ context, event }) => ({
      phase: 'idle' as const,
      movement: { x: 0, y: 0 },
      activeIntentId: 'movement.idle' as const,
      angularVelocity: 0,
      tick: event.type === 'INTENT' ? event.tick : context.tick
    })),
    applyGroundedMovementIntent: assign(({ context, event }) => ({
      phase: 'moving' as const,
      activeIntentId: 'movement.toprock' as const,
      angularVelocity: 0,
      tick: event.type === 'INTENT' ? event.tick : context.tick
    })),
    applyPerformanceIntent: assign(({ context, event }) => {
      if (event.type !== 'INTENT' || !isPerformIntent(event.intent)) return {};
      return {
        phase: 'active' as const,
        activeIntentId: event.intent.intentId,
        angularVelocity: event.intent.intentId === 'move.spin.start' ? 1 : context.angularVelocity,
        tick: event.tick
      };
    })
  }
});

export const playerMotionMachine = playerMotionSetup.createMachine({
  id: 'playerMotion',
  initial: 'inactive',
  context: createInitialPlayerMotionSnapshot(),
  states: {
    inactive: {
      entry: 'resetInactive',
      on: {
        ENABLE: {
          target: 'active.grounded.idle',
          actions: 'resetIdle'
        }
      }
    },
    active: {
      initial: 'grounded',
      on: {
        PAUSE: {
          target: 'paused',
          actions: 'markPaused'
        },
        DISABLE: {
          target: 'inactive'
        },
        RESET: {
          target: '.grounded.idle',
          actions: 'resetIdle'
        },
        TICK: {
          actions: 'updateTick'
        },
        INTENT: [
          {
            guard: 'hasMoveVector',
            target: '.grounded.moving',
            actions: ['applyMoveIntent', 'restoreGroundedMovement']
          },
          {
            guard: 'hasNoMoveVector',
            target: '.grounded.idle',
            actions: ['applyMoveIntent', 'restoreGroundedIdle']
          },
          {
            guard: 'requestsGroundedIdle',
            target: '.grounded.idle',
            actions: 'applyIdleIntent'
          },
          {
            guard: 'requestsGroundedMovement',
            target: '.grounded.moving',
            actions: 'applyGroundedMovementIntent'
          },
          {
            guard: 'requestsAllowedPerformance',
            target: '.performing',
            actions: 'applyPerformanceIntent'
          }
        ]
      },
      states: {
        history: {
          type: 'history',
          history: 'deep'
        },
        grounded: {
          initial: 'idle',
          states: {
            idle: {
              entry: 'restoreGroundedIdle'
            },
            moving: {
              entry: 'restoreGroundedMovement'
            }
          }
        },
        performing: {
          entry: 'restorePerformance',
          on: {
            INTENT: [
              {
                guard: 'receivesMoveIntent',
                actions: 'updateMovementWhilePerforming'
              },
              {
                guard: 'releasesActivePerformance',
                target: 'grounded.idle',
                actions: 'applyIdleIntent'
              },
              {
                guard: 'requestsStop',
                target: 'grounded.idle',
                actions: 'applyIdleIntent'
              }
            ]
          }
        }
      }
    },
    paused: {
      on: {
        RESUME: {
          target: 'active.history'
        },
        RESET: {
          target: 'active.grounded.idle',
          actions: 'resetIdle'
        },
        DISABLE: {
          target: 'inactive'
        }
      }
    }
  }
});

export const selectPlayerMotionSnapshot = (
  context: PlayerMotionMachineContext
): PlayerMotionSnapshot => ({
  tick: context.tick,
  phase: context.phase,
  movement: { ...context.movement },
  facing: { ...context.facing },
  rotationAxis: { ...context.rotationAxis },
  angularVelocity: context.angularVelocity,
  balance: context.balance,
  contactPoint: context.contactPoint ? { ...context.contactPoint } : null,
  activeIntentId: context.activeIntentId
});
