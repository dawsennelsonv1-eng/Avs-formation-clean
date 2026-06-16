"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui-toast";
import { cn, formatHTG } from "@/lib/utils";
import type { Course, Bundle } from "@/types";
import type { UserRow } from "@/lib/admin-tables";

export function GrantModal({
  user,
  courses,
  bundles,
  onClose,
}: {
  user: UserRow;
  courses: Course[];
  bundles: Bundle[];
  onClose: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<"courses" | "bundle">("courses");
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [bundleId, setBundleId] = useState<string>("");
  const [markPaid, setMarkPaid] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const toggleCourse = (id: string) =>
    setCourseIds((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));

  const submit = async () => {
    if (mode === "courses" && courseIds.length === 0) return toast("Choisis au moins une formation.", "error");
    if (mode === "bundle" && !bundleId) return toast("Choisis une offre groupée.", "error");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...(mode === "bundle" ? { bundleId } : { courseIds }),
          markPaid,
          amount: markPaid && amount ? Number(amount) : null,
          note: note.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.error) toast(data.error, "error");
      else {
        toast(`Accès accordé à ${user.fullName} ✓`, "success");
        router.refresh();
        onClose();
      }
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[92dvh] w-full max-w-[440px] flex-col rounded-t-3xl border border-border bg-background sm:rounded-3xl">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="min-w-0">
            <div className="text-[14px] font-bold">Accorder l'accès</div>
            <div className="truncate text-[11px] text-muted-foreground">{user.fullName}</div>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground">
            <X className="h-[18px] w-[18px]" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* mode toggle */}
          <div className="mb-3 flex gap-2">
            {(["courses", "bundle"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 rounded-xl border py-2 text-[12px] font-semibold",
                  mode === m ? "border-gold bg-gold text-[#1a1208]" : "border-border bg-card text-muted-foreground"
                )}
              >
                {m === "courses" ? "Formations" : "Offre groupée"}
              </button>
            ))}
          </div>

          {mode === "courses" ? (
            <div className="grid gap-2">
              {courses.map((c) => {
                const on = courseIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCourse(c.id)}
                    className={cn("flex items-center gap-3 rounded-xl border p-2.5 text-left", on ? "border-gold bg-gold/10" : "border-border bg-card")}
                  >
                    <div className="h-9 w-9 shrink-0 rounded-lg" style={{ backgroundImage: `linear-gradient(150deg, ${c.color}, #0c0f17)` }} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold">{c.title}</div>
                      <div className="text-[11px] text-muted-foreground">{c.isFree ? "Gratuit" : formatHTG(c.price)}</div>
                    </div>
                    <div className={cn("grid h-5 w-5 place-items-center rounded-full border", on ? "border-gold bg-gold text-[#1a1208]" : "border-border")}>
                      {on && <Check className="h-3 w-3" />}
                    </div>
                  </button>
                );
              })}
              {courses.length === 0 && <p className="text-center text-[12px] text-muted-foreground">Aucune formation.</p>}
            </div>
          ) : (
            <div className="grid gap-2">
              {bundles.map((bd) => (
                <button
                  key={bd.id}
                  onClick={() => setBundleId(bd.id)}
                  className={cn("flex items-center gap-3 rounded-xl border p-2.5 text-left", bundleId === bd.id ? "border-gold bg-gold/10" : "border-border bg-card")}
                >
                  <div className="h-9 w-9 shrink-0 rounded-lg" style={{ backgroundImage: `linear-gradient(150deg, ${bd.color}, #0c0f17)` }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold">{bd.title}</div>
                    <div className="text-[11px] text-muted-foreground">{bd.count} formations · {formatHTG(bd.price)}</div>
                  </div>
                  <div className={cn("grid h-5 w-5 place-items-center rounded-full border", bundleId === bd.id ? "border-gold bg-gold text-[#1a1208]" : "border-border")}>
                    {bundleId === bd.id && <Check className="h-3 w-3" />}
                  </div>
                </button>
              ))}
              {bundles.length === 0 && <p className="text-center text-[12px] text-muted-foreground">Aucune offre groupée.</p>}
            </div>
          )}

          {/* mark paid */}
          <div className="mt-4 rounded-2xl border border-border bg-card p-3.5">
            <button onClick={() => setMarkPaid((v) => !v)} className="flex w-full items-center justify-between text-left">
              <div className="flex-1 pr-3">
                <div className="text-[13px] font-semibold">Marquer comme payé (paiement direct)</div>
                <div className="text-[11px] text-muted-foreground">S'il t'a payé directement (cash, etc.), enregistre-le.</div>
              </div>
              <div className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", markPaid ? "bg-gold" : "bg-secondary")}>
                <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", markPaid ? "translate-x-[22px]" : "translate-x-0.5")} />
              </div>
            </button>
            {markPaid && (
              <div className="mt-3 grid gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Montant reçu (HTG)"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-gold"
                />
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Note (optionnel) — ex : payé en cash le 15/06"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-gold"
                />
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border px-4 py-3">
          <button
            onClick={submit}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-bold text-[#1a1208] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Accorder l'accès
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
