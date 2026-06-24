import { createMachine } from 'xstate';

export const gameMachine = createMachine({
  id: 'game',
  initial: 'idle',
  states: {
    idle: {
      on: {
        START: { target: 'playing' }
      }
    },
    playing: {
      on: {
        PAUSE: { target: 'paused' },
        GAME_OVER: { target: 'gameOver' },
        RESET: { target: 'idle' }
      }
    },
    paused: {
      on: {
        RESUME: { target: 'playing' },
        RESET: { target: 'idle' }
      }
    },
    gameOver: {
      on: {
        START: { target: 'playing' },
        RESET: { target: 'idle' }
      }
    }
  }
});
