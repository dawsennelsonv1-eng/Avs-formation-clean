import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth-auth-shell";
import { ForgotForm } from "@/components/auth-forgot-form";

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { sent?: string };
}) {
  const sent = searchParams.sent === "1";

  if (sent) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-gold/15">
          <MailCheck className="h-8 w-8 text-gold" />
        </div>
        <h1 className="font-display text-2xl font-extrabold">Lien envoyé</h1>
        <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
          Si un compte existe pour cet email, tu recevras un lien pour réinitialiser ton mot de passe.
        </p>
        <Link href="/auth/login" className="mt-6 text-[13px] font-semibold text-gold">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Entre ton email et on t'enverra un lien de réinitialisation."
      footer={
        <Link href="/auth/login" className="font-semibold text-gold">
          Retour à la connexion
        </Link>
      }
    >
      <ForgotForm />
    </AuthShell>
  );
}
