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
  const { id, role } = (await req.json()) as { id: string; role: "user" | "admin" };
  if (role !== "user" && role !== "admin")
    return NextResponse.json({ error: "Rôle invalide." }, { status: 400 });
  const { error } = await s.from("profiles").update({ role }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
