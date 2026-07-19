# ♟️ Chess.com Games Analyzer

A production-grade chess game analysis tool built with **React 18**, **TypeScript**, **Stockfish 16 NNUE (WASM)**, and the **Chess.com Public API**. Analyze your games with engine-powered evaluations, opening book lookups, move classifications, and export annotated PGNs.

[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Stockfish](https://img.shields.io/badge/Stockfish-16-81b64c?logo=chess.com&logoColor=white)](https://stockfishchess.org/)
[![Zustand](https://img.shields.io/badge/Zustand-4.5-FF9F43?logo=react&logoColor=white)](https://github.com/pmndrs/zustand)

---

## ✨ Features

### 🔍 Game Import
- **Paste PGN** — Import any standard PGN with full header support
- **Chess.com Integration** — Fetch games directly by username via the official Chess.com PubAPI
- **Sample Game Loader** — Quick-load a World Championship game for testing

### 🧠 Engine Analysis
- **Stockfish 16 NNUE** — Runs entirely in the browser via WASM (no backend required)
- **Real-time Position Analysis** — Analyze any position with configurable depth (14–24)
- **MultiPV Support** — View up to 5 top engine lines simultaneously
- **Full Game Analysis** — Batch-analyze entire games with progress tracking
- **Move Classifications** — Automatic tagging: Brilliant, Great, Best, Excellent, Good, Inaccuracy, Mistake, Blunder

### 📊 Visualization
- **Interactive Chessboard** — `react-chessboard` with smooth animations
- **Evaluation Bar** — Real-time centipawn display with visual bar
- **Engine Arrows** — Shows best-move arrows on the board
- **Move List** — Clickable move navigator with classification colors
- **Game Stats** — Aggregate breakdown of move quality

### 📚 Opening Book
- **Lichess Masters DB** — Automatic opening name and ECO code lookup
- **Master Statistics** — Win/Draw/Loss ratios from master games

### 💾 Export & Persistence
- **Annotated PGN Export** — Download analysis with `[%eval]` and `[%cal]` annotations
- **State Persistence** — Zustand `persist` middleware saves sessions to `localStorage`

---

## 🏗️ Architecture

```
chess-analyzer/
├── src/
│   ├── components/          # React UI components
│   │   ├── ChessBoard.tsx   # Interactive board with arrows
│   │   ├── EngineControls.tsx # Analysis triggers & export
│   │   ├── MoveList.tsx     # Clickable move navigator
│   │   ├── EvaluationBar.tsx # Live eval display
│   │   ├── AnalysisPanel.tsx # Move stats & opening info
│   │   └── GameImporter.tsx # PGN paste & Chess.com fetch
│   ├── engine/
│   │   └── stockfishEngine.ts # UCI wrapper with Promise API
│   ├── hooks/
│   │   ├── useChessStore.ts  # Zustand state + persist
│   │   ├── useChessGame.ts   # Game navigation logic
│   │   ├── useStockfish.ts   # Engine React hook
│   │   └── useAnalysis.ts    # Full-game batch analysis
│   ├── services/
│   │   ├── chesscomApi.ts    # Chess.com PubAPI client
│   │   └── openingBook.ts    # Lichess Masters DB client
│   ├── utils/
│   │   ├── chessHelpers.ts   # PGN parser, FEN builder
│   │   ├── evaluation.ts     # Move classification logic
│   │   └── export.ts         # Annotated PGN generator
│   ├── types/
│   │   └── index.ts          # Shared TypeScript interfaces
│   └── test/                 # Unit tests (Vitest)
│       ├── chessHelpers.test.ts
│       ├── evaluation.test.ts
│       ├── export.test.ts
│       ├── chesscomApi.test.ts
│       └── openingBook.test.ts
├── public/                   # Static assets
├── eslint.config.js          # ESLint flat config
├── vitest.config.ts          # Vitest test config
└── vite.config.ts            # Vite build config
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Stockfish via CDN** | WASM loaded from jsDelivr for zero backend. For BFSI deployments, vendor to `public/` for CSP/SRI compliance. |
| **Promise-based Engine** | `analyzePositionAsync()` resolves on `bestmove`, enabling clean `async/await` in analysis loops. |
| **Zustand + Persist** | Lightweight state management with automatic `localStorage` hydration. Engine state excluded (workers don't survive reloads). |
| **No Backend Proxy** | Chess.com PubAPI sends `Access-Control-Allow-Origin: *`, enabling direct browser calls. |

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/SandeshKale/chess-analyzer.git
cd chess-analyzer

# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm run test

# Run tests with coverage
npm run coverage

# Lint
npm run lint

# Production build
npm run build
```

---

## 🧪 Testing

Tests are written with **Vitest** + **React Testing Library** + **jsdom**.

```bash
# Watch mode
npm run test

# CI mode
npm run test:run

# Coverage report
npm run coverage
```

### Test Coverage

| Module | Tests |
|--------|-------|
| `utils/chessHelpers` | PGN parsing, FEN generation, move indexing |
| `utils/evaluation` | Move classification, eval formatting, percentage conversion |
| `utils/export` | Annotated PGN generation |
| `services/chesscomApi` | Archive fetching, error handling (404/429), URL parsing |
| `services/openingBook` | Lichess opening lookup, error resilience |

---

## 📝 Usage Guide

### Analyzing a Chess.com Game

1. Click the **Chess.com** tab in the importer
2. Enter your username (e.g., `MagnusCarlsen`)
3. Click **Fetch Archives** — your monthly game archives appear
4. Select a month — games load with ratings, time controls, and accuracies
5. Click any game to load it into the analyzer

### Running Full Analysis

1. Load a game (via PGN or Chess.com)
2. In the **Engine** panel, set desired **Depth** (18 recommended) and **Lines**
3. Click **Run Full Game Analysis**
4. Watch the progress bar — each move is analyzed before and after to compute accurate classification
5. Navigate moves in the list or with arrow buttons to see per-move details

### Exporting Results

Once analysis is complete, click **Export Annotated PGN** to download a file with:
- `[%eval +0.45]` markers after every move
- `[%cal e2e4]` arrows showing engine best moves
- Classification comments (`Excellent`, `Mistake.`, `Blunder!`, etc.)

---

## ⚙️ Configuration

### Engine Settings

| Setting | Range | Default | Description |
|---------|-------|---------|-------------|
| Depth | 14–24 | 20 | Search depth in plies |
| Lines | 1–5 | 3 | MultiPV — number of top variations |

### Environment Variables (optional)

For custom deployments, create `.env.local`:

```env
# Override Stockfish CDN (for CSP compliance)
VITE_STOCKFISH_URL=/stockfish/stockfish-nnue-16.js
```

---

## 🔒 Security Considerations

- **PGN Input Sanitization** — All moves are validated through `chess.js` before state acceptance
- **No Token Storage** — Chess.com API is public/read-only; no auth tokens needed
- **CSP Compliance** — Stockfish loads from CDN by default. For strict CSP, vendor the `.js` and `.wasm` files to `public/stockfish/`
- **XSS Prevention** — PGN content is never rendered as HTML; all display uses text nodes

---

## 🛣️ Roadmap

- [ ] Cloud analysis with persistent server-side Stockfish
- [ ] Lichess game import (OAuth integration)
- [ ] Interactive tactics trainer from blunders
- [ ] Time-usage analysis (if PGN contains clock annotations)
- [ ] Shareable analysis links (encode FEN + evals in URL)

---

## 📄 License

MIT License — feel free to fork, modify, and deploy.

---

Built with ♟️ by a 10-year BFSI full-stack engineer who believes chess analysis should be as rigorous as production code.
