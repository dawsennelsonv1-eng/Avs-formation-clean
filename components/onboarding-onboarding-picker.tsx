"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui-button";
import { completeOnboarding } from "@/app/auth/actions";
import { useToast } from "@/components/ui-toast";
import { cn } from "@/lib/utils";

const INTERESTS = [
  { id: "marketing", label: "Marketing", emoji: "📈" },
  { id: "ventes", label: "Ventes", emoji: "🤝" },
  { id: "ecommerce", label: "E-commerce", emoji: "🛒" },
  { id: "finance", label: "Finances", emoji: "💰" },
  { id: "cartes", label: "Cartes & paiements", emoji: "💳" },
  { id: "contenu", label: "Création de contenu", emoji: "🎬" },
];

export function OnboardingPicker({ name }: { name: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const finish = async () => {
    setSaving(true);
    try {
      await completeOnboarding(selected);
      toast(`Bienvenue, ${name.split(" ")[0]} !`, "success");
      router.push("/");
    } catch {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-2rem)] flex-col px-5 py-10">
      <div className="mb-6">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-[12px] font-semibold text-gold">
          <Sparkles className="h-3.5 w-3.5" /> Bienvenue
        </div>
        <h1 className="font-display text-[26px] font-extrabold leading-tight">
          Qu'est-ce qui t'intéresse, {name.split(" ")[0]} ?
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Choisis quelques sujets pour personnaliser tes recommandations.
        </p>
      </div>

      <div className="grid flex-1 grid-cols-2 content-start gap-3">
        {INTERESTS.map((it) => {
          const on = selected.includes(it.id);
          return (
            <button
              key={it.id}
              onClick={() => toggle(it.id)}
              className={cn(
                "relative flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98]",
                on ? "border-gold bg-gold/10" : "border-border bg-card"
              )}
            >
              <span className="text-2xl">{it.emoji}</span>
              <span className="text-sm font-bold">{it.label}</span>
              {on && (
                <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-gold text-[#1a1208]">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-2">
        <Button size="lg" disabled={saving} onClick={finish}>
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Commencer"}
        </Button>
        <button onClick={finish} className="py-2 text-center text-[13px] text-muted-foreground">
          Passer
        </button>
      </div>
    </div>
  );
}
