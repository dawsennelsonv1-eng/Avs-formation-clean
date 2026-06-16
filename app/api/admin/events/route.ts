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
  const { error } = await s.from("events").insert({
    title: b.title,
    date_label: b.date,
    time_label: b.time,
    live: !!b.live,
    position: Number(b.position) || 0,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  const s = await admin();
  if (!s) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id manquant." }, { status: 400 });
  const patch: Record<string, any> = {};
  if (b.title !== undefined) patch.title = b.title;
  if (b.date !== undefined) patch.date_label = b.date;
  if (b.time !== undefined) patch.time_label = b.time;
  if (b.live !== undefined) patch.live = !!b.live;
  const { error } = await s.from("events").update(patch).eq("id", b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const s = await admin();
  if (!s) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id manquant." }, { status: 400 });
  const { error } = await s.from("events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
