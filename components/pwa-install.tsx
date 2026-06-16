"use client";

import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstall() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [standalone, setStandalone] = useState(true); // assume installed until proven otherwise (avoids flash)
  const [dismissed, setDismissed] = useState(false);   // in-memory only → returns on refresh / new session
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Register the service worker (needed for installability).
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setStandalone(isStandalone);

    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setStandalone(true));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  // Already installed, or dismissed this view → show nothing.
  if (standalone || dismissed) return null;

  // Show only when we can actually install: Android prompt captured, or iOS (manual steps).
  const canShow = !!deferred || isIOS;
  if (!canShow) return null;

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      setDismissed(true);
    } else if (isIOS) {
      setShowGuide(true);
    }
  };

  return (
    <>
      <div className="fixed inset-x-0 bottom-[84px] z-[80] mx-auto flex max-w-[440px] items-center gap-3 px-4">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-gold/30 bg-card/95 p-3 shadow-2xl backdrop-blur">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold to-gold-deep text-[15px] font-extrabold text-[#1a1208]">
            A
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold leading-tight">Installe l'application AVS</div>
            <div className="text-[11px] text-muted-foreground">Accès rapide, plein écran, comme une vraie app.</div>
          </div>
          <button
            onClick={install}
            className="shrink-0 rounded-xl bg-gold px-3.5 py-2 text-[12px] font-bold text-[#1a1208]"
          >
            <span className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> Installer</span>
          </button>
          <button onClick={() => setDismissed(true)} aria-label="Fermer" className="shrink-0 text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* iOS guide */}
      {showGuide && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowGuide(false)}>
          <div className="w-full max-w-[440px] rounded-t-3xl border border-border bg-background p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-extrabold">Installer sur iPhone / iPad</h3>
              <button onClick={() => setShowGuide(false)} className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground">
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>
            <p className="mb-4 text-[13px] text-muted-foreground">
              Apple ne permet pas l'installation en un clic. Suis ces étapes dans <span className="font-semibold text-foreground">Safari</span> :
            </p>
            <ol className="grid gap-3">
              <Step n={1} icon={<Share className="h-4 w-4 text-sky-400" />}>
                Appuie sur le bouton <span className="font-semibold text-foreground">Partager</span> (le carré avec une flèche vers le haut), en bas de Safari.
              </Step>
              <Step n={2} icon={<SquarePlus className="h-4 w-4 text-gold" />}>
                Fais défiler et choisis <span className="font-semibold text-foreground">« Sur l'écran d'accueil »</span>.
              </Step>
              <Step n={3} icon={<Download className="h-4 w-4 text-emerald-400" />}>
                Appuie sur <span className="font-semibold text-foreground">Ajouter</span>. L'icône AVS apparaîtra sur ton écran d'accueil.
              </Step>
            </ol>
            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-xl bg-gold py-3 text-sm font-bold text-[#1a1208]"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Step({ n, icon, children }: { n: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-card text-[12px] font-extrabold text-gold">{n}</span>
      <div className="flex-1 text-[13px] leading-relaxed text-muted-foreground">
        <span className="mr-1 inline-flex translate-y-0.5">{icon}</span>
        {children}
      </div>
    </li>
  );
}
