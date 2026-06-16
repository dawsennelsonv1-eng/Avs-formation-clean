import { getAllCourses } from "@/lib/courses";
import { getMyCourseIds } from "@/lib/enrollments";
import { Catalogue } from "@/components/course-catalogue";

export default async function CoursesPage() {
  const [courses, ownedIds] = await Promise.all([getAllCourses(), getMyCourseIds()]);
  return <Catalogue courses={courses} ownedIds={ownedIds} />;
}
