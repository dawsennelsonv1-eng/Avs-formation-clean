"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, Shield, ShieldOff } from "lucide-react";
import { useToast } from "@/components/ui-toast";
import { cn } from "@/lib/utils";
import { GrantModal } from "@/components/admin-grant-modal";
import type { UserRow } from "@/lib/admin-tables";
import type { Course, Bundle } from "@/types";

export function UsersTable({
  rows,
  courses,
  bundles,
}: {
  rows: UserRow[];
  courses: Course[];
  bundles: Bundle[];
}) {
  const [list, setList] = useState(rows);
  const [q, setQ] = useState("");
  const [grantUser, setGrantUser] = useState<UserRow | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const setRole = async (id: string, role: "user" | "admin") => {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    const data = await res.json();
    if (data.error) return toast(data.error, "error");
    setList((l) => l.map((u) => (u.id === id ? { ...u, role } : u)));
    toast(role === "admin" ? "Promu administrateur ✓" : "Rétrogradé.", "info");
    router.refresh();
  };

  const filtered = list.filter(
    (u) =>
      u.fullName.toLowerCase().includes(q.toLowerCase()) ||
      (u.whatsapp ?? "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher par nom ou WhatsApp…"
        className="mb-3 h-11 w-full rounded-xl border border-border bg-card px-3.5 text-sm outline-none focus:border-gold"
      />
      <div className="grid gap-2">
        {filtered.map((u) => (
          <div key={u.id} className="rounded-2xl border border-border bg-card p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-[13px] font-extrabold text-[#1a1208]">
                {u.fullName.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 truncate text-[13px] font-bold">
                  {u.fullName}
                  {u.role === "admin" && (
                    <span className="rounded bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold text-gold">ADMIN</span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground">🔥 {u.streak} · {u.whatsapp ?? "—"}</div>
              </div>
              <button
                onClick={() => setRole(u.id, u.role === "admin" ? "user" : "admin")}
                className={cn(
                  "flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold",
                  u.role === "admin" ? "border-border text-muted-foreground" : "border-gold/40 text-gold"
                )}
              >
                {u.role === "admin" ? <><ShieldOff className="h-3.5 w-3.5" /> Retirer</> : <><Shield className="h-3.5 w-3.5" /> Promouvoir</>}
              </button>
            </div>
            <button
              onClick={() => setGrantUser(u)}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gold/30 bg-gold/10 py-2 text-[12px] font-bold text-gold"
            >
              <Gift className="h-3.5 w-3.5" /> Accorder une formation / offre
            </button>
          </div>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-[13px] text-muted-foreground">Aucun utilisateur.</p>}
      </div>

      {grantUser && (
        <GrantModal user={grantUser} courses={courses} bundles={bundles} onClose={() => setGrantUser(null)} />
      )}
    </div>
  );
}
