import { createClient } from "@/lib/supabase-server";
import { ENROLLMENTS } from "@/lib/data";

const configured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface LearningStats {
  streak: number;
  coursesCount: number;
  quizzesPassed: number;
}

export async function getLearningStats(): Promise<LearningStats> {
  if (!configured()) {
    return { streak: 7, coursesCount: ENROLLMENTS.length, quizzesPassed: 12 };
  }
  try {
    const s = createClient();
    const {
      data: { user },
    } = await s.auth.getUser();
    if (!user) return { streak: 0, coursesCount: 0, quizzesPassed: 0 };

    const [{ data: profile }, { count: courses }, { data: attempts }] = await Promise.all([
      s.from("profiles").select("streak").eq("id", user.id).maybeSingle(),
      s.from("enrollments").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      s.from("quiz_attempts").select("score,total").eq("user_id", user.id),
    ]);

    const passed = (attempts ?? []).filter((a: any) => a.total && a.score / a.total >= 0.7).length;
    return {
      streak: profile?.streak ?? 0,
      coursesCount: courses ?? 0,
      quizzesPassed: passed,
    };
  } catch {
    return { streak: 7, coursesCount: ENROLLMENTS.length, quizzesPassed: 12 };
  }
}
