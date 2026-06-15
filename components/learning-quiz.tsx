"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Check, RotateCw, X } from "lucide-react";
import { Button } from "@/components/ui-button";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/learning-content";

export function Quiz({ questions, courseId }: { questions: QuizQuestion[]; courseId: string }) {
  const [idx, setIdx] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[idx];
  const progress = Math.round((idx / questions.length) * 100);

  const choose = (i: number) => {
    if (pick !== null) return;
    setPick(i);
    if (i === q.correctIndex) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx((n) => n + 1);
      setPick(null);
    } else {
      setFinished(true);
      fetch("/api/learning/quiz-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, score, total: questions.length }),
      }).catch(() => {});
    }
  };

  const restart = () => {
    setIdx(0); setPick(null); setScore(0); setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const great = pct >= 70;
    return (
      <div className="py-6 text-center">
        <div
          className={cn(
            "mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full",
            great ? "bg-emerald-500/15" : "bg-gold/15"
          )}
        >
          <Award className={cn("h-8 w-8", great ? "text-emerald-400" : "text-gold")} />
        </div>
        <h3 className="font-display text-xl font-extrabold">
          {score}/{questions.length} · {pct}%
        </h3>
        <p className="mx-auto mt-1.5 max-w-[260px] text-[13px] text-muted-foreground">
          {great ? "Excellent ! Tu maîtrises le sujet." : "Pas mal — revois les points manqués et réessaie."}
        </p>
        <Button variant="secondary" className="mt-5" onClick={restart}>
          <RotateCw className="h-4 w-4" /> Refaire le quiz
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <div className="mb-1.5 flex justify-between text-[11px] text-muted-foreground">
          <span>
            Question {idx + 1}/{questions.length}
          </span>
          <span>{score} bonne(s)</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div className="h-full rounded-full bg-gold" animate={{ width: `${progress}%` }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          <p className="mb-3.5 text-[15px] font-bold leading-snug">{q.question}</p>
          <div className="grid gap-2">
            {q.options.map((opt, i) => {
              const isRight = pick !== null && i === q.correctIndex;
              const isWrong = pick === i && i !== q.correctIndex;
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={pick !== null}
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-3.5 py-3 text-left text-[13px] transition-colors",
                    isRight
                      ? "border-emerald-500 bg-emerald-500/15"
                      : isWrong
                      ? "border-destructive bg-destructive/15"
                      : "border-border bg-card",
                    pick === null && "hover:border-gold/50"
                  )}
                >
                  <span>{opt}</span>
                  {isRight && <Check className="h-4 w-4 text-emerald-400" />}
                  {isWrong && <X className="h-4 w-4 text-destructive" />}
                </button>
              );
            })}
          </div>

          {pick !== null && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
              {q.explanation && (
                <p
                  className={cn(
                    "rounded-xl border p-3 text-[12px] leading-relaxed",
                    pick === q.correctIndex
                      ? "border-emerald-500/30 text-emerald-300"
                      : "border-destructive/30 text-muted-foreground"
                  )}
                >
                  {pick === q.correctIndex ? "✓ " : "✗ "}
                  {q.explanation}
                </p>
              )}
              <Button className="mt-3 w-full" onClick={next}>
                {idx + 1 < questions.length ? "Question suivante →" : "Voir le résultat"}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
