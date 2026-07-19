"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { AnnotatedMove } from "@/lib/types";
import { evalToCp } from "@/lib/classify";

export function EvalGraph({
  moves,
  activeIndex,
  onSelect,
}: {
  moves: AnnotatedMove[];
  activeIndex: number | null;
  onSelect: (i: number) => void;
}) {
  const data = moves.map((m, i) => ({
    idx: i,
    cp: Math.max(-1000, Math.min(1000, evalToCp(m.evalAfter))),
    isBlunder: m.classification === "blunder",
    isMistake: m.classification === "mistake",
    isBrilliant: m.classification === "brilliant",
    label: `${m.moveNumber}${m.color === "white" ? "." : "..."} ${m.san}`,
  }));

  return (
    <div className="h-40 w-full cursor-pointer">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          onClick={(e: any) => {
            if (e?.activeTooltipIndex != null) onSelect(e.activeTooltipIndex);
          }}
        >
          <defs>
            <linearGradient id="evalFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EDE6D6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#1C1F26" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#33384455" vertical={false} />
          <ReferenceLine y={0} stroke="#8A7256" strokeDasharray="3 3" />
          <XAxis dataKey="idx" hide />
          <YAxis domain={[-1000, 1000]} hide />
          <Tooltip
            contentStyle={{
              background: "#252932",
              border: "1px solid #8A7256",
              fontSize: 12,
              fontFamily: "var(--font-plex-mono)",
            }}
            labelFormatter={() => ""}
            formatter={(_value: any, _name: any, props: any) => [props.payload.label, ""]}
          />
          <Area
            type="monotone"
            dataKey="cp"
            stroke="#B8956A"
            fill="url(#evalFill)"
            strokeWidth={2}
            dot={(props: any) => {
              const { cx, cy, payload, index } = props;
              const isActive = index === activeIndex;
              if (payload.isBlunder) {
                return <circle key={index} cx={cx} cy={cy} r={isActive ? 5 : 3.5} fill="#8C3A3A" stroke="none" />;
              }
              if (payload.isMistake) {
                return <circle key={index} cx={cx} cy={cy} r={isActive ? 5 : 3} fill="#C97B3F" stroke="none" />;
              }
              if (payload.isBrilliant) {
                return <circle key={index} cx={cx} cy={cy} r={isActive ? 5 : 3} fill="#3FA7C9" stroke="none" />;
              }
              if (isActive) {
                return <circle key={index} cx={cx} cy={cy} r={4} fill="#EDE6D6" stroke="none" />;
              }
              return <circle key={index} cx={cx} cy={cy} r={0} />;
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
