import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

async function assertAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, supabase: null };
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (data?.role !== "admin") return { ok: false as const, supabase: null };
  return { ok: true as const, supabase };
}

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  const a = await assertAdmin();
  if (!a.ok) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const b = await req.json();
  const payload = {
    title: b.title,
    slug: b.slug || slugify(b.title ?? "cours"),
    tag: b.tag,
    blurb: b.blurb ?? "",
    summary: b.summary ?? "",
    price: Number(b.price) || 0,
    duration_min: Number(b.durationMin) || 0,
    lessons: Number(b.lessons) || 0,
    color: b.color ?? "#7B3FF2",
    upcoming: !!b.upcoming,
    has_learning_tools: !!b.hasLearningTools,
    flyer_url: b.flyerUrl ?? null,
  };
  const { data, error } = await a.supabase.from("courses").insert(payload).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}

export async function PUT(req: NextRequest) {
  const a = await assertAdmin();
  if (!a.ok) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id manquant." }, { status: 400 });
  const patch: Record<string, any> = {};
  for (const [key, col] of Object.entries({
    title: "title", tag: "tag", blurb: "blurb", summary: "summary", color: "color",
    flyerUrl: "flyer_url",
  })) if (b[key] !== undefined) patch[col] = b[key];
  if (b.price !== undefined) patch.price = Number(b.price) || 0;
  if (b.durationMin !== undefined) patch.duration_min = Number(b.durationMin) || 0;
  if (b.lessons !== undefined) patch.lessons = Number(b.lessons) || 0;
  if (b.upcoming !== undefined) patch.upcoming = !!b.upcoming;
  if (b.hasLearningTools !== undefined) patch.has_learning_tools = !!b.hasLearningTools;

  const { error } = await a.supabase.from("courses").update(patch).eq("id", b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const a = await assertAdmin();
  if (!a.ok) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id manquant." }, { status: 400 });
  const { error } = await a.supabase.from("courses").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
