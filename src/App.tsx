import { GameImporter } from '@/components/GameImporter';
import { ChessBoard } from '@/components/ChessBoard';
import { MoveList } from '@/components/MoveList';
import { EvaluationBar } from '@/components/EvaluationBar';
import { EngineControls } from '@/components/EngineControls';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import { useChessGame } from '@/hooks/useChessGame';

function App() {
  const { hasGame, goToStart, goBackward, goForward, goToEnd } = useChessGame();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#121212',
      color: '#e0e0e0',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      padding: '24px',
    }}>
      <header style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>Chess.com Games Analyzer</h1>
        <p style={{ margin: '4px 0 0', color: '#888', fontSize: '14px' }}>
          Stockfish 16 NNUE · WASM · Chess.com API
        </p>
      </header>

      {!hasGame && <GameImporter />}

      {hasGame && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto auto',
          gap: '16px',
          maxWidth: '1200px',
          margin: '0 auto',
          alignItems: 'start',
        }}>
          <EvaluationBar />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <ChessBoard />
            <div style={{ display: 'flex', gap: '8px' }}>
              <NavButton label="⏮" onClick={goToStart} />
              <NavButton label="◀" onClick={goBackward} />
              <NavButton label="▶" onClick={goForward} />
              <NavButton label="⏭" onClick={goToEnd} />
            </div>
          </div>

          <MoveList />

          <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <EngineControls />
            <AnalysisPanel />
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        background: '#2a2a2a',
        color: '#e0e0e0',
        border: '1px solid #444',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
        minWidth: '44px',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#3d3d3d'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#2a2a2a'; }}
    >
      {label}
    </button>
  );
}

export default App;
