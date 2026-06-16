"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUp, Loader2, Plus, Trash2, Video, X } from "lucide-react";
import { Button } from "@/components/ui-button";
import { Input } from "@/components/ui-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui-tabs";
import { useToast } from "@/components/ui-toast";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/lib/learning-lessons";
import type { Flashcard, QuizQuestion } from "@/lib/learning-content";

export function CourseContentManager({
  courseId,
  lessons,
  cards,
  quiz,
}: {
  courseId: string;
  lessons: Lesson[];
  cards: Flashcard[];
  quiz: QuizQuestion[];
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">Leçons</TabsTrigger>
          <TabsTrigger value="cards">Flashcards</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>
        <TabsContent value="lessons">
          <LessonManager courseId={courseId} initial={lessons} />
        </TabsContent>
        <TabsContent value="cards">
          <CardManager courseId={courseId} initial={cards} />
        </TabsContent>
        <TabsContent value="quiz">
          <QuizManager courseId={courseId} initial={quiz} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function useDelete(endpoint: string) {
  const { toast } = useToast();
  return async (id: string, extra?: Record<string, any>) => {
    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...extra }),
    });
    const data = await res.json();
    if (data.error) {
      toast(data.error, "error");
      return false;
    }
    toast("Supprimé.", "info");
    return true;
  };
}

function LessonManager({ courseId, initial }: { courseId: string; initial: Lesson[] }) {
  const [list, setList] = useState(initial);
  const [title, setTitle] = useState("");
  const [dur, setDur] = useState("");
  const [preview, setPreview] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const del = useDelete("/api/admin/lessons");

  const uploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) setImages((arr) => [...arr, data.url]);
        else toast(data.error ?? "Échec du téléversement", "error");
      }
      toast("Image(s) ajoutée(s) ✓", "success");
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setTitle(""); setDur(""); setPreview(false); setVideoUrl(""); setImages([]); setContent("");
  };

  const add = async () => {
    if (!title.trim()) return toast("Le titre est requis.", "error");
    const res = await fetch("/api/admin/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId, title, durationMin: dur, isPreview: preview,
        videoUrl: videoUrl.trim() || null, imageUrls: images, content: content.trim() || null,
        position: list.length,
      }),
    });
    const data = await res.json();
    if (data.error) return toast(data.error, "error");
    setList((l) => [
      ...l,
      { id: data.id ?? `tmp-${Date.now()}`, title, durationMin: Number(dur) || 0, isPreview: preview, completed: false, videoUrl: videoUrl.trim() || null, imageUrls: images, content: content.trim() || null },
    ]);
    reset();
    toast("Leçon ajoutée ✓", "success");
  };

  return (
    <div>
      <div className="grid gap-2">
        {list.map((l, i) => (
          <Row key={l.id} onDelete={async () => (await del(l.id)) && setList((x) => x.filter((y) => y.id !== l.id))}>
            <span className="text-[13px]">{i + 1}. {l.title}</span>
            <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
              {l.durationMin}min{l.isPreview ? " · aperçu" : ""}
              {l.videoUrl && <Video className="h-3 w-3 text-gold" />}
              {l.imageUrls.length > 0 && <span className="text-gold">{l.imageUrls.length} 🖼</span>}
            </span>
          </Row>
        ))}
        {list.length === 0 && <Empty>Aucune leçon.</Empty>}
      </div>
      <Divider />

      <div className="grid gap-2.5">
        <Input placeholder="Titre de la leçon" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex gap-2">
          <Input placeholder="Durée (min)" type="number" value={dur} onChange={(e) => setDur(e.target.value)} className="flex-1" />
          <button
            onClick={() => setPreview((p) => !p)}
            className={cn("rounded-xl border px-3 text-[12px] font-semibold", preview ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground")}
          >
            Aperçu gratuit
          </button>
        </div>

        {/* Video URL */}
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <Video className="h-3.5 w-3.5" /> Vidéo (lien YouTube, Vimeo ou MP4)
          </div>
          <Input placeholder="https://..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
        </div>

        {/* Slideshow images */}
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <ImageUp className="h-3.5 w-3.5" /> Diapositives / images
          </div>
          {images.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {images.map((url, i) => (
                <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => setImages((arr) => arr.filter((_, j) => j !== i))}
                    className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-black/70 text-white"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-[12px] font-semibold text-muted-foreground">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}
            {uploading ? "Téléversement…" : "Téléverser des images"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadImages(e.target.files)} />
          </label>
        </div>

        {/* Text content */}
        <div>
          <div className="mb-1 text-[11px] font-semibold text-muted-foreground">Notes / contenu écrit (optionnel)</div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Points clés, ressources, transcription…"
            className="w-full resize-none rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-gold"
          />
        </div>

        <Button onClick={add} disabled={uploading}><Plus className="h-4 w-4" /> Ajouter la leçon</Button>
      </div>
    </div>
  );
}

function CardManager({ courseId, initial }: { courseId: string; initial: Flashcard[] }) {
  const [list, setList] = useState(initial);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const { toast } = useToast();
  const del = useDelete("/api/admin/flashcards");

  const add = async () => {
    if (!front.trim() || !back.trim()) return;
    const res = await fetch("/api/admin/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, front, back, position: list.length }),
    });
    const data = await res.json();
    if (data.error) return toast(data.error, "error");
    setList((l) => [...l, { id: `tmp-${Date.now()}`, front, back }]);
    setFront(""); setBack("");
    toast("Flashcard ajoutée ✓", "success");
  };

  return (
    <div>
      <div className="grid gap-2">
        {list.map((c) => (
          <Row key={c.id} onDelete={async () => (await del(c.id)) && setList((x) => x.filter((y) => y.id !== c.id))}>
            <span className="text-[13px]">{c.front}</span>
            <span className="text-[11px] text-muted-foreground">→ {c.back.slice(0, 24)}…</span>
          </Row>
        ))}
        {list.length === 0 && <Empty>Aucune flashcard.</Empty>}
      </div>
      <Divider />
      <div className="grid gap-2">
        <Input placeholder="Question (recto)" value={front} onChange={(e) => setFront(e.target.value)} />
        <Input placeholder="Réponse (verso)" value={back} onChange={(e) => setBack(e.target.value)} />
        <Button onClick={add}><Plus className="h-4 w-4" /> Ajouter la carte</Button>
      </div>
    </div>
  );
}

function QuizManager({ courseId, initial }: { courseId: string; initial: QuizQuestion[] }) {
  const [list, setList] = useState(initial);
  const [q, setQ] = useState("");
  const [opts, setOpts] = useState(["", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [expl, setExpl] = useState("");
  const { toast } = useToast();
  const del = useDelete("/api/admin/quiz");

  const add = async () => {
    if (!q.trim() || opts.filter((o) => o.trim()).length < 2) return toast("Question + 2 options minimum.", "error");
    const res = await fetch("/api/admin/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, question: q, options: opts, correctIndex: correct, explanation: expl, position: list.length }),
    });
    const data = await res.json();
    if (data.error) return toast(data.error, "error");
    setList((l) => [...l, { id: `tmp-${Date.now()}`, question: q, options: opts.filter((o) => o.trim()), correctIndex: correct, explanation: expl }]);
    setQ(""); setOpts(["", "", ""]); setCorrect(0); setExpl("");
    toast("Question ajoutée ✓", "success");
  };

  return (
    <div>
      <div className="grid gap-2">
        {list.map((item) => (
          <Row key={item.id} onDelete={async () => (await del(item.id)) && setList((x) => x.filter((y) => y.id !== item.id))}>
            <span className="text-[13px]">{item.question}</span>
            <span className="text-[11px] text-muted-foreground">{item.options.length} options</span>
          </Row>
        ))}
        {list.length === 0 && <Empty>Aucune question.</Empty>}
      </div>
      <Divider />
      <div className="grid gap-2">
        <Input placeholder="Question" value={q} onChange={(e) => setQ(e.target.value)} />
        {opts.map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => setCorrect(i)}
              className={cn("h-7 w-7 shrink-0 rounded-full border text-[11px] font-bold", correct === i ? "border-emerald-500 bg-emerald-500/20 text-emerald-400" : "border-border text-muted-foreground")}
              title="Marquer comme correcte"
            >
              ✓
            </button>
            <Input
              placeholder={`Option ${i + 1}`}
              value={o}
              onChange={(e) => setOpts((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))}
            />
          </div>
        ))}
        <button onClick={() => setOpts((o) => [...o, ""])} className="text-left text-[12px] text-gold">+ Ajouter une option</button>
        <Input placeholder="Explication (optionnel)" value={expl} onChange={(e) => setExpl(e.target.value)} />
        <Button onClick={add}><Plus className="h-4 w-4" /> Ajouter la question</Button>
      </div>
    </div>
  );
}

function Row({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-ink-2 px-3 py-2.5">
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      <button onClick={onDelete} className="text-muted-foreground hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-3 text-center text-[12px] text-muted-foreground">{children}</p>;
}
function Divider() {
  return <div className="my-4 h-px bg-border" />;
}
