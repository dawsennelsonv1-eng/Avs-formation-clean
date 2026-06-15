"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { useToast } from "@/components/ui-toast";
import { cn } from "@/lib/utils";
import type { PaymentRow } from "@/lib/admin-tables";

const STATUS = {
  granted: { label: "Validé", c: "text-emerald-400 border-emerald-500/30" },
  pending: { label: "En attente", c: "text-gold border-gold/30" },
  duplicate: { label: "Doublon", c: "text-destructive border-destructive/30" },
  rejected: { label: "Rejeté", c: "text-destructive border-destructive/30" },
} as const;

export function PaymentsTable({ rows }: { rows: PaymentRow[] }) {
  const [list, setList] = useState(rows);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();
  const router = useRouter();

  const act = async (id: string, action: "grant" | "reject") => {
    const res = await fetch("/api/admin/payments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const data = await res.json();
    if (data.error) return toast(data.error, "error");
    setList((l) => l.map((r) => (r.id === id ? { ...r, status: action === "grant" ? "granted" : "rejected" } : r)));
    toast(action === "grant" ? "Accès accordé ✓" : "Paiement rejeté", action === "grant" ? "success" : "info");
    router.refresh();
  };

  const filtered = filter === "all" ? list : list.filter((r) => r.status === filter);

  return (
    <div>
      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
        {["all", "pending", "granted", "duplicate", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-semibold",
              filter === f ? "border-gold bg-gold text-[#1a1208]" : "border-border bg-card text-muted-foreground"
            )}
          >
            {f === "all" ? "Tous" : STATUS[f as keyof typeof STATUS].label}
          </button>
        ))}
      </div>

      <div className="grid gap-2.5">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-3.5">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-bold">{r.fullName}</div>
                <div className="text-[11px] text-muted-foreground">{r.courseTitle}</div>
              </div>
              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold", STATUS[r.status as keyof typeof STATUS]?.c)}>
                {STATUS[r.status as keyof typeof STATUS]?.label ?? r.status}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
              <span>📱 {r.whatsapp}</span>
              <span className="uppercase">{r.method}</span>
              <span>ID : {r.transactionId ?? "—"}</span>
              <span>{r.proofKind === "screenshot" ? "Capture" : "Saisi"}</span>
            </div>
            {r.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <button onClick={() => act(r.id, "grant")} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500/15 py-2 text-[12px] font-bold text-emerald-400">
                  <Check className="h-4 w-4" /> Accorder
                </button>
                <button onClick={() => act(r.id, "reject")} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-destructive/15 py-2 text-[12px] font-bold text-destructive">
                  <X className="h-4 w-4" /> Rejeter
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-[13px] text-muted-foreground">Aucun paiement.</p>}
      </div>
    </div>
  );
}
