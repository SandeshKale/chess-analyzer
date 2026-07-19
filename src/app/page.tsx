"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns";
import { DateRangeBar, type RangeMode } from "@/components/DateRangeBar";
import { GameList } from "@/components/GameList";
import { AnalysisBoard } from "@/components/AnalysisBoard";
import { EvalGraph } from "@/components/EvalGraph";
import { MoveList } from "@/components/MoveList";
import { SummaryBar } from "@/components/SummaryBar";
import { CommentaryPanel } from "@/components/CommentaryPanel";
import { parseChessComGame, START_FEN } from "@/lib/pgn";
import { StockfishEngine } from "@/lib/engine";
import { analyzeGame } from "@/lib/analyzeGame";
import type { ChessComGame, ParsedGame, GameAnalysis } from "@/lib/types";

export default function Home() {
  const [username, setUsername] = useState("Sandesh_kale");
  const [mode, setMode] = useState<RangeMode>("week");
  const [dateStr, setDateStr] = useState(() => format(new Date(), "yyyy-MM-dd"));

  const [loadingGames, setLoadingGames] = useState(false);
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [games, setGames] = useState<ParsedGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<ParsedGame | null>(null);

  const [depth, setDepth] = useState(16);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [commentary, setCommentary] = useState<string | null>(null);
  const [commentaryLoading, setCommentaryLoading] = useState(false);
  const [commentaryError, setCommentaryError] = useState<string | null>(null);

  const engineRef = useRef<StockfishEngine | null>(null);
  useEffect(() => {
    engineRef.current = new StockfishEngine();
    return () => engineRef.current?.terminate();
  }, []);

  const fetchGames = useCallback(async () => {
    setLoadingGames(true);
    setGamesError(null);
    setGames([]);
    setSelectedGame(null);
    setAnalysis(null);
    setCommentary(null);

    const date = new Date(dateStr);
    let from = date;
    let to = date;
    if (mode === "week") {
      from = startOfWeek(date, { weekStartsOn: 1 });
      to = endOfWeek(date, { weekStartsOn: 1 });
    } else if (mode === "month") {
      from = startOfMonth(date);
      to = endOfMonth(date);
    }

    try {
      const params = new URLSearchParams({
        username,
        from: from.toISOString(),
        to: to.toISOString(),
      });
      const res = await fetch(`/api/chesscom?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed to fetch games");
      const parsed = (data.games as ChessComGame[])
        .map((g) => parseChessComGame(g, username))
        .filter((g): g is ParsedGame => g !== null);
      setGames(parsed);
    } catch (err: any) {
      setGamesError(err.message || "Something went wrong fetching games.");
    } finally {
      setLoadingGames(false);
    }
  }, [username, mode, dateStr]);

  const runAnalysis = useCallback(
    async (game: ParsedGame) => {
      if (!engineRef.current) return;
      setAnalyzing(true);
      setAnalysis(null);
      setActiveIndex(null);
      setCommentary(null);
      setCommentaryError(null);
      setProgress({ done: 0, total: game.moveSans.length + 1 });
      try {
        const result = await analyzeGame(game, engineRef.current, {
          depth,
          onProgress: (done, total) => setProgress({ done, total }),
        });
        setAnalysis(result);
      } finally {
        setAnalyzing(false);
      }
    },
    [depth]
  );

  const selectGame = (g: ParsedGame) => {
    setSelectedGame(g);
    runAnalysis(g);
  };

  const generateCommentary = useCallback(async () => {
    if (!selectedGame || !analysis) return;
    setCommentaryLoading(true);
    setCommentaryError(null);
    try {
      const res = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          myUsername: username,
          playedAs: selectedGame.playedAs,
          opponent: selectedGame.opponent,
          result: selectedGame.result,
          opening: selectedGame.opening,
          moves: analysis.moves.map((m) => ({
            moveNumber: m.moveNumber,
            color: m.color,
            san: m.san,
            classification: m.classification,
            cpLoss: m.cpLoss,
            bestMoveSan: m.bestMoveSan,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed to generate commentary");
      setCommentary(data.commentary);
    } catch (err: any) {
      setCommentaryError(err.message || "Something went wrong generating commentary.");
    } finally {
      setCommentaryLoading(false);
    }
  }, [selectedGame, analysis, username]);

  const activeMove = analysis && activeIndex !== null ? analysis.moves[activeIndex] : null;
  const boardFen = activeMove
    ? activeMove.fenAfter
    : selectedGame?.fensAfterMove.slice(-1)[0] ?? START_FEN;

  return (
    <main className="min-h-screen bg-graphite text-ivory px-4 py-8 sm:px-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass mb-2">
          Self-hosted · unlimited · Stockfish 18
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-ivory">Game Review</h1>
        <p className="text-ivorydim mt-1">
          Pull your chess.com games, run them through a full local engine, and get plain-English
          coaching on what actually happened.
        </p>
      </header>

      <section className="mb-8">
        <DateRangeBar
          username={username}
          onUsernameChange={setUsername}
          mode={mode}
          onModeChange={setMode}
          date={dateStr}
          onDateChange={setDateStr}
          onFetch={fetchGames}
          loading={loadingGames}
        />
        {gamesError && <p className="text-oxblood text-sm mt-3">{gamesError}</p>}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
        <section>
          <h2 className="font-display text-lg mb-3">{games.length > 0 ? `${games.length} games` : "Games"}</h2>
          <GameList games={games} selectedId={selectedGame?.id ?? null} onSelect={selectGame} />
        </section>

        <section>
          {!selectedGame && (
            <div className="h-full flex items-center justify-center text-ivorydim/50 italic border border-dashed border-brassdim/20 rounded-lg py-16">
              Select a game to run the engine on it.
            </div>
          )}

          {selectedGame && (
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
                    onChange={(e) => setDepth(parseInt(e.target.value, 10))}
                    className="bg-graphite2 border border-brassdim/30 rounded px-2 py-1"
                  >
                    <option value={12}>12 · quick</option>
                    <option value={16}>16 · standard</option>
                    <option value={20}>20 · deep</option>
                    <option value={24}>24 · very deep</option>
                  </select>
                  <button
                    onClick={() => runAnalysis(selectedGame)}
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
                  <EvalGraph moves={analysis.moves} activeIndex={activeIndex} onSelect={setActiveIndex} />
                  <SummaryBar analysis={analysis} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <MoveList moves={analysis.moves} activeIndex={activeIndex} onSelect={setActiveIndex} />
                    <CommentaryPanel
                      commentary={commentary}
                      loading={commentaryLoading}
                      error={commentaryError}
                      onGenerate={generateCommentary}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
