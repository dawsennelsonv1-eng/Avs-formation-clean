"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronLeft, ChevronRight, Circle, FileText, Lock, Play, X } from "lucide-react";
import { useToast } from "@/components/ui-toast";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/lib/learning-lessons";

function VideoEmbed({ url }: { url: string }) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (yt) {
    return (
      <iframe
        className="aspect-video w-full rounded-xl"
        src={`https://www.youtube.com/embed/${yt[1]}`}
        title="video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  if (vimeo) {
    return (
      <iframe
        className="aspect-video w-full rounded-xl"
        src={`https://player.vimeo.com/video/${vimeo[1]}`}
        title="video"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }
  // eslint-disable-next-line jsx-a11y/media-has-caption
  return <video className="aspect-video w-full rounded-xl" src={url} controls />;
}

export function LessonsList({
  lessons,
  courseId,
  unlocked,
}: {
  lessons: Lesson[];
  courseId: string;
  unlocked: boolean;
}) {
  const [state, setState] = useState<Lesson[]>(lessons);
  const [open, setOpen] = useState<Lesson | null>(null);
  const [slide, setSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const progress = useMemo(() => {
    if (state.length === 0) return 0;
    return Math.round((state.filter((l) => l.completed).length / state.length) * 100);
  }, [state]);

  const openLesson = (lesson: Lesson) => {
    if (!unlocked && !lesson.isPreview) {
      toast("Débloque la formation pour accéder à cette leçon.", "info");
      return;
    }
    setSlide(0);
    setOpen(lesson);
  };

  const setCompleted = async (lesson: Lesson, next: boolean) => {
    setState((s) => s.map((l) => (l.id === lesson.id ? { ...l, completed: next } : l)));
    setOpen((o) => (o && o.id === lesson.id ? { ...o, completed: next } : o));
    try {
      const res = await fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, courseId, completed: next }),
      });
      const data = await res.json();
      if (data.persisted && next) toast("Leçon terminée ✓", "success");
      if (!data.persisted) toast("Connecte-toi pour sauvegarder ta progression.", "info");
    } catch {
      setState((s) => s.map((l) => (l.id === lesson.id ? { ...l, completed: !next } : l)));
      toast("Erreur réseau.", "error");
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-[12px] text-muted-foreground">
        <span>{state.length} leçons</span>
        <span className="font-semibold text-gold">{progress}% terminé</span>
      </div>
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="grid gap-1.5">
        {state.map((lesson, i) => {
          const locked = !unlocked && !lesson.isPreview;
          return (
            <button
              key={lesson.id}
              onClick={() => openLesson(lesson)}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3 text-left transition-colors",
                lesson.completed && "border-emerald-500/30"
              )}
            >
              <div className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full", lesson.completed ? "bg-emerald-500/20" : "bg-secondary")}>
                {lesson.completed ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : locked ? (
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold leading-tight">{i + 1}. {lesson.title}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{lesson.durationMin} min</span>
                  {lesson.videoUrl && <Play className="h-3 w-3 text-gold" />}
                  {lesson.imageUrls.length > 0 && <FileText className="h-3 w-3 text-gold" />}
                  {lesson.isPreview && !unlocked && (
                    <span className="rounded bg-gold/15 px-1.5 py-0.5 font-semibold text-gold">Aperçu gratuit</span>
                  )}
                </div>
              </div>
              {!locked && <Play className="h-4 w-4 text-muted-foreground" />}
            </button>
          );
        })}
      </div>

      {open && mounted &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex h-full max-h-[100dvh] w-full max-w-[480px] flex-col bg-background">
              <header className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="min-w-0 flex-1 pr-2">
                  <div className="truncate text-[14px] font-bold">{open.title}</div>
                  <div className="text-[11px] text-muted-foreground">{open.durationMin} min</div>
                </div>
                <button onClick={() => setOpen(null)} aria-label="Fermer" className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground">
                  <X className="h-[18px] w-[18px]" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                {open.videoUrl && (
                  <div className="mb-4">
                    <VideoEmbed url={open.videoUrl} />
                  </div>
                )}

                {open.imageUrls.length > 0 && (
                  <div className="mb-4">
                    <div className="relative overflow-hidden rounded-xl border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={open.imageUrls[slide]} alt={`diapositive ${slide + 1}`} className="w-full" />
                      {open.imageUrls.length > 1 && (
                        <>
                          <button
                            onClick={() => setSlide((s) => (s - 1 + open.imageUrls.length) % open.imageUrls.length)}
                            className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setSlide((s) => (s + 1) % open.imageUrls.length)}
                            className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
                            {slide + 1} / {open.imageUrls.length}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {open.content && (
                  <div className="mb-4 whitespace-pre-wrap rounded-xl border border-border bg-card p-3.5 text-[13px] leading-relaxed text-muted-foreground">
                    {open.content}
                  </div>
                )}

                {!open.videoUrl && open.imageUrls.length === 0 && !open.content && (
                  <p className="py-10 text-center text-[13px] text-muted-foreground">
                    Le contenu de cette leçon sera bientôt disponible.
                  </p>
                )}
              </div>

              <div className="border-t border-border px-4 py-3">
                <button
                  onClick={() => setCompleted(open, !open.completed)}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors",
                    open.completed ? "bg-emerald-500/15 text-emerald-400" : "bg-gold text-[#1a1208]"
                  )}
                >
                  <Check className="h-4 w-4" />
                  {open.completed ? "Terminée — marquer non terminée" : "Marquer comme terminée"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
