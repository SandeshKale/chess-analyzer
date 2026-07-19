"use client";

import type { GameAnalysis, MoveClassLabel } from "@/lib/types";
import { CLASS_COLORS, CLASS_LABELS } from "@/lib/classify";

const ORDER: MoveClassLabel[] = [
  "brilliant",
  "best",
  "excellent",
  "good",
  "book",
  "inaccuracy",
  "mistake",
  "blunder",
];

export function SummaryBar({
  analysis,
  activeIndex,
  onSelect,
}: {
  analysis: GameAnalysis;
  activeIndex: number | null;
  onSelect: (i: number) => void;
}) {
  const indicesFor = (cls: MoveClassLabel) =>
    analysis.moves.reduce<number[]>((acc, m, i) => {
      if (m.classification === cls) acc.push(i);
      return acc;
    }, []);

  const jumpTo = (cls: MoveClassLabel) => {
    const indices = indicesFor(cls);
    if (indices.length === 0) return;
    const currentPos = indices.indexOf(activeIndex ?? -1);
    const next = indices[(currentPos + 1) % indices.length];
    onSelect(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-4 text-xs font-mono">
        <span className="text-ivorydim">
          White accuracy: <span className="text-ivory">{analysis.accuracyWhite.toFixed(1)}%</span>
        </span>
        <span className="text-ivorydim">
          Black accuracy: <span className="text-ivory">{analysis.accuracyBlack.toFixed(1)}%</span>
        </span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs font-mono">
        {ORDER.filter((k) => analysis.summary[k] > 0).map((k) => {
          const indices = indicesFor(k);
          const isActiveClass = activeIndex !== null && indices.includes(activeIndex);
          return (
            <button
              key={k}
              onClick={() => jumpTo(k)}
              title={`Jump to next ${CLASS_LABELS[k]} move`}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full border transition-colors ${
                isActiveClass ? "border-brass bg-graphite2" : "border-brassdim/20 hover:border-brassdim/60"
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: CLASS_COLORS[k] }} />
              <span className="text-ivory">{analysis.summary[k]}</span>
              <span className="text-ivorydim">{CLASS_LABELS[k]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
