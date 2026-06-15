import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { lessonId, courseId, completed } = (await req.json()) as {
      lessonId: string;
      courseId: string;
      completed: boolean;
    };
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ persisted: false });

    if (completed) {
      await supabase.from("lesson_progress").upsert(
        { user_id: user.id, lesson_id: lessonId, course_id: courseId, completed: true },
        { onConflict: "user_id,lesson_id" }
      );
    } else {
      await supabase
        .from("lesson_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId);
    }

    await supabase.rpc("recompute_progress", { p_user: user.id, p_course: courseId });
    return NextResponse.json({ persisted: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
