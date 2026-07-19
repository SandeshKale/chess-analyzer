import { Chess } from 'chess.js';
import type { ParsedGame, GameHeader } from '@/types';

export function parsePgn(pgn: string): ParsedGame {
  const lines = pgn.split('\n');
  const headers: GameHeader = {};
  const headerRegex = /\[(\w+) "(.+)"\]/;

  let moveTextStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(headerRegex);
    if (match) {
      const key = match[1].toLowerCase();
      const value = match[2];
      switch (key) {
        case 'event': headers.event = value; break;
        case 'site': headers.site = value; break;
        case 'date': headers.date = value; break;
        case 'round': headers.round = value; break;
        case 'white': headers.white = value; break;
        case 'black': headers.black = value; break;
        case 'result': headers.result = value; break;
        case 'whiteelo': headers.whiteElo = parseInt(value, 10); break;
        case 'blackelo': headers.blackElo = parseInt(value, 10); break;
        case 'timecontrol': headers.timeControl = value; break;
        case 'termination': headers.termination = value; break;
      }
    } else if (lines[i].trim() && !lines[i].startsWith('[')) {
      moveTextStart = i;
      break;
    }
  }

  const moveText = lines.slice(moveTextStart).join(' ')
    .replace(/\{[^}]*\}/g, ' ') // Remove comments
    .replace(/\$\d+/g, ' ') // Remove NAGs
    .replace(/\d+\.\.\./g, ' ') // Remove ellipses
    .replace(/\d+\./g, ' ') // Remove move numbers
    .replace(/\s+/g, ' ')
    .trim();

  const rawMoves = moveText.split(' ').filter(m => m && !['1-0', '0-1', '1/2-1/2', '*'].includes(m));

  // Validate moves using chess.js
  const chess = new Chess();
  const validMoves: string[] = [];

  for (const san of rawMoves) {
    try {
      const move = chess.move(san);
      if (move) {
        validMoves.push(move.san);
      }
    } catch {
      // Skip invalid moves
    }
  }

  return {
    headers,
    moves: validMoves,
    rawPgn: pgn,
  };
}

export function getFenAtMove(moves: string[], moveIndex: number): string {
  const chess = new Chess();
  for (let i = 0; i <= moveIndex && i < moves.length; i++) {
    chess.move(moves[i]);
  }
  return chess.fen();
}

export function getMoveAtIndex(moves: string[], moveIndex: number): { san: string; isWhite: boolean; moveNumber: number } | null {
  if (moveIndex < 0 || moveIndex >= moves.length) return null;
  return {
    san: moves[moveIndex],
    isWhite: moveIndex % 2 === 0,
    moveNumber: Math.floor(moveIndex / 2) + 1,
  };
}
