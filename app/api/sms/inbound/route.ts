import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-service";
import type { PayMethod } from "@/types";

export const runtime = "nodejs";

/**
 * SMS FORWARDER WEBHOOK
 * ---------------------
 * Point your SMS-forwarding app (e.g. an Android forwarder) at:
 *   POST /api/sms/inbound
 *   Header: x-sms-secret: <SMS_FORWARDER_SECRET>
 *   Body (either):
 *     { "text": "<full SMS body>", "method": "moncash" }      // we parse it
 *     { "transactionId": "...", "amount": 1500, "method": "moncash" }  // pre-parsed
 *
 * Parsed confirmations are stored in forwarded_sms. verify_payment() later
 * matches a client's submitted ID against these and consumes the row once.
 */

function parseSms(text: string, method: PayMethod) {
  // Transaction ID: common labels across MonCash/NatCash receipts.
  const idMatch =
    text.match(/(?:transaction|trans|ref(?:erence|érence)?|id)\D{0,8}([A-Z0-9]{6,})/i) ||
    text.match(/\b([A-Z0-9]{8,})\b/);
  const transactionId = idMatch?.[1] ?? null;

  // Amount in HTG / gourdes.
  const amtMatch = text.match(/(\d[\d.,]*)\s*(?:htg|gdes?|gourdes?|g)\b/i);
  const amount = amtMatch ? Number(amtMatch[1].replace(/[.,]/g, "")) : null;

  // Sender phone (Haitian format, loose).
  const phoneMatch = text.match(/(?:\+?509)?\s?\d{4}\s?\d{4}/);
  const senderPhone = phoneMatch?.[0]?.replace(/\s/g, "") ?? null;

  return { transactionId, amount, senderPhone };
}

export async function POST(req: NextRequest) {
  // Shared-secret auth so only your forwarder can post here.
  const secret = req.headers.get("x-sms-secret");
  if (!process.env.SMS_FORWARDER_SECRET || secret !== process.env.SMS_FORWARDER_SECRET) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const method = body.method as PayMethod;
    if (method !== "moncash" && method !== "natcash") {
      return NextResponse.json({ error: "Méthode invalide." }, { status: 400 });
    }

    let transactionId: string | null = body.transactionId ?? null;
    let amount: number | null = typeof body.amount === "number" ? body.amount : null;
    let senderPhone: string | null = body.senderPhone ?? null;
    const rawText: string | null = body.text ?? null;

    if (!transactionId && rawText) {
      const parsed = parseSms(rawText, method);
      transactionId = parsed.transactionId;
      amount = amount ?? parsed.amount;
      senderPhone = parsed.senderPhone;
    }

    if (!transactionId) {
      return NextResponse.json({ error: "ID de transaction introuvable dans le SMS." }, { status: 422 });
    }

    const admin = createServiceClient();
    const { error } = await admin
      .from("forwarded_sms")
      .upsert(
        {
          method,
          transaction_id: transactionId,
          amount,
          sender_phone: senderPhone,
          raw_text: rawText,
        },
        { onConflict: "method,transaction_id", ignoreDuplicates: true }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, transactionId });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur webhook SMS.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
