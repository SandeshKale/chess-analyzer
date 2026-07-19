import { useState, useCallback } from 'react';
import { useChessStore } from '@/hooks/useChessStore';
import { parsePgn } from '@/utils/chessHelpers';

export function GameImporter() {
  const [pgn, setPgn] = useState('');
  const [error, setError] = useState('');
  const setGame = useChessStore((s) => s.setGame);

  const handleLoad = useCallback(() => {
    try {
      setError('');
      if (!pgn.trim()) {
        setError('Please enter a PGN');
        return;
      }
      const game = parsePgn(pgn);
      if (game.moves.length === 0) {
        setError('No valid moves found in PGN');
        return;
      }
      setGame(game);
    } catch (err) {
      setError('Failed to parse PGN: ' + (err as Error).message);
    }
  }, [pgn, setGame]);

  const handleSample = useCallback(() => {
    const sample = `[Event "FIDE World Championship Match"]
[Site "Astana KAZ"]
[Date "2023.04.30"]
[Round "6.1"]
[White "Nepomniachtchi, Ian"]
[Black "Ding, Liren"]
[Result "1-0"]
[WhiteElo "2795"]
[BlackElo "2788"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6
8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. Nbd2 Bb7 12. Bc2 Re8 13. Nf1 Bf8
14. Ng3 g6 15. b3 Bg7 16. Bg5 h6 17. Bxf6 Qxf6 18. a4 c5 19. d5 c4
20. b4 Rec8 21. Qe2 Qe7 22. Nh2 h5 23. Bd1 Bh6 24. Nf3 Kg7 25. Ra2 Nf6
26. Nh4 Rh8 27. Be2 Rc7 28. Qd1 Rhc8 29. Rc2 Bc8 30. Rb1 Bd7 31. Qe1 Qd8
32. Kh2 Be8 33. Rbb2 Nd7 34. Nf3 Nb6 35. axb5 axb5 36. Nh4 Bg5 37. Bxh5 gxh5
38. Qe2 Bxh4 39. Qxh5 Bg5 40. f4 exf4 41. Qxg5+ Qxg5 42. Bxg5 Nxd5 43. exd5 f3+
44. Kh1 Bg6 45. Rc1 Ra7 46. Nf1 Ra1 47. Rxa1 Bd3 48. Kg1 Bxf1 49. Kxf1 Rxc3
50. Ra7 Kg6 51. Rxf7 Rc1+ 52. Kf2 Rc2+ 53. Kxf3 Rxb2 54. Rf6+ Kh5 55. Rxd6 Rb3+
56. Ke4 Rb1 57. Kd4 Rb4 58. Kc5 Rxb4 59. Rb6 Rb1 60. d6 b4 61. d7 Rd1 62. Kc6 c3
63. Rb5+ Kg6 64. Kc7 1-0`;
    setPgn(sample);
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Import Chess.com Game</h2>
      <p>Paste your PGN below or load the sample game.</p>
      <textarea
        value={pgn}
        onChange={(e) => setPgn(e.target.value)}
        placeholder="Paste PGN here..."
        style={{
          width: '100%',
          height: '200px',
          fontFamily: 'monospace',
          fontSize: '13px',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #333',
          background: '#1e1e1e',
          color: '#e0e0e0',
          resize: 'vertical',
        }}
      />
      {error && <div style={{ color: '#e34f4f', marginTop: '8px', fontSize: '14px' }}>{error}</div>}
      <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
        <button
          onClick={handleLoad}
          style={{
            padding: '10px 24px',
            background: '#81b64c',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          Load Game
        </button>
        <button
          onClick={handleSample}
          style={{
            padding: '10px 24px',
            background: '#3d3d3d',
            color: '#e0e0e0',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          Load Sample
        </button>
      </div>
    </div>
  );
}
