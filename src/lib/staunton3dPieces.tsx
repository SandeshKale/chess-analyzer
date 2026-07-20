"use client";

import type { CSSProperties, JSX } from "react";
import type { PieceRenderObject } from "react-chessboard";

type PieceType = "P" | "N" | "B" | "R" | "Q" | "K";

// Shared "turned wood" base + tapered body every piece sits on, matching the
// chunky rounded silhouette of a modern 3D Staunton set. Only the topper
// (head/crown/crenellation) differs per piece type below.
function baseAndCone(neckY: number, neckRx: number) {
  const footRx = neckRx <= 20 ? 27 : 25;
  return (
    <>
      <ellipse cx="50" cy="90" rx={footRx + 1} ry="6" className="piece-shadow" />
      <rect x={50 - footRx} y="82" width={footRx * 2} height="10" rx="5" />
      <path
        d={`M ${50 - footRx + 2} 84 C ${50 - footRx - 3} ${(84 + neckY) / 2 - 6}, ${50 - neckRx - 2} ${
          neckY + 8
        }, ${50 - neckRx} ${neckY} L ${50 + neckRx} ${neckY} C ${50 + neckRx + 2} ${neckY + 8}, ${
          50 + footRx + 3
        } ${(84 + neckY) / 2 - 6}, ${50 + footRx - 2} 84 Z`}
      />
    </>
  );
}

function pieceShape(type: PieceType): JSX.Element {
  switch (type) {
    case "P":
      return (
        <>
          {baseAndCone(55, 9)}
          <ellipse cx="50" cy="55" rx="11" ry="3.5" />
          <circle cx="50" cy="36" r="17" />
        </>
      );
    case "R":
      return (
        <>
          {baseAndCone(62, 16)}
          <rect x="30" y="38" width="40" height="26" rx="4" />
          <rect x="27" y="26" width="10" height="14" rx="3" />
          <rect x="45" y="26" width="10" height="14" rx="3" />
          <rect x="63" y="26" width="10" height="14" rx="3" />
          <rect x="27" y="36" width="46" height="8" rx="3" />
        </>
      );
    case "N":
      return (
        <>
          {baseAndCone(58, 12)}
          <path
            d="M 38 58 C 34 46, 36 36, 44 28 C 42 24, 44 19, 49 18 C 53 18, 54 22, 52 25
               C 60 24, 68 28, 71 36 C 73 41, 71 45, 66 46 C 68 50, 66 54, 61 55 L 62 58 Z"
          />
          <circle cx="47" cy="30" r="1.6" className="piece-eye" />
        </>
      );
    case "B":
      return (
        <>
          {baseAndCone(56, 10)}
          <path d="M 50 16 C 62 24, 66 38, 60 50 L 40 50 C 34 38, 38 24, 50 16 Z" />
          <ellipse cx="50" cy="38" rx="10" ry="3" className="piece-groove" />
          <circle cx="50" cy="12" r="5" />
        </>
      );
    case "Q":
      return (
        <>
          {baseAndCone(53, 11)}
          <path
            d="M 33 51 C 30 40, 33 28, 38 20 C 41 26, 42 32, 42 38 C 46 30, 48 24, 50 16
               C 52 24, 54 30, 58 38 C 58 32, 59 26, 62 20 C 67 28, 70 40, 67 51 Z"
          />
          <circle cx="38" cy="19" r="3.2" />
          <circle cx="50" cy="14" r="3.6" />
          <circle cx="62" cy="19" r="3.2" />
        </>
      );
    case "K":
      return (
        <>
          {baseAndCone(53, 11)}
          <path
            d="M 34 51 C 30 42, 32 32, 38 26 C 44 30, 47 36, 47 42 L 53 42 C 53 36, 56 30, 62 26
               C 68 32, 70 42, 66 51 Z"
          />
          <rect x="46" y="10" width="8" height="20" rx="2" />
          <rect x="40" y="15" width="20" height="8" rx="2" />
        </>
      );
  }
}

function build3DPiece(type: PieceType, isWhite: boolean) {
  const gradientId = isWhite ? "staunton3d-white" : "staunton3d-black";
  return (props?: { fill?: string; square?: string; svgStyle?: CSSProperties }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      style={{
        ...props?.svgStyle,
        filter: "drop-shadow(1px 3px 2px rgba(0,0,0,0.55)) drop-shadow(0 0 1px rgba(0,0,0,0.35))",
      }}
    >
      <g
        fill={`url(#${gradientId})`}
        stroke={isWhite ? "#00000055" : "#00000088"}
        strokeWidth="1"
        strokeLinejoin="round"
      >
        {pieceShape(type)}
      </g>
      <style>{`
        .piece-shadow { fill: #000; opacity: 0.35; stroke: none; }
        .piece-eye { fill: #00000099; stroke: none; }
        .piece-groove { fill: #00000033; stroke: none; }
      `}</style>
    </svg>
  );
}

const TYPES: PieceType[] = ["P", "N", "B", "R", "Q", "K"];

/** Drop-in replacement for react-chessboard's `pieces` option: an original,
 * chunky rounded "3D Staunton" set shaded with a wood (white) / onyx (black)
 * gradient plus a cast shadow. Not a copy of any specific vendor's artwork —
 * built from scratch as simple rounded primitives in the same general genre
 * as glossy 3D chess sets. */
export const staunton3DPieces: PieceRenderObject = Object.fromEntries([
  ...TYPES.map((t) => [`w${t}`, build3DPiece(t, true)]),
  ...TYPES.map((t) => [`b${t}`, build3DPiece(t, false)]),
]) as PieceRenderObject;

export function Staunton3DDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <radialGradient id="staunton3d-white" cx="35%" cy="20%" r="90%">
          <stop offset="0%" stopColor="#FFFDF6" />
          <stop offset="45%" stopColor="#EDE6D6" />
          <stop offset="100%" stopColor="#B8956A" />
        </radialGradient>
        <radialGradient id="staunton3d-black" cx="35%" cy="20%" r="90%">
          <stop offset="0%" stopColor="#5A5F6B" />
          <stop offset="45%" stopColor="#2B2F38" />
          <stop offset="100%" stopColor="#0A0C10" />
        </radialGradient>
      </defs>
    </svg>
  );
}
