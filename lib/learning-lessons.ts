import { createClient } from "@/lib/supabase-server";

const configured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface Lesson {
  id: string;
  title: string;
  durationMin: number;
  isPreview: boolean;
  completed: boolean;
  videoUrl: string | null;
  imageUrls: string[];
  content: string | null;
}

const MOCK: Lesson[] = [
  { id: "l1", title: "Introduction & état d'esprit", durationMin: 8, isPreview: true, completed: false, videoUrl: null, imageUrls: [], content: null },
  { id: "l2", title: "Le hook parfait en 3 secondes", durationMin: 12, isPreview: false, completed: false, videoUrl: null, imageUrls: [], content: null },
  { id: "l3", title: "Monter une vidéo qui retient", durationMin: 15, isPreview: false, completed: false, videoUrl: null, imageUrls: [], content: null },
  { id: "l4", title: "Comprendre l'algorithme", durationMin: 10, isPreview: false, completed: false, videoUrl: null, imageUrls: [], content: null },
  { id: "l5", title: "Analyser et itérer", durationMin: 9, isPreview: false, completed: false, videoUrl: null, imageUrls: [], content: null },
];

export async function getLessons(courseId: string): Promise<Lesson[]> {
  if (!configured()) return MOCK;
  try {
    const s = createClient();
    const {
      data: { user },
    } = await s.auth.getUser();

    const { data: lessons } = await s
      .from("lessons")
      .select("id,title,duration_min,is_preview,video_url,image_urls,content")
      .eq("course_id", courseId)
      .order("position");

    if (!lessons?.length) return MOCK;

    let done = new Set<string>();
    if (user) {
      const { data: progress } = await s
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("course_id", courseId);
      done = new Set((progress ?? []).map((p: any) => p.lesson_id));
    }

    return lessons.map((l: any) => ({
      id: l.id,
      title: l.title,
      durationMin: l.duration_min ?? 0,
      isPreview: l.is_preview ?? false,
      completed: done.has(l.id),
      videoUrl: l.video_url ?? null,
      imageUrls: Array.isArray(l.image_urls) ? l.image_urls : [],
      content: l.content ?? null,
    }));
  } catch {
    return MOCK;
  }
}
