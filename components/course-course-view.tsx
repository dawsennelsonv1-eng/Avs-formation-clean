"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ListVideo, Lock, MessageCircle, Play } from "lucide-react";
import { Button } from "@/components/ui-button";
import { Stars } from "@/components/course-course-card";
import { PaymentFlow } from "@/components/payment-payment-flow";
import { LearningHub } from "@/components/learning-learning-hub";
import { LessonsList } from "@/components/learning-lessons-list";
import { Reviews } from "@/components/learning-reviews";
import { SectionTitle } from "@/components/shell-section";
import { formatHTG } from "@/lib/utils";
import type { Course } from "@/types";
import type { Flashcard, QuizQuestion, Review } from "@/lib/learning-content";
import type { Lesson } from "@/lib/learning-lessons";

export function CourseView({
  course,
  initialAccess,
  cards,
  quiz,
  reviews,
  lessons,
  signedIn,
  userName,
}: {
  course: Course;
  initialAccess: boolean;
  cards: Flashcard[];
  quiz: QuizQuestion[];
  reviews: Review[];
  lessons: Lesson[];
  signedIn: boolean;
  userName: string | null;
}) {
  const [unlocked, setUnlocked] = useState(initialAccess || course.isFree);
  const [payOpen, setPayOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const router = useRouter();

  const openPay = () => {
    if (!signedIn) {
      router.push(`/auth/login?next=/courses/${course.id}`);
      return;
    }
    setPayOpen(true);
  };

  return (
    <div className="animate-fade-up pb-6">
      {/* Player / paywall */}
      <div
        className="relative grid aspect-video place-items-center overflow-hidden"
        style={{ backgroundImage: `linear-gradient(135deg, ${course.color}, #0c0f17)` }}
      >
        <Button asChild size="icon" variant="secondary" className="absolute left-3.5 top-3.5 z-10 bg-black/55">
          <Link href="/courses" aria-label="Retour">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>

        {unlocked ? (
          playing ? (
            <video className="h-full w-full" controls autoPlay poster="">
              {/* In production, stream course.videoUrl (signed Supabase Storage URL). */}
              <source src="/demo.mp4" type="video/mp4" />
            </video>
          ) : (
            <button onClick={() => setPlaying(true)} className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white shadow-2xl transition-transform active:scale-95">
                <Play className="ml-0.5 h-6 w-6 fill-black text-black" />
              </div>
              <p className="mt-3 text-xs font-semibold text-white">Lire la formation</p>
            </button>
          )
        ) : (
          <button onClick={openPay} className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-gold bg-black/50 transition-transform active:scale-95">
              <Lock className="h-6 w-6 text-gold" />
            </div>
            <p className="mt-3 text-[13px] font-bold text-white">Débloquer pour {formatHTG(course.price)}</p>
          </button>
        )}
      </div>

      <div className="px-4 pt-4">
        <span className="text-[11px] font-bold text-gold">{course.tag.toUpperCase()}</span>
        <h1 className="mb-2.5 mt-1.5 font-display text-[23px] font-extrabold leading-tight">{course.title}</h1>
        <div className="mb-3.5 flex items-center gap-2 text-[13px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Stars n={course.rating} /> {course.rating}
          </span>
          <span>·</span>
          <span>
            {Math.floor(course.durationMin / 60)}h {course.durationMin % 60}m
          </span>
          <span>·</span>
          <span>{course.lessons} leçons</span>
        </div>
        <p className="text-sm leading-relaxed opacity-90">{course.summary}</p>

        {/* Lessons */}
        {lessons.length > 0 && (
          <div className="mt-7">
            <SectionTitle
              icon={<ListVideo className="h-[17px] w-[17px] text-gold" />}
              title="Contenu de la formation"
              className="mt-0"
            />
            <LessonsList lessons={lessons} courseId={course.id} unlocked={unlocked} />
          </div>
        )}

        {!unlocked && (
          <Button className="mt-5 w-full" size="lg" onClick={openPay}>
            <Lock className="h-4 w-4" /> Débloquer pour {formatHTG(course.price)}
          </Button>
        )}

        {/* Learning tools — only when this course has them enabled */}
        {course.hasLearningTools && (
          <div className="mt-7">
            <SectionTitle
              icon={<MessageCircle className="h-[17px] w-[17px] text-gold" />}
              title="Apprends & mémorise"
              className="mt-0"
            />
            <LearningHub course={course} cards={cards} quiz={quiz} signedIn={signedIn} />
          </div>
        )}

        {/* Reviews — always shown */}
        <div className="mt-8">
          <SectionTitle
            icon={<MessageCircle className="h-[17px] w-[17px] text-gold" />}
            title="Avis"
            className="mt-0"
          />
          <Reviews courseId={course.id} initial={reviews} signedIn={signedIn} userName={userName} />
        </div>
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
