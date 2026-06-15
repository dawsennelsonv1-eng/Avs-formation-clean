"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui-toast";
import { Star } from "lucide-react";
import { Button } from "@/components/ui-button";
import { Card } from "@/components/ui-card";
import { Stars } from "@/components/course-course-card";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/learning-content";

export function Reviews({
  courseId,
  initial,
  signedIn,
  userName,
}: {
  courseId: string;
  initial: Review[];
  signedIn: boolean;
  userName: string | null;
}) {
  const [reviews, setReviews] = useState<Review[]>(initial);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [name, setName] = useState(userName ?? "");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { toast } = useToast();

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const submit = async () => {
    if (!rating || !name.trim()) {
      setErr("Ajoute une note et ton nom.");
      return;
    }
    setSending(true);
    setErr(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, rating, body, authorName: name }),
      });
      const data = await res.json();
      if (data.error) {
        setErr(data.error);
        toast(data.error, "error");
      } else {
        setReviews((r) => [
          { id: `local-${Date.now()}`, rating, body, authorName: name, date: "À l'instant" },
          ...r,
        ]);
        toast("Merci pour ton avis !", "success");
        setOpen(false);
        setRating(0);
        setBody("");
        setName("");
      }
    } catch {
      setErr("Erreur réseau.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-2xl font-extrabold text-gold">{avg.toFixed(1)}</span>
          <div>
            <Stars n={avg} />
            <div className="text-[11px] text-muted-foreground">{reviews.length} avis</div>
          </div>
        </div>
        {signedIn ? (
          <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
            {open ? "Annuler" : "Laisser un avis"}
          </Button>
        ) : (
          <Button asChild size="sm" variant="outline">
            <Link href="/auth/login">Connecte-toi pour noter</Link>
          </Button>
        )}
      </div>

      {open && (
        <Card className="mb-3 p-4">
          <div className="mb-3 flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onClick={() => setRating(i)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  className={cn(
                    "h-7 w-7 transition-colors",
                    i <= (hover || rating) ? "fill-gold text-gold" : "text-border"
                  )}
                />
              </button>
            ))}
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ton nom"
            className="mb-2 h-11 w-full rounded-xl border border-border bg-card px-3.5 text-sm outline-none focus:border-gold"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Partage ton expérience…"
            rows={3}
            className="mb-2 w-full resize-none rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-gold"
          />
          {err && <p className="mb-2 text-[12px] text-destructive">{err}</p>}
          <Button className="w-full" onClick={submit} disabled={sending}>
            {sending ? "Envoi…" : "Publier l'avis"}
          </Button>
        </Card>
      )}

      <div className="grid gap-2.5">
        {reviews.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">{r.authorName}</span>
              <span className="text-[11px] text-muted-foreground">{r.date}</span>
            </div>
            <div className="my-1.5">
              <Stars n={r.rating} size={12} />
            </div>
            {r.body && <p className="text-[13px] leading-relaxed text-muted-foreground">{r.body}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
