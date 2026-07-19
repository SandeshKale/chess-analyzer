import { useChessStore } from '@/hooks/useChessStore';
import { useStockfish } from '@/hooks/useStockfish';
import { evaluationToPercentage, formatEvaluation } from '@/utils/evaluation';

export function EvaluationBar() {
  const analysis = useChessStore((s) => s.analysis);
  const currentMoveIndex = useChessStore((s) => s.currentMoveIndex);
  const { lines, isAnalyzing } = useStockfish();

  // Prefer live engine eval, fallback to stored analysis
  let evalScore = 0;
  if (lines.length > 0 && lines[0].depth > 10) {
    evalScore = lines[0].score;
  } else if (currentMoveIndex >= 0 && analysis[currentMoveIndex]) {
    evalScore = analysis[currentMoveIndex].evaluation;
  }

  const percentage = evaluationToPercentage(evalScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: '24px',
          height: '400px',
          background: '#1a1a1a',
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #333',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${percentage}%`,
            background: '#fff',
            transition: 'height 0.3s ease',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '2px',
            background: '#e34f4f',
            transform: 'translateY(-50%)',
          }}
        />
      </div>
      <div style={{ 
        fontSize: '13px', 
        fontWeight: 600, 
        fontFamily: 'monospace',
        color: isAnalyzing ? '#81b64c' : '#e0e0e0',
      }}>
        {formatEvaluation(evalScore)}
      </div>
    </div>
  );
}
