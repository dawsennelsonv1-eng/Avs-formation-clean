import { notFound } from "next/navigation";
import { getCourseById, hasAccess } from "@/lib/courses";
import { getFlashcards, getQuiz, getReviews } from "@/lib/learning-content";
import { getLessons } from "@/lib/learning-lessons";
import { getCurrentUser } from "@/lib/auth";
import { CourseView } from "@/components/course-course-view";

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = await getCourseById(params.id);
  if (!course) notFound();

  const access = await hasAccess(course.id);
  const user = await getCurrentUser();

  // Only fetch learning content if this course has the tools enabled.
  const [cards, quiz, reviews, lessons] = await Promise.all([
    course.hasLearningTools ? getFlashcards(course.id) : Promise.resolve([]),
    course.hasLearningTools ? getQuiz(course.id) : Promise.resolve([]),
    getReviews(course.id),
    getLessons(course.id),
  ]);

  return (
    <CourseView
      course={course}
      initialAccess={access}
      cards={cards}
      quiz={quiz}
      reviews={reviews}
      lessons={lessons}
      signedIn={!!user}
      userName={user?.fullName ?? null}
    />
  );
}
