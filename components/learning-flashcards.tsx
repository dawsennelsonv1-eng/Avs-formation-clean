"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, Check, RotateCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui-button";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@/lib/learning-content";

type Grade = 0 | 1 | 2 | 3;
const GRADES: { g: Grade; label: string; color: string }[] = [
  { g: 0, label: "À revoir", color: "#E5484D" },
  { g: 1, label: "Difficile", color: "#E8B84B" },
  { g: 2, label: "Bien", color: "#4C8DFF" },
  { g: 3, label: "Facile", color: "#3BB273" },
];

export function Flashcards({ cards }: { cards: Flashcard[] }) {
  // Queue holds card ids; weak cards get pushed back into it.
  const [queue, setQueue] = useState<string[]>(() => cards.map((c) => c.id));
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<Set<string>>(new Set());
  const byId = useMemo(() => Object.fromEntries(cards.map((c) => [c.id, c])), [cards]);

  const currentId = queue[0];
  const current = currentId ? byId[currentId] : null;
  const done = !current;

  const grade = async (g: Grade) => {
    if (!currentId) return;

    // Persist SR memory (best-effort; works anonymously too).
    fetch("/api/learning/card-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: currentId, grade: g }),
    }).catch(() => {});

    setFlipped(false);
    setQueue((q) => {
      const [, ...rest] = q;
      if (g === 0) return [...rest, currentId]; // "again" -> back of queue
      if (g === 1) return [...rest.slice(0, 2), currentId, ...rest.slice(2)]; // hard -> a few cards later
      // good / easy -> mastered for this session
      setMastered((m) => new Set(m).add(currentId));
      return rest;
    });
  };

  const restart = () => {
    setQueue(cards.map((c) => c.id));
    setMastered(new Set());
    setFlipped(false);
  };

  if (done) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15">
          <Check className="h-7 w-7 text-emerald-400" />
        </div>
        <h3 className="font-display text-lg font-extrabold">Série terminée !</h3>
        <p className="mx-auto mt-1.5 max-w-[260px] text-[13px] text-muted-foreground">
          {mastered.size}/{cards.length} cartes mémorisées. Les cartes difficiles reviendront automatiquement.
        </p>
        <Button variant="secondary" className="mt-5" onClick={restart}>
          <RotateCw className="h-4 w-4" /> Recommencer
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-[12px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5 text-gold" /> Mémorisation espacée
        </span>
        <span>
          {mastered.size}/{cards.length} mémorisées · {queue.length} en file
        </span>
      </div>

      <div className="[perspective:1200px]">
        <AnimatePresence mode="wait">
          <motion.button
            key={currentId + String(flipped)}
            onClick={() => setFlipped((f) => !f)}
            initial={{ opacity: 0, y: 16, rotateY: flipped ? -90 : 90 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) grade(0); // swipe left = à revoir
              else if (info.offset.x > 80) grade(2); // swipe right = bien
            }}
            className={cn(
              "grid min-h-[170px] w-full place-items-center rounded-2xl border p-6 text-center [transform-style:preserve-3d]",
              flipped ? "border-gold/50 bg-ink-3" : "border-border bg-card"
            )}
          >
            <div>
              <div className="mb-2.5 text-[10px] font-bold tracking-wide text-gold">
                {flipped ? "RÉPONSE" : "QUESTION"}
              </div>
              <div className="text-[15px] font-medium leading-relaxed">
                {flipped ? current!.back : current!.front}
              </div>
              {!flipped && (
                <div className="mt-3 text-[11px] text-muted-foreground">Tape pour retourner · glisse pour noter</div>
              )}
            </div>
          </motion.button>
        </AnimatePresence>
      </div>

      {/* Grading appears once flipped */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 grid grid-cols-4 gap-2"
          >
            {GRADES.map(({ g, label, color }) => (
              <button
                key={g}
                onClick={() => grade(g)}
                className="rounded-xl border border-border bg-card py-2.5 text-[11px] font-bold transition-transform active:scale-95"
                style={{ color }}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-muted-foreground">
        <Sparkles className="h-3 w-3" /> Tes réponses ajustent quand chaque carte revient
      </p>
    </div>
  );
}
