import { createClient } from "@/lib/supabase-server";
import { EVENTS as MOCK } from "@/lib/data";
import type { AppEvent } from "@/types";

const configured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getEvents(): Promise<AppEvent[]> {
  if (!configured()) return MOCK;
  try {
    const s = createClient();
    const { data } = await s.from("events").select("*").order("position");
    return (data ?? []).map((r: any) => ({
      id: r.id,
      title: r.title,
      date: r.date_label,
      time: r.time_label,
      live: r.live,
    }));
  } catch {
    return [];
  }
}
