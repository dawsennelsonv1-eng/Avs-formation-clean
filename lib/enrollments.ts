import { createClient } from "@/lib/supabase-server";
import { ENROLLMENTS as MOCK_ENR, getCourse } from "@/lib/data";
import { getAllCourses } from "@/lib/courses";
import type { Course } from "@/types";

const configured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface MyEnrollment {
  course: Course;
  progress: number;   // 0-100
  completed: boolean;
  lastLesson: number;
}

/** The signed-in user's real enrolled courses with live progress. */
export async function getMyEnrollments(): Promise<MyEnrollment[]> {
  if (!configured()) {
    return MOCK_ENR
      .map((e) => {
        const course = getCourse(e.courseId);
        return course ? { course, progress: e.progress, completed: e.completed, lastLesson: e.lastLesson } : null;
      })
      .filter(Boolean) as MyEnrollment[];
  }

  try {
    const s = createClient();
    const {
      data: { user },
    } = await s.auth.getUser();
    if (!user) return [];

    const { data: enr } = await s
      .from("enrollments")
      .select("course_id,progress,last_lesson,completed")
      .eq("user_id", user.id);
    if (!enr?.length) return [];

    const courseIds = enr.map((e: any) => e.course_id);

    // Live progress: completed lessons / total lessons per course (3 queries, no N+1).
    const [{ data: doneRows }, { data: lessonRows }, courses] = await Promise.all([
      s.from("lesson_progress").select("course_id").eq("user_id", user.id).in("course_id", courseIds),
      s.from("lessons").select("course_id").in("course_id", courseIds),
      getAllCourses(),
    ]);

    const doneCount = new Map<string, number>();
    (doneRows ?? []).forEach((r: any) => doneCount.set(r.course_id, (doneCount.get(r.course_id) ?? 0) + 1));
    const totalCount = new Map<string, number>();
    (lessonRows ?? []).forEach((r: any) => totalCount.set(r.course_id, (totalCount.get(r.course_id) ?? 0) + 1));
    const byId = new Map(courses.map((c) => [c.id, c]));

    return enr
      .map((e: any) => {
        const course = byId.get(e.course_id);
        if (!course) return null;
        const total = totalCount.get(e.course_id) ?? 0;
        const done = doneCount.get(e.course_id) ?? 0;
        const liveProgress = total > 0 ? Math.round((done / total) * 100) : e.progress ?? 0;
        return {
          course,
          progress: liveProgress,
          completed: e.completed ?? liveProgress >= 100,
          lastLesson: e.last_lesson ?? done,
        };
      })
      .filter(Boolean) as MyEnrollment[];
  } catch {
    return [];
  }
}
