import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { courseId, rating, body, authorName } = (await req.json()) as {
      courseId: string;
      rating: number;
      body: string;
      authorName: string;
    };
    if (!courseId || !rating) return NextResponse.json({ error: "Champs manquants." }, { status: 400 });

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Connecte-toi pour laisser un avis." }, { status: 401 });

    const { error } = await supabase.from("reviews").upsert(
      { user_id: user.id, course_id: courseId, rating, body, author_name: authorName },
      { onConflict: "user_id,course_id" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.rpc("refresh_course_rating", { p_course: courseId });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
