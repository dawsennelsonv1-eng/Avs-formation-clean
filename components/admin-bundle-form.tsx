"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ImageUp, Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui-button";
import { Input } from "@/components/ui-input";
import { useToast } from "@/components/ui-toast";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { cn, formatHTG } from "@/lib/utils";
import type { Bundle, Course } from "@/types";

const COLORS = ["#7B3FF2", "#0FA3B1", "#E5484D", "#3BB273", "#E8B84B", "#F2618C", "#4C8DFF"];

export function BundleForm({ bundle, courses }: { bundle?: Bundle; courses: Course[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const editing = !!bundle;

  const [form, setForm] = useState({
    title: bundle?.title ?? "",
    blurb: bundle?.blurb ?? "",
    price: bundle?.price ?? 0,
    was: bundle?.was ?? 0,
    color: bundle?.color ?? COLORS[0],
    featured: bundle?.featured ?? false,
    courseIds: bundle?.courseIds ?? [],
    imageUrl: bundle?.imageUrl ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const uploadImage = async (file?: File) => {
    if (!file) return;
    setImgUploading(true);
    try {
      const supabase = createBrowserSupabase();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `bundles/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("course-media").upload(path, file, { contentType: file.type });
      if (error) toast(error.message, "error");
      else {
        const { data } = supabase.storage.from("course-media").getPublicUrl(path);
        set("imageUrl", data.publicUrl);
        toast("Bannière téléversée ✓", "success");
      }
    } finally {
      setImgUploading(false);
    }
  };

  const toggleCourse = (id: string) =>
    setForm((f) => ({
      ...f,
      courseIds: f.courseIds.includes(id) ? f.courseIds.filter((x) => x !== id) : [...f.courseIds, id],
    }));

  const save = async () => {
    if (!form.title.trim()) return toast("Le titre est requis.", "error");
    if (form.courseIds.length === 0) return toast("Choisis au moins une formation.", "error");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/bundles", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: bundle!.id, ...form } : form),
      });
      const data = await res.json();
      if (data.error) toast(data.error, "error");
      else {
        toast(editing ? "Offre mise à jour ✓" : "Offre créée ✓", "success");
        router.push("/admin/bundles");
        router.refresh();
      }
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!editing || !confirm("Supprimer cette offre groupée ?")) return;
    const res = await fetch("/api/admin/bundles", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bundle!.id }),
    });
    const data = await res.json();
    if (data.error) toast(data.error, "error");
    else {
      toast("Offre supprimée.", "info");
      router.push("/admin/bundles");
      router.refresh();
    }
  };

  return (
    <div className="grid gap-4">
      <Field label="Titre">
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex : Pack Entrepreneur Complet" />
      </Field>
      <Field label="Accroche">
        <Input value={form.blurb} onChange={(e) => set("blurb", e.target.value)} placeholder="Une phrase qui vend l'offre" />
      </Field>

      <Field label="Bannière (image de l'offre)">
        {form.imageUrl ? (
          <div className="relative overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.imageUrl} alt="bannière" className="aspect-[16/9] w-full object-cover" />
            <button
              onClick={() => set("imageUrl", "")}
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-[12px] font-semibold text-muted-foreground">
            {imgUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}
            {imgUploading ? "Téléversement…" : "Téléverser une bannière"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files?.[0])} />
          </label>
        )}
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Prix (HTG)">
          <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} />
        </Field>
        <Field label="Prix barré (HTG)">
          <Input type="number" value={form.was} onChange={(e) => set("was", e.target.value)} />
        </Field>
      </div>

      <Field label="Couleur">
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

      <button
        onClick={() => set("featured", !form.featured)}
        className="flex items-center justify-between rounded-2xl border border-border bg-card p-3.5 text-left"
      >
        <div className="flex-1 pr-3">
          <div className="text-[13px] font-semibold">Offre limitée (bannière d'accueil)</div>
          <div className="text-[11px] text-muted-foreground">Met cette offre en avant tout en haut de l'accueil.</div>
        </div>
        <div className={cn("relative h-6 w-11 rounded-full transition-colors", form.featured ? "bg-gold" : "bg-secondary")}>
          <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", form.featured ? "translate-x-[22px]" : "translate-x-0.5")} />
        </div>
      </button>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[12px] font-semibold text-muted-foreground">Formations incluses</span>
          <span className="text-[11px] text-gold">{form.courseIds.length} sélectionnée(s)</span>
        </div>
        <div className="grid gap-2">
          {courses.map((c) => {
            const on = form.courseIds.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleCourse(c.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-2.5 text-left transition-colors",
                  on ? "border-gold bg-gold/10" : "border-border bg-card"
                )}
              >
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[9px] font-bold text-white/80"
                  style={{ backgroundImage: `linear-gradient(150deg, ${c.color}, #0c0f17)` }}
                >
                  {c.tag.slice(0, 3)}
                </div>
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
          {courses.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-3 text-center text-[12px] text-muted-foreground">
              Crée d'abord des formations pour les regrouper.
            </p>
          )}
        </div>
      </div>

      <div className="mt-2 grid gap-2">
        <Button size="lg" onClick={save} disabled={saving || imgUploading}>
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : editing ? "Enregistrer" : "Créer l'offre"}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[12px] font-semibold text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}
