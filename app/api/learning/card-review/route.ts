import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { schedule, type SrState } from "@/lib/learning-srs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { cardId, grade } = (await req.json()) as { cardId: string; grade: 0 | 1 | 2 | 3 };
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // No auth (e.g. preview) -> just compute next state client-side fallback.
    if (!user) {
      const next = schedule({ ease: 2.5, intervalDays: 0, repetitions: 0 }, grade);
      return NextResponse.json({ persisted: false, ...next });
    }

    const { data: existing } = await supabase
      .from("card_reviews")
      .select("ease,interval_days,repetitions")
      .eq("user_id", user.id)
      .eq("card_id", cardId)
      .maybeSingle();

    const prev: SrState = existing
      ? { ease: Number(existing.ease), intervalDays: existing.interval_days, repetitions: existing.repetitions }
      : { ease: 2.5, intervalDays: 0, repetitions: 0 };

    const next = schedule(prev, grade);

    await supabase.from("card_reviews").upsert(
      {
        user_id: user.id,
        card_id: cardId,
        ease: next.ease,
        interval_days: next.intervalDays,
        repetitions: next.repetitions,
        due_at: next.dueAt,
        last_grade: grade,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,card_id" }
    );

    return NextResponse.json({ persisted: true, ...next });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
