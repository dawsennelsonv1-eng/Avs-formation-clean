import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui-button";

export default function ConfirmPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-gold/15">
        <MailCheck className="h-8 w-8 text-gold" />
      </div>
      <h1 className="font-display text-2xl font-extrabold">Vérifie ton email</h1>
      <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
        On t'a envoyé un lien de confirmation. Clique dessus pour activer ton compte, puis connecte-toi.
      </p>
      <Button asChild variant="secondary" className="mt-6">
        <Link href="/auth/login">Aller à la connexion</Link>
      </Button>
    </div>
  );
}
