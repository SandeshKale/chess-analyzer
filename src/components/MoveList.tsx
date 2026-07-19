import { useChessStore } from '@/hooks/useChessStore';
import { useChessGame } from '@/hooks/useChessGame';
import { CLASSIFICATION_COLORS } from '@/utils/evaluation';

export function MoveList() {
  const currentGame = useChessStore((s) => s.currentGame);
  const analysis = useChessStore((s) => s.analysis);
  const { currentMoveIndex, goToMove, hasGame } = useChessGame();

  if (!hasGame || !currentGame) {
    return (
      <div style={{
        width: '280px',
        height: '400px',
        background: '#1e1e1e',
        borderRadius: '8px',
        padding: '16px',
        color: '#888',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        No game loaded
      </div>
    );
  }

  const pairs: { white?: string; black?: string; whiteIndex: number; blackIndex: number }[] = [];
  for (let i = 0; i < currentGame.moves.length; i += 2) {
    pairs.push({
      white: currentGame.moves[i],
      black: currentGame.moves[i + 1],
      whiteIndex: i,
      blackIndex: i + 1,
    });
  }

  return (
    <div style={{
      width: '280px',
      height: '400px',
      background: '#1e1e1e',
      borderRadius: '8px',
      padding: '12px',
      overflowY: 'auto',
      fontSize: '14px',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 600, color: '#ccc' }}>
        {currentGame.headers.white} vs {currentGame.headers.black}
      </div>
      {pairs.map((pair, idx) => (
        <div key={idx} style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
          <span style={{ color: '#666', minWidth: '28px', textAlign: 'right' }}>
            {pair.whiteIndex / 2 + 1}.
          </span>
          {pair.white && (
            <MoveButton 
              san={pair.white} 
              index={pair.whiteIndex}
              isActive={currentMoveIndex === pair.whiteIndex}
              classification={analysis[pair.whiteIndex]?.classification}
              onClick={() => goToMove(pair.whiteIndex)}
            />
          )}
          {pair.black && (
            <MoveButton 
              san={pair.black} 
              index={pair.blackIndex}
              isActive={currentMoveIndex === pair.blackIndex}
              classification={analysis[pair.blackIndex]?.classification}
              onClick={() => goToMove(pair.blackIndex)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function MoveButton({ 
  san, 
  index: _index, 
  isActive, 
  classification, 
  onClick 
}: { 
  san: string; 
  index: number; 
  isActive: boolean;
  classification?: string;
  onClick: () => void;
}) {
  const color = classification ? CLASSIFICATION_COLORS[classification] : undefined;

  return (
    <button
      onClick={onClick}
      style={{
        padding: '2px 8px',
        borderRadius: '4px',
        border: 'none',
        background: isActive ? '#4a4a4a' : 'transparent',
        color: color || '#e0e0e0',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: isActive ? 600 : 400,
        minWidth: '50px',
        textAlign: 'left',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = '#2a2a2a';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
    >
      {san}
    </button>
  );
}
