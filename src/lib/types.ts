export interface ChessComGame {
  url: string;
  pgn: string;
  end_time: number; // unix seconds
  time_control: string;
  time_class: string; // "bullet" | "blitz" | "rapid" | "daily"
  rated: boolean;
  rules: string;
  white: { username: string; rating: number; result: string };
  black: { username: string; rating: number; result: string };
}

export interface ParsedGame {
  id: string; // game url, used as react key
  raw: ChessComGame;
  playedAs: "white" | "black";
  opponent: string;
  opponentRating: number;
  myRating: number;
  result: "win" | "loss" | "draw";
  endTime: Date;
  timeClass: string;
  opening: string | null;
  moveSans: string[]; // SAN moves in order
  fensAfterMove: string[]; // FEN after each move, index-aligned with moveSans
}

export type MoveClassLabel =
  | "book"
  | "best"
  | "excellent"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder"
  | "brilliant";

export interface PositionEval {
  fen: string;
  cp: number | null; // centipawns, from White's perspective, null if mate
  mate: number | null; // moves to mate, from White's perspective (+ = white mates, - = black mates)
  bestMoveUci: string;
  bestMoveSan: string | null;
  pvSan: string[]; // principal variation in SAN, best-line continuation
  depth: number;
}

export interface AnnotatedMove {
  ply: number; // 1-indexed half-move number
  moveNumber: number; // full move number (1, 1, 2, 2, ...)
  color: "white" | "black";
  san: string;
  fenBefore: string;
  fenAfter: string;
  evalBefore: PositionEval;
  evalAfter: PositionEval;
  classification: MoveClassLabel;
  cpLoss: number; // centipawn loss from the mover's perspective, >=0
  bestMoveSan: string | null; // what the engine would have played instead
  wasBestMove: boolean;
}

export interface GameAnalysis {
  gameId: string;
  moves: AnnotatedMove[];
  accuracyWhite: number;
  accuracyBlack: number;
  summary: Record<MoveClassLabel, number>;
}
