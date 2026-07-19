import type { MoveAnalysis, ParsedGame } from '@/types';

/**
 * Generate annotated PGN with Stockfish evals and classifications.
 * Uses Chess.com / Lichess annotation syntax:
 *   { [%eval +0.45] [%csl Gf3][%cal Gf3g5] }
 */
export function generateAnnotatedPgn(
  game: ParsedGame,
  analysis: MoveAnalysis[],
  includeArrows: boolean = true
): string {
  const lines: string[] = [];

  // Headers
  const headers = game.headers;
  if (headers.event) lines.push(`[Event "${headers.event}"]`);
  if (headers.site) lines.push(`[Site "${headers.site}"]`);
  if (headers.date) lines.push(`[Date "${headers.date}"]`);
  if (headers.round) lines.push(`[Round "${headers.round}"]`);
  if (headers.white) lines.push(`[White "${headers.white}"]`);
  if (headers.black) lines.push(`[Black "${headers.black}"]`);
  if (headers.result) lines.push(`[Result "${headers.result}"]`);
  if (headers.whiteElo) lines.push(`[WhiteElo "${headers.whiteElo}"]`);
  if (headers.blackElo) lines.push(`[BlackElo "${headers.blackElo}"]`);
  lines.push('');

  // Annotated moves
  let moveText = '';
  for (let i = 0; i < game.moves.length; i++) {
    const move = game.moves[i];
    const moveAn = analysis[i];
    const isWhite = i % 2 === 0;

    if (isWhite) {
      moveText += `${Math.floor(i / 2) + 1}. `;
    }

    // Add annotation before move if analysis exists
    if (moveAn) {
      const evalStr = formatEvalForPgn(moveAn.evaluation);
      const classification = moveAn.classification;

      let annotation = `{ [%eval ${evalStr}]`;

      // Add classification comment
      if (classification !== 'best' && classification !== 'excellent') {
        annotation += ` ${formatClassificationComment(classification)}`;
      }

      // Add arrow for best move if not the move played
      if (includeArrows && moveAn.bestLine && moveAn.bestLine.pv.length > 0) {
        const bestUci = moveAn.bestLine.pv[0];
        if (bestUci && bestUci !== moveAn.uci && bestUci.length >= 4) {
          const from = bestUci.substring(0, 2);
          const to = bestUci.substring(2, 4);
          annotation += ` [%cal ${from}${to}]`;
        }
      }

      annotation += ' } ';
      moveText += annotation;
    }

    moveText += move + ' ';
  }

  if (headers.result) {
    moveText += headers.result;
  }

  lines.push(moveText.trim());
  lines.push('');

  return lines.join('\n');
}

function formatEvalForPgn(score: number): string {
  if (Math.abs(score) >= 90000) {
    const mateIn = score > 0 ? Math.round(100000 - score) : Math.round(-100000 - score);
    return `#${mateIn}`;
  }
  const val = score / 100;
  return val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2);
}

function formatClassificationComment(c: string): string {
  const map: Record<string, string> = {
    brilliant: 'Brilliant!',
    great: 'Great move!',
    best: 'Best move',
    excellent: 'Excellent',
    good: 'Good move',
    inaccuracy: 'Inaccuracy.',
    mistake: 'Mistake.',
    blunder: 'Blunder!',
  };
  return map[c] ?? '';
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
