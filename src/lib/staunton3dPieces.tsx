"use client";

import { defaultPieces } from "react-chessboard";
import type { PieceRenderObject } from "react-chessboard";
import type { CSSProperties } from "react";

const PIECE_KEYS = ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"] as const;

function build3DPiece(key: (typeof PIECE_KEYS)[number]) {
  const isWhite = key[0] === "w";
  const gradientId = isWhite ? "staunton3d-white" : "staunton3d-black";
  const base = (defaultPieces as PieceRenderObject)[key];
  return (props?: { fill?: string; square?: string; svgStyle?: CSSProperties }) =>
    base({
      ...props,
      fill: `url(#${gradientId})`,
      svgStyle: {
        ...props?.svgStyle,
        filter: "drop-shadow(1px 3px 2px rgba(0,0,0,0.55)) drop-shadow(0 0 1px rgba(0,0,0,0.35))",
      },
    });
}

/** Drop-in replacement for react-chessboard's `pieces` option. Same silhouettes,
 * shaded with a radial gradient (ivory→brass for white, graphite→onyx for black)
 * plus a cast shadow, so flat 2D pieces read as glossy 3D Staunton pieces. */
export const staunton3DPieces: PieceRenderObject = Object.fromEntries(
  PIECE_KEYS.map((k) => [k, build3DPiece(k)])
) as PieceRenderObject;

/** Renders the gradient <defs> the pieces above reference. Mount once per page —
 * harmless if invisible (0x0, absolutely positioned) but must exist in the DOM. */
export function Staunton3DDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <radialGradient id="staunton3d-white" cx="35%" cy="22%" r="85%">
          <stop offset="0%" stopColor="#FFFDF6" />
          <stop offset="45%" stopColor="#EDE6D6" />
          <stop offset="100%" stopColor="#B8956A" />
        </radialGradient>
        <radialGradient id="staunton3d-black" cx="35%" cy="22%" r="85%">
          <stop offset="0%" stopColor="#5A5F6B" />
          <stop offset="45%" stopColor="#2B2F38" />
          <stop offset="100%" stopColor="#0A0C10" />
        </radialGradient>
      </defs>
    </svg>
  );
}
