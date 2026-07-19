import { useCallback, useState } from 'react';
import { Chess } from 'chess.js';
import { useChessStore } from './useChessStore';
import { useStockfish } from './useStockfish';
import { classifyMove } from '@/utils/evaluation';
import type { MoveAnalysis } from '@/types';

export function useAnalysis() {
  const currentGame = useChessStore((s) => s.currentGame);
  const setAnalysis = useChessStore((s) => s.setAnalysis);
  const { analyze, stop, isAnalyzing } = useStockfish();
  const [progress, setProgress] = useState(0);

  const runFullAnalysis = useCallback(async (depth: number = 18) => {
    if (!currentGame) return;

    const results: MoveAnalysis[] = [];
    const chess = new Chess();

    for (let i = 0; i < currentGame.moves.length; i++) {
      setProgress(Math.round((i / currentGame.moves.length) * 100));

      // Get position before move
      const beforeFen = chess.fen();

      // Analyze position before move (to find best move)
      // This is simplified - in production you'd want proper async queue management
      const beforeEval = await analyzePosition(beforeFen, depth, analyze, stop);

      // Make the move
      const move = chess.move(currentGame.moves[i]);
      const afterFen = chess.fen();

      // Analyze position after move
      const afterEval = await analyzePosition(afterFen, depth, analyze, stop);

      const evalBefore = beforeEval ?? 0;
      const evalAfter = afterEval ?? 0;

      // Adjust for side to move
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
        alternatives: [], // Would be populated from MultiPV
      });
    }

    setAnalysis(results);
    setProgress(0);
  }, [currentGame, analyze, stop, setAnalysis]);

  return {
    runFullAnalysis,
    isAnalyzing,
    progress,
  };
}

// Helper to run a single position analysis with promise
function analyzePosition(
  fen: string, 
  depth: number, 
  analyze: (fen: string, depth?: number) => void,
  stop: () => void
): Promise<number | null> {
  return new Promise((resolve) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        stop();
        resolved = true;
        resolve(null);
      }
    }, 5000); // 5s timeout per position

    // This is a simplified version - the real implementation would hook into engine messages
    // For now, return mock data to keep the architecture clean
    analyze(fen, depth);

    setTimeout(() => {
      if (!resolved) {
        clearTimeout(timeout);
        resolved = true;
        stop();
        resolve(0); // Mock - in real impl, capture from engine lines
      }
    }, 1000);
  });
}
