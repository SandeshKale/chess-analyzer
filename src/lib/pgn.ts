import { Chess } from "chess.js";
import type { ChessComGame, ParsedGame } from "./types";

function extractOpening(pgn: string): string | null {
  const ecoUrlMatch = pgn.match(/\[ECOUrl "([^"]+)"\]/);
  if (ecoUrlMatch) {
    // e.g. https://www.chess.com/openings/Sicilian-Defense-Najdorf-Variation
    const slug = ecoUrlMatch[1].split("/openings/")[1];
    if (slug) return slug.replace(/-/g, " ");
  }
  const ecoMatch = pgn.match(/\[ECO "([^"]+)"\]/);
  return ecoMatch ? ecoMatch[1] : null;
}

export function parseChessComGame(raw: ChessComGame, myUsername: string): ParsedGame | null {
  const chess = new Chess();
  try {
    chess.loadPgn(raw.pgn);
  } catch {
    return null; // skip unparseable games (rare: 960, variants, aborted games with no moves)
  }

  const playedAs: "white" | "black" =
    raw.white.username.toLowerCase() === myUsername.toLowerCase() ? "white" : "black";
  const me = playedAs === "white" ? raw.white : raw.black;
  const opponent = playedAs === "white" ? raw.black : raw.white;

  let result: "win" | "loss" | "draw" = "draw";
  if (me.result === "win") result = "win";
  else if (["checkmated", "timeout", "resigned", "abandoned", "lose"].includes(me.result)) {
    result = "loss";
  } else if (["agreed", "repetition", "stalemate", "insufficient", "50move", "timevsinsufficient"].includes(me.result)) {
    result = "draw";
  }

  const verboseHistory = chess.history({ verbose: true });
  const moveSans = verboseHistory.map((m) => m.san);
  const fensAfterMove = verboseHistory.map((m) => m.after);

  return {
    id: raw.url,
    raw,
    playedAs,
    opponent: opponent.username,
    opponentRating: opponent.rating,
    myRating: me.rating,
    result,
    endTime: new Date(raw.end_time * 1000),
    timeClass: raw.time_class,
    opening: extractOpening(raw.pgn),
    moveSans,
    fensAfterMove,
  };
}

export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
