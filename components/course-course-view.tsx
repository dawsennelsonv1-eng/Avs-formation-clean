"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ChevronLeft, ListVideo, Lock, MessageCircle, Play } from "lucide-react";
import { Button } from "@/components/ui-button";
import { Stars } from "@/components/course-course-card";
import { PaymentFlow } from "@/components/payment-payment-flow";
import { LearningHub } from "@/components/learning-learning-hub";
import { SectionTitle } from "@/components/shell-section";
import { useToast } from "@/components/ui-toast";
import { formatHTG, cn } from "@/lib/utils";
import type { Course } from "@/types";
import type { Flashcard, QuizQuestion } from "@/lib/learning-content";
import type { Lesson } from "@/lib/learning-lessons";

/* Renders a Bunny Stream embed, a YouTube embed, or a direct video — autoplaying. */
function CourseVideo({ url, onEnded, watermark }: { url: string; onEnded?: () => void; watermark?: string }) {
  const isBunny = url.includes("mediadelivery.net") || url.includes("iframe.media");
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);

  if (isBunny) {
    const src = url.includes("?") ? `${url}&autoplay=true&preload=true` : `${url}?autoplay=true&preload=true`;
    return (
      <iframe
        className="absolute inset-0 h-full w-full"
        src={src}
        loading="lazy"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    );
  }
  if (yt) {
    return (
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube.com/embed/${yt[1]}?autoplay=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return (
    <div className="absolute inset-0" onContextMenu={(e) => e.preventDefault()}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        className="h-full w-full"
        src={url}
        controls
        autoPlay
        onEnded={onEnded}
        controlsList="nodownload noremoteplayback noplaybackrate"
        disablePictureInPicture
      />
      {watermark && (
        <div className="pointer-events-none absolute right-2 top-2 rounded bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white/70">
          {watermark}
        </div>
      )}
    </div>
  );
}

export function CourseView({
  course,
  initialAccess,
  cards,
  quiz,
  lessons,
  signedIn,
  userName,
}: {
  course: Course;
  initialAccess: boolean;
  cards: Flashcard[];
  quiz: QuizQuestion[];
  lessons: Lesson[];
  signedIn: boolean;
  userName: string | null;
}) {
  const [unlocked, setUnlocked] = useState(initialAccess || course.isFree);
  const [payOpen, setPayOpen] = useState(false);
  const [lessonList, setLessonList] = useState<Lesson[]>(lessons);
  const [activeIndex, setActiveIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const watermark = userName ? `AVS · ${userName}` : "AVS Formation";

  const playable = lessonList.filter((l) => l.videoUrl);
  const active = lessonList[activeIndex];

  // Auto-start the first video as soon as an owner opens the course.
  useEffect(() => {
    if (unlocked && playable.length > 0) setStarted(true);
  }, [unlocked, playable.length]);

  const openPay = () => {
    if (!signedIn) {
      router.push(`/auth/login?next=/courses/${course.id}`);
      return;
    }
    setPayOpen(true);
  };

  const selectLesson = (i: number) => {
    const l = lessonList[i];
    if (!unlocked && !l.isPreview) {
      toast("Débloque la formation pour accéder à cette leçon.", "info");
      return;
    }
    setActiveIndex(i);
    setStarted(true);
  };

  const nextLesson = () => {
    const next = lessonList.findIndex((l, i) => i > activeIndex && l.videoUrl);
    if (next !== -1) setActiveIndex(next);
  };

  const markComplete = async (lesson: Lesson) => {
    const next = !lesson.completed;
    setLessonList((ls) => ls.map((l) => (l.id === lesson.id ? { ...l, completed: next } : l)));
    try {
      await fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, courseId: course.id, completed: next }),
      });
    } catch {
      /* keep optimistic state */
    }
  };

  const showVideo = unlocked && started && active?.videoUrl;

  return (
    <div className="animate-fade-up pb-6">
      {/* ---------- TOP: video (owner) or poster + paywall ---------- */}
      <div
        className="relative grid aspect-video place-items-center overflow-hidden bg-black"
        style={
          !showVideo
            ? { backgroundImage: `linear-gradient(135deg, ${course.color}, #0c0f17)` }
            : undefined
        }
      >
        {!showVideo && course.flyerUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={course.flyerUrl} alt={course.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/45" />
          </>
        )}

        <Button asChild size="icon" variant="secondary" className="absolute left-3.5 top-3.5 z-20 bg-black/55">
          <Link href="/courses" aria-label="Retour">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>

        {showVideo ? (
          <CourseVideo key={active.id} url={active.videoUrl!} onEnded={nextLesson} watermark={watermark} />
        ) : unlocked ? (
          // Owner but no video yet
          playable.length === 0 ? (
            <p className="relative z-10 px-6 text-center text-[13px] text-white/80">
              Les vidéos de cette formation seront bientôt disponibles.
            </p>
          ) : (
            <button onClick={() => setStarted(true)} className="relative z-10 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white shadow-2xl active:scale-95">
                <Play className="ml-0.5 h-6 w-6 fill-black text-black" />
              </div>
              <p className="mt-3 text-xs font-semibold text-white">Lire la formation</p>
            </button>
          )
        ) : (
          <button onClick={openPay} className="relative z-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-gold bg-black/50 active:scale-95">
              <Lock className="h-6 w-6 text-gold" />
            </div>
            <p className="mt-3 text-[13px] font-bold text-white">Débloquer pour {formatHTG(course.price)}</p>
          </button>
        )}
      </div>

      {/* Now-playing title + mark complete */}
      {showVideo && active && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold">{active.title}</div>
            <div className="text-[11px] text-muted-foreground">Leçon {activeIndex + 1} / {lessonList.length}</div>
          </div>
          <button
            onClick={() => markComplete(active)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-bold",
              active.completed ? "bg-emerald-500/15 text-emerald-400" : "bg-gold text-[#1a1208]"
            )}
          >
            <Check className="h-3.5 w-3.5" /> {active.completed ? "Terminé" : "Marquer terminé"}
          </button>
        </div>
      )}

      <div className="px-4 pt-4">
        <span className="text-[11px] font-bold text-gold">{course.tag.toUpperCase()}</span>
        <h1 className="mb-2.5 mt-1.5 font-display text-[23px] font-extrabold leading-tight">{course.title}</h1>
        <div className="mb-3.5 flex items-center gap-2 text-[13px] text-muted-foreground">
          {course.reviews > 0 && (
            <>
              <span className="flex items-center gap-1.5"><Stars n={course.rating} /> {course.rating}</span>
              <span>·</span>
            </>
          )}
          <span>{Math.floor(course.durationMin / 60)}h {course.durationMin % 60}m</span>
          <span>·</span>
          <span>{lessonList.length} leçons</span>
        </div>
        <p className="text-sm leading-relaxed opacity-90">{course.summary}</p>

        {/* ---------- PLAYLIST ---------- */}
        {lessonList.length > 0 && (
          <div className="mt-7">
            <SectionTitle icon={<ListVideo className="h-[17px] w-[17px] text-gold" />} title="Contenu de la formation" className="mt-0" />
            <div className="grid gap-1.5">
              {lessonList.map((l, i) => {
                const locked = !unlocked && !l.isPreview;
                const isActive = i === activeIndex && showVideo;
                return (
                  <button
                    key={l.id}
                    onClick={() => selectLesson(i)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
                      isActive ? "border-gold bg-gold/10" : "border-border bg-card"
                    )}
                  >
                    <div className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full", l.completed ? "bg-emerald-500/20" : "bg-secondary")}>
                      {l.completed ? <Check className="h-4 w-4 text-emerald-400" /> : locked ? <Lock className="h-3.5 w-3.5 text-muted-foreground" /> : <Play className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold">{i + 1}. {l.title}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{l.durationMin} min</span>
                        {l.isPreview && !unlocked && <span className="rounded bg-gold/15 px-1.5 py-0.5 font-semibold text-gold">Aperçu gratuit</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!unlocked && (
          <Button className="mt-5 w-full" size="lg" onClick={openPay}>
            <Lock className="h-4 w-4" /> Débloquer pour {formatHTG(course.price)}
          </Button>
        )}

        {/* ---------- AI TUTOR (helps understand the videos) ---------- */}
        {course.hasLearningTools && (
          <div className="mt-8">
            <SectionTitle icon={<MessageCircle className="h-[17px] w-[17px] text-gold" />} title="Tuteur IA & révisions" className="mt-0" />
            <LearningHub course={course} cards={cards} quiz={quiz} signedIn={signedIn} />
          </div>
        )}
      </div>

      <PaymentFlow
        course={course}
        defaultName={userName ?? ""}
        open={payOpen}
        onOpenChange={setPayOpen}
        onGranted={() => {
          setUnlocked(true);
          setPayOpen(false);
        }}
      />
    </div>
  );
}
