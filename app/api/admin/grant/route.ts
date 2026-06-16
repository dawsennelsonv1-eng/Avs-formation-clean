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
  const userId: string = b.userId;
  if (!userId) return NextResponse.json({ error: "Utilisateur manquant." }, { status: 400 });

  // Resolve the courses to grant.
  let courseIds: string[] = [];
  let label = "";
  if (b.bundleId) {
    const { data: members } = await s.from("bundle_courses").select("course_id").eq("bundle_id", b.bundleId);
    courseIds = (members ?? []).map((m: any) => m.course_id);
    const { data: bundle } = await s.from("bundles").select("title").eq("id", b.bundleId).maybeSingle();
    label = `Offre groupée : ${bundle?.title ?? "bundle"}`;
  } else if (Array.isArray(b.courseIds)) {
    courseIds = b.courseIds;
    label = `${courseIds.length} formation(s)`;
  }
  if (courseIds.length === 0) return NextResponse.json({ error: "Aucune formation à accorder." }, { status: 400 });

  // Grant access (idempotent).
  const rows = courseIds.map((cid) => ({ user_id: userId, course_id: cid }));
  const { error: enrErr } = await s.from("enrollments").upsert(rows, { onConflict: "user_id,course_id" });
  if (enrErr) return NextResponse.json({ error: enrErr.message }, { status: 500 });

  // Optionally record a direct (off-system) payment for the books.
  if (b.markPaid) {
    const { data: profile } = await s
      .from("profiles")
      .select("full_name,whatsapp")
      .eq("id", userId)
      .maybeSingle();
    await s.from("payment_submissions").insert({
      user_id: userId,
      course_id: courseIds[0],
      method: "manual",
      full_name: profile?.full_name ?? "Client",
      whatsapp: profile?.whatsapp ?? "—",
      proof_kind: "id",
      status: "granted",
      amount: b.amount != null ? Number(b.amount) || 0 : null,
      note: b.note ? `${label} — ${b.note}` : label,
    });
  }

  return NextResponse.json({ ok: true, granted: courseIds.length });
}
