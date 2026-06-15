import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-auth-shell";
import { LoginForm } from "@/components/auth-login-form";
import { createClient } from "@/lib/supabase-server";

export default async function LoginPage({ searchParams }: { searchParams: { error?: string; next?: string } }) {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/profile");
  }
  return (
    <AuthShell
      title="Content de te revoir"
      subtitle="Connecte-toi pour accéder à tes formations et ta progression."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/auth/signup" className="font-semibold text-gold">
            S'inscrire
          </Link>
        </>
      }
    >
      <LoginForm urlError={searchParams.error} next={searchParams.next} />
    </AuthShell>
  );
}
