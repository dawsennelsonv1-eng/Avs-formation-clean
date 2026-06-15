import Link from "next/link";
import { Brain, Lock, Star } from "lucide-react";
import { Badge } from "@/components/ui-badge";
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
}: {
  course: Course;
  className?: string;
  fill?: boolean;
  width?: number;
}) {
  const d = getDict();
  return (
    <Link
      href={`/courses/${course.id}`}
      className={cn("group block text-left", fill ? "w-full" : "shrink-0", className)}
      style={!fill && width ? { width } : undefined}
    >
      <div
        className="relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl border border-border p-3"
        style={{
          backgroundImage: `linear-gradient(155deg, ${course.color}, ${course.color}66 60%, #0c0f17)`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.16),transparent_55%)]" />
        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          {course.isFree ? (
            <Badge className="bg-emerald-500 text-white">{d.courses.free}</Badge>
          ) : (
            <Badge className="bg-black/55 text-white">
              <Lock className="h-2.5 w-2.5" /> {formatHTG(course.price)}
            </Badge>
          )}
          {course.upcoming && <Badge className="bg-black/55 text-white">{d.courses.soon}</Badge>}
        </div>
        <span className="absolute right-2.5 top-2.5 rounded-lg bg-black/55 px-1.5 py-1 text-[10px] font-bold text-white">
          {course.tag}
        </span>
        {course.hasLearningTools && (
          <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-lg bg-gold/90 px-1.5 py-1 text-[9px] font-extrabold text-[#1a1208]">
            <Brain className="h-2.5 w-2.5" /> INTERACTIF
          </span>
        )}
        <h3 className="relative font-display text-[15px] font-extrabold leading-tight text-white transition-transform group-hover:-translate-y-0.5">
          {course.title}
        </h3>
      </div>
      <div className="px-0.5 pt-2">
        <div className="flex items-center gap-1.5 text-xs">
          <Stars n={course.rating} size={12} />
          <span className="text-muted-foreground">
            {course.rating} ({course.reviews})
          </span>
        </div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          {Math.floor(course.durationMin / 60)}h {course.durationMin % 60}m · {d.courses.lessons(course.lessons)}
        </div>
      </div>
    </Link>
  );
}
