import { Chess } from "chess.js";
import { StockfishEngine } from "./engine";
import { classifyMove, evalToCp } from "./classify";
import type { ParsedGame, AnnotatedMove, GameAnalysis, MoveClassLabel } from "./types";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const PIECE_VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

// lichess-style ACPL -> accuracy% logistic curve
function accuracyFromAcpl(acpl: number): number {
  return Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * acpl) - 3.1668));
}

export async function analyzeGame(
  game: ParsedGame,
  engine: StockfishEngine,
  opts: { depth?: number; onProgress?: (done: number, total: number) => void } = {}
): Promise<GameAnalysis> {
  const depth = opts.depth ?? 16;
  const allFens = [START_FEN, ...game.fensAfterMove]; // n+1 positions for n moves

  // Evaluate every distinct position exactly once (position i is both "after move i"
  // and "before move i+1"), instead of evaluating each move's before/after separately.
  const evals = [];
  for (let i = 0; i < allFens.length; i++) {
    evals.push(await engine.evaluate(allFens[i], { depth }));
    opts.onProgress?.(i, allFens.length - 1);
  }

  const boardChess = new Chess(); // used to check for material sacrifices, move by move
  const moves: AnnotatedMove[] = [];
  const summary: Record<MoveClassLabel, number> = {
    book: 0,
    best: 0,
    excellent: 0,
    good: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
    brilliant: 0,
  };

  let cpLossSumWhite = 0,
    cpLossCountWhite = 0,
    cpLossSumBlack = 0,
    cpLossCountBlack = 0;

  for (let i = 0; i < game.moveSans.length; i++) {
    const san = game.moveSans[i];
    const color: "white" | "black" = i % 2 === 0 ? "white" : "black";
    const ply = i + 1;
    const evalBefore = evals[i];
    const evalAfter = evals[i + 1];

    const wasBestMove = evalBefore.bestMoveSan === san;

    const moveObj = boardChess.move(san);
    let sacHeuristic = false;
    if (moveObj?.captured) {
      const capturedVal = PIECE_VALUE[moveObj.captured] ?? 0;
      const movingVal = PIECE_VALUE[moveObj.piece] ?? 0;
      if (movingVal > capturedVal + 1) sacHeuristic = true;
    }

    const { classification: baseClass, cpLoss } = classifyMove({
      moverColor: color,
      ply,
      evalBefore,
      evalAfter,
      wasBestMove,
    });

    let classification = baseClass;
    const sign = color === "white" ? 1 : -1;
    const afterMover = sign * evalToCp(evalAfter);
    if (baseClass === "best" && sacHeuristic && afterMover >= 150) {
      classification = "brilliant"; // heuristic: engine's top move + apparent material sac + still clearly favorable
    }

    summary[classification]++;
    if (color === "white") {
      cpLossSumWhite += cpLoss;
      cpLossCountWhite++;
    } else {
      cpLossSumBlack += cpLoss;
      cpLossCountBlack++;
    }

    moves.push({
      ply,
      moveNumber: Math.floor(i / 2) + 1,
      color,
      san,
      fenBefore: allFens[i],
      fenAfter: allFens[i + 1],
      evalBefore,
      evalAfter,
      classification,
      cpLoss,
      bestMoveSan: evalBefore.bestMoveSan,
      wasBestMove,
    });
  }

  const accuracyWhite = cpLossCountWhite ? accuracyFromAcpl(cpLossSumWhite / cpLossCountWhite) : 100;
  const accuracyBlack = cpLossCountBlack ? accuracyFromAcpl(cpLossSumBlack / cpLossCountBlack) : 100;

  return { gameId: game.id, moves, accuracyWhite, accuracyBlack, summary };
}
