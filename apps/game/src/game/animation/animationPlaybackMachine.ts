import { assign, fromPromise, setup } from 'xstate';
import {
  AnimationCatalogLoadError,
  loadAnimationCatalog,
  type AnimationCatalogLoadState,
  type AnimationCatalogSourceSelection
} from './animationCatalogLoader';
import type { AnimationCatalog, AnimationDefinition } from './animationCatalogTypes';
import type {
  AnimationPlaybackEvent,
  AnimationPlaybackRequest
} from './animationPlaybackTypes';

type ActiveAnimationPlayback = {
  requestId: string;
  definition: AnimationDefinition;
  startedAtTick: number;
};

export type AnimationPlaybackMachineInput = {
  sources: AnimationCatalogSourceSelection;
};

export type AnimationPlaybackMachineEvent =
  | AnimationPlaybackRequest
  | { type: 'animation.complete'; completedAtTick: number }
  | { type: 'animation.error'; reason: string; failedAtTick: number }
  | { type: 'catalog.retry' };

export type AnimationPlaybackMachineContext = {
  sources: AnimationCatalogSourceSelection;
  catalog: AnimationCatalog | null;
  sourceId: string | null;
  usedFallback: boolean;
  current: ActiveAnimationPlayback | null;
  loadError: AnimationCatalogLoadError | null;
  lastEvent: AnimationPlaybackEvent | null;
};

const loadCatalogActor = fromPromise<
  AnimationCatalogLoadState,
  { sources: AnimationCatalogSourceSelection }
>(({ input, signal }) => loadAnimationCatalog(input.sources, signal));

const findDefinition = (
  catalog: AnimationCatalog | null,
  event: AnimationPlaybackMachineEvent
) => {
  if (event.type !== 'animation.play' || catalog === null) return null;
  return catalog.animations.find((animation) => animation.intentId === event.intentId) ?? null;
};

const animationPlaybackSetup = setup({
  types: {
    context: {} as AnimationPlaybackMachineContext,
    events: {} as AnimationPlaybackMachineEvent,
    input: {} as AnimationPlaybackMachineInput
  },
  actors: {
    loadCatalog: loadCatalogActor
  },
  guards: {
    hasAnimationMapping: ({ context, event }) => findDefinition(context.catalog, event) !== null,
    hasCurrentAnimation: ({ context }) => context.current !== null
  },
  actions: {
    clearPlayback: assign({
      current: null,
      lastEvent: null
    }),
    startPlayback: assign(({ context, event }) => {
      if (event.type !== 'animation.play') return {};
      const definition = findDefinition(context.catalog, event);
      if (definition === null) return {};

      return {
        current: {
          requestId: event.requestId,
          definition,
          startedAtTick: event.issuedAtTick
        },
        lastEvent: {
          type: 'animation.started' as const,
          requestId: event.requestId,
          intentId: event.intentId,
          animationId: definition.id,
          startedAtTick: event.issuedAtTick
        }
      };
    }),
    rejectMissingMapping: assign(({ event }) => {
      if (event.type !== 'animation.play') return {};
      return {
        lastEvent: {
          type: 'animation.failed' as const,
          requestId: event.requestId,
          intentId: event.intentId,
          reason: `No animation mapping exists for intent "${event.intentId}".`,
          failedAtTick: event.issuedAtTick
        }
      };
    }),
    markInterrupted: assign(({ context, event }) => {
      if (context.current === null) return {};
      const interruptedAtTick =
        'issuedAtTick' in event ? event.issuedAtTick : context.current.startedAtTick;
      return {
        lastEvent: {
          type: 'animation.interrupted' as const,
          requestId: context.current.requestId,
          intentId: context.current.definition.intentId,
          animationId: context.current.definition.id,
          interruptedAtTick
        }
      };
    }),
    markCompleted: assign(({ context, event }) => {
      if (context.current === null || event.type !== 'animation.complete') return {};
      return {
        lastEvent: {
          type: 'animation.completed' as const,
          requestId: context.current.requestId,
          intentId: context.current.definition.intentId,
          animationId: context.current.definition.id,
          completedAtTick: event.completedAtTick
        }
      };
    }),
    markPlaybackFailed: assign(({ context, event }) => {
      if (context.current === null || event.type !== 'animation.error') return {};
      return {
        lastEvent: {
          type: 'animation.failed' as const,
          requestId: context.current.requestId,
          intentId: context.current.definition.intentId,
          reason: event.reason,
          failedAtTick: event.failedAtTick
        }
      };
    }),
    dropCurrentPlayback: assign({ current: null })
  }
});

export const animationPlaybackMachine = animationPlaybackSetup.createMachine({
  id: 'animationPlayback',
  initial: 'loadingCatalog',
  context: ({ input }) => ({
    sources: input.sources,
    catalog: null,
    sourceId: null,
    usedFallback: false,
    current: null,
    loadError: null,
    lastEvent: null
  }),
  states: {
    loadingCatalog: {
      invoke: {
        id: 'loadCatalog',
        src: 'loadCatalog',
        input: ({ context }) => ({ sources: context.sources }),
        onDone: [
          {
            guard: ({ event }) => event.output.status === 'ready',
            target: 'ready.idle',
            actions: assign(({ event }) => {
              if (event.output.status !== 'ready') return {};
              return {
                catalog: event.output.catalog,
                sourceId: event.output.sourceId,
                usedFallback: event.output.usedFallback,
                loadError: null
              };
            })
          },
          {
            target: 'failed',
            actions: assign(({ event }) => {
              if (event.output.status !== 'failed') return {};
              return {
                sourceId: event.output.sourceId,
                loadError: event.output.error
              };
            })
          }
        ],
        onError: {
          target: 'failed',
          actions: assign(({ context, event }) => ({
            loadError: new AnimationCatalogLoadError(
              context.sources.primary.id,
              'Animation catalog actor failed unexpectedly.',
              event.error
            )
          }))
        }
      }
    },
    ready: {
      initial: 'idle',
      on: {
        'animation.play': [
          {
            guard: 'hasAnimationMapping',
            target: '.transitioning',
            actions: ['markInterrupted', 'startPlayback']
          },
          {
            actions: 'rejectMissingMapping'
          }
        ],
        'animation.reset': {
          target: '.idle',
          actions: 'clearPlayback'
        }
      },
      states: {
        idle: {},
        transitioning: {
          always: 'playing'
        },
        playing: {
          on: {
            'animation.stop': {
              target: 'idle',
              actions: ['markInterrupted', 'dropCurrentPlayback']
            },
            'animation.pause': {
              target: 'paused'
            },
            'animation.complete': {
              target: 'idle',
              actions: ['markCompleted', 'dropCurrentPlayback']
            },
            'animation.error': {
              target: 'idle',
              actions: ['markPlaybackFailed', 'dropCurrentPlayback']
            }
          }
        },
        paused: {
          on: {
            'animation.resume': {
              target: 'playing',
              guard: 'hasCurrentAnimation'
            },
            'animation.stop': {
              target: 'idle',
              actions: ['markInterrupted', 'dropCurrentPlayback']
            }
          }
        }
      }
    },
    failed: {
      on: {
        'catalog.retry': {
          target: 'loadingCatalog',
          actions: 'clearPlayback'
        }
      }
    }
  }
});
