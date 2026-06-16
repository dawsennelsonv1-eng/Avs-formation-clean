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
      <CourseContentManager courseId={course.id} lessons={lessons} cards={cards} quiz={quiz} />
      {!course.hasLearningTools && (
        <p className="mt-4 rounded-2xl border border-dashed border-border p-3 text-center text-[11px] text-muted-foreground">
          Astuce : active « Outils d'apprentissage » ci-dessus pour que les flashcards, quiz et le tuteur IA soient visibles par les étudiants. Tu peux ajouter le contenu ici dans tous les cas.
        </p>
      )}
    </div>
  );
}
