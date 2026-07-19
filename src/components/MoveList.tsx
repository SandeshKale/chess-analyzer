"use client";

import { useEffect, useRef } from "react";
import type { AnnotatedMove } from "@/lib/types";
import { CLASS_COLORS, CLASS_LABELS } from "@/lib/classify";

export function MoveList({
  moves,
  activeIndex,
  onSelect,
}: {
  moves: AnnotatedMove[];
  activeIndex: number | null;
  onSelect: (i: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <div
      ref={containerRef}
      className="font-mono text-sm max-h-72 overflow-y-auto rounded-lg border border-brassdim/30 divide-y divide-brassdim/10"
    >
      {moves.map((m, i) => (
        <button
          key={i}
          ref={activeIndex === i ? activeRef : undefined}
          onClick={() => onSelect(i)}
          className={`w-full text-left px-3 py-1.5 flex items-center justify-between gap-2 hover:bg-graphite2 transition-colors ${
            activeIndex === i ? "bg-graphite2" : ""
          }`}
        >
          <span className="text-ivorydim truncate">
            {m.moveNumber}
            {m.color === "white" ? "." : "..."} {m.san}
          </span>
          <span
            style={{ color: CLASS_COLORS[m.classification] }}
            className="text-xs uppercase tracking-wide shrink-0"
          >
            {CLASS_LABELS[m.classification]}
          </span>
        </button>
      ))}
    </div>
  );
}
