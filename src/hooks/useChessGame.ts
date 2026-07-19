import { useMemo, useCallback } from 'react';
import { Chess } from 'chess.js';
import { useChessStore } from './useChessStore';
import { getFenAtMove } from '@/utils/chessHelpers';

export function useChessGame() {
  const currentGame = useChessStore((s) => s.currentGame);
  const currentMoveIndex = useChessStore((s) => s.currentMoveIndex);
  const setMoveIndex = useChessStore((s) => s.setMoveIndex);
  const boardOrientation = useChessStore((s) => s.boardOrientation);

  const currentFen = useMemo(() => {
    if (!currentGame) return 'start';
    return getFenAtMove(currentGame.moves, currentMoveIndex);
  }, [currentGame, currentMoveIndex]);

  const chessInstance = useMemo(() => {
    const chess = new Chess();
    if (currentFen !== 'start') {
      chess.load(currentFen);
    }
    return chess;
  }, [currentFen]);

  const goToMove = useCallback((index: number) => {
    if (!currentGame) return;
    const clamped = Math.max(-1, Math.min(index, currentGame.moves.length - 1));
    setMoveIndex(clamped);
  }, [currentGame, setMoveIndex]);

  const goToStart = useCallback(() => goToMove(-1), [goToMove]);
  const goToEnd = useCallback(() => {
    if (currentGame) goToMove(currentGame.moves.length - 1);
  }, [currentGame, goToMove]);
  const goForward = useCallback(() => goToMove(currentMoveIndex + 1), [goToMove, currentMoveIndex]);
  const goBackward = useCallback(() => goToMove(currentMoveIndex - 1), [goToMove, currentMoveIndex]);

  const currentMove = useMemo(() => {
    if (!currentGame || currentMoveIndex < 0) return null;
    return currentGame.moves[currentMoveIndex];
  }, [currentGame, currentMoveIndex]);

  return {
    currentFen,
    chessInstance,
    currentMoveIndex,
    currentMove,
    boardOrientation,
    goToMove,
    goToStart,
    goToEnd,
    goForward,
    goBackward,
    hasGame: !!currentGame,
    moveCount: currentGame?.moves.length ?? 0,
  };
}
