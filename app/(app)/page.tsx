import Link from "next/link";
import { Clock, Layers, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui-card";
import { SectionTitle, Row } from "@/components/shell-section";
import { CourseCard } from "@/components/course-course-card";
import { BundleCase } from "@/components/course-bundle-case";
import { getAllCourses } from "@/lib/courses";
import { getBundles, getFeaturedBundle } from "@/lib/bundles";
import { getEvents } from "@/lib/events";
import { getDict } from "@/config/i18n";
import { getMyCourseIds } from "@/lib/enrollments";
import { getCurrentUser } from "@/lib/auth";
import { GoogleBanner } from "@/components/home-google-banner";
import { formatHTG } from "@/lib/utils";

export default async function HomePage() {
  const d = getDict();
  const [courses, bundles, events, hero, user, ownedIds] = await Promise.all([
    getAllCourses(),
    getBundles(),
    getEvents(),
    getFeaturedBundle(),
    getCurrentUser(),
    getMyCourseIds(),
  ]);
  const owned = new Set(ownedIds);
  const upcoming = courses.filter((c) => c.upcoming).slice(0, 4);
  // Available now = released courses, ranked by rating then popularity (review count).
  const available = courses
    .filter((c) => !c.upcoming)
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, 10);
  const heroDiscount = hero && hero.was > 0 ? Math.round((1 - hero.price / hero.was) * 100) : 0;

  return (
    <div className="animate-fade-up px-4 pt-4">
      <GoogleBanner signedIn={!!user} />

      {/* Hero — the featured "Offre limitée" bundle (only if one exists) */}
      {hero && (
        <Link
          href={`/bundles/${hero.id}`}
          className="relative block overflow-hidden rounded-3xl border border-border bg-cover bg-center p-6"
          style={{
            backgroundImage: hero.imageUrl
              ? `linear-gradient(to top, rgba(0,0,0,0.92), rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.3)), url(${hero.imageUrl})`
              : `linear-gradient(150deg, ${hero.color} 0%, #2A1854 70%)`,
          }}
        >
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10 blur-sm" />
          <span className="text-[11px] font-bold tracking-wider text-[#E8C9FF]">{d.home.limited}</span>
          <h1 className="mt-2 font-display text-[25px] font-extrabold leading-[1.1] text-white">{hero.title}</h1>
          <p className="mb-4 mt-1.5 text-[13px] text-[#D9C7F2]">
            {hero.count} formations{heroDiscount > 0 ? ` · économise ${heroDiscount}%` : ""}
          </p>
          <div className="mb-4 flex items-baseline gap-2">
            <span className="font-display text-2xl font-extrabold text-gold">{formatHTG(hero.price)}</span>
            {hero.was > 0 && <span className="text-sm text-white/50 line-through">{formatHTG(hero.was)}</span>}
          </div>
          <span className="inline-flex items-center rounded-xl bg-gold px-5 py-3 font-display text-sm font-extrabold text-[#1a1208]">
            {d.home.seeOffer} →
          </span>
        </Link>
      )}

      {/* Offres groupées */}
      {bundles.length > 0 && (
        <>
          <SectionTitle icon={<Layers className="h-[17px] w-[17px] text-gold" />} title={d.home.bundles} />
          <Row>
            {bundles.map((b) => (
              <BundleCase key={b.id} bundle={b} courses={courses} />
            ))}
          </Row>
        </>
      )}

      {/* Formations disponibles (released, ranked by rating + popularity) */}
      {available.length > 0 && (
        <>
          <SectionTitle icon={<TrendingUp className="h-[17px] w-[17px] text-gold" />} title="Formations disponibles" />
          <Row>
            {available.map((c) => (
              <CourseCard key={c.id} course={c} width={160} owned={owned.has(c.id)} />
            ))}
          </Row>
        </>
      )}

      {/* Prochaines formations (upcoming courses) */}
      {upcoming.length > 0 && (
        <>
          <SectionTitle icon={<Sparkles className="h-[17px] w-[17px] text-gold" />} title={d.home.upcoming} />
          <Row>
            {upcoming.map((c) => (
              <CourseCard key={c.id} course={c} width={160} owned={owned.has(c.id)} />
            ))}
          </Row>
        </>
      )}

      {/* Évènements */}
      {events.length > 0 && (
        <>
          <SectionTitle icon={<Clock className="h-[17px] w-[17px] text-gold" />} title={d.home.events} />
          <div className="grid gap-2.5">
            {events.map((e) => (
              <Card key={e.id} className="flex items-center gap-3.5 p-3.5">
                <div className="min-w-[50px] text-center">
                  <div className="font-display text-[13px] font-extrabold text-gold">{e.date.split(" ")[0]}</div>
                  <div className="text-[10px] text-muted-foreground">{e.date.split(" ")[1] ?? ""}</div>
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
        </>
      )}

      {/* Empty state when nothing is configured yet */}
      {!hero && bundles.length === 0 && available.length === 0 && upcoming.length === 0 && events.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-sm font-semibold">Bienvenue sur AVS Formation</p>
          <p className="mx-auto mt-1.5 max-w-xs text-[13px] text-muted-foreground">
            Les formations et offres apparaîtront ici dès qu'elles seront publiées.
          </p>
        </div>
      )}
    </div>
  );
}
