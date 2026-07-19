/**
 * Lichess Opening Explorer Integration
 * Fetches opening names and stats from Lichess Masters DB
 * 
 * Endpoint: https://explorer.lichess.ovh/masters
 * No auth required, CORS enabled
 */

export interface OpeningInfo {
  eco: string;
  name: string;
  fen: string;
  moves: number;
  white: number;
  draws: number;
  black: number;
}

export interface LichessOpeningResponse {
  opening?: { eco: string; name: string };
  fen: string;
  moves: { uci: string; san: string; white: number; draws: number; black: number; averageRating: number }[];
  white: number;
  draws: number;
  black: number;
}

const BASE_URL = 'https://explorer.lichess.ovh/masters';

export async function getOpeningByFen(fen: string): Promise<OpeningInfo | null> {
  try {
    const url = `${BASE_URL}?fen=${encodeURIComponent(fen)}&moves=5`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;

    const data: LichessOpeningResponse = await res.json();
    if (!data.opening) return null;

    return {
      eco: data.opening.eco,
      name: data.opening.name,
      fen: data.fen,
      moves: data.moves?.length ?? 0,
      white: data.white ?? 0,
      draws: data.draws ?? 0,
      black: data.black ?? 0,
    };
  } catch {
    return null;
  }
}

export async function getOpeningByMoves(moves: string): Promise<OpeningInfo | null> {
  try {
    const url = `${BASE_URL}?play=${encodeURIComponent(moves)}&moves=5`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;

    const data: LichessOpeningResponse = await res.json();
    if (!data.opening) return null;

    return {
      eco: data.opening.eco,
      name: data.opening.name,
      fen: data.fen,
      moves: data.moves?.length ?? 0,
      white: data.white ?? 0,
      draws: data.draws ?? 0,
      black: data.black ?? 0,
    };
  } catch {
    return null;
  }
}
