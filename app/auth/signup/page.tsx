import Link from "next/link";
import { AuthShell } from "@/components/auth-auth-shell";
import { SignupForm } from "@/components/auth-signup-form";

export default function SignupPage() {
  return (
    <AuthShell
      title="Crée ton compte"
      subtitle="Sauvegarde ta progression, tes quiz et tes formations débloquées."
      footer={
        <>
          Déjà inscrit ?{" "}
          <Link href="/auth/login" className="font-semibold text-gold">
            Se connecter
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
