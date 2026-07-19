/**
 * Chess.com Public API Client
 * 
 * Endpoints used:
 * - GET /pub/player/{username}/games/archives
 * - GET /pub/player/{username}/games/{YYYY}/{MM}
 * 
 * Chess.com requires a descriptive User-Agent header.
 * Reference: https://www.chess.com/news/view/published-data-api
 */

export interface ChessComGame {
  url: string;
  pgn: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  accuracies?: { white: number; black: number };
  tcn: string;
  uuid: string;
  initial_setup: string;
  fen: string;
  time_class: string;
  rules: string;
  white: { rating: number; result: string; '@id': string; username: string; uuid: string };
  black: { rating: number; result: string; '@id': string; username: string; uuid: string };
  eco?: string;
}

export interface ArchivesResponse {
  archives: string[];
}

export interface MonthlyGamesResponse {
  games: ChessComGame[];
}

const BASE_URL = 'https://api.chess.com/pub/player';

function getHeaders(): HeadersInit {
  return {
    'Accept': 'application/json',
    // Chess.com strongly recommends a descriptive User-Agent
    'User-Agent': 'ChessAnalyzer/1.0 (contact: chess-analyzer-app)',
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) {
    if (res.status === 404) throw new Error('Player not found');
    if (res.status === 429) throw new Error('Rate limited by Chess.com. Please wait a moment.');
    throw new Error(`Chess.com API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getPlayerArchives(username: string): Promise<string[]> {
  const data = await fetchJson<ArchivesResponse>(`${BASE_URL}/${encodeURIComponent(username)}/games/archives`);
  return data.archives.reverse(); // Most recent first
}

export async function getMonthlyGames(archiveUrl: string): Promise<ChessComGame[]> {
  const data = await fetchJson<MonthlyGamesResponse>(archiveUrl);
  return data.games.reverse(); // Most recent first
}

export async function getPlayerProfile(username: string) {
  return fetchJson(`${BASE_URL}/${encodeURIComponent(username)}`);
}

export function parseArchiveUrl(url: string): { username: string; year: string; month: string } {
  const match = url.match(/player\/([^/]+)\/games\/(\d{4})\/(\d{2})$/);
  if (!match) throw new Error('Invalid archive URL');
  return { username: match[1], year: match[2], month: match[3] };
}
