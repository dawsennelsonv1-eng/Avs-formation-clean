"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUp, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui-button";
import { Input } from "@/components/ui-input";
import { useToast } from "@/components/ui-toast";
import { cn } from "@/lib/utils";
import type { AdminCourse } from "@/lib/admin-courses";

const TAGS = ["Marketing", "Ventes", "Cartes", "E-commerce", "Finance", "Création de contenu"];
const COLORS = ["#7B3FF2", "#0FA3B1", "#E5484D", "#3BB273", "#E8B84B", "#F2618C", "#4C8DFF"];

export function CourseForm({ course }: { course?: AdminCourse }) {
  const router = useRouter();
  const { toast } = useToast();
  const editing = !!course;

  const [form, setForm] = useState({
    title: course?.title ?? "",
    tag: course?.tag ?? TAGS[0],
    blurb: course?.blurb ?? "",
    summary: course?.summary ?? "",
    price: course?.price ?? 0,
    durationMin: course?.durationMin ?? 0,
    lessons: course?.lessons ?? 0,
    color: course?.color ?? COLORS[0],
    upcoming: course?.upcoming ?? false,
    hasLearningTools: course?.hasLearningTools ?? false,
    flyerUrl: course?.flyerUrl ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        set("flyerUrl", data.url);
        toast("Flyer téléversé ✓", "success");
      } else {
        toast(data.error ?? "Échec du téléversement", "error");
      }
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast("Le titre est requis.", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: course!.id, ...form } : form),
      });
      const data = await res.json();
      if (data.error) {
        toast(data.error, "error");
      } else {
        toast(editing ? "Formation mise à jour ✓" : "Formation créée ✓", "success");
        router.push("/admin/courses");
        router.refresh();
      }
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!editing || !confirm("Supprimer définitivement cette formation ?")) return;
    const res = await fetch("/api/admin/courses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: course!.id }),
    });
    const data = await res.json();
    if (data.error) toast(data.error, "error");
    else {
      toast("Formation supprimée.", "info");
      router.push("/admin/courses");
      router.refresh();
    }
  };

  return (
    <div className="grid gap-4">
      {/* Flyer */}
      <div>
        <Label>Flyer</Label>
        <div
          className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl border border-border"
          style={{ backgroundImage: `linear-gradient(155deg, ${form.color}, #0c0f17)` }}
        >
          {form.flyerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.flyerUrl} alt="flyer" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[12px] text-white/70">Aperçu du flyer</span>
          )}
          <label className="absolute bottom-2 right-2 flex cursor-pointer items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1.5 text-[11px] font-semibold text-white">
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageUp className="h-3.5 w-3.5" />}
            {form.flyerUrl ? "Changer" : "Téléverser"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
          </label>
        </div>
      </div>

      <Field label="Titre">
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex : Maîtriser le Marketing" />
      </Field>

      <Field label="Catégorie">
        <div className="flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => set("tag", t)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12px] font-semibold",
                form.tag === t ? "border-gold bg-gold text-[#1a1208]" : "border-border bg-card text-muted-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Accroche (sur le flyer)">
        <Input value={form.blurb} onChange={(e) => set("blurb", e.target.value)} placeholder="Une phrase d'accroche" />
      </Field>

      <Field label="Résumé (page détail)">
        <textarea
          value={form.summary}
          onChange={(e) => set("summary", e.target.value)}
          rows={3}
          placeholder="Description complète de la formation"
          className="w-full resize-none rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-gold"
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Prix (HTG)">
          <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} />
        </Field>
        <Field label="Durée (min)">
          <Input type="number" value={form.durationMin} onChange={(e) => set("durationMin", e.target.value)} />
        </Field>
        <Field label="Leçons">
          <Input type="number" value={form.lessons} onChange={(e) => set("lessons", e.target.value)} />
        </Field>
      </div>

      <Field label="Couleur du flyer">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => set("color", c)}
              className={cn("h-8 w-8 rounded-full border-2", form.color === c ? "border-white" : "border-transparent")}
              style={{ background: c }}
            />
          ))}
        </div>
      </Field>

      <Toggle label="Bientôt disponible" desc="Affiche un badge « Bientôt » et masque la lecture." on={form.upcoming} onClick={() => set("upcoming", !form.upcoming)} />
      <Toggle label="Outils d'apprentissage" desc="Active le tuteur IA, les quiz et les flashcards." on={form.hasLearningTools} onClick={() => set("hasLearningTools", !form.hasLearningTools)} />

      <div className="mt-2 grid gap-2">
        <Button size="lg" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : editing ? "Enregistrer" : "Créer la formation"}
        </Button>
        {editing && (
          <Button variant="ghost" className="text-destructive" onClick={remove}>
            <Trash2 className="h-4 w-4" /> Supprimer
          </Button>
        )}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-1.5 text-[12px] font-semibold text-muted-foreground">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
function Toggle({ label, desc, on, onClick }: { label: string; desc: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between rounded-2xl border border-border bg-card p-3.5 text-left">
      <div className="flex-1 pr-3">
        <div className="text-[13px] font-semibold">{label}</div>
        <div className="text-[11px] text-muted-foreground">{desc}</div>
      </div>
      <div className={cn("relative h-6 w-11 rounded-full transition-colors", on ? "bg-gold" : "bg-secondary")}>
        <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", on ? "translate-x-[22px]" : "translate-x-0.5")} />
      </div>
    </button>
  );
}
