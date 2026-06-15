"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { id: "courses", label: "Nouvelles formations", desc: "Quand une formation sort" },
  { id: "promos", label: "Offres & promos", desc: "Réductions et packs limités" },
  { id: "streak", label: "Rappels de série", desc: "Pour garder ton 🔥" },
  { id: "replies", label: "Réponses du tuteur IA", desc: "Quand l'IA te répond" },
];

export function NotificationToggles() {
  const [on, setOn] = useState<Record<string, boolean>>({
    courses: true, promos: true, streak: true, replies: false,
  });
  return (
    <div className="grid gap-2.5">
      {ITEMS.map((it) => (
        <button
          key={it.id}
          onClick={() => setOn((s) => ({ ...s, [it.id]: !s[it.id] }))}
          className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 text-left"
        >
          <div className="flex-1 pr-3">
            <div className="text-[13px] font-semibold">{it.label}</div>
            <div className="text-[11px] text-muted-foreground">{it.desc}</div>
          </div>
          <div className={cn("relative h-6 w-11 rounded-full transition-colors", on[it.id] ? "bg-gold" : "bg-secondary")}>
            <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", on[it.id] ? "translate-x-[22px]" : "translate-x-0.5")} />
          </div>
        </button>
      ))}
    </div>
  );
}
