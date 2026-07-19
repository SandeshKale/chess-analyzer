import { create } from 'zustand';
import type { ParsedGame, MoveAnalysis, EngineState } from '@/types';

interface ChessStore {
  currentGame: ParsedGame | null;
  currentMoveIndex: number;
  analysis: MoveAnalysis[];
  engineState: EngineState;
  boardOrientation: 'white' | 'black';
  showArrows: boolean;

  setGame: (game: ParsedGame | null) => void;
  setMoveIndex: (index: number) => void;
  setAnalysis: (analysis: MoveAnalysis[]) => void;
  updateEngineState: (state: Partial<EngineState>) => void;
  toggleOrientation: () => void;
  toggleArrows: () => void;
  reset: () => void;
}

const defaultEngineState: EngineState = {
  isReady: false,
  isAnalyzing: false,
  depth: 20,
  multipv: 3,
  lines: [],
};

export const useChessStore = create<ChessStore>((set) => ({
  currentGame: null,
  currentMoveIndex: -1,
  analysis: [],
  engineState: defaultEngineState,
  boardOrientation: 'white',
  showArrows: true,

  setGame: (game) => set({ currentGame: game, currentMoveIndex: -1, analysis: [] }),
  setMoveIndex: (index) => set({ currentMoveIndex: index }),
  setAnalysis: (analysis) => set({ analysis }),
  updateEngineState: (state) => set((prev) => ({ 
    engineState: { ...prev.engineState, ...state } 
  })),
  toggleOrientation: () => set((prev) => ({ 
    boardOrientation: prev.boardOrientation === 'white' ? 'black' : 'white' 
  })),
  toggleArrows: () => set((prev) => ({ showArrows: !prev.showArrows })),
  reset: () => set({ 
    currentGame: null, 
    currentMoveIndex: -1, 
    analysis: [], 
    engineState: defaultEngineState 
  }),
}));
