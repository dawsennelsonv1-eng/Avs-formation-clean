import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase-service";
import { extractTransactionId } from "@/lib/ai-extract-id";
import type { PaymentSubmission, VerifyResult, VerifyStatus } from "@/types";

export const runtime = "nodejs";

const MESSAGES: Record<VerifyStatus, string> = {
  granted: "Paiement vérifié ✓ Accès débloqué. Bonne formation !",
  pending:
    "Paiement reçu. La confirmation n'est pas encore arrivée — l'accès s'active dès que la transaction est confirmée (quelques minutes).",
  duplicate:
    "Cet identifiant de transaction a déjà été utilisé. Vérifie ton ID ou contacte le support sur WhatsApp.",
  rejected:
    "Le montant ne correspond pas au prix de la formation. Vérifie ta transaction ou contacte le support.",
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PaymentSubmission;
    const { courseId, method, fullName, whatsapp, proofKind } = body;

    if (!courseId || !method || !fullName?.trim() || !whatsapp?.trim() || !proofKind) {
      return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
    }

    // Resolve transaction ID either from typed input or AI extraction.
    let transactionId = body.transactionId?.trim() ?? "";
    let extractedViaAi = false;

    if (proofKind === "screenshot") {
      if (!body.screenshotBase64) {
        return NextResponse.json({ error: "Capture manquante." }, { status: 400 });
      }
      const ai = await extractTransactionId(body.screenshotBase64, method);
      if (!ai.transactionId) {
        return NextResponse.json(
          { status: "rejected", message: "Impossible de lire l'ID sur la capture. Saisis-le manuellement." } as VerifyResult,
          { status: 200 }
        );
      }
      transactionId = ai.transactionId;
      extractedViaAi = true;
    }

    if (!transactionId) {
      return NextResponse.json({ error: "Identifiant de transaction manquant." }, { status: 400 });
    }

    // Identify the logged-in user (anon allowed -> user_id null, stays pending-friendly).
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // verify_payment is SECURITY DEFINER and touches the private forwarded_sms
    // table, so we call it with the service-role client.
    const admin = createServiceClient();
    const { data, error } = await admin.rpc("verify_payment", {
      p_user: user?.id ?? null,
      p_course: courseId,
      p_method: method,
      p_transaction_id: transactionId,
      p_full_name: fullName.trim(),
      p_whatsapp: whatsapp.trim(),
      p_proof_kind: proofKind,
      p_extracted_via_ai: extractedViaAi,
      p_screenshot_path: null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const status = (data as VerifyStatus) ?? "pending";
    const result: VerifyResult = { status, message: MESSAGES[status], transactionId };
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur de vérification.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
