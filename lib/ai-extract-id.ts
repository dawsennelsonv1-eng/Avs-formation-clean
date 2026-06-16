import { GoogleGenerativeAI } from "@google/generative-ai";
import type { PayMethod } from "@/types";

/**
 * Extract a MonCash / NatCash transaction ID from a payment screenshot.
 * Uses gemini-1.5-flash-8b — the cheapest capable vision model — and asks
 * for a strict JSON reply so parsing stays reliable.
 */
export async function extractTransactionId(
  base64Image: string,
  method: PayMethod
): Promise<{ transactionId: string | null; amount: number | null }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY manquant.");

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Strip a data URL prefix if present.
  const data = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;
  const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  const mimeType = mimeMatch?.[1] ?? "image/jpeg";

  const label = method === "moncash" ? "MonCash (Digicel)" : "NatCash (Natcom)";
  const prompt = `Tu analyses une capture d'écran de confirmation de paiement ${label} en Haïti.
Extrait précisément:
1. L'identifiant / numéro de transaction (Transaction ID, "Référence", "ID Transaction").
2. Le montant en gourdes (HTG), sous forme de nombre entier sans symbole.
Réponds UNIQUEMENT avec un objet JSON, sans texte ni balises Markdown, au format exact:
{"transactionId": string|null, "amount": number|null}
Si une valeur est illisible, mets null.`;

  const result = await model.generateContent([
    { inlineData: { data, mimeType } },
    { text: prompt },
  ]);

  const text = result.response.text().replace(/```json|```/g, "").trim();
  try {
    const parsed = JSON.parse(text);
    const tx = typeof parsed.transactionId === "string" ? parsed.transactionId.trim() : null;
    const amt = typeof parsed.amount === "number" ? parsed.amount : null;
    return { transactionId: tx || null, amount: amt };
  } catch {
    return { transactionId: null, amount: null };
  }
}
