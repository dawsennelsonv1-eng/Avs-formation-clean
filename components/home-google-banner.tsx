"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { signInWithGoogle } from "@/app/auth/actions";

const KEY = "avs_google_banner_dismissed";

export function GoogleBanner({ signedIn }: { signedIn: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (signedIn) return;
    try {
      if (localStorage.getItem(KEY) !== "1") setShow(true);
    } catch {
      setShow(true);
    }
  }, [signedIn]);

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setShow(false);
  };

  return (
    <div className="animate-fade-up mb-3 flex items-center gap-3 rounded-2xl border border-border bg-card px-3.5 py-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white">
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
          <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 4.75 12 4.75Z" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold leading-tight">Connecte-toi plus vite</p>
        <p className="text-[11px] text-muted-foreground">Une autre façon de se connecter : avec Google.</p>
      </div>
      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="rounded-xl bg-gold px-3 py-2 text-[12px] font-bold text-[#1a1208] transition-transform active:scale-95"
        >
          Continuer
        </button>
      </form>
      <button onClick={dismiss} aria-label="Fermer" className="shrink-0 text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
