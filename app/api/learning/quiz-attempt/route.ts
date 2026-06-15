import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { courseId, score, total } = (await req.json()) as {
      courseId: string;
      score: number;
      total: number;
    };
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ persisted: false });

    await supabase.from("quiz_attempts").insert({
      user_id: user.id,
      course_id: courseId,
      score,
      total,
    });
    return NextResponse.json({ persisted: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
