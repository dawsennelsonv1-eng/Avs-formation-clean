"use client";

import { useFormState } from "react-dom";
import { signup, type AuthResult } from "@/app/auth/actions";
import { Input } from "@/components/ui-input";
import { SubmitButton } from "@/components/auth-submit-button";
import { GoogleButton } from "@/components/auth-google-button";
import { OrDivider } from "@/components/auth-divider";

export function SignupForm() {
  const [state, formAction] = useFormState<AuthResult, FormData>(signup, {});
  return (
    <div>
      <GoogleButton />
      <OrDivider />
      <form action={formAction} className="grid gap-3">
      <Input name="fullName" placeholder="Nom complet" autoComplete="name" required />
      <Input name="whatsapp" placeholder="Numéro WhatsApp (optionnel)" inputMode="tel" autoComplete="tel" />
      <Input name="email" type="email" placeholder="Email" autoComplete="email" required />
      <Input name="password" type="password" placeholder="Mot de passe (6+ caractères)" autoComplete="new-password" required />
      {state.error && <p className="text-[12px] text-destructive">{state.error}</p>}
      <div className="mt-1">
        <SubmitButton>Créer mon compte</SubmitButton>
      </div>
      </form>
    </div>
  );
}