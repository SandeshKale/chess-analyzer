"use client";

import { DateRangeBar, type RangeMode } from "@/components/DateRangeBar";
import { GameList } from "@/components/GameList";
import type { ParsedGame } from "@/lib/types";

export function GamesTab({
  username,
  onUsernameChange,
  mode,
  onModeChange,
  date,
  onDateChange,
  onFetch,
  loading,
  gamesError,
  games,
  selectedGameId,
  onSelectGame,
}: {
  username: string;
  onUsernameChange: (v: string) => void;
  mode: RangeMode;
  onModeChange: (m: RangeMode) => void;
  date: string;
  onDateChange: (d: string) => void;
  onFetch: () => void;
  loading: boolean;
  gamesError: string | null;
  games: ParsedGame[];
  selectedGameId: string | null;
  onSelectGame: (g: ParsedGame) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ivory mb-4">Search games</h1>
        <DateRangeBar
          username={username}
          onUsernameChange={onUsernameChange}
          mode={mode}
          onModeChange={onModeChange}
          date={date}
          onDateChange={onDateChange}
          onFetch={onFetch}
          loading={loading}
        />
        {gamesError && <p className="text-oxblood text-sm mt-3">{gamesError}</p>}
      </div>

      <div>
        <h2 className="font-display text-lg mb-3">{games.length > 0 ? `${games.length} games` : "Games"}</h2>
        <GameList games={games} selectedId={selectedGameId} onSelect={onSelectGame} />
      </div>
    </div>
  );
}
