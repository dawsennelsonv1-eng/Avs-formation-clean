import Link from "next/link";
import { Award, BookOpen, Flame, LogIn, Shield } from "lucide-react";
import { Card } from "@/components/ui-card";
import { Button } from "@/components/ui-button";
import { ProfileSettings } from "@/components/profile-profile-settings";
import { getDict } from "@/config/i18n";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin-guard";
import { getLearningStats } from "@/lib/learning-stats";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function ProfilePage() {
  const d = getDict();
  const [user, stats, admin] = await Promise.all([getCurrentUser(), getLearningStats(), isAdmin()]);

  const statCards = [
    { icon: <Flame className="h-[18px] w-[18px] text-gold" />, label: d.profile.stats.streak, value: String(stats.streak) },
    { icon: <BookOpen className="h-[18px] w-[18px] text-sky-400" />, label: d.profile.stats.courses, value: String(stats.coursesCount) },
    { icon: <Award className="h-[18px] w-[18px] text-emerald-400" />, label: d.profile.stats.quizzes, value: String(stats.quizzesPassed) },
  ];

  return (
    <div className="animate-fade-up px-4 pt-4">
      {user ? (
        <div className="mb-5 flex items-center gap-3.5">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-deep font-display text-2xl font-extrabold text-[#1a1208]">
            {initials(user.fullName)}
          </div>
          <div>
            <div className="font-display text-xl font-extrabold">{user.fullName}</div>
            <div className="text-[13px] text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ) : (
        <Card className="mb-5 flex items-center gap-3 p-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/15">
            <LogIn className="h-6 w-6 text-gold" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold">Connecte-toi</div>
            <div className="text-[12px] text-muted-foreground">Sauvegarde ta progression et tes formations.</div>
          </div>
          <Button asChild size="sm">
            <Link href="/auth/login">Connexion</Link>
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        {statCards.map((s) => (
          <Card key={s.label} className="px-2 py-3.5 text-center">
            <div className="mb-1.5 flex justify-center">{s.icon}</div>
            <div className="font-display text-xl font-extrabold">{s.value}</div>
            <div className="text-[11px] text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>

      {admin && (
        <Link
          href="/admin"
          className="mt-5 flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-4"
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold/20">
            <Shield className="h-5 w-5 text-gold" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-gold">Tableau de bord Admin</div>
            <div className="text-[12px] text-muted-foreground">Métriques, formations, paiements…</div>
          </div>
        </Link>
      )}

      <ProfileSettings signedIn={!!user} />
    </div>
  );
}
