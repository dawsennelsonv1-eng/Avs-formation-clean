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
  const { data, error } = await s.from("lessons").insert({
    course_id: b.courseId,
    title: b.title,
    duration_min: Number(b.durationMin) || 0,
    is_preview: !!b.isPreview,
    position: Number(b.position) || 0,
    video_url: b.videoUrl ?? null,
    image_urls: Array.isArray(b.imageUrls) ? b.imageUrls : [],
    content: b.content ?? null,
  }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}

export async function PUT(req: NextRequest) {
  const s = await admin();
  if (!s) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id manquant." }, { status: 400 });
  const patch: Record<string, any> = {};
  if (b.title !== undefined) patch.title = b.title;
  if (b.durationMin !== undefined) patch.duration_min = Number(b.durationMin) || 0;
  if (b.isPreview !== undefined) patch.is_preview = !!b.isPreview;
  if (b.videoUrl !== undefined) patch.video_url = b.videoUrl || null;
  if (b.imageUrls !== undefined) patch.image_urls = Array.isArray(b.imageUrls) ? b.imageUrls : [];
  if (b.content !== undefined) patch.content = b.content || null;
  const { error } = await s.from("lessons").update(patch).eq("id", b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const s = await admin();
  if (!s) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const { id } = await req.json();
  const { error } = await s.from("lessons").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
