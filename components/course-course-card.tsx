import Link from "next/link";
import { Brain, Check, Clock, Lock, Star } from "lucide-react";
import { formatHTG, cn } from "@/lib/utils";
import { getDict } from "@/config/i18n";
import type { Course } from "@/types";

export function Stars({ n, size = 13 }: { n: number; size?: number }) {
  return (
    <span className="inline-flex gap-px">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= Math.round(n) ? "fill-gold text-gold" : "text-border"}
        />
      ))}
    </span>
  );
}

export function CourseCard({
  course,
  className,
  fill,
  width,
  owned,
}: {
  course: Course;
  className?: string;
  fill?: boolean;
  width?: number;
  owned?: boolean;
}) {
  const d = getDict();
  const hours = Math.floor(course.durationMin / 60);
  const mins = course.durationMin % 60;

  return (
    <Link
      href={`/courses/${course.id}`}
      className={cn("group block text-left", fill ? "w-full" : "shrink-0", className)}
      style={!fill && width ? { width } : undefined}
    >
      {/* ---------- BANNER ---------- */}
      <div
        className="relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border border-border p-3 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-black/30 group-hover:ring-1 group-hover:ring-gold/40"
        style={{ backgroundImage: `linear-gradient(160deg, ${course.color} 0%, ${course.color}55 45%, #0b0e14 100%)` }}
      >
        {course.flyerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.flyerUrl} alt={course.title} className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_15%,rgba(255,255,255,0.18),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        {/* Top row: price (left) + BIENTÔT (right) — only two, never collide */}
        <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between">
          {owned ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-1.5 py-1 text-[10px] font-extrabold leading-none text-white">
              <Check className="h-2.5 w-2.5" /> Débloqué
            </span>
          ) : course.isFree ? (
            <span className="rounded-md bg-emerald-500 px-1.5 py-1 text-[10px] font-extrabold leading-none text-white">
              {d.courses.free}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-black/65 px-1.5 py-1 text-[10px] font-extrabold leading-none text-white backdrop-blur-sm">
              <Lock className="h-2.5 w-2.5" /> {formatHTG(course.price)}
            </span>
          )}
          {course.upcoming && (
            <span className="rounded-md bg-white/15 px-1.5 py-1 text-[10px] font-extrabold leading-none text-white backdrop-blur-sm">
              {d.courses.soon}
            </span>
          )}
        </div>

        <h3 className="relative font-display text-[15px] font-extrabold leading-tight text-white transition-transform group-hover:-translate-y-0.5">
          {course.title}
        </h3>
      </div>

      {/* ---------- BELOW THE BANNER: tags + meta ---------- */}
      <div className="px-0.5 pt-2.5">
        {/* tag chips row */}
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-card px-2 py-1 text-[10px] font-bold text-muted-foreground">
            {course.tag}
          </span>
          {course.hasLearningTools && (
            <span className="inline-flex items-center gap-1 rounded-md bg-gold/15 px-2 py-1 text-[10px] font-bold text-gold">
              <Brain className="h-2.5 w-2.5" /> Interactif
            </span>
          )}
        </div>
        {/* rating + duration */}
        <div className="flex items-center gap-1.5 text-xs">
          <Stars n={course.rating} size={12} />
          <span className="text-muted-foreground">{course.rating} ({course.reviews})</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" /> {hours}h {mins}m · {d.courses.lessons(course.lessons)}
        </div>
      </div>
    </Link>
  );
}
