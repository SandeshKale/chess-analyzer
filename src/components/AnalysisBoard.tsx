"use client";

import { Chessboard } from "react-chessboard";
import type { AnnotatedMove } from "@/lib/types";
import { CLASS_COLORS, CLASS_LABELS } from "@/lib/classify";

export function AnalysisBoard({
  fen,
  orientation,
  move,
}: {
  fen: string;
  orientation: "white" | "black";
  move: AnnotatedMove | null;
}) {
  const arrows =
    move && !move.wasBestMove && move.evalBefore.bestMoveUci
      ? [
          {
            startSquare: move.evalBefore.bestMoveUci.slice(0, 2),
            endSquare: move.evalBefore.bestMoveUci.slice(2, 4),
            color: "#B8956A",
          },
        ]
      : [];

  return (
    <div className="rounded-lg overflow-hidden border border-brassdim/40 shadow-lg bg-graphite2">
      <Chessboard
        options={{
          position: fen,
          boardOrientation: orientation,
          allowDragging: false,
          arrows,
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
