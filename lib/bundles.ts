import { createClient } from "@/lib/supabase-server";
import { BUNDLES as MOCK } from "@/lib/data";
import type { Bundle } from "@/types";

const configured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function rowToBundle(r: any): Bundle {
  const members = (r.bundle_courses ?? []).slice().sort((a: any, b: any) => a.position - b.position);
  return {
    id: r.id,
    title: r.title,
    blurb: r.blurb ?? "",
    price: r.price ?? 0,
    was: r.was ?? 0,
    color: r.color ?? "#7B3FF2",
    count: members.length,
    courseIds: members.map((m: any) => m.course_id),
    featured: r.featured ?? false,
    imageUrl: r.image_url ?? null,
  };
}

const SELECT = "id,title,blurb,price,was,color,featured,image_url,position,bundle_courses(course_id,position)";

export async function getBundles(): Promise<Bundle[]> {
  if (!configured()) return MOCK;
  try {
    const s = createClient();
    const { data } = await s.from("bundles").select(SELECT).order("position");
    return (data ?? []).map(rowToBundle);
  } catch {
    return [];
  }
}

export async function getFeaturedBundle(): Promise<Bundle | null> {
  const all = await getBundles();
  return all.find((b) => b.featured) ?? all[0] ?? null;
}

export async function getBundleById(id: string): Promise<Bundle | null> {
  if (!configured()) return MOCK.find((b) => b.id === id) ?? null;
  try {
    const s = createClient();
    const { data } = await s.from("bundles").select(SELECT).eq("id", id).maybeSingle();
    return data ? rowToBundle(data) : null;
  } catch {
    return null;
  }
}
