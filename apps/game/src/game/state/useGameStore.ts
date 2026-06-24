import { create } from 'zustand';

export type GameMenuScene = 'splashscreen' | 'mainMenu' | 'settings' | 'credits';
export type GamePlayMode = 'career' | 'training';
export type GameScene = GameMenuScene | GamePlayMode;

interface GameState {
  scene: GameScene;
  selectedMode: GamePlayMode;
  selectedCharacter: string;
  score: number;
  bpm: number;
  isMuted: boolean;
  setScene: (scene: GameScene) => void;
  setSelectedMode: (mode: GamePlayMode) => void;
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
  scene: 'splashscreen',
  selectedMode: 'career',
  selectedCharacter: 'Dust Crew',
  score: 0,
  bpm: 120,
  isMuted: false,
  setScene: (scene) => set({ scene }),
  setSelectedMode: (selectedMode) => set({ selectedMode }),
  openSplash: () => set({ scene: 'splashscreen' }),
  openMainMenu: () => set({ scene: 'mainMenu' }),
  openSettings: () => set({ scene: 'settings' }),
  openCredits: () => set({ scene: 'credits' }),
  startMode: (selectedMode) => set({ scene: selectedMode, selectedMode }),
  setSelectedCharacter: (selectedCharacter) => set({ selectedCharacter }),
  incrementScore: (amount) => set((state) => ({ score: state.score + amount })),
  setBpm: (bpm) => set({ bpm }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  resetGame: () => set({ score: 0 }),
}));
