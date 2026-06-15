import Link from "next/link";
import { Award, Check, Flame, Play, BookOpen } from "lucide-react";
import { Card } from "@/components/ui-card";
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
  const featured = inProgress[0] ? getCourse(inProgress[0].courseId) : null;
  const featuredEnrollment = inProgress[0];

  return (
    <div className="animate-fade-up px-4 pt-4">
      <h1 className="font-display text-2xl font-extrabold">{d.learning.title}</h1>

      {!user && (
        <Link href="/auth/login" className="mt-3 block rounded-2xl border border-gold/30 bg-gold/10 p-3.5 text-center text-[13px] font-semibold text-gold">
          Connecte-toi pour sauvegarder ta progression →
        </Link>
      )}

      {/* Compact stat strip — was a big banner, now a slim 3-up row */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat icon={<Flame className="h-4 w-4 text-gold" />} value={`${stats.streak}`} label="jours" />
        <MiniStat icon={<BookOpen className="h-4 w-4 text-sky-400" />} value={`${stats.coursesCount}`} label="formations" />
        <MiniStat icon={<Award className="h-4 w-4 text-emerald-400" />} value={`${stats.quizzesPassed}`} label="quiz réussis" />
      </div>

      {/* PROMINENT continue card — the hero of this page */}
      {featured && featuredEnrollment && (
        <Link href={`/courses/${featured.id}`} className="group mt-5 block">
          <div
            className="relative overflow-hidden rounded-3xl border border-border p-5"
            style={{ backgroundImage: `linear-gradient(150deg, ${featured.color} 0%, ${featured.color}40 50%, #0b0e14 100%)` }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(255,255,255,0.15),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/80 to-transparent" />

            <div className="relative">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">{d.learning.continue}</span>
              <h2 className="mt-1 font-display text-[22px] font-extrabold leading-tight text-white">{featured.title}</h2>
              <div className="mt-1 text-[12px] text-white/60">Leçon {featuredEnrollment.lastLesson}/{featured.lessons}</div>

              <div className="mt-4 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-xl transition-transform group-hover:scale-105">
                  <Play className="ml-0.5 h-5 w-5 fill-black text-black" />
                </span>
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-[11px] text-white/70">
                    <span>{d.learning.progress}</span>
                    <span className="font-bold text-gold">{featuredEnrollment.progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-black/40">
                    <div className="h-full rounded-full bg-gold" style={{ width: `${featuredEnrollment.progress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Other in-progress courses (compact) */}
      {inProgress.length > 1 && (
        <>
          <SectionTitle icon={<Play className="h-[17px] w-[17px] text-gold" />} title="Aussi en cours" />
          <div className="grid gap-2.5">
            {inProgress.slice(1).map((e) => {
              const c = getCourse(e.courseId);
              if (!c) return null;
              return (
                <Link key={e.courseId} href={`/courses/${c.id}`}>
                  <Card className="flex items-center gap-3 p-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ backgroundImage: `linear-gradient(155deg, ${c.color}, #0c0f17)` }}>
                      <Play className="h-5 w-5 text-white/90" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-bold">{c.title}</div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-gold" style={{ width: `${e.progress}%` }} />
                      </div>
                    </div>
                    <span className="text-[12px] font-bold text-gold">{e.progress}%</span>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {inProgress.length === 0 && (
        <p className="mt-5 text-sm text-muted-foreground">{d.learning.empty}</p>
      )}

      {/* Certificates */}
      <SectionTitle icon={<Award className="h-[17px] w-[17px] text-gold" />} title={d.learning.certificates} />
      {completed.length === 0 ? (
        <p className="text-sm text-muted-foreground">Termine une formation pour débloquer ton premier certificat.</p>
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
                  <div className="text-[11px] text-emerald-400">Formation terminée</div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                  <Check className="h-3.5 w-3.5" /> Terminé
                </span>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-3">
      {icon}
      <div className="mt-1 font-display text-lg font-extrabold leading-none">{value}</div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
