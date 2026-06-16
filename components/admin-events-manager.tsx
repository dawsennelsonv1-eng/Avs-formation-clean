"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui-button";
import { Input } from "@/components/ui-input";
import { useToast } from "@/components/ui-toast";
import { cn } from "@/lib/utils";
import type { AppEvent } from "@/types";

export function EventsManager({ initial }: { initial: AppEvent[] }) {
  const [list, setList] = useState(initial);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [live, setLive] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const add = async () => {
    if (!title.trim() || !date.trim() || !time.trim())
      return toast("Titre, date et heure requis.", "error");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date, time, live, position: list.length }),
      });
      const data = await res.json();
      if (data.error) return toast(data.error, "error");
      setList((l) => [...l, { id: `tmp-${Date.now()}`, title, date, time, live }]);
      setTitle(""); setDate(""); setTime(""); setLive(false);
      toast("Évènement ajouté ✓", "success");
      router.refresh();
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cet évènement ?")) return;
    const res = await fetch("/api/admin/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.error) return toast(data.error, "error");
    setList((l) => l.filter((e) => e.id !== id));
    toast("Évènement supprimé.", "info");
    router.refresh();
  };

  return (
    <div>
      <div className="grid gap-2">
        {list.map((e) => (
          <div key={e.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <div className="min-w-[52px] text-center">
              <div className="font-display text-[13px] font-extrabold text-gold">{e.date.split(" ")[0]}</div>
              <div className="text-[10px] text-muted-foreground">{e.date.split(" ")[1] ?? ""}</div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-bold">{e.title}</div>
              <div className="text-[11px] text-muted-foreground">{e.time}{e.live ? " · 🔴 En direct" : ""}</div>
            </div>
            <button onClick={() => remove(e.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {list.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-3 text-center text-[12px] text-muted-foreground">
            Aucun évènement.
          </p>
        )}
      </div>

      <div className="my-4 h-px bg-border" />

      <div className="grid gap-2">
        <Input placeholder="Titre de l'évènement" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex gap-2">
          <Input placeholder="Date (ex : 15 JUIN)" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1" />
          <Input placeholder="Heure (ex : 19h00)" value={time} onChange={(e) => setTime(e.target.value)} className="flex-1" />
        </div>
        <button
          onClick={() => setLive((v) => !v)}
          className={cn(
            "rounded-xl border px-3 py-2.5 text-left text-[12px] font-semibold",
            live ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border bg-card text-muted-foreground"
          )}
        >
          {live ? "🔴 En direct (activé)" : "Marquer « En direct »"}
        </button>
        <Button onClick={add} disabled={saving}>
          <Plus className="h-4 w-4" /> Ajouter l'évènement
        </Button>
      </div>
    </div>
  );
}
