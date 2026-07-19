import { NextRequest, NextResponse } from "next/server";
import type { ChessComGame } from "@/lib/types";

// Chess.com asks integrations to send a descriptive User-Agent.
// Update the contact email if you want abuse reports to reach you.
const UA = "chess-analyzer/0.1 (personal use; contact: set-your-email@example.com)";

function monthsBetween(from: Date, to: Date): { y: number; m: number }[] {
  const months: { y: number; m: number }[] = [];
  const cur = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(to.getFullYear(), to.getMonth(), 1);
  while (cur <= end) {
    months.push({ y: cur.getFullYear(), m: cur.getMonth() + 1 });
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get("username") || "").trim().toLowerCase();
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");

  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }
  if (!fromStr || !toStr) {
    return NextResponse.json({ error: "from and to (ISO dates) are required" }, { status: 400 });
  }

  const from = new Date(fromStr);
  const to = new Date(toStr);
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return NextResponse.json({ error: "invalid date" }, { status: 400 });
  }

  const fromTs = from.getTime() / 1000;
  // include the whole "to" day
  const toTs = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59).getTime() / 1000;

  const months = monthsBetween(from, to);

  try {
    const monthlyGames = await Promise.all(
      months.map(async ({ y, m }) => {
        const mm = String(m).padStart(2, "0");
        const url = `https://api.chess.com/pub/player/${username}/games/${y}/${mm}`;
        const res = await fetch(url, { headers: { "User-Agent": UA }, next: { revalidate: 0 } });
        if (res.status === 404) return []; // no games that month
        if (!res.ok) {
          throw new Error(`chess.com responded ${res.status} for ${y}-${mm}`);
        }
        const data = (await res.json()) as { games: ChessComGame[] };
        return data.games || [];
      })
    );

    const games = monthlyGames
      .flat()
      .filter((g) => g.end_time >= fromTs && g.end_time <= toTs)
      .sort((a, b) => b.end_time - a.end_time);

    return NextResponse.json({ games });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "failed to fetch chess.com games" },
      { status: 502 }
    );
  }
}
