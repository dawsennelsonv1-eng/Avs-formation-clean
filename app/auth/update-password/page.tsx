import { AuthShell } from "@/components/auth-auth-shell";
import { UpdatePasswordForm } from "@/components/auth-update-password-form";

export default function UpdatePasswordPage() {
  return (
    <AuthShell
      title="Nouveau mot de passe"
      subtitle="Choisis un nouveau mot de passe pour ton compte."
      footer={null}
    >
      <UpdatePasswordForm />
    </AuthShell>
  );
}
