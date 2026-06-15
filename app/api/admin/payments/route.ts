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

export async function PUT(req: NextRequest) {
  const s = await admin();
  if (!s) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const { id, action } = (await req.json()) as { id: string; action: "grant" | "reject" };

  const { data: sub, error: e1 } = await s.from("payment_submissions").select("*").eq("id", id).single();
  if (e1 || !sub) return NextResponse.json({ error: "Soumission introuvable." }, { status: 404 });

  if (action === "grant") {
    if (sub.user_id) {
      await s.from("enrollments").upsert(
        { user_id: sub.user_id, course_id: sub.course_id },
        { onConflict: "user_id,course_id" }
      );
    }
    await s.from("payment_submissions").update({ status: "granted" }).eq("id", id);
  } else {
    await s.from("payment_submissions").update({ status: "rejected" }).eq("id", id);
  }
  return NextResponse.json({ ok: true });
}
