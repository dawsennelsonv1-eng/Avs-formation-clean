"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CourseCard } from "@/components/course-course-card";
import { getDict } from "@/config/i18n";
import { cn } from "@/lib/utils";
import type { Course } from "@/types";

export function Catalogue({ courses, ownedIds = [] }: { courses: Course[]; ownedIds?: string[] }) {
  const owned = new Set(ownedIds);
  const d = getDict();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>(d.courses.filters[0]);

  const list = useMemo(
    () =>
      courses.filter((c) => {
        const matchFilter =
          filter === d.courses.filters[0] ||
          (filter === d.courses.filters[1] ? c.isFree : c.tag === filter);
        const matchQuery = c.title.toLowerCase().includes(query.toLowerCase());
        return matchFilter && matchQuery;
      }),
    [query, filter, courses, d.courses.filters]
  );

  return (
    <div className="animate-fade-up px-4 pt-4">
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-3.5 h-[17px] w-[17px] text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={d.courses.search}
          className="h-12 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-sm outline-none transition-colors focus:border-gold"
        />
      </div>

      <div className="no-scrollbar -mx-4 mb-1 flex gap-2 overflow-x-auto px-4 pb-3.5">
        {d.courses.filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors",
              filter === f
                ? "border-gold bg-gold text-[#1a1208]"
                : "border-border bg-card text-foreground hover:bg-accent"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {list.map((c) => (
          <CourseCard key={c.id} course={c} fill owned={owned.has(c.id)} />
        ))}
      </div>
      {list.length === 0 && <p className="mt-10 text-center text-muted-foreground">{d.courses.none}</p>}
    </div>
  );
}
