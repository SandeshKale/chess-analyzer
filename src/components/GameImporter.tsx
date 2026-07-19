import { useState, useCallback } from 'react';
import { useChessStore } from '@/hooks/useChessStore';
import { parsePgn } from '@/utils/chessHelpers';
import { getPlayerArchives, getMonthlyGames, type ChessComGame } from '@/services/chesscomApi';

type Tab = 'pgn' | 'chesscom';

export function GameImporter() {
  const [activeTab, setActiveTab] = useState<Tab>('pgn');
  const [pgn, setPgn] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [archives, setArchives] = useState<string[]>([]);
  const [games, setGames] = useState<ChessComGame[]>([]);
  const setGame = useChessStore((s) => s.setGame);

  const handleLoadPgn = useCallback(() => {
    try {
      setError('');
      if (!pgn.trim()) { setError('Please enter a PGN'); return; }
      const game = parsePgn(pgn);
      if (game.moves.length === 0) { setError('No valid moves found in PGN'); return; }
      setGame(game);
    } catch (err) {
      setError('Failed to parse PGN: ' + (err as Error).message);
    }
  }, [pgn, setGame]);

  const handleFetchArchives = useCallback(async () => {
    if (!username.trim()) { setError('Enter a Chess.com username'); return; }
    setError(''); setLoading(true); setArchives([]); setGames([]);
    try {
      const list = await getPlayerArchives(username.trim());
      setArchives(list);
      if (list.length === 0) {
        setError('No game archives found for this user');
      }
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setError('Network error. Chess.com API may be blocked by CORS. Try pasting a PGN instead.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [username]);

  const handleFetchGames = useCallback(async (archiveUrl: string) => {
    setError(''); setLoading(true); setGames([]);
    try {
      const list = await getMonthlyGames(archiveUrl);
      setGames(list);
      if (list.length === 0) {
        setError('No games found in this archive');
      }
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setError('Network error fetching games. Try a different month or paste a PGN.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectGame = useCallback((game: ChessComGame) => {
    try {
      setError('');
      const parsed = parsePgn(game.pgn);
      if (parsed.moves.length === 0) { setError('Game has no valid moves'); return; }
      setGame(parsed);
    } catch (err) {
      setError('Failed to parse game PGN: ' + (err as Error).message);
    }
  }, [setGame]);

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
    <div style={{ padding: '20px', maxWidth: '720px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '4px' }}>Import Game</h2>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        Paste a PGN or fetch from Chess.com
      </p>

      <div style={{ display: 'flex', gap: '2px', marginBottom: '20px', background: '#1e1e1e', borderRadius: '8px', padding: '4px' }}>
        <TabButton active={activeTab === 'pgn'} onClick={() => setActiveTab('pgn')} label="Paste PGN" />
        <TabButton active={activeTab === 'chesscom'} onClick={() => setActiveTab('chesscom')} label="Chess.com" />
      </div>

      {activeTab === 'pgn' && (
        <div>
          <textarea
            value={pgn}
            onChange={(e) => setPgn(e.target.value)}
            placeholder="Paste PGN here..."
            style={textareaStyle}
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button onClick={handleLoadPgn} style={primaryBtn}>Load Game</button>
            <button onClick={handleSample} style={secondaryBtn}>Load Sample</button>
          </div>
        </div>
      )}

      {activeTab === 'chesscom' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Chess.com username (e.g., MagnusCarlsen)"
              onKeyDown={(e) => e.key === 'Enter' && handleFetchArchives()}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={handleFetchArchives} disabled={loading} style={primaryBtn}>
              {loading ? 'Loading...' : 'Fetch Archives'}
            </button>
          </div>

          {archives.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Select a month:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {archives.map((url) => {
                  const parts = url.split('/');
                  const label = `${parts[parts.length - 2]}-${parts[parts.length - 1]}`;
                  return (
                    <button
                      key={url}
                      onClick={() => handleFetchGames(url)}
                      disabled={loading}
                      style={archiveBtn}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {games.length > 0 && (
            <div>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                {games.length} games found — click to analyze:
              </div>
              <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {games.map((game) => (
                  <button
                    key={game.uuid}
                    onClick={() => handleSelectGame(game)}
                    style={gameCardBtn}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>
                        {game.white.username} ({game.white.rating}) vs {game.black.username} ({game.black.rating})
                      </span>
                      <span style={{ fontSize: '12px', color: '#888', textTransform: 'capitalize' }}>
                        {game.time_class}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                      {new Date(game.end_time * 1000).toLocaleDateString()} · {game.time_control}s · {game.rated ? 'Rated' : 'Casual'}
                      {game.accuracies && (
                        <span style={{ marginLeft: '8px' }}>
                          Acc: {game.accuracies.white}% / {game.accuracies.black}%
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ 
          color: '#e34f4f', 
          marginTop: '12px', 
          fontSize: '14px',
          padding: '10px 14px',
          background: '#e34f4f11',
          borderRadius: '6px',
          border: '1px solid #e34f4f33',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        background: active ? '#2a2a2a' : 'transparent',
        color: active ? '#e0e0e0' : '#888',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '14px',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

const textareaStyle: React.CSSProperties = {
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
  outline: 'none',
};

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '6px',
  border: '1px solid #333',
  background: '#1e1e1e',
  color: '#e0e0e0',
  fontSize: '14px',
  outline: 'none',
};

const primaryBtn: React.CSSProperties = {
  padding: '10px 24px',
  background: '#81b64c',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '14px',
};

const secondaryBtn: React.CSSProperties = {
  padding: '10px 24px',
  background: '#3d3d3d',
  color: '#e0e0e0',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '14px',
};

const archiveBtn: React.CSSProperties = {
  padding: '6px 12px',
  background: '#2a2a2a',
  color: '#e0e0e0',
  border: '1px solid #444',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '13px',
};

const gameCardBtn: React.CSSProperties = {
  padding: '12px 16px',
  background: '#1e1e1e',
  color: '#e0e0e0',
  border: '1px solid #333',
  borderRadius: '8px',
  cursor: 'pointer',
  textAlign: 'left',
  fontSize: '14px',
  transition: 'border-color 0.15s',
};
