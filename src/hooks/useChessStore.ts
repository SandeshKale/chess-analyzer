import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  updateEngineState: (state: Partial<EngineState> | ((prev: EngineState) => Partial<EngineState>)) => void;
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

const initialState = {
  currentGame: null as ParsedGame | null,
  currentMoveIndex: -1,
  analysis: [] as MoveAnalysis[],
  engineState: defaultEngineState,
  boardOrientation: 'white' as const,
  showArrows: true,
};

export const useChessStore = create<ChessStore>()(
  persist(
    (set) => ({
      ...initialState,

      setGame: (game) => set({ currentGame: game, currentMoveIndex: -1, analysis: [] }),
      setMoveIndex: (index) => set({ currentMoveIndex: index }),
      setAnalysis: (analysis) => set({ analysis }),
      updateEngineState: (state) => set((prev) => ({
        engineState: { 
          ...prev.engineState, 
          ...(typeof state === 'function' ? state(prev.engineState) : state) 
        },
      })),
      toggleOrientation: () => set((prev) => ({ 
        boardOrientation: prev.boardOrientation === 'white' ? 'black' : 'white' 
      })),
      toggleArrows: () => set((prev) => ({ showArrows: !prev.showArrows })),
      reset: () => set(initialState),
    }),
    {
      name: 'chess-analyzer-storage',
      partialize: (state) => ({
        currentGame: state.currentGame,
        currentMoveIndex: state.currentMoveIndex,
        analysis: state.analysis,
        boardOrientation: state.boardOrientation,
        showArrows: state.showArrows,
        // Don't persist engineState (worker can't survive reload)
      }),
    }
  )
);
