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

export function SummaryBar({ analysis }: { analysis: GameAnalysis }) {
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
      <div className="flex flex-wrap gap-3 text-xs font-mono">
        {ORDER.filter((k) => analysis.summary[k] > 0).map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: CLASS_COLORS[k] }} />
            {analysis.summary[k]} {CLASS_LABELS[k]}
          </span>
        ))}
      </div>
    </div>
  );
}
