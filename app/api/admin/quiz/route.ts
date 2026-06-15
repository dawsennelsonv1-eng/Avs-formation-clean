import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

async function admin() {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return null;
  const { data } = await s.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return data?.role === "admin" ? s : null;
}

export async function POST(req: NextRequest) {
  const s = await admin();
  if (!s) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const b = await req.json();
  const opts = (b.options as string[]).filter((o) => o.trim());
  if (opts.length < 2) return NextResponse.json({ error: "Au moins 2 options." }, { status: 400 });
  const { error } = await s.from("quiz_questions").insert({
    course_id: b.courseId, question: b.question, options: opts,
    correct_index: Number(b.correctIndex) || 0, explanation: b.explanation ?? null,
    position: Number(b.position) || 0,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const s = await admin();
  if (!s) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const { id } = await req.json();
  const { error } = await s.from("quiz_questions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
