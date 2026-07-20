"use client";

import type { AnnotatedMove } from "@/lib/types";
import { CLASS_COLORS, CLASS_LABELS } from "@/lib/classify";

export function MoveCoachPanel({
  move,
  note,
  loading,
  error,
  onExplain,
}: {
  move: AnnotatedMove | null;
  note: string | undefined;
  loading: boolean;
  error: string | null;
  onExplain: () => void;
}) {
  if (!move) {
    return (
      <div className="rounded-lg border border-dashed border-brassdim/20 p-3 text-xs text-ivorydim/50 italic">
        Select a move (from the graph, chips, or list below) to ask the coach about it specifically.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-brassdim/30 bg-graphite2/50 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="font-mono text-sm text-ivory">
          {move.moveNumber}
          {move.color === "white" ? "." : "..."} {move.san}{" "}
          <span style={{ color: CLASS_COLORS[move.classification] }}>
            ({CLASS_LABELS[move.classification]})
          </span>
        </span>
        <button
          onClick={onExplain}
          disabled={loading}
          className="text-xs px-2.5 py-1 rounded border border-brass text-brass hover:bg-brass/10 disabled:opacity-40 shrink-0"
        >
          {loading ? "Thinking…" : note ? "Regenerate" : "Explain this move"}
        </button>
      </div>
      {error && <p className="text-oxblood text-xs">{error}</p>}
      {note && <p className="text-ivorydim text-sm leading-relaxed">{note}</p>}
    </div>
  );
}
