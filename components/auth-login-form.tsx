"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { login, type AuthResult } from "@/app/auth/actions";
import { Input } from "@/components/ui-input";
import { SubmitButton } from "@/components/auth-submit-button";
import { GoogleButton } from "@/components/auth-google-button";
import { OrDivider } from "@/components/auth-divider";

export function LoginForm({ urlError, next }: { urlError?: string; next?: string }) {
  const [state, formAction] = useFormState<AuthResult, FormData>(login, {});
  return (
    <div>
      <GoogleButton />
      <OrDivider />
      <form action={formAction} className="grid gap-3">
      <input type="hidden" name="next" value={next ?? "/profile"} />
      <Input name="email" type="email" placeholder="Email" autoComplete="email" required />
      <Input name="password" type="password" placeholder="Mot de passe" autoComplete="current-password" required />
      <Link href="/auth/forgot-password" className="-mt-1 text-right text-[12px] text-gold">
        Mot de passe oublié ?
      </Link>
      {(state.error || urlError) && <p className="text-[12px] text-destructive">{state.error || urlError}</p>}
      <div className="mt-1">
        <SubmitButton>Se connecter</SubmitButton>
      </div>
      <Link href="/" className="mt-1 text-center text-[12px] text-muted-foreground hover:text-foreground">
        Continuer sans compte
      </Link>
      </form>
    </div>
  );
}