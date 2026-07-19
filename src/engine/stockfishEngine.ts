/**
 * Stockfish Engine Wrapper
 * Handles UCI communication with Stockfish WASM
 * 
 * Architecture: Worker-based isolation for non-blocking UI
 */

import type { AnalysisLine } from '@/types';

const STOCKFISH_CDN = 'https://cdn.jsdelivr.net/npm/stockfish@16.0.0/src/stockfish-nnue-16.js';

export class StockfishEngine {
  private worker: Worker | null = null;
  private isReady = false;
  private messageQueue: string[] = [];
  private onMessageCallback: ((line: AnalysisLine | 'readyok' | 'bestmove') => void) | null = null;
  private currentMultiPv = 1;

  async init(): Promise<void> {
    if (this.worker) return;

    return new Promise((resolve, reject) => {
      try {
        // Create worker from CDN
        this.worker = new Worker(STOCKFISH_CDN, { type: 'module' });

        this.worker.onmessage = (e: MessageEvent<string>) => {
          this.handleMessage(e.data);
        };

        this.worker.onerror = (err) => {
          console.error('Stockfish worker error:', err);
          reject(err);
        };

        // Wait for readyok
        const checkReady = setInterval(() => {
          if (this.isReady) {
            clearInterval(checkReady);
            resolve();
          }
        }, 100);

        // Send initial commands
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
      this.onMessageCallback?.('readyok');
      return;
    }

    if (data.includes('bestmove')) {
      this.onMessageCallback?.('bestmove');
      return;
    }

    if (data.startsWith('info') && data.includes('score')) {
      const line = this.parseInfoLine(data);
      if (line) {
        this.onMessageCallback?.(line);
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

    return {
      depth,
      score: scoreValue,
      pv,
      multipvIndex,
    };
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
    this.currentMultiPv = multipv;
    this.send('stop');
    this.send(`setoption name MultiPV value ${multipv}`);
    this.send(`position fen ${fen}`);
    this.send(`go depth ${depth}`);
  }

  stop(): void {
    this.send('stop');
  }

  quit(): void {
    this.send('quit');
    this.worker?.terminate();
    this.worker = null;
    this.isReady = false;
  }

  onMessage(callback: (line: AnalysisLine | 'readyok' | 'bestmove') => void): void {
    this.onMessageCallback = callback;
  }

  get ready(): boolean {
    return this.isReady;
  }
}

export const createEngine = (): StockfishEngine => new StockfishEngine();
