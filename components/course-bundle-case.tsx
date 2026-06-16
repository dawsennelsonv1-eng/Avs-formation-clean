"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { formatHTG } from "@/lib/utils";
import type { Bundle, Course } from "@/types";

/**
 * "Boxed set" bundle card with a coverflow-style shelf.
 *
 * The member courses are shown like cases on a shelf. The active case is
 * centered and brought forward; neighbours recede symmetrically and anything
 * 3+ away fades out, so it stays inside the card bounds with no harsh tilt.
 * The active index AUTO-CYCLES (~2.4s) so every banner is briefly featured —
 * this works on touch where there's no hover.
 */
export function BundleCase({ bundle, courses }: { bundle: Bundle; courses: Course[] }) {
  const members = courses.filter((c) => bundle.courseIds.includes(c.id)).slice(0, 6);
  const discount = Math.round((1 - bundle.price / bundle.was) * 100);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (members.length <= 1) return;
    const t = setInterval(() => setActive((i) => (i + 1) % members.length), 2400);
    return () => clearInterval(t);
  }, [members.length]);

  return (
    <Link
      href={`/bundles/${bundle.id}`}
      className="group relative block w-[290px] shrink-0 overflow-hidden rounded-3xl border border-border bg-cover bg-center p-4 transition-colors hover:border-gold/40"
      style={{
        backgroundImage: bundle.imageUrl
          ? `linear-gradient(150deg, rgba(11,14,20,0.55), rgba(11,14,20,0.88)), url(${bundle.imageUrl})`
          : `linear-gradient(150deg, ${bundle.color}38 0%, #0b0e14 60%)`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-2xl"
        style={{ background: `${bundle.color}40` }}
      />

      <div className="relative mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white backdrop-blur-sm">
          <Layers className="h-3 w-3" style={{ color: bundle.color }} /> {bundle.count} FORMATIONS
        </span>
        <span className="rounded-full bg-gold px-2.5 py-1 text-[10px] font-extrabold text-[#1a1208]">
          -{discount}%
        </span>
      </div>

      {/* Coverflow shelf */}
      <div className="relative mb-4 flex h-[168px] items-center justify-center [perspective:800px]">
        {members.map((c, i) => {
          const offset = i - active;
          const absO = Math.abs(offset);
          const hidden = absO >= 3;
          const translateX = offset * 46;
          const scale = Math.max(0.74, 1 - absO * 0.12);
          const rotateY = offset * -18; // subtle 3D turn toward center
          const isActive = offset === 0;
          return (
            <div
              key={c.id}
              className="absolute h-[150px] w-[100px] overflow-hidden rounded-xl border border-white/10 shadow-2xl transition-all duration-500 ease-out"
              style={{
                backgroundImage: `linear-gradient(160deg, ${c.color} 0%, ${c.color}45 55%, #0b0e14 100%)`,
                transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                zIndex: 50 - absO,
                opacity: hidden ? 0 : isActive ? 1 : 0.78,
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(255,255,255,0.22),transparent_55%)]" />
              {c.flyerUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.flyerUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              )}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 to-transparent" />
              <div className="absolute inset-0 flex items-end p-2.5">
                <span className="line-clamp-3 text-[10px] font-bold leading-tight text-white">{c.title}</span>
              </div>
              {/* spine highlight */}
              <div className="absolute left-0 top-0 h-full w-[3px] bg-white/15" />
              {isActive && <div className="absolute inset-0 rounded-xl ring-1 ring-gold/60" />}
            </div>
          );
        })}
      </div>

      {/* progress dots */}
      <div className="relative mb-3 flex justify-center gap-1.5">
        {members.map((_, i) => (
          <span
            key={i}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i === active ? 16 : 6,
              background: i === active ? "#E8B84B" : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>

      <div className="relative">
        <h3 className="font-display text-[17px] font-extrabold leading-tight text-white">{bundle.title}</h3>
        {bundle.blurb && <p className="mt-1 line-clamp-1 text-[11px] text-white/55">{bundle.blurb}</p>}
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl font-extrabold text-gold">{formatHTG(bundle.price)}</span>
            <span className="text-xs text-white/40 line-through">{formatHTG(bundle.was)}</span>
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gold text-[#1a1208] transition-transform group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
