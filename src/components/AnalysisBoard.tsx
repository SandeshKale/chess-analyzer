"use client";

import { useMemo } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { Arrow } from "react-chessboard";
import type { AnnotatedMove } from "@/lib/types";
import { CLASS_COLORS, CLASS_LABELS } from "@/lib/classify";
import { staunton3DPieces, Staunton3DDefs } from "@/lib/staunton3dPieces";

export function AnalysisBoard({
  fen,
  orientation,
  move,
}: {
  fen: string;
  orientation: "white" | "black";
  move: AnnotatedMove | null;
}) {
  const { arrows, squareStyles } = useMemo(() => {
    if (!move) return { arrows: [] as Arrow[], squareStyles: {} as Record<string, React.CSSProperties> };

    // Recover the actual from/to squares of the move that was played, so we
    // can draw its path — not just the engine's suggested alternative.
    let playedFrom: string | null = null;
    let playedTo: string | null = null;
    try {
      const chess = new Chess(move.fenBefore);
      const played = chess.move(move.san);
      playedFrom = played.from;
      playedTo = played.to;
    } catch {
      // shouldn't happen since these SANs came from a successfully parsed
      // game, but fall back gracefully to no arrow rather than crashing
    }

    const classColor = CLASS_COLORS[move.classification];
    const arrows: Arrow[] = [];
    const squareStyles: Record<string, React.CSSProperties> = {};

    if (playedFrom && playedTo) {
      arrows.push({ startSquare: playedFrom, endSquare: playedTo, color: classColor });
      squareStyles[playedFrom] = { backgroundColor: `${classColor}40` };
      squareStyles[playedTo] = { backgroundColor: `${classColor}66` };
    }

    if (!move.wasBestMove && move.evalBefore.bestMoveUci) {
      const uci = move.evalBefore.bestMoveUci;
      arrows.push({ startSquare: uci.slice(0, 2), endSquare: uci.slice(2, 4), color: "#B8956A" });
    }

    return { arrows, squareStyles };
  }, [move]);

  return (
    <div className="rounded-lg overflow-hidden border border-brassdim/40 shadow-lg bg-graphite2">
      <Staunton3DDefs />
      <Chessboard
        options={{
          position: fen,
          boardOrientation: orientation,
          allowDragging: false,
          pieces: staunton3DPieces,
          arrows,
          squareStyles,
          darkSquareStyle: { backgroundColor: "#4A4E58" },
          lightSquareStyle: { backgroundColor: "#EDE6D6" },
        }}
      />
      {move && (
        <div className="px-3 py-2 text-ivorydim text-sm font-mono flex items-center justify-between flex-wrap gap-1 border-t border-brassdim/20">
          <span style={{ color: CLASS_COLORS[move.classification] }} className="font-semibold">
            {move.moveNumber}
            {move.color === "white" ? "." : "..."} {move.san} — {CLASS_LABELS[move.classification]}
          </span>
          {!move.wasBestMove && move.bestMoveSan && <span>engine preferred: {move.bestMoveSan}</span>}
        </div>
      )}
    </div>
  );
}
