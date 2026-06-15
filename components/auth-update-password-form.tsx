"use client";

import { useFormState } from "react-dom";
import { updatePassword, type AuthResult } from "@/app/auth/actions";
import { Input } from "@/components/ui-input";
import { SubmitButton } from "@/components/auth-submit-button";

export function UpdatePasswordForm() {
  const [state, formAction] = useFormState<AuthResult, FormData>(updatePassword, {});
  return (
    <form action={formAction} className="grid gap-3">
      <Input name="password" type="password" placeholder="Nouveau mot de passe" autoComplete="new-password" required />
      <Input name="confirm" type="password" placeholder="Confirme le mot de passe" autoComplete="new-password" required />
      {state.error && <p className="text-[12px] text-destructive">{state.error}</p>}
      <div className="mt-1">
        <SubmitButton>Mettre à jour</SubmitButton>
      </div>
    </form>
  );
}
