"use client";

export type RangeMode = "day" | "week" | "month";

export function DateRangeBar({
  username,
  onUsernameChange,
  mode,
  onModeChange,
  date,
  onDateChange,
  onFetch,
  loading,
}: {
  username: string;
  onUsernameChange: (v: string) => void;
  mode: RangeMode;
  onModeChange: (m: RangeMode) => void;
  date: string;
  onDateChange: (d: string) => void;
  onFetch: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end flex-wrap">
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-ivorydim/70">Chess.com username</label>
        <input
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          className="bg-graphite2 border border-brassdim/30 rounded px-3 py-2 text-ivory font-mono text-sm min-w-[180px]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-ivorydim/70">Range</label>
        <div className="flex rounded border border-brassdim/30 overflow-hidden">
          {(["day", "week", "month"] as RangeMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`px-3 py-2 text-sm capitalize transition-colors ${
                mode === m ? "bg-brass text-graphite font-semibold" : "text-ivorydim hover:bg-graphite2"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-ivorydim/70">
          {mode === "day" ? "Date" : mode === "week" ? "Any day in the week" : "Any day in the month"}
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-graphite2 border border-brassdim/30 rounded px-3 py-2 text-ivory font-mono text-sm"
        />
      </div>

      <button
        onClick={onFetch}
        disabled={loading}
        className="px-4 py-2 rounded bg-brass text-graphite font-semibold text-sm disabled:opacity-40 h-[42px]"
      >
        {loading ? "Fetching…" : "Fetch games"}
      </button>
    </div>
  );
}
