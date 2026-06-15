"use client";

import { useEffect, useRef, useState } from "react";
import { ImageUp, Loader2, Maximize2, Minimize2, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course } from "@/types";

interface Msg {
  role: "user" | "model";
  text: string;
}

const SUGGESTED = [
  "Peux-tu résumer cette leçon ?",
  "Donne-moi un exemple concret.",
  "Quelle est l'erreur la plus fréquente ?",
];

export function AITutor({ course }: { course: Course }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "model", text: `Bonjour 👋 Je suis ton tuteur IA pour « ${course.title} ». Pose-moi une question, ou envoie une capture de l'endroit où tu bloques.` },
  ]);
  const [input, setInput] = useState("");
  const [shot, setShot] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Lock background scroll while the tutor is fullscreen.
  useEffect(() => {
    if (!expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [expanded]);

  const scrollDown = () =>
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }));

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if ((!content && !shot) || streaming) return;

    // Sending counts as interacting → grow to fullscreen.
    setExpanded(true);

    const history = msgs.map((m) => ({ role: m.role, text: m.text }));
    const userMsg: Msg = { role: "user", text: content || "(capture envoyée)" };
    setMsgs((m) => [...m, userMsg, { role: "model", text: "" }]);
    setInput("");
    const screenshot = shot;
    setShot(null);
    setStreaming(true);
    scrollDown();

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseTitle: course.title,
          courseSummary: course.summary,
          history,
          message: content,
          screenshotBase64: screenshot ?? undefined,
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value).split("\n\n");
          for (const line of lines) {
            const m = line.match(/^data: (.*)$/);
            if (!m) continue;
            if (m[1] === "[DONE]") continue;
            try {
              const parsed = JSON.parse(m[1]);
              if (parsed.error) acc += `\n⚠️ ${parsed.error}`;
              if (parsed.text) acc += parsed.text;
              setMsgs((cur) => {
                const copy = [...cur];
                copy[copy.length - 1] = { role: "model", text: acc };
                return copy;
              });
              scrollDown();
            } catch {
              /* ignore partial frames */
            }
          }
        }
      }
      if (!acc) {
        setMsgs((cur) => {
          const copy = [...cur];
          copy[copy.length - 1] = { role: "model", text: "Désolé, je n'ai pas pu répondre. Réessaie." };
          return copy;
        });
      }
    } catch {
      setMsgs((cur) => {
        const copy = [...cur];
        copy[copy.length - 1] = { role: "model", text: "Erreur réseau. Réessaie." };
        return copy;
      });
    } finally {
      setStreaming(false);
      scrollDown();
    }
  };

  const onFile = (f?: File) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setShot(reader.result as string);
    reader.readAsDataURL(f);
  };

  /* ---------- shared pieces ---------- */
  const messageList = msgs.map((m, i) => (
    <div
      key={i}
      className={cn(
        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
        m.role === "user"
          ? "justify-self-end bg-gold text-[#1a1208]"
          : "justify-self-start border border-border bg-card"
      )}
    >
      {m.text || (streaming && i === msgs.length - 1 ? <Loader2 className="h-4 w-4 animate-spin" /> : null)}
    </div>
  ));

  const suggestedRow = (
    <div className="mb-2.5 flex flex-wrap gap-1.5">
      {SUGGESTED.map((q) => (
        <button
          key={q}
          onClick={() => send(q)}
          disabled={streaming}
          className="rounded-full border border-border bg-card px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          {q}
        </button>
      ))}
    </div>
  );

  const shotPreview = shot && (
    <div className="mb-2 flex items-center gap-2 rounded-xl border border-gold/40 p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={shot} alt="capture" className="h-10 w-10 rounded object-cover" />
      <span className="flex-1 text-[12px] text-muted-foreground">Capture prête à analyser</span>
      <button onClick={() => setShot(null)} className="text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );

  const inputBar = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => fileRef.current?.click()}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Joindre une capture"
      >
        <ImageUp className="h-[18px] w-[18px]" />
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setExpanded(true)}
        onKeyDown={(e) => e.key === "Enter" && send()}
        placeholder="Pose ta question…"
        className="h-12 flex-1 rounded-xl border border-border bg-card px-3.5 text-[14px] outline-none focus:border-gold"
      />
      <button
        onClick={() => send()}
        disabled={streaming}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold text-[#1a1208] disabled:opacity-50"
        aria-label="Envoyer"
      >
        {streaming ? <Loader2 className="h-[17px] w-[17px] animate-spin" /> : <Send className="h-[17px] w-[17px]" />}
      </button>
    </div>
  );

  const footer = (
    <>
      {suggestedRow}
      {shotPreview}
      {inputBar}
      <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[10px] text-muted-foreground">
        <Sparkles className="h-3 w-3" /> Propulsé par Gemini · les réponses peuvent contenir des erreurs
      </p>
    </>
  );

  /* ---------- FULLSCREEN ---------- */
  if (expanded) {
    return (
      <div className="fixed inset-0 z-[60] flex justify-center bg-black/70 backdrop-blur-sm">
        <div className="flex h-[100dvh] w-full max-w-[480px] flex-col bg-background">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15">
                <Sparkles className="h-4 w-4 text-gold" />
              </span>
              <div className="min-w-0">
                <div className="text-[13px] font-bold leading-tight">Tuteur IA</div>
                <div className="truncate text-[11px] text-muted-foreground">{course.title}</div>
              </div>
            </div>
            <button
              onClick={() => setExpanded(false)}
              aria-label="Réduire"
              className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              <Minimize2 className="h-[18px] w-[18px]" />
            </button>
          </header>

          <div ref={scrollRef} className="grid flex-1 content-start gap-2.5 overflow-y-auto px-4 py-4">
            {messageList}
          </div>

          <div className="border-t border-border bg-background px-4 py-3">{footer}</div>
        </div>
      </div>
    );
  }

  /* ---------- INLINE (compact) ---------- */
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[13px] font-semibold">
          <Sparkles className="h-4 w-4 text-gold" /> Tuteur IA
        </div>
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <Maximize2 className="h-3.5 w-3.5" /> Agrandir
        </button>
      </div>
      <div ref={scrollRef} className="mb-3 grid max-h-[420px] min-h-[300px] content-start gap-2.5 overflow-y-auto">
        {messageList}
      </div>
      {footer}
    </div>
  );
}
