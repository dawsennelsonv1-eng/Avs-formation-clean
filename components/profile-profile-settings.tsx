"use client";

import { useState } from "react";
import { Check, ChevronRight, Globe, Settings } from "lucide-react";
import { SectionTitle } from "@/components/shell-section";
import { LOCALES, getDict } from "@/config/i18n";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";
import { signout } from "@/app/auth/actions";
import Link from "next/link";

export function ProfileSettings({ signedIn }: { signedIn: boolean }) {
  const d = getDict();
  const [locale, setLocale] = useState<Locale>("fr");
  const items = d.profile.items.filter((i) => signedIn || i !== "Déconnexion");

  return (
    <>
      <SectionTitle icon={<Globe className="h-[17px] w-[17px] text-gold" />} title={d.profile.language} />
      <div className="grid gap-2">
        {LOCALES.map((l) => {
          const active = locale === l.code && l.available;
          return (
            <button
              key={l.code}
              disabled={!l.available}
              onClick={() => l.available && setLocale(l.code)}
              className={cn(
                "flex items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-colors",
                active ? "border-gold bg-gold/10" : "border-border bg-card",
                !l.available && "opacity-50"
              )}
            >
              <span>{l.flag} {l.label}</span>
              {!l.available ? (
                <span className="text-[11px] text-muted-foreground">{d.profile.soon}</span>
              ) : (
                active && <Check className="h-[18px] w-[18px] text-gold" />
              )}
            </button>
          );
        })}
      </div>

      <SectionTitle icon={<Settings className="h-[17px] w-[17px] text-gold" />} title={d.profile.settings} />
      <div className="grid">
        {items.map((item) =>
          item === "Déconnexion" ? (
            <form key={item} action={signout}>
              <button
                type="submit"
                className="flex w-full items-center justify-between border-b border-border py-3.5 text-sm font-semibold text-destructive"
              >
                {item}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </form>
          ) : item === "Politique de confidentialité" ? (
            <Link
              key={item}
              href="/legal/privacy"
              className="flex items-center justify-between border-b border-border py-3.5 text-sm font-semibold transition-colors hover:text-gold"
            >
              {item}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ) : item === "Conditions d'utilisation" ? (
            <Link
              key={item}
              href="/legal/terms"
              className="flex items-center justify-between border-b border-border py-3.5 text-sm font-semibold transition-colors hover:text-gold"
            >
              {item}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ) : (
            <button
              key={item}
              className="flex items-center justify-between border-b border-border py-3.5 text-sm font-semibold transition-colors hover:text-gold"
            >
              {item}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )
        )}
      </div>
    </>
  );
}
