"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns";
import { BottomTabBar, type TabKey } from "@/components/BottomTabBar";
import { HomeTab } from "@/components/tabs/HomeTab";
import { GamesTab } from "@/components/tabs/GamesTab";
import { AnalysisTab } from "@/components/tabs/AnalysisTab";
import type { RangeMode } from "@/components/DateRangeBar";
import { parseChessComGame, START_FEN } from "@/lib/pgn";
import { StockfishEngine } from "@/lib/engine";
import { analyzeGame } from "@/lib/analyzeGame";
import type { ChessComGame, ParsedGame, GameAnalysis } from "@/lib/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");

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

  const [moveNotes, setMoveNotes] = useState<Record<number, string>>({});
  const [moveNoteLoadingIndex, setMoveNoteLoadingIndex] = useState<number | null>(null);
  const [moveNoteError, setMoveNoteError] = useState<string | null>(null);

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
      setMoveNotes({});
      setMoveNoteError(null);
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

  // Selecting a game from Search jumps straight to Analysis — that's the
  // whole point of picking one, and it mirrors what a native app would do.
  const selectGame = (g: ParsedGame) => {
    setSelectedGame(g);
    setActiveTab("analysis");
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

  const explainMove = useCallback(
    async (index: number) => {
      if (!analysis || !selectedGame) return;
      if (moveNotes[index]) return; // already fetched, nothing to do
      setMoveNoteLoadingIndex(index);
      setMoveNoteError(null);
      try {
        const m = analysis.moves[index];
        const res = await fetch("/api/groq/move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            myUsername: username,
            playedAs: selectedGame.playedAs,
            opponent: selectedGame.opponent,
            moveNumber: m.moveNumber,
            color: m.color,
            san: m.san,
            classification: m.classification,
            cpLoss: m.cpLoss,
            bestMoveSan: m.bestMoveSan,
            pvSan: m.evalBefore.pvSan,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "failed to get move commentary");
        setMoveNotes((prev) => ({ ...prev, [index]: data.commentary }));
      } catch (err: any) {
        setMoveNoteError(err.message || "Something went wrong explaining that move.");
      } finally {
        setMoveNoteLoadingIndex(null);
      }
    },
    [analysis, selectedGame, username, moveNotes]
  );

  const activeMove = analysis && activeIndex !== null ? analysis.moves[activeIndex] : null;
  const boardFen = activeMove
    ? activeMove.fenAfter
    : selectedGame?.fensAfterMove.slice(-1)[0] ?? START_FEN;

  return (
    <main className="min-h-screen bg-graphite text-ivory">
      <div className="px-4 py-8 sm:px-8 max-w-3xl mx-auto pb-24">
        {activeTab === "home" && (
          <HomeTab
            username={username}
            lastGame={selectedGame}
            lastAnalysis={analysis}
            onGoToGames={() => setActiveTab("games")}
            onGoToAnalysis={() => setActiveTab("analysis")}
          />
        )}

        {activeTab === "games" && (
          <GamesTab
            username={username}
            onUsernameChange={setUsername}
            mode={mode}
            onModeChange={setMode}
            date={dateStr}
            onDateChange={setDateStr}
            onFetch={fetchGames}
            loading={loadingGames}
            gamesError={gamesError}
            games={games}
            selectedGameId={selectedGame?.id ?? null}
            onSelectGame={selectGame}
          />
        )}

        {activeTab === "analysis" && (
          <AnalysisTab
            username={username}
            selectedGame={selectedGame}
            depth={depth}
            onDepthChange={setDepth}
            analyzing={analyzing}
            progress={progress}
            onRerun={() => selectedGame && runAnalysis(selectedGame)}
            analysis={analysis}
            activeIndex={activeIndex}
            onSelectMove={setActiveIndex}
            activeMove={activeMove}
            boardFen={boardFen}
            commentary={commentary}
            commentaryLoading={commentaryLoading}
            commentaryError={commentaryError}
            onGenerateCommentary={generateCommentary}
            onGoToGames={() => setActiveTab("games")}
            moveNotes={moveNotes}
            moveNoteLoadingIndex={moveNoteLoadingIndex}
            moveNoteError={moveNoteError}
            onExplainMove={explainMove}
          />
        )}
      </div>

      <BottomTabBar active={activeTab} onChange={setActiveTab} />
    </main>
  );
}
