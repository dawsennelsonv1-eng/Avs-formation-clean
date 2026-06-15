import { NextRequest, NextResponse } from "next/server";
import { extractTransactionId } from "@/lib/ai-extract-id";
import type { PayMethod } from "@/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { screenshotBase64, method } = (await req.json()) as {
      screenshotBase64?: string;
      method?: PayMethod;
    };

    if (!screenshotBase64 || !method) {
      return NextResponse.json({ error: "Capture ou méthode manquante." }, { status: 400 });
    }

    const { transactionId, amount } = await extractTransactionId(screenshotBase64, method);

    if (!transactionId) {
      return NextResponse.json(
        { transactionId: null, amount, error: "ID introuvable sur l'image." },
        { status: 200 }
      );
    }

    return NextResponse.json({ transactionId, amount });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur d'extraction.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
