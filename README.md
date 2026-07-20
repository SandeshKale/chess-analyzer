# Chess Analyzer — Game Review

Pulls your chess.com games for any day/week/month, runs them through a
self-hosted Stockfish 18 engine (no API, no rate limits, runs entirely in
your browser), classifies every move (Brilliant / Best / Excellent / Good /
Book / Inaccuracy / Mistake / Blunder), and can generate plain-English
coaching notes via Groq's free LLM API.

## 1. Install

```bash
npm install
```

This project was built and verified against Node's current LTS with these
pinned, mutually-compatible versions (already locked in `package-lock.json`):
Next.js 16, React 19, react-chessboard 5.10, chess.js 1.4.

## 2. (Optional but recommended) Add a free Groq key for the "Coach's notes" panel

1. Go to https://console.groq.com, sign up (no credit card).
2. Create an API key.
3. Copy `.env.local.example` to `.env.local` and paste your key in:

```bash
cp .env.local.example .env.local
# then edit .env.local:
GROQ_API_KEY=gsk_...
```

Without this, everything else works (pulling games, engine analysis, move
classification, eval graph) — you'll just see an error if you click
"Generate" on the coaching panel.

## 3. Run it

```bash
npm run dev
```

Open http://localhost:3000. The username field defaults to `Sandesh_kale`;
change it to pull anyone's public games.

## 4. Deploy (optional)

Push to GitHub, import into Vercel. Add `GROQ_API_KEY` under
Project Settings → Environment Variables on Vercel (same value as your
`.env.local`). No other config needed — the Stockfish files in
`public/engine/` are static assets and deploy as-is.

## How it works

- **`/api/chesscom`** — server route. Given a `username` and a `from`/`to`
  date range, it works out which monthly chess.com archives overlap that
  range, fetches them, and filters to games whose end time falls in range.
  Chess.com's public API needs no auth.
- **`src/lib/pgn.ts`** — parses each game's PGN with chess.js into a move
  list + a FEN after every move, and pulls the opening name out of the PGN
  headers.
- **`src/lib/engine.ts`** — a thin wrapper around Stockfish 18 (lite,
  single-threaded WASM build, served from `/public/engine/`) that speaks UCI
  over a Web Worker. One position at a time, queued.
- **`src/lib/analyzeGame.ts`** — feeds every position in the game to the
  engine exactly once, then for each move compares "best achievable eval"
  (before the move) to "actual eval" (after the move) to get a centipawn
  loss, and buckets that into a classification. Also flags likely sacrifice
  "Brilliant" moves with a lightweight material-loss heuristic — it's not a
  full SEE-based detector, just a reasonable approximation.
- **`/api/groq`** — takes the flagged moments (blunders/mistakes/
  inaccuracies/brilliancies) from an analyzed game and asks Groq's
  `llama-3.3-70b-versatile` (free tier: 30 req/min, 1,000 req/day — plenty
  for personal use) to explain them like a coach would.

## What's new: 3D pieces, move arrows, per-move coaching

- **Fixed a real date-range bug**: "day" mode never actually computed an
  end-of-day boundary, and `new Date("YYYY-MM-DD")` parses as UTC midnight —
  both together meant results could drift or barely respond to the date
  picker. `src/lib/dateRange.ts` now parses the input as a local calendar
  date and computes exact day/week/month boundaries in your own timezone.
- **3D Staunton pieces** (`src/lib/staunton3dPieces.tsx`) are an original,
  hand-built chunky/rounded piece set (wood gradient for white, onyx for
  black, plus a cast shadow) — not a copy of any vendor's specific artwork,
  just the same general glossy 3D-look genre, built from scratch as simple
  SVG primitives so you can freely restyle it.
- **Click a move → see its path**: `AnalysisBoard` now derives the actual
  from/to squares of whatever move is selected (via chess.js) and draws an
  arrow colored by that move's classification, plus highlights both squares.
  If the move wasn't the engine's top choice, a second brass arrow shows
  what it preferred instead.
- **Per-move coaching** (`/api/groq/move`): click "Explain this move" under
  the board to get a 2-4 sentence explanation of that one move specifically,
  not just the whole-game summary. Answers are cached per move so revisiting
  one doesn't re-spend a Groq call.

## Tuning

- **Depth**: the depth selector in the UI (12/16/20/24) trades analysis
  time for accuracy. The lite-single Stockfish build is single-threaded, so
  depth 20+ on a long game can take a while — that's expected, it's genuinely
  running the engine, not calling a rate-limited API.
- **Opening book cutoff**: the first 10 half-moves are auto-labeled "Book"
  unless they lose real material (see `BOOK_PLY_CUTOFF` in
  `src/lib/classify.ts`). Adjust if you want theory recognized deeper or
  shallower into the game.
- **Multi-threaded engine**: `public/engine/` currently ships the
  single-threaded build so it works with zero server config. If you want
  more speed later, swap in the multi-threaded `stockfish-18.wasm` build
  from the `stockfish` npm package and uncomment the
  `Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy` headers in
  `next.config.js` — that build requires them.

## Known limitations

- The "Brilliant" tag is a heuristic (best move + apparent material sac +
  still clearly favorable), not a rigorous sacrifice detector — treat it as
  a hint to look closer, not gospel.
- Chess960 and other variants aren't handled; `parseChessComGame` silently
  skips games chess.js can't parse.
- Accuracy % uses the standard ACPL→accuracy logistic curve (same formula
  Lichess uses), which is an approximation, not chess.com's exact
  proprietary formula.
