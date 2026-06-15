import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui-button";
import { adminListCourses } from "@/lib/admin-courses";
import { formatHTG } from "@/lib/utils";

export default async function AdminCoursesPage() {
  const courses = await adminListCourses();
  return (
    <div className="animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-[22px] font-extrabold">Formations</h1>
        <Button asChild size="sm">
          <Link href="/admin/courses/new"><Plus className="h-4 w-4" /> Nouvelle</Link>
        </Button>
      </div>

      <div className="grid gap-2.5">
        {courses.map((c) => (
          <Link
            key={c.id}
            href={`/admin/courses/${c.id}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
          >
            <div
              className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl"
              style={{ backgroundImage: `linear-gradient(155deg, ${c.color}, #0c0f17)` }}
            >
              {c.flyerUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.flyerUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-white/80">{c.tag.slice(0, 3)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-bold">{c.title}</div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{c.tag}</span>
                <span>·</span>
                <span>{c.isFree ? "Gratuit" : formatHTG(c.price)}</span>
                {c.hasLearningTools && <span className="text-gold">· Interactif</span>}
                {c.upcoming && <span>· Bientôt</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
