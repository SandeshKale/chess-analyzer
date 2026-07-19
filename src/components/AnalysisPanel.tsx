import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { useChessStore } from '@/hooks/useChessStore';
import { useChessGame } from '@/hooks/useChessGame';
import { getOpeningByFen, type OpeningInfo } from '@/services/openingBook';
import { CLASSIFICATION_COLORS } from '@/utils/evaluation';

export function AnalysisPanel() {
  const analysis = useChessStore((s) => s.analysis);
  const currentMoveIndex = useChessStore((s) => s.currentMoveIndex);
  const currentGame = useChessStore((s) => s.currentGame);
  const { hasGame } = useChessGame();
  const [opening, setOpening] = useState<OpeningInfo | null>(null);
  const [loadingOpening, setLoadingOpening] = useState(false);

  useEffect(() => {
    if (!hasGame || currentMoveIndex < 0 || !currentGame) {
      setOpening(null);
      return;
    }

    const chess = new Chess();
    for (let i = 0; i <= currentMoveIndex && i < currentGame.moves.length; i++) {
      chess.move(currentGame.moves[i]);
    }
    const fen = chess.fen();

    setLoadingOpening(true);
    getOpeningByFen(fen)
      .then(setOpening)
      .catch(() => setOpening(null))
      .finally(() => setLoadingOpening(false));
  }, [currentMoveIndex, hasGame, currentGame]);

  if (!hasGame) {
    return (
      <div style={panelStyle}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Move Analysis</h3>
        <div style={{ color: '#888', fontSize: '14px' }}>Load a game to see analysis</div>
      </div>
    );
  }

  const current = currentMoveIndex >= 0 ? analysis[currentMoveIndex] : null;

  return (
    <div style={panelStyle}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Move Analysis</h3>

      {opening && (
        <div style={{ 
          marginBottom: '12px', 
          padding: '10px', 
          background: '#252525', 
          borderRadius: '6px',
          border: '1px solid #333',
        }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Opening</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#e0e0e0' }}>
            {opening.name}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
            {opening.eco} · Masters: {opening.white}W / {opening.draws}D / {opening.black}B
          </div>
        </div>
      )}
      {loadingOpening && !opening && (
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>Looking up opening...</div>
      )}

      {current ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: CLASSIFICATION_COLORS[current.classification] || '#888',
            }} />
            <span style={{ 
              fontSize: '14px', 
              fontWeight: 600,
              textTransform: 'capitalize',
              color: CLASSIFICATION_COLORS[current.classification] || '#e0e0e0',
            }}>
              {current.classification}
            </span>
            <span style={{ color: '#888', fontSize: '13px' }}>
              {current.isWhite ? 'White' : 'Black'} → {current.san}
            </span>
          </div>

          <div style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.5 }}>
            <div>Eval after: {(current.evaluation / 100).toFixed(2)}</div>
            {current.bestLine && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ color: '#666', marginBottom: '4px' }}>Engine best:</div>
                <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#81b64c' }}>
                  {current.bestLine.pv.slice(0, 8).join(' ')}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ color: '#888', fontSize: '14px' }}>
          Select a move or run full analysis
        </div>
      )}

      {analysis.length > 0 && (
        <div style={{ marginTop: '16px', borderTop: '1px solid #333', paddingTop: '12px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Game Stats</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['blunder', 'mistake', 'inaccuracy', 'good', 'excellent', 'best'] as const).map(type => {
              const count = analysis.filter(a => a.classification === type).length;
              if (count === 0) return null;
              return (
                <span key={type} style={{
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: `${CLASSIFICATION_COLORS[type]}22`,
                  color: CLASSIFICATION_COLORS[type],
                  border: `1px solid ${CLASSIFICATION_COLORS[type]}44`,
                }}>
                  {type}: {count}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  background: '#1e1e1e',
  borderRadius: '8px',
  padding: '16px',
  color: '#e0e0e0',
  fontFamily: '"Segoe UI", system-ui, sans-serif',
  minHeight: '200px',
};
