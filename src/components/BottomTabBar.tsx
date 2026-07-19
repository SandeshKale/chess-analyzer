"use client";

import { Home, Search, LineChart } from "lucide-react";

export type TabKey = "home" | "games" | "analysis";

const TABS: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "games", label: "Search", icon: Search },
  { key: "analysis", label: "Analysis", icon: LineChart },
];

export function BottomTabBar({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-graphite2 border-t border-brassdim/20 flex z-20"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors ${
              isActive ? "text-brass" : "text-ivorydim hover:text-ivory"
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
