import { create } from 'zustand';
import type { InputSnapshot } from '../input/InputManager';

export const emptyInputSnapshot: InputSnapshot = {
  movement: { x: 0, y: 0 },
  look: { x: 0, y: 0 },
  pointer: { x: 0, y: 0 },
  actions: new Set(),
  activeSources: new Set(),
  gamepads: [],
  lastGesture: null,
  timestamp: 0
};

interface InputState {
  snapshot: InputSnapshot;
  setSnapshot: (snapshot: InputSnapshot) => void;
  resetSnapshot: () => void;
}

export const useInputStore = create<InputState>((set) => ({
  snapshot: emptyInputSnapshot,
  setSnapshot: (snapshot) => set({ snapshot }),
  resetSnapshot: () => set({ snapshot: emptyInputSnapshot })
}));
