import { NextRequest } from "next/server";
import { GoogleGenerativeAI, type Content } from "@google/generative-ai";

export const runtime = "nodejs";

interface TutorBody {
  courseTitle: string;
  courseSummary?: string;
  history: { role: "user" | "model"; text: string }[];
  message: string;
  screenshotBase64?: string;
}

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return new Response("data: " + JSON.stringify({ error: "GEMINI_API_KEY manquant." }) + "\n\n", {
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const body = (await req.json()) as TutorBody;
  const genAI = new GoogleGenerativeAI(key);

  const system = `Tu es le tuteur IA de la formation « ${body.courseTitle} » sur AVS Formation.
${body.courseSummary ? `Contexte du cours : ${body.courseSummary}` : ""}
Règles:
- Réponds en français, de façon claire, encourageante et concise.
- Donne des exemples concrets et des étapes actionnables.
- Si l'élève partage une capture d'écran d'un point de blocage, analyse-la et explique précisément quoi faire.
- Reste dans le sujet de la formation.`;

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: system,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
  });

  const history: Content[] = body.history.map((h) => ({
    role: h.role,
    parts: [{ text: h.text }],
  }));

  const userParts: any[] = [{ text: body.message || "Aide-moi avec ce point." }];
  if (body.screenshotBase64) {
    const data = body.screenshotBase64.includes(",")
      ? body.screenshotBase64.split(",")[1]
      : body.screenshotBase64;
    const mime = body.screenshotBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/)?.[1] ?? "image/jpeg";
    userParts.unshift({ inlineData: { data, mimeType: mime } });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const chat = model.startChat({ history });
        const result = await chat.sendMessageStream(userParts);
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erreur du tuteur.";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
