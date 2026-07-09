import { create } from 'zustand';
import type {
  ActiveInputSource,
  GameInputButtonId,
  GamepadInputMap,
  KeyboardInputMap,
  PreferredInputMode
} from '../input/gameInputTypes';
import { defaultGamepadInputMap, defaultKeyboardInputMap } from '../input/gameInputTypes';
import type { CameraFeel } from '../camera/cameraFeel';

export type GameMenuScreen = 'splashscreen' | 'mainMenu' | 'settings' | 'credits';
export type GamePlayMode = 'career' | 'training';
export type GameDifficultyMode = 'assisted' | 'adaptive' | 'expert';
export type TrainingAudioMode = 'internal' | 'bring-your-music' | 'manual';
export type GameScreen = GameMenuScreen | GamePlayMode;

interface GameState {
  screen: GameScreen;
  selectedMode: GamePlayMode;
  selectedCharacter: string;
  score: number;
  bpm: number;
  difficultyMode: GameDifficultyMode;
  adaptiveSkillRating: number;
  internalMusicEnabled: boolean;
  trainingAudioMode: TrainingAudioMode;
  cameraFeel: CameraFeel;
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
  setDifficultyMode: (mode: GameDifficultyMode) => void;
  recordAdaptivePerformance: (score: number) => void;
  setInternalMusicEnabled: (enabled: boolean) => void;
  setTrainingAudioMode: (mode: TrainingAudioMode) => void;
  setCameraFeel: (feel: CameraFeel) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  screen: 'splashscreen',
  selectedMode: 'career',
  selectedCharacter: 'Dust Crew',
  score: 0,
  bpm: 110,
  difficultyMode: 'adaptive',
  adaptiveSkillRating: 0,
  internalMusicEnabled: true,
  trainingAudioMode: 'internal',
  cameraFeel: 'dynamic',
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
  setDifficultyMode: (difficultyMode) => set({ difficultyMode }),
  recordAdaptivePerformance: (score) => set((state) => {
    const performance = Math.max(0, Math.min(1, (score - 20) / 80));
    const sampleWeight = 0.12;
    return {
      adaptiveSkillRating: state.adaptiveSkillRating * (1 - sampleWeight) + performance * sampleWeight
    };
  }),
  setInternalMusicEnabled: (internalMusicEnabled) => set({ internalMusicEnabled }),
  setTrainingAudioMode: (trainingAudioMode) => set({ trainingAudioMode }),
  setCameraFeel: (cameraFeel) => set({ cameraFeel }),
  resetGame: () => set({ score: 0 }),
}));
