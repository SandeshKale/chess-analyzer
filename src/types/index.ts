export interface AnalysisLine {
  depth: number;
  score: number;
  mate?: number;
  pv: string[]; // UCI moves
  multipvIndex: number;
}

export interface MoveAnalysis {
  san: string;
  uci: string;
  fen: string;
  moveNumber: number;
  isWhite: boolean;
  evaluation: number; // centipawns from white's perspective
  classification: MoveClassification;
  bestLine?: AnalysisLine;
  alternatives: AnalysisLine[];
  timeSpent?: number; // ms, from PGN
}

export type MoveClassification = 
  | 'brilliant' 
  | 'great' 
  | 'best' 
  | 'excellent' 
  | 'good' 
  | 'inaccuracy' 
  | 'mistake' 
  | 'blunder';

export interface GameHeader {
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  white?: string;
  black?: string;
  result?: string;
  whiteElo?: number;
  blackElo?: number;
  timeControl?: string;
  termination?: string;
}

export interface ParsedGame {
  headers: GameHeader;
  moves: string[]; // SAN strings
  rawPgn: string;
}

export interface EngineState {
  isReady: boolean;
  isAnalyzing: boolean;
  depth: number;
  multipv: number;
  lines: AnalysisLine[];
}

export interface AppState {
  currentGame: ParsedGame | null;
  currentMoveIndex: number;
  analysis: MoveAnalysis[];
  engineState: EngineState;
  boardOrientation: 'white' | 'black';
  showArrows: boolean;
}
