import { useCallback, useState, useRef } from 'react';
import { Chess } from 'chess.js';
import { useChessStore } from './useChessStore';
import { useStockfish } from './useStockfish';
import { classifyMove } from '@/utils/evaluation';
import type { MoveAnalysis, AnalysisLine } from '@/types';

export function useAnalysis() {
  const currentGame = useChessStore((s) => s.currentGame);
  const setAnalysis = useChessStore((s) => s.setAnalysis);
  const { analyzeAsync, stop } = useStockfish();
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef(false);

  const runFullAnalysis = useCallback(async (depth: number = 18) => {
    if (!currentGame) return;

    abortRef.current = false;
    setIsRunning(true);
    setProgress(0);

    const results: MoveAnalysis[] = [];
    const chess = new Chess();

    try {
      for (let i = 0; i < currentGame.moves.length; i++) {
        if (abortRef.current) break;

        setProgress(Math.round((i / currentGame.moves.length) * 100));

        // Position BEFORE the move
        const beforeFen = chess.fen();

        // Analyze position before move to find best move
        const beforeLines = await analyzeAsync(beforeFen, depth);
        const bestLine = beforeLines[0] ?? null;
        const evalBefore = bestLine?.score ?? 0;

        // Make the actual move
        const move = chess.move(currentGame.moves[i]);
        const afterFen = chess.fen();

        // Analyze position AFTER the move
        const afterLines = await analyzeAsync(afterFen, depth);
        const afterBestLine = afterLines[0] ?? null;
        const evalAfter = afterBestLine?.score ?? 0;

        // Classification is based on eval drop from current player's perspective
        const isWhite = i % 2 === 0;
        const playerEvalBefore = isWhite ? evalBefore : -evalBefore;
        const playerEvalAfter = isWhite ? evalAfter : -evalAfter;

        results.push({
          san: move.san,
          uci: move.from + move.to + (move.promotion || ''),
          fen: afterFen,
          moveNumber: Math.floor(i / 2) + 1,
          isWhite,
          evaluation: evalAfter,
          classification: classifyMove(playerEvalBefore, playerEvalAfter),
          bestLine: bestLine ? { ...bestLine } : undefined,
          alternatives: beforeLines.slice(1),
        });
      }

      setAnalysis(results);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsRunning(false);
      setProgress(0);
    }
  }, [currentGame, analyzeAsync, setAnalysis]);

  const cancelAnalysis = useCallback(() => {
    abortRef.current = true;
    stop();
    setIsRunning(false);
    setProgress(0);
  }, [stop]);

  return {
    runFullAnalysis,
    cancelAnalysis,
    isAnalyzing: isRunning,
    progress,
  };
}
