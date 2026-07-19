/**
 * Stockfish Engine Wrapper with Promise-Based Analysis
 * 
 * Key feature: analyzePositionAsync() returns a Promise that resolves
 * when Stockfish emits 'bestmove', giving full MultiPV results.
 */

import type { AnalysisLine } from '@/types';

const STOCKFISH_CDN = 'https://cdn.jsdelivr.net/npm/stockfish@16.0.0/src/stockfish-nnue-16.js';

interface PendingRequest {
  resolve: (lines: AnalysisLine[]) => void;
  reject: (err: Error) => void;
  lines: AnalysisLine[];
  timeout: ReturnType<typeof setTimeout>;
}

export class StockfishEngine {
  private worker: Worker | null = null;
  private isReady = false;
  private messageQueue: string[] = [];
  private pending: PendingRequest | null = null;
  private onInfoCallback: ((line: AnalysisLine) => void) | null = null;
  private _currentMultiPv = 1;

  async init(): Promise<void> {
    if (this.worker) return;

    return new Promise((resolve, reject) => {
      try {
        this.worker = new Worker(STOCKFISH_CDN, { type: 'module' });

        this.worker.onmessage = (e: MessageEvent<string>) => {
          this.handleMessage(e.data);
        };

        this.worker.onerror = (err) => {
          console.error('Stockfish worker error:', err);
          reject(err);
        };

        const checkReady = setInterval(() => {
          if (this.isReady) {
            clearInterval(checkReady);
            resolve();
          }
        }, 100);

        this.send('uci');
        this.send('setoption name Use NNUE value true');
        this.send('isready');
      } catch (err) {
        reject(err);
      }
    });
  }

  private handleMessage(data: string): void {
    if (!data) return;

    if (data.includes('readyok')) {
      this.isReady = true;
      return;
    }

    if (data.includes('bestmove')) {
      if (this.pending) {
        clearTimeout(this.pending.timeout);
        this.pending.resolve(this.pending.lines);
        this.pending = null;
      }
      return;
    }

    if (data.startsWith('info') && data.includes('score')) {
      const line = this.parseInfoLine(data);
      if (line) {
        this.onInfoCallback?.(line);
        if (this.pending) {
          const existing = this.pending.lines.filter(l => l.multipvIndex !== line.multipvIndex);
          this.pending.lines = [...existing, line].sort((a, b) => a.multipvIndex - b.multipvIndex);
        }
      }
    }
  }

  private parseInfoLine(data: string): AnalysisLine | null {
    const depthMatch = data.match(/depth (\d+)/);
    const multipvMatch = data.match(/multipv (\d+)/);
    const scoreMatch = data.match(/score (cp|mate) (-?\d+)/);
    const pvMatch = data.match(/pv (.+)/);

    if (!depthMatch || !scoreMatch) return null;

    const depth = parseInt(depthMatch[1], 10);
    const multipvIndex = multipvMatch ? parseInt(multipvMatch[1], 10) : 1;
    const scoreType = scoreMatch[1];
    const scoreValue = parseInt(scoreMatch[2], 10);
    const pv = pvMatch ? pvMatch[1].trim().split(' ') : [];

    if (scoreType === 'mate') {
      return {
        depth,
        score: scoreValue > 0 ? 100000 - scoreValue : -100000 + Math.abs(scoreValue),
        mate: scoreValue,
        pv,
        multipvIndex,
      };
    }

    return { depth, score: scoreValue, pv, multipvIndex };
  }

  send(command: string): void {
    if (!this.worker) {
      this.messageQueue.push(command);
      return;
    }
    this.worker.postMessage(command);
  }

  setOption(name: string, value: string | number): void {
    this.send(`setoption name ${name} value ${value}`);
  }

  analyzePosition(fen: string, depth: number = 20, multipv: number = 3): void {
    this._currentMultiPv = multipv;
    this.send('stop');
    this.send(`setoption name MultiPV value ${multipv}`);
    this.send(`position fen ${fen}`);
    this.send(`go depth ${depth}`);
  }

  /**
   * Promise-based analysis. Resolves when bestmove is received.
   * @param timeoutMs - Max wait time before rejecting
   */
  analyzePositionAsync(fen: string, depth: number = 20, multipv: number = 3, timeoutMs: number = 15000): Promise<AnalysisLine[]> {
    return new Promise((resolve, reject) => {
      if (this.pending) {
        this.send('stop');
        clearTimeout(this.pending.timeout);
        this.pending.reject(new Error('Cancelled by new request'));
        this.pending = null;
      }

      const timeout = setTimeout(() => {
        this.send('stop');
        if (this.pending) {
          this.pending.reject(new Error(`Analysis timed out after ${timeoutMs}ms`));
          this.pending = null;
        }
      }, timeoutMs);

      this.pending = { resolve, reject, lines: [], timeout };
      this.analyzePosition(fen, depth, multipv);
    });
  }

  stop(): void {
    this.send('stop');
    if (this.pending) {
      clearTimeout(this.pending.timeout);
      this.pending.reject(new Error('Stopped by user'));
      this.pending = null;
    }
  }

  quit(): void {
    this.send('quit');
    this.worker?.terminate();
    this.worker = null;
    this.isReady = false;
  }

  onInfo(callback: (line: AnalysisLine) => void): void {
    this.onInfoCallback = callback;
  }

  get ready(): boolean {
    return this.isReady;
  }
}

export const createEngine = (): StockfishEngine => new StockfishEngine();
