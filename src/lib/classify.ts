import type { PositionEval, MoveClassLabel } from "./types";

/** Converts an engine eval into a single signed centipawn number from White's
 * perspective, treating forced mate as a very large magnitude so comparisons
 * still behave sensibly (mate-in-1 outranks mate-in-5 outranks any cp score). */
export function evalToCp(ev: PositionEval): number {
  if (ev.mate !== null) {
    const sign = ev.mate > 0 ? 1 : -1;
    return sign * (100000 - Math.abs(ev.mate) * 100);
  }
  return ev.cp ?? 0;
}

const BOOK_PLY_CUTOFF = 10; // first 5 full moves treated as opening theory by default

export function classifyMove(params: {
  moverColor: "white" | "black";
  ply: number;
  evalBefore: PositionEval; // position before the move (mover to move) — represents best case
  evalAfter: PositionEval; // position after the move actually played
  wasBestMove: boolean;
}): { classification: MoveClassLabel; cpLoss: number } {
  const { moverColor, ply, evalBefore, evalAfter, wasBestMove } = params;

  const sign = moverColor === "white" ? 1 : -1;
  const before = sign * evalToCp(evalBefore); // best achievable, mover's perspective
  const after = sign * evalToCp(evalAfter); // what actually resulted, mover's perspective
  const cpLoss = Math.max(0, before - after);

  if (ply <= BOOK_PLY_CUTOFF && cpLoss < 30) {
    return { classification: "book", cpLoss };
  }
  if (wasBestMove) {
    return { classification: "best", cpLoss };
  }
  if (cpLoss < 20) return { classification: "excellent", cpLoss };
  if (cpLoss < 50) return { classification: "good", cpLoss };
  if (cpLoss < 100) return { classification: "inaccuracy", cpLoss };
  if (cpLoss < 300) return { classification: "mistake", cpLoss };
  return { classification: "blunder", cpLoss };
}

export const CLASS_COLORS: Record<MoveClassLabel, string> = {
  brilliant: "#3FA7C9",
  best: "#6E8F71",
  excellent: "#7DA37F",
  good: "#B8956A",
  book: "#8A7256",
  inaccuracy: "#B08B3F",
  mistake: "#C97B3F",
  blunder: "#8C3A3A",
};

export const CLASS_LABELS: Record<MoveClassLabel, string> = {
  brilliant: "Brilliant",
  best: "Best",
  excellent: "Excellent",
  good: "Good",
  book: "Book",
  inaccuracy: "Inaccuracy",
  mistake: "Mistake",
  blunder: "Blunder",
};
