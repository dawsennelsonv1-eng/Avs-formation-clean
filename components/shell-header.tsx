"use client";

import { Bell, Flame, Search, Settings } from "lucide-react";
import { SITE } from "@/config/site";

export function Header({ streak = 7 }: { streak?: number }) {
  return (
    <header className="glass sticky top-0 z-40 border-b border-border px-4 pb-3 pt-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-gold to-gold-deep font-display text-[17px] font-extrabold text-[#1a1208] shadow-lg shadow-gold/25">
            {SITE.brandLetter}
          </div>
          <div className="leading-none">
            <div className="font-display text-base font-extrabold tracking-tight">
              AVS <span className="text-gold">Formation</span>
            </div>
            <div className="mt-0.5 text-[10px] tracking-wider text-muted-foreground">
              {SITE.tagline}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1.5">
            <Flame className="h-4 w-4 text-gold" />
            <span className="text-[13px] font-bold">{streak}</span>
          </div>
          <IconButton aria-label="Rechercher"><Search className="h-[18px] w-[18px]" /></IconButton>
          <IconButton aria-label="Notifications" dot><Bell className="h-[18px] w-[18px]" /></IconButton>
          <IconButton aria-label="Paramètres"><Settings className="h-[18px] w-[18px]" /></IconButton>
        </div>
      </div>
    </header>
  );
}

function IconButton({
  children,
  dot,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { dot?: boolean }) {
  return (
    <button
      className="relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-accent active:scale-95"
      {...props}
    >
      {children}
      {dot && (
        <span className="absolute right-2 top-1.5 h-[7px] w-[7px] rounded-full border-2 border-card bg-destructive" />
      )}
    </button>
  );
}
