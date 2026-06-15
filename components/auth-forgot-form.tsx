"use client";

import { useFormState } from "react-dom";
import { requestPasswordReset, type AuthResult } from "@/app/auth/actions";
import { Input } from "@/components/ui-input";
import { SubmitButton } from "@/components/auth-submit-button";

export function ForgotForm() {
  const [state, formAction] = useFormState<AuthResult, FormData>(requestPasswordReset, {});
  return (
    <form action={formAction} className="grid gap-3">
      <Input name="email" type="email" placeholder="Ton email" autoComplete="email" required />
      {state.error && <p className="text-[12px] text-destructive">{state.error}</p>}
      <div className="mt-1">
        <SubmitButton>Envoyer le lien</SubmitButton>
      </div>
    </form>
  );
}
