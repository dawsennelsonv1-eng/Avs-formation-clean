import Link from "next/link";
import { Clock, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui-button";
import { Card } from "@/components/ui-card";
import { SectionTitle, Row } from "@/components/shell-section";
import { CourseCard } from "@/components/course-course-card";
import { BundleCase } from "@/components/course-bundle-case";
import { BUNDLES, EVENTS } from "@/lib/data";
import { getAllCourses } from "@/lib/courses";
import { getDict } from "@/config/i18n";
import { getCurrentUser } from "@/lib/auth";
import { GoogleBanner } from "@/components/home-google-banner";

export default async function HomePage() {
  const d = getDict();
  const courses = await getAllCourses();
  const user = await getCurrentUser();
  const upcoming = courses.filter((c) => c.upcoming).slice(0, 4);
  const heroBundle = BUNDLES[0];

  return (
    <div className="animate-fade-up px-4 pt-4">
      <GoogleBanner signedIn={!!user} />
      {/* Hero — kept as-is, now links to the bundle */}
      <Link href={`/bundles/${heroBundle.id}`} className="relative block overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#2A1854] to-[#7B3FF2] p-6">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10 blur-sm" />
        <span className="text-[11px] font-bold tracking-wider text-[#E8C9FF]">{d.home.limited}</span>
        <h1 className="mt-2 font-display text-[25px] font-extrabold leading-[1.1]">Pack Entrepreneur Complet</h1>
        <p className="mb-4 mt-1.5 text-[13px] text-[#D9C7F2]">4 formations · économise 32%</p>
        <span className="inline-flex items-center rounded-xl bg-gold px-5 py-3 font-display text-sm font-extrabold text-[#1a1208]">
          {d.home.seeOffer} →
        </span>
      </Link>

      {/* Bundles — new DVD-case UI */}
      <SectionTitle icon={<Layers className="h-[17px] w-[17px] text-gold" />} title={d.home.bundles} />
      <Row>
        {BUNDLES.map((b) => (
          <BundleCase key={b.id} bundle={b} courses={courses} />
        ))}
      </Row>

      {/* Upcoming */}
      <SectionTitle icon={<Sparkles className="h-[17px] w-[17px] text-gold" />} title={d.home.upcoming} />
      <Row>
        {upcoming.map((c) => (
          <CourseCard key={c.id} course={c} width={160} />
        ))}
      </Row>

      {/* Events */}
      <SectionTitle icon={<Clock className="h-[17px] w-[17px] text-gold" />} title={d.home.events} />
      <div className="grid gap-2.5">
        {EVENTS.map((e) => (
          <Card key={e.id} className="flex items-center gap-3.5 p-3.5">
            <div className="min-w-[50px] text-center">
              <div className="font-display text-[13px] font-extrabold text-gold">{e.date.split(" ")[0]}</div>
              <div className="text-[10px] text-muted-foreground">{e.date.split(" ")[1]}</div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold">{e.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{e.time}</div>
            </div>
            {e.live && (
              <span className="rounded-full border border-destructive/40 px-2 py-1 text-[10px] font-extrabold text-destructive">
                ● {d.home.live}
              </span>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
