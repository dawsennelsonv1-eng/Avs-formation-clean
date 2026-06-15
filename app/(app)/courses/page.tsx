import { getAllCourses } from "@/lib/courses";
import { Catalogue } from "@/components/course-catalogue";

export default async function CoursesPage() {
  const courses = await getAllCourses();
  return <Catalogue courses={courses} />;
}
