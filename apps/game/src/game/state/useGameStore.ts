import { create } from 'zustand';
import type {
  ActiveInputSource,
  GameInputButtonId,
  GamepadInputMap,
  KeyboardInputMap,
  PreferredInputMode
} from '../input/gameInputTypes';
import { defaultGamepadInputMap, defaultKeyboardInputMap } from '../input/gameInputTypes';

export type GameMenuScreen = 'splashscreen' | 'mainMenu' | 'settings' | 'credits';
export type GamePlayMode = 'career' | 'training';
export type GameScreen = GameMenuScreen | GamePlayMode;

interface GameState {
  screen: GameScreen;
  selectedMode: GamePlayMode;
  selectedCharacter: string;
  score: number;
  bpm: number;
  isMuted: boolean;
  preferredInputMode: PreferredInputMode;
  activeInputSource: ActiveInputSource;
  touchControlsVisible: boolean;
  selectedGamepadIndex: number | null;
  keyboardInputMap: KeyboardInputMap;
  gamepadInputMap: GamepadInputMap;
  setScreen: (screen: GameScreen) => void;
  setSelectedMode: (mode: GamePlayMode) => void;
  setPreferredInputMode: (mode: PreferredInputMode) => void;
  setActiveInputSource: (source: ActiveInputSource) => void;
  setTouchControlsVisible: (visible: boolean) => void;
  setSelectedGamepadIndex: (index: number | null) => void;
  setKeyboardBinding: (button: GameInputButtonId, code: string) => void;
  setGamepadBinding: (button: GameInputButtonId, index: number) => void;
  openSplash: () => void;
  openMainMenu: () => void;
  openSettings: () => void;
  openCredits: () => void;
  startMode: (mode: GamePlayMode) => void;
  setSelectedCharacter: (character: string) => void;
  incrementScore: (amount: number) => void;
  setBpm: (bpm: number) => void;
  toggleMute: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  screen: 'splashscreen',
  selectedMode: 'career',
  selectedCharacter: 'Dust Crew',
  score: 0,
  bpm: 120,
  isMuted: false,
  preferredInputMode: 'auto',
  activeInputSource: 'keyboardMouse',
  touchControlsVisible: false,
  selectedGamepadIndex: null,
  keyboardInputMap: defaultKeyboardInputMap,
  gamepadInputMap: defaultGamepadInputMap,
  setScreen: (screen) => set({ screen }),
  setSelectedMode: (selectedMode) => set({ selectedMode }),
  setPreferredInputMode: (preferredInputMode) => set({ preferredInputMode }),
  setActiveInputSource: (activeInputSource) => set({ activeInputSource }),
  setTouchControlsVisible: (touchControlsVisible) => set({ touchControlsVisible }),
  setSelectedGamepadIndex: (selectedGamepadIndex) => set({ selectedGamepadIndex }),
  setKeyboardBinding: (button, code) => set((state) => ({
    keyboardInputMap: { ...state.keyboardInputMap, [button]: code }
  })),
  setGamepadBinding: (button, index) => set((state) => ({
    gamepadInputMap: { ...state.gamepadInputMap, [button]: index }
  })),
  openSplash: () => set({ screen: 'splashscreen' }),
  openMainMenu: () => set({ screen: 'mainMenu' }),
  openSettings: () => set({ screen: 'settings' }),
  openCredits: () => set({ screen: 'credits' }),
  startMode: (selectedMode) => set({ screen: selectedMode, selectedMode }),
  setSelectedCharacter: (selectedCharacter) => set({ selectedCharacter }),
  incrementScore: (amount) => set((state) => ({ score: state.score + amount })),
  setBpm: (bpm) => set({ bpm }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  resetGame: () => set({ score: 0 }),
}));
