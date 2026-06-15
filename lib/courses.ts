import { createClient } from "@/lib/supabase-server";
import { COURSES as MOCK } from "@/lib/data";
import type { Course } from "@/types";

function rowToCourse(r: any): Course {
  return {
    id: r.id,
    title: r.title,
    tag: r.tag,
    blurb: r.blurb ?? "",
    summary: r.summary ?? "",
    price: r.price ?? 0,
    isFree: r.is_free ?? r.price === 0,
    rating: Number(r.rating ?? 0),
    reviews: r.reviews ?? 0,
    durationMin: r.duration_min ?? 0,
    lessons: r.lessons ?? 0,
    color: r.color ?? "#7B3FF2",
    upcoming: r.upcoming ?? false,
    hasLearningTools: r.has_learning_tools ?? false,
  };
}

const configured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getAllCourses(): Promise<Course[]> {
  if (!configured()) return MOCK;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("courses").select("*").order("created_at");
    if (error || !data?.length) return MOCK;
    return data.map(rowToCourse);
  } catch {
    return MOCK;
  }
}

export async function getCourseById(id: string): Promise<Course | null> {
  if (!configured()) return MOCK.find((c) => c.id === id) ?? null;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("courses").select("*").eq("id", id).single();
    if (error || !data) return MOCK.find((c) => c.id === id) ?? null;
    return rowToCourse(data);
  } catch {
    return MOCK.find((c) => c.id === id) ?? null;
  }
}

export async function hasAccess(courseId: string): Promise<boolean> {
  if (!configured()) return false;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}
