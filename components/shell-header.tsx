"use client";

import { Bell, Flame } from "lucide-react";
import Link from "next/link";
import { SITE } from "@/config/site";

export function Header({ streak = 7 }: { streak?: number }) {
  return (
    <header className="glass sticky top-0 z-40 border-b border-border px-4 pb-3 pt-3.5">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
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
        </Link>

        <div className="flex items-center gap-2.5">
          <Link
            href="/learning"
            aria-label="Mes formations"
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 transition-colors hover:bg-accent active:scale-95"
          >
            <Flame className="h-4 w-4 text-gold" />
            <span className="text-[13px] font-bold">{streak}</span>
          </Link>
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-accent active:scale-95"
          >
            <Bell className="h-[18px] w-[18px]" />
          </Link>
        </div>
      </div>
    </header>
  );
}
