import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PAYMENT } from "@/config/site";

export const metadata = { title: "Moyens de paiement" };

export default function PaymentSettingsPage() {
  return (
    <div className="animate-fade-up px-4 pt-4">
      <Link href="/profile" className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted-foreground">
        <ChevronLeft className="h-4 w-4" /> Profil
      </Link>
      <h1 className="font-display text-2xl font-extrabold">Moyens de paiement</h1>
      <p className="mb-5 mt-1 text-[12px] text-muted-foreground">Les paiements se font via MonCash ou NatCash lors de l'achat d'une formation.</p>
      <div className="grid gap-3">
        {([PAYMENT.moncash, PAYMENT.natcash]).map((m) => (
          <div key={m.label} className="rounded-2xl border border-border bg-card p-4">
            <div className="text-sm font-bold" style={{ color: m.color }}>{m.label}</div>
            <div className="mt-1 text-[12px] text-muted-foreground">Numéro du marchand : {m.phone}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
