import { notFound } from "next/navigation";
import { adminGetCourse } from "@/lib/admin-courses";
import { getLessons } from "@/lib/learning-lessons";
import { getFlashcards, getQuiz } from "@/lib/learning-content";
import { CourseForm } from "@/components/admin-course-form";
import { CourseContentManager } from "@/components/admin-course-content-manager";

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const course = await adminGetCourse(params.id);
  if (!course) notFound();

  const [lessons, cards, quiz] = await Promise.all([
    getLessons(course.id),
    getFlashcards(course.id),
    getQuiz(course.id),
  ]);

  return (
    <div className="animate-fade-up">
      <h1 className="mb-4 font-display text-[22px] font-extrabold">Modifier la formation</h1>
      <CourseForm course={course} />
      {course.hasLearningTools ? (
        <CourseContentManager courseId={course.id} lessons={lessons} cards={cards} quiz={quiz} />
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-border p-4 text-center text-[12px] text-muted-foreground">
          Active « Outils d'apprentissage » et enregistre pour gérer leçons, flashcards et quiz.
        </p>
      )}
    </div>
  );
}
