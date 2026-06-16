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

async function setMembers(s: any, bundleId: string, courseIds: string[]) {
  await s.from("bundle_courses").delete().eq("bundle_id", bundleId);
  if (courseIds?.length) {
    const rows = courseIds.map((cid, i) => ({ bundle_id: bundleId, course_id: cid, position: i }));
    await s.from("bundle_courses").insert(rows);
  }
}

export async function POST(req: NextRequest) {
  const s = await admin();
  if (!s) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const b = await req.json();
  const { data, error } = await s
    .from("bundles")
    .insert({
      title: b.title,
      blurb: b.blurb ?? "",
      price: Number(b.price) || 0,
      was: Number(b.was) || 0,
      color: b.color ?? "#7B3FF2",
      featured: !!b.featured,
      position: Number(b.position) || 0,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await setMembers(s, data.id, b.courseIds ?? []);
  // Only one featured bundle at a time.
  if (b.featured) await s.from("bundles").update({ featured: false }).neq("id", data.id);
  return NextResponse.json({ ok: true, id: data.id });
}

export async function PUT(req: NextRequest) {
  const s = await admin();
  if (!s) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id manquant." }, { status: 400 });
  const patch: Record<string, any> = {};
  if (b.title !== undefined) patch.title = b.title;
  if (b.blurb !== undefined) patch.blurb = b.blurb;
  if (b.price !== undefined) patch.price = Number(b.price) || 0;
  if (b.was !== undefined) patch.was = Number(b.was) || 0;
  if (b.color !== undefined) patch.color = b.color;
  if (b.featured !== undefined) patch.featured = !!b.featured;
  const { error } = await s.from("bundles").update(patch).eq("id", b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (Array.isArray(b.courseIds)) await setMembers(s, b.id, b.courseIds);
  if (b.featured) await s.from("bundles").update({ featured: false }).neq("id", b.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const s = await admin();
  if (!s) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id manquant." }, { status: 400 });
  const { error } = await s.from("bundles").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
