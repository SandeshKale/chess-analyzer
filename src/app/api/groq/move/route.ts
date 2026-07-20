import { NextRequest, NextResponse } from "next/server";

const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GROQ_API_KEY is not set. Get a free key at console.groq.com and add it to .env.local (or your Vercel project's env vars) — see README.",
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
    moveNumber,
    color,
    san,
    classification,
    cpLoss,
    bestMoveSan,
    pvSan,
  }: {
    myUsername: string;
    playedAs: "white" | "black";
    opponent: string;
    moveNumber: number;
    color: "white" | "black";
    san: string;
    classification: string;
    cpLoss: number;
    bestMoveSan: string | null;
    pvSan?: string[];
  } = body;

  const systemPrompt =
    "You are a chess coach. You are given ONE specific move from a club player's game, its " +
    "engine classification, and what the engine preferred instead if different. In 2-4 sentences, " +
    "explain in plain language why this move was (or wasn't) a problem, what idea the engine's " +
    "suggestion follows instead, and one concrete takeaway. Plain prose, no markdown, no headers.";

  const moveLabel = `${moveNumber}${color === "white" ? "." : "..."} ${san}`;
  const alternativeLine =
    bestMoveSan && bestMoveSan !== san
      ? `Engine preferred: ${bestMoveSan}${pvSan?.length ? ` (line: ${pvSan.slice(0, 4).join(" ")})` : ""}`
      : "This was the engine's own top choice at that point.";

  const userPrompt = `Player: ${myUsername} (played ${playedAs})
Opponent: ${opponent}
Move: ${moveLabel} — classified as ${classification} (~${Math.round(cpLoss)} centipawn loss)
${alternativeLine}`;

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
        max_tokens: 180,
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
