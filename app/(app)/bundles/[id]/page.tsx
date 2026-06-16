import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Check, Layers } from "lucide-react";
import { getBundleById } from "@/lib/bundles";
import { getAllCourses } from "@/lib/courses";
import { CourseCard } from "@/components/course-course-card";
import { formatHTG } from "@/lib/utils";

export default async function BundlePage({ params }: { params: { id: string } }) {
  const bundle = await getBundleById(params.id);
  if (!bundle) notFound();

  const allCourses = await getAllCourses();
  const courses = allCourses.filter((c) => bundle.courseIds.includes(c.id));
  const discount = bundle.was > 0 ? Math.round((1 - bundle.price / bundle.was) * 100) : 0;
  const totalValue = courses.reduce((sum, c) => sum + c.price, 0);

  return (
    <div className="animate-fade-up pb-6">
      {/* Hero */}
      <div className="relative overflow-hidden px-4 pb-6 pt-4" style={{ backgroundImage: `linear-gradient(160deg, ${bundle.color}45, #0b0e14 70%)` }}>
        <Link href="/" className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-[11px] font-bold tracking-wide text-white backdrop-blur-sm">
          <Layers className="h-3.5 w-3.5" style={{ color: bundle.color }} /> OFFRE GROUPÉE · {bundle.count} FORMATIONS
        </span>
        <h1 className="mt-3 font-display text-[26px] font-extrabold leading-tight">{bundle.title}</h1>
        {bundle.blurb && <p className="mt-1.5 text-[13px] text-white/65">{bundle.blurb}</p>}

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-3.5 backdrop-blur-sm">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-extrabold text-gold">{formatHTG(bundle.price)}</span>
              <span className="text-sm text-white/40 line-through">{formatHTG(bundle.was)}</span>
            </div>
            <div className="mt-0.5 text-[11px] text-emerald-400">Tu économises {formatHTG(totalValue - bundle.price)} ({discount}%)</div>
          </div>
          <button className="rounded-xl bg-gold px-5 py-3 font-display text-sm font-extrabold text-[#1a1208] transition active:scale-95">
            Débloquer tout
          </button>
        </div>
      </div>

      {/* What's inside */}
      <div className="px-4 pt-5">
        <h2 className="mb-1 font-display text-[17px] font-extrabold">Ce que contient ce pack</h2>
        <p className="mb-4 text-[12px] text-muted-foreground">{courses.length} formations incluses</p>
        <div className="grid grid-cols-2 gap-3.5">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} fill />
          ))}
        </div>

        {/* Value breakdown */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 font-display text-[14px] font-bold">Pourquoi ce pack ?</h3>
          <ul className="grid gap-2.5">
            {[
              `Accès à vie aux ${courses.length} formations`,
              `Économise ${formatHTG(totalValue - bundle.price)} vs achat séparé`,
              "Mises à jour futures incluses",
              "Tuteur IA et quiz sur les formations éligibles",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-500/20">
                  <Check className="h-2.5 w-2.5 text-emerald-400" />
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
