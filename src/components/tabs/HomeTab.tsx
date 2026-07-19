"use client";

import type { GameAnalysis, ParsedGame } from "@/lib/types";

export function HomeTab({
  username,
  lastGame,
  lastAnalysis,
  onGoToGames,
  onGoToAnalysis,
}: {
  username: string;
  lastGame: ParsedGame | null;
  lastAnalysis: GameAnalysis | null;
  onGoToGames: () => void;
  onGoToAnalysis: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass mb-2">
          Self-hosted · unlimited · Stockfish 18
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-ivory">Game Review</h1>
        <p className="text-ivorydim mt-2 max-w-md">
          Pull {username}&rsquo;s chess.com games, run them through a full local engine, and get
          plain-English coaching on what actually happened.
        </p>
      </header>

      {lastGame && lastAnalysis && (
        <button
          onClick={onGoToAnalysis}
          className="text-left rounded-lg border border-brass/40 bg-graphite2 px-4 py-3 hover:border-brass transition-colors"
        >
          <p className="text-xs uppercase tracking-wide text-brass mb-1">Continue reviewing</p>
          <p className="font-body text-ivory text-sm">
            vs {lastGame.opponent} &middot;{" "}
            <span
              className={
                lastGame.result === "win"
                  ? "text-sage"
                  : lastGame.result === "loss"
                  ? "text-oxblood"
                  : "text-ivorydim"
              }
            >
              {lastGame.result}
            </span>
          </p>
          <p className="text-xs text-ivorydim/70 font-mono mt-1">
            {lastAnalysis.accuracyWhite.toFixed(1)}% / {lastAnalysis.accuracyBlack.toFixed(1)}%
            accuracy &middot; {lastAnalysis.summary.blunder} blunders &middot;{" "}
            {lastAnalysis.summary.mistake} mistakes
          </p>
        </button>
      )}

      <button
        onClick={onGoToGames}
        className="px-4 py-3 rounded-lg bg-brass text-graphite font-semibold text-sm w-fit"
      >
        Pull games →
      </button>

      <div className="rounded-lg border border-brassdim/20 p-4 text-sm text-ivorydim leading-relaxed">
        <p className="text-ivory font-display text-base mb-2">How it works</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Search pulls your games for any day, week, or month.</li>
          <li>Pick a game — Stockfish 18 analyzes every position, right in your browser.</li>
          <li>Every move gets classified, from Brilliant down to Blunder.</li>
          <li>Ask the coach for plain-English notes on the moments that mattered.</li>
        </ol>
      </div>
    </div>
  );
}
