import { NextRequest, NextResponse } from "next/server";

const GROQ_MODEL = "llama-3.3-70b-versatile"; // fast + free-tier friendly on Groq as of mid-2026

interface CommentaryMoveInput {
  moveNumber: number;
  color: "white" | "black";
  san: string;
  classification: string;
  cpLoss: number;
  bestMoveSan: string | null;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GROQ_API_KEY is not set. Get a free key at console.groq.com and add it to .env.local (see README).",
      },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const {
    myUsername,
    playedAs,
    opponent,
    result,
    opening,
    moves,
  }: {
    myUsername: string;
    playedAs: "white" | "black";
    opponent: string;
    result: string;
    opening: string | null;
    moves: CommentaryMoveInput[];
  } = body;

  // Only send the moves worth commenting on (mistakes/blunders/brilliancies) plus
  // a couple of neighbors for context, to keep the prompt small and within the
  // free tier's token limits.
  const notable = moves.filter((m) =>
    ["blunder", "mistake", "inaccuracy", "brilliant"].includes(m.classification)
  );

  const movesText = notable.length
    ? notable
        .map(
          (m) =>
            `${m.moveNumber}${m.color === "white" ? "." : "..."} ${m.san} — ${m.classification}` +
            (m.bestMoveSan && m.bestMoveSan !== m.san ? ` (engine preferred ${m.bestMoveSan})` : "")
        )
        .join("\n")
    : "No notable inaccuracies, mistakes, or blunders — a clean game by engine standards.";

  const systemPrompt =
    "You are a chess coach giving concise, encouraging but honest feedback to a club player. " +
    "You are given a list of only the engine-flagged moments from one game (blunders, mistakes, " +
    "inaccuracies, brilliancies) along with what the engine preferred instead. Explain the likely " +
    "practical/human reason each moment happened (e.g. missed tactic, time pressure, wrong plan) and " +
    "one concrete lesson to take away. Keep it under 200 words, plain text, no markdown headers.";

  const userPrompt = `Player: ${myUsername} (played ${playedAs})
Opponent: ${opponent}
Result: ${result}
Opening: ${opening ?? "unknown"}

Flagged moments:
${movesText}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Groq API error ${res.status}: ${errText.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const commentary: string = data?.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ commentary });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "failed to reach Groq" }, { status: 502 });
  }
}
