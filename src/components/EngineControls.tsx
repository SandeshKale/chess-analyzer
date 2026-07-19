import { useStockfish } from '@/hooks/useStockfish';
import { useChessGame } from '@/hooks/useChessGame';
import { useChessStore } from '@/hooks/useChessStore';
import { useAnalysis } from '@/hooks/useAnalysis';
import { generateAnnotatedPgn, downloadFile } from '@/utils/export';

export function EngineControls() {
  const { isReady, isAnalyzing, analyze, lines, depth, multipv, setDepth, setMultiPv } = useStockfish();
  const { currentFen } = useChessGame();
  const toggleOrientation = useChessStore((s) => s.toggleOrientation);
  const showArrows = useChessStore((s) => s.showArrows);
  const toggleArrows = useChessStore((s) => s.toggleArrows);
  const currentGame = useChessStore((s) => s.currentGame);
  const analysis = useChessStore((s) => s.analysis);
  const { runFullAnalysis, cancelAnalysis, isAnalyzing: isFullAnalyzing, progress } = useAnalysis();

  const handleExport = () => {
    if (!currentGame) return;
    const annotated = generateAnnotatedPgn(currentGame, analysis);
    const white = currentGame.headers.white?.replace(/\s+/g, '_') ?? 'White';
    const black = currentGame.headers.black?.replace(/\s+/g, '_') ?? 'Black';
    const date = currentGame.headers.date ?? new Date().toISOString().split('T')[0];
    downloadFile(annotated, `${white}_vs_${black}_${date}.pgn`, 'application/x-chess-pgn');
  };

  const anyAnalyzing = isAnalyzing || isFullAnalyzing;

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Engine</h3>
        <div style={{ 
          width: '10px', 
          height: '10px', 
          borderRadius: '50%', 
          background: isReady ? '#81b64c' : '#e34f4f',
        }} />
      </div>

      <div style={{ marginBottom: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          Depth:
          <select 
            value={depth} 
            onChange={(e) => setDepth(Number(e.target.value))}
            disabled={anyAnalyzing}
            style={selectStyle}
          >
            {[14, 16, 18, 20, 22, 24].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>

        <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          Lines:
          <select 
            value={multipv} 
            onChange={(e) => setMultiPv(Number(e.target.value))}
            disabled={anyAnalyzing}
            style={selectStyle}
          >
            {[1, 2, 3, 4, 5].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          onClick={() => currentFen !== 'start' && analyze(currentFen)}
          disabled={!isReady || anyAnalyzing || currentFen === 'start'}
          style={{
            flex: 1,
            padding: '8px 16px',
            background: isAnalyzing ? '#3d3d3d' : '#81b64c',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: anyAnalyzing ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Position'}
        </button>
        <button
          onClick={() => analyze(currentFen)}
          disabled={!isReady || anyAnalyzing || currentFen === 'start'}
          style={{
            padding: '8px 16px',
            background: '#e34f4f',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: anyAnalyzing ? 'pointer' : 'not-allowed',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          Stop
        </button>
      </div>

      <button
        onClick={isFullAnalyzing ? cancelAnalysis : runFullAnalysis}
        disabled={!isReady || !currentGame}
        style={{
          width: '100%',
          padding: '10px 16px',
          background: isFullAnalyzing ? '#e34f4f' : '#5c8bb5',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '13px',
          marginBottom: '12px',
        }}
      >
        {isFullAnalyzing ? `Analyzing... ${progress}%` : 'Run Full Game Analysis'}
      </button>

      {isFullAnalyzing && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ height: '4px', background: '#2a2a2a', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#81b64c', transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
        <button onClick={toggleOrientation} style={btnStyle}>Flip Board</button>
        <button onClick={toggleArrows} style={btnStyle}>
          {showArrows ? 'Hide Arrows' : 'Show Arrows'}
        </button>
      </div>

      {analysis.length > 0 && (
        <button
          onClick={handleExport}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: '#2a2a2a',
            color: '#81b64c',
            border: '1px solid #81b64c',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
            marginBottom: '12px',
          }}
        >
          Export Annotated PGN
        </button>
      )}

      {lines.length > 0 && (
        <div style={{ marginTop: '12px', borderTop: '1px solid #333', paddingTop: '12px' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Top Lines</div>
          {lines.map((line) => (
            <div key={line.multipvIndex} style={{ fontSize: '13px', marginBottom: '6px', fontFamily: 'monospace' }}>
              <span style={{ color: '#81b64c' }}>d{line.depth}</span>
              {' '}
              <span style={{ color: '#f0c14c' }}>
                {line.mate ? `M${line.mate}` : (line.score / 100).toFixed(2)}
              </span>
              {' '}
              <span style={{ color: '#aaa' }}>{line.pv.slice(0, 6).join(' ')}</span>
            </div>
          ))}
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
};

const selectStyle: React.CSSProperties = {
  background: '#2a2a2a',
  color: '#fff',
  border: '1px solid #444',
  borderRadius: '4px',
  padding: '4px',
};

const btnStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: '#2a2a2a',
  color: '#e0e0e0',
  border: '1px solid #444',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '13px',
};
