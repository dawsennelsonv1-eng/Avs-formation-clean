import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Modifier le profil" };

export default async function EditProfilePage() {
  const user = await getCurrentUser();
  return (
    <div className="animate-fade-up px-4 pt-4">
      <Link href="/profile" className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted-foreground">
        <ChevronLeft className="h-4 w-4" /> Profil
      </Link>
      <h1 className="font-display text-2xl font-extrabold">Modifier le profil</h1>
      <div className="mt-5 grid gap-3">
        <Field label="Nom" value={user?.fullName ?? "—"} />
        <Field label="Email" value={user?.email ?? "—"} />
        <Field label="WhatsApp" value={user?.whatsapp ?? "Non renseigné"} />
      </div>
      <p className="mt-4 text-[12px] text-muted-foreground">
        {user ? "L'édition en ligne arrive bientôt. Contacte le support pour modifier tes infos." : "Connecte-toi pour gérer ton profil."}
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}
