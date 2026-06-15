import Link from "next/link";
import { Award, Flame, PlayCircle } from "lucide-react";
import { Card } from "@/components/ui-card";
import { Button } from "@/components/ui-button";
import { SectionTitle } from "@/components/shell-section";
import { ENROLLMENTS, getCourse } from "@/lib/data";
import { getLearningStats } from "@/lib/learning-stats";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/config/i18n";

export default async function LearningPage() {
  const d = getDict();
  const stats = await getLearningStats();
  const user = await getCurrentUser();
  const inProgress = ENROLLMENTS.filter((e) => !e.completed);
  const completed = ENROLLMENTS.filter((e) => e.completed);

  return (
    <div className="animate-fade-up px-4 pt-4">
      <h1 className="font-display text-2xl font-extrabold">{d.learning.title}</h1>
      {!user && (
        <Link href="/auth/login" className="mt-3 block rounded-2xl border border-gold/30 bg-gold/10 p-3.5 text-center text-[13px] font-semibold text-gold">
          Connecte-toi pour sauvegarder ta progression →
        </Link>
      )}

      {/* Streak banner */}
      <Card className="mt-4 flex items-center gap-3 bg-gradient-to-br from-ink-3 to-card p-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/15">
          <Flame className="h-6 w-6 text-gold" />
        </div>
        <div className="flex-1">
          <div className="text-sm text-muted-foreground">{d.learning.streak}</div>
          <div className="font-display text-xl font-extrabold">{stats.streak} jours 🔥</div>
        </div>
        <Award className="h-7 w-7 text-emerald-400" />
      </Card>

      {/* Continue */}
      <SectionTitle icon={<PlayCircle className="h-[17px] w-[17px] text-gold" />} title={d.learning.continue} />
      {inProgress.length === 0 ? (
        <p className="text-sm text-muted-foreground">{d.learning.empty}</p>
      ) : (
        <div className="grid gap-3">
          {inProgress.map((e) => {
            const c = getCourse(e.courseId);
            if (!c) return null;
            return (
              <Card key={e.courseId} className="overflow-hidden">
                <div className="flex gap-3 p-3">
                  <div
                    className="grid h-20 w-16 shrink-0 place-items-center rounded-xl"
                    style={{ backgroundImage: `linear-gradient(155deg, ${c.color}, #0c0f17)` }}
                  >
                    <PlayCircle className="h-7 w-7 text-white/90" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between py-0.5">
                    <div>
                      <div className="text-sm font-bold leading-tight">{c.title}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        Leçon {e.lastLesson}/{c.lessons}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                        <span>{d.learning.progress}</span>
                        <span className="font-semibold text-gold">{e.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-gold" style={{ width: `${e.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <Button asChild variant="secondary" className="w-full rounded-none rounded-b-2xl border-t border-border">
                  <Link href={`/courses/${c.id}`}>{d.learning.continue} →</Link>
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Certificates */}
      <SectionTitle icon={<Award className="h-[17px] w-[17px] text-gold" />} title={d.learning.certificates} />
      {completed.length === 0 ? (
        <p className="text-sm text-muted-foreground">—</p>
      ) : (
        <div className="grid gap-3">
          {completed.map((e) => {
            const c = getCourse(e.courseId);
            if (!c) return null;
            return (
              <Card key={e.courseId} className="flex items-center gap-3 border-emerald-500/30 p-3.5">
                <Award className="h-8 w-8 text-emerald-400" />
                <div className="flex-1">
                  <div className="text-sm font-bold">{c.title}</div>
                  <div className="text-[11px] text-emerald-400">Terminé · Certificat disponible</div>
                </div>
                <Button size="sm" variant="outline">Voir</Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
