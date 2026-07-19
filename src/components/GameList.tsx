import type { ParsedGame } from "@/lib/types";
import { format } from "date-fns";

export function GameList({
  games,
  selectedId,
  onSelect,
}: {
  games: ParsedGame[];
  selectedId: string | null;
  onSelect: (g: ParsedGame) => void;
}) {
  if (games.length === 0) {
    return <p className="text-ivorydim/60 text-sm italic">No games found in this range yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto pr-1">
      {games.map((g) => {
        const resultColor =
          g.result === "win" ? "text-sage" : g.result === "loss" ? "text-oxblood" : "text-ivorydim";
        return (
          <button
            key={g.id}
            onClick={() => onSelect(g)}
            className={`text-left rounded-lg border px-3 py-2 transition-colors ${
              selectedId === g.id ? "border-brass bg-graphite2" : "border-brassdim/20 hover:border-brassdim/50"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-body text-ivory text-sm truncate">
                vs {g.opponent} <span className="text-ivorydim">({g.opponentRating})</span>
              </span>
              <span className={`text-xs font-mono uppercase shrink-0 ${resultColor}`}>{g.result}</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-ivorydim/70 font-mono gap-2">
              <span className="truncate">{g.opening ?? "Unknown opening"}</span>
              <span className="shrink-0">
                {format(g.endTime, "d MMM, HH:mm")} · {g.timeClass}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
