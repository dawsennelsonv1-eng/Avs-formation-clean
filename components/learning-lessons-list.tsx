"use client";

import { useMemo, useState } from "react";
import { Check, Circle, Lock, Play } from "lucide-react";
import { useToast } from "@/components/ui-toast";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/lib/learning-lessons";

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
  const { toast } = useToast();

  const progress = useMemo(() => {
    if (state.length === 0) return 0;
    return Math.round((state.filter((l) => l.completed).length / state.length) * 100);
  }, [state]);

  const toggle = async (lesson: Lesson) => {
    if (!unlocked && !lesson.isPreview) {
      toast("Débloque la formation pour accéder à cette leçon.", "info");
      return;
    }
    const next = !lesson.completed;
    setState((s) => s.map((l) => (l.id === lesson.id ? { ...l, completed: next } : l)));
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
      // revert on failure
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
              onClick={() => toggle(lesson)}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3 text-left transition-colors",
                lesson.completed && "border-emerald-500/30"
              )}
            >
              <div
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full",
                  lesson.completed ? "bg-emerald-500/20" : "bg-secondary"
                )}
              >
                {lesson.completed ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : locked ? (
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold leading-tight">
                  {i + 1}. {lesson.title}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{lesson.durationMin} min</span>
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
    </div>
  );
}
