import { createClient } from "@/lib/supabase-server";
import { COURSES as MOCK } from "@/lib/data";
import type { Course } from "@/types";

const configured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface AdminCourse extends Course {
  flyerUrl: string | null;
  slug: string | null;
}

function row(r: any): AdminCourse {
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
    flyerUrl: r.flyer_url ?? null,
    slug: r.slug ?? null,
  };
}

export async function adminListCourses(): Promise<AdminCourse[]> {
  if (!configured()) return MOCK.map((c) => ({ ...c, flyerUrl: null, slug: null }));
  try {
    const s = createClient();
    const { data } = await s.from("courses").select("*").order("created_at", { ascending: false });
    return data?.length ? data.map(row) : MOCK.map((c) => ({ ...c, flyerUrl: null, slug: null }));
  } catch {
    return MOCK.map((c) => ({ ...c, flyerUrl: null, slug: null }));
  }
}

export async function adminGetCourse(id: string): Promise<AdminCourse | null> {
  if (!configured()) {
    const c = MOCK.find((x) => x.id === id);
    return c ? { ...c, flyerUrl: null, slug: null } : null;
  }
  try {
    const s = createClient();
    const { data } = await s.from("courses").select("*").eq("id", id).single();
    return data ? row(data) : null;
  } catch {
    return null;
  }
}
