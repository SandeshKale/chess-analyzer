import { Chessboard } from 'react-chessboard';
import { useChessGame } from '@/hooks/useChessGame';
import { useChessStore } from '@/hooks/useChessStore';
import { useStockfish } from '@/hooks/useStockfish';

export function ChessBoard() {
  const { currentFen, boardOrientation, goForward, goBackward } = useChessGame();
  const showArrows = useChessStore((s) => s.showArrows);
  const { lines } = useStockfish();

  // Build custom arrows from engine analysis
  const customArrows = showArrows && lines.length > 0 
    ? lines.slice(0, 1).map((line) => {
        if (line.pv.length === 0) return null;
        const bestMove = line.pv[0];
        if (bestMove.length < 4) return null;
        return [
          bestMove.substring(0, 2),
          bestMove.substring(2, 4),
          'rgb(155, 199, 75)',
        ] as unknown as [string, string, string];
      }).filter((a): a is [string, string, string] => a !== null) as unknown as [string, string, string][]
    : [];

  return (
    <div 
      style={{ 
        width: '100%', 
        maxWidth: '560px',
        aspectRatio: '1',
      }}
      onWheel={(e) => {
        e.preventDefault();
        if (e.deltaY > 0) goForward();
        else goBackward();
      }}
    >
      <Chessboard
        position={currentFen}
        boardOrientation={boardOrientation}
        customArrows={customArrows}
        areArrowsAllowed={false}
        animationDuration={200}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
        customDarkSquareStyle={{ backgroundColor: '#779556' }}
        customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
      />
    </div>
  );
}
