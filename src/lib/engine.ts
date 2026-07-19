"use client";

import { Chess } from "chess.js";
import type { PositionEval } from "./types";

interface PendingEval {
  fen: string;
  depth: number;
  multipv: number;
  resolve: (ev: PositionEval) => void;
  reject: (err: unknown) => void;
  bestLineByMultipv: Map<number, { cp: number | null; mate: number | null; pvUci: string[] }>;
  latestDepthSeen: number;
}

/**
 * Thin wrapper around the Stockfish 18 (lite, single-threaded) WASM build
 * served from /public/engine. Talks classic UCI over postMessage, exactly
 * like nmrugg/stockfish.js (the same engine chess.com uses in-browser).
 *
 * One engine instance processes one position at a time; calls to evaluate()
 * are queued and resolved in order.
 */
export class StockfishEngine {
  private worker: Worker;
  private readyPromise: Promise<void>;
  private queue: PendingEval[] = [];
  private current: PendingEval | null = null;

  constructor() {
    if (typeof window === "undefined") {
      throw new Error("StockfishEngine can only be constructed in the browser");
    }
    this.worker = new Worker("/engine/stockfish-18-lite-single.js");

    let resolveReady!: () => void;
    this.readyPromise = new Promise((res) => (resolveReady = res));

    this.worker.onmessage = (e: MessageEvent) => {
      const line = typeof e.data === "string" ? e.data : "";
      if (line === "uciok") {
        this.worker.postMessage("isready");
      } else if (line === "readyok") {
        resolveReady();
      } else if (line.startsWith("info") && line.includes(" pv ")) {
        this.handleInfoLine(line);
      } else if (line.startsWith("bestmove")) {
        this.handleBestMove(line);
      }
    };

    this.worker.postMessage("uci");
  }

  async waitUntilReady() {
    await this.readyPromise;
  }

  private handleInfoLine(line: string) {
    if (!this.current) return;
    const depthMatch = line.match(/\bdepth (\d+)/);
    const multipvMatch = line.match(/\bmultipv (\d+)/);
    const cpMatch = line.match(/\bscore cp (-?\d+)/);
    const mateMatch = line.match(/\bscore mate (-?\d+)/);
    const pvMatch = line.match(/\bpv (.+)$/);
    if (!depthMatch || !pvMatch) return;

    const depth = parseInt(depthMatch[1], 10);
    const mpv = multipvMatch ? parseInt(multipvMatch[1], 10) : 1;
    const pvUci = pvMatch[1].trim().split(/\s+/);
    const cp = cpMatch ? parseInt(cpMatch[1], 10) : null;
    const mate = mateMatch ? parseInt(mateMatch[1], 10) : null;

    this.current.bestLineByMultipv.set(mpv, { cp, mate, pvUci });
    this.current.latestDepthSeen = Math.max(this.current.latestDepthSeen, depth);
  }

  private handleBestMove(bestmoveLine: string) {
    const cur = this.current;
    if (!cur) return;

    const bestMoveUciFromLine = bestmoveLine.split(/\s+/)[1] || "";
    const top = cur.bestLineByMultipv.get(1);
    const sideToMove = cur.fen.split(" ")[1] === "b" ? "b" : "w";

    let cpWhite: number | null = null;
    let mateWhite: number | null = null;
    if (top) {
      if (top.cp !== null) cpWhite = sideToMove === "w" ? top.cp : -top.cp;
      if (top.mate !== null) mateWhite = sideToMove === "w" ? top.mate : -top.mate;
    }

    const pvUci = top?.pvUci?.length ? top.pvUci : bestMoveUciFromLine ? [bestMoveUciFromLine] : [];
    const { bestMoveSan, pvSan } = this.uciLineToSan(cur.fen, pvUci);

    const result: PositionEval = {
      fen: cur.fen,
      cp: cpWhite,
      mate: mateWhite,
      bestMoveUci: pvUci[0] || bestMoveUciFromLine,
      bestMoveSan,
      pvSan,
      depth: cur.latestDepthSeen,
    };

    cur.resolve(result);
    this.current = null;
    this.pump();
  }

  private uciLineToSan(fen: string, pvUci: string[]): { bestMoveSan: string | null; pvSan: string[] } {
    try {
      const chess = new Chess(fen);
      const pvSan: string[] = [];
      for (const uci of pvUci.slice(0, 8)) {
        const from = uci.slice(0, 2);
        const to = uci.slice(2, 4);
        const promotion = uci.length > 4 ? uci.slice(4) : undefined;
        const move = chess.move({ from, to, promotion });
        if (!move) break;
        pvSan.push(move.san);
      }
      return { bestMoveSan: pvSan[0] || null, pvSan };
    } catch {
      return { bestMoveSan: null, pvSan: [] };
    }
  }

  /** Evaluate a single FEN to the given depth. Calls are queued (one at a time). */
  evaluate(fen: string, opts: { depth?: number; multipv?: number } = {}): Promise<PositionEval> {
    const depth = opts.depth ?? 16;
    const multipv = opts.multipv ?? 1;
    return new Promise((resolve, reject) => {
      this.queue.push({
        fen,
        depth,
        multipv,
        resolve,
        reject,
        bestLineByMultipv: new Map(),
        latestDepthSeen: 0,
      });
      this.pump();
    });
  }

  private async pump() {
    if (this.current || this.queue.length === 0) return;
    await this.waitUntilReady();
    const next = this.queue.shift()!;
    this.current = next;
    if (next.multipv > 1) {
      this.worker.postMessage(`setoption name MultiPV value ${next.multipv}`);
    }
    this.worker.postMessage(`position fen ${next.fen}`);
    this.worker.postMessage(`go depth ${next.depth}`);
  }

  stop() {
    this.worker.postMessage("stop");
  }

  terminate() {
    this.worker.terminate();
  }
}
