"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Clock, FileText, ImageUp, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui-sheet";
import { Button } from "@/components/ui-button";
import { Input } from "@/components/ui-input";
import { PAYMENT } from "@/config/site";
import { formatHTG, cn } from "@/lib/utils";
import type { Course, PayMethod, ProofKind, VerifyResult } from "@/types";
import { useToast } from "@/components/ui-toast";

export function PaymentFlow({
  course,
  open,
  onOpenChange,
  onGranted,
  defaultName = "",
}: {
  course: Course;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onGranted: () => void;
  defaultName?: string;
}) {
  const [method, setMethod] = useState<PayMethod | null>(null);
  const [fullName, setFullName] = useState(defaultName);
  const [whatsapp, setWhatsapp] = useState("");
  const [proofKind, setProofKind] = useState<ProofKind | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const receiver = method ? PAYMENT[method] : null;

  const reset = () => {
    setMethod(null); setFullName(""); setWhatsapp(""); setProofKind(null);
    setTransactionId(""); setScreenshot(null); setResult(null); setLoading(false);
  };

  const onFile = (f?: File) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(f);
  };

  const canSubmit =
    method &&
    fullName.trim().length > 1 &&
    whatsapp.trim().length >= 6 &&
    ((proofKind === "id" && transactionId.trim().length >= 4) ||
      (proofKind === "screenshot" && !!screenshot));

  const submit = async () => {
    if (!canSubmit || !method || !proofKind) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          method,
          fullName,
          whatsapp,
          proofKind,
          transactionId: proofKind === "id" ? transactionId : undefined,
          screenshotBase64: proofKind === "screenshot" ? screenshot : undefined,
        }),
      });
      const data = (await res.json()) as VerifyResult & { error?: string };
      if (data.error) {
        setResult({ status: "rejected", message: data.error });
      } else {
        setResult(data);
        if (data.status === "granted") {
          toast("Accès débloqué !", "success");
          setTimeout(onGranted, 1400);
        } else if (data.status === "duplicate" || data.status === "rejected") {
          toast(data.message, "error");
        }
      }
    } catch {
      setResult({ status: "rejected", message: "Erreur réseau. Réessaie." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <SheetContent title="Paiement">
        {/* Result state */}
        {result ? (
          <ResultView result={result} onRetry={() => setResult(null)} onClose={() => onOpenChange(false)} />
        ) : (
          <>
            <h3 className="font-display text-xl font-extrabold">Débloquer la formation</h3>
            <p className="mb-4 mt-1 text-[13px] text-muted-foreground">
              {course.title} · <b className="text-gold">{formatHTG(course.price)}</b>
            </p>

            {/* Step 1 — method */}
            <div className="mb-4 grid grid-cols-2 gap-2.5">
              {(["moncash", "natcash"] as PayMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={cn(
                    "flex h-14 items-center justify-center rounded-2xl border-2 bg-card transition-all",
                    method === m ? "border-gold" : "border-border"
                  )}
                  style={method === m ? { boxShadow: `0 0 0 3px ${PAYMENT[m].color}22` } : undefined}
                >
                  <Image
                    src={`/brand/${m}.svg`}
                    alt={PAYMENT[m].label}
                    width={104}
                    height={28}
                    className="h-7 w-auto"
                  />
                </button>
              ))}
            </div>

            {/* Receiver details */}
            {receiver && (
              <div className="mb-4 rounded-2xl border border-border bg-card p-4">
                <p className="mb-2.5 text-[12px] text-muted-foreground">
                  Envoie <b className="text-gold">{formatHTG(course.price)}</b> via{" "}
                  <b style={{ color: receiver.color }}>{receiver.label}</b> à :
                </p>
                <DetailRow label="Nom" value={receiver.name} />
                <DetailRow label="Numéro" value={receiver.phone} copyable />
              </div>
            )}

            {/* Step 2 — identity */}
            {method && (
              <div className="mb-4 grid gap-2.5">
                <Input placeholder="Ton nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <Input
                  placeholder="Ton numéro WhatsApp"
                  inputMode="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>
            )}

            {/* Step 3 — proof (ID or screenshot, mutually exclusive) */}
            {method && (
              <div className="mb-5">
                <p className="mb-2 text-[12px] font-semibold text-muted-foreground">Preuve de paiement</p>

                {proofKind !== "screenshot" && (
                  <div className={cn("mb-2", proofKind === "id" && "rounded-2xl border border-gold/40 p-3")}>
                    <Input
                      placeholder="Identifiant de transaction"
                      value={transactionId}
                      onChange={(e) => {
                        setTransactionId(e.target.value);
                        setProofKind(e.target.value ? "id" : null);
                      }}
                    />
                  </div>
                )}

                {/* Swap hint */}
                {proofKind !== "screenshot" && (
                  <button
                    onClick={() => {
                      setProofKind("screenshot");
                      setTransactionId("");
                      fileRef.current?.click();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ImageUp className="h-4 w-4" />
                    Tu n'as pas l'identifiant ? Fournis plutôt une capture d'écran
                  </button>
                )}

                {proofKind === "screenshot" && (
                  <div className="rounded-2xl border border-gold/40 p-3">
                    {screenshot ? (
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={screenshot} alt="Capture" className="h-16 w-16 rounded-lg object-cover" />
                        <div className="flex-1 text-[12px] text-muted-foreground">
                          Capture ajoutée. L'ID sera extrait automatiquement.
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="flex w-full items-center justify-center gap-2 py-3 text-[13px] font-semibold text-gold"
                      >
                        <ImageUp className="h-4 w-4" /> Choisir une capture
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setProofKind(null);
                        setScreenshot(null);
                      }}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2 text-[12px] text-muted-foreground hover:text-foreground"
                    >
                      <FileText className="h-3.5 w-3.5" /> Saisir l'identifiant à la place
                    </button>
                  </div>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
              </div>
            )}

            <Button className="w-full" size="lg" disabled={!canSubmit || loading} onClick={submit}>
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Vérification…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" /> J'ai payé — vérifier
                </>
              )}
            </Button>
            <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Vérification automatique et sécurisée
            </p>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between border-t border-border py-2 first:border-t-0">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <button
        onClick={() => {
          if (!copyable) return;
          navigator.clipboard?.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className={cn("text-[13px] font-bold", copyable && "underline decoration-dotted underline-offset-2")}
      >
        {copied ? "Copié ✓" : value}
      </button>
    </div>
  );
}

function ResultView({
  result,
  onRetry,
  onClose,
}: {
  result: VerifyResult;
  onRetry: () => void;
  onClose: () => void;
}) {
  const map = {
    granted: { icon: <CheckCircle2 className="h-12 w-12 text-emerald-400" />, tone: "text-emerald-400" },
    pending: { icon: <Clock className="h-12 w-12 text-gold" />, tone: "text-gold" },
    duplicate: { icon: <XCircle className="h-12 w-12 text-destructive" />, tone: "text-destructive" },
    rejected: { icon: <XCircle className="h-12 w-12 text-destructive" />, tone: "text-destructive" },
  }[result.status];

  return (
    <div className="py-4 text-center">
      <div className="mx-auto mb-3 flex justify-center">{map.icon}</div>
      <h3 className={cn("font-display text-lg font-extrabold", map.tone)}>
        {result.status === "granted"
          ? "Accès débloqué"
          : result.status === "pending"
          ? "En attente de confirmation"
          : result.status === "duplicate"
          ? "Identifiant déjà utilisé"
          : "Vérification échouée"}
      </h3>
      <p className="mx-auto mt-2 max-w-[300px] text-[13px] leading-relaxed text-muted-foreground">
        {result.message}
      </p>
      <div className="mt-5">
        {result.status === "granted" ? (
          <Button className="w-full" size="lg" onClick={onClose}>
            Commencer la formation →
          </Button>
        ) : (
          <Button className="w-full" size="lg" variant="secondary" onClick={onRetry}>
            Réessayer
          </Button>
        )}
      </div>
    </div>
  );
}
