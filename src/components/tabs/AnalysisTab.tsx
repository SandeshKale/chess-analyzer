"use client";

import { AnalysisBoard } from "@/components/AnalysisBoard";
import { EvalGraph } from "@/components/EvalGraph";
import { MoveList } from "@/components/MoveList";
import { SummaryBar } from "@/components/SummaryBar";
import { CommentaryPanel } from "@/components/CommentaryPanel";
import type { AnnotatedMove, GameAnalysis, ParsedGame } from "@/lib/types";

export function AnalysisTab({
  username,
  selectedGame,
  depth,
  onDepthChange,
  analyzing,
  progress,
  onRerun,
  analysis,
  activeIndex,
  onSelectMove,
  activeMove,
  boardFen,
  commentary,
  commentaryLoading,
  commentaryError,
  onGenerateCommentary,
  onGoToGames,
}: {
  username: string;
  selectedGame: ParsedGame | null;
  depth: number;
  onDepthChange: (d: number) => void;
  analyzing: boolean;
  progress: { done: number; total: number };
  onRerun: () => void;
  analysis: GameAnalysis | null;
  activeIndex: number | null;
  onSelectMove: (i: number) => void;
  activeMove: AnnotatedMove | null;
  boardFen: string;
  commentary: string | null;
  commentaryLoading: boolean;
  commentaryError: string | null;
  onGenerateCommentary: () => void;
  onGoToGames: () => void;
}) {
  if (!selectedGame) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-4 py-20">
        <p className="text-ivorydim/60 italic">Nothing to analyze yet.</p>
        <button
          onClick={onGoToGames}
          className="px-4 py-2 rounded-lg border border-brass text-brass text-sm"
        >
          Go search for a game →
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="font-mono text-sm text-ivorydim">
            {username} ({selectedGame.playedAs}) vs {selectedGame.opponent}
          </p>
          <p className="text-xs text-ivorydim/60">{selectedGame.opening ?? "Unknown opening"}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <label className="text-ivorydim/70">Depth</label>
          <select
            value={depth}
            onChange={(e) => onDepthChange(parseInt(e.target.value, 10))}
            className="bg-graphite2 border border-brassdim/30 rounded px-2 py-1"
          >
            <option value={12}>12 · quick</option>
            <option value={16}>16 · standard</option>
            <option value={20}>20 · deep</option>
            <option value={24}>24 · very deep</option>
          </select>
          <button
            onClick={onRerun}
            disabled={analyzing}
            className="px-3 py-1 rounded border border-brass text-brass disabled:opacity-40"
          >
            {analyzing ? `Analyzing ${progress.done}/${progress.total}` : "Re-run"}
          </button>
        </div>
      </div>

      {analyzing && !analysis && (
        <div className="w-full h-2 rounded bg-graphite2 overflow-hidden">
          <div
            className="h-full bg-brass transition-all"
            style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
          />
        </div>
      )}

      <AnalysisBoard fen={boardFen} orientation={selectedGame.playedAs} move={activeMove} />

      {analysis && (
        <>
          <EvalGraph moves={analysis.moves} activeIndex={activeIndex} onSelect={onSelectMove} />
          <SummaryBar analysis={analysis} activeIndex={activeIndex} onSelect={onSelectMove} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MoveList moves={analysis.moves} activeIndex={activeIndex} onSelect={onSelectMove} />
            <CommentaryPanel
              commentary={commentary}
              loading={commentaryLoading}
              error={commentaryError}
              onGenerate={onGenerateCommentary}
            />
          </div>
        </>
      )}
    </div>
  );
}
