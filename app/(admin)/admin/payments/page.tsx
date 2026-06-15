import { adminPayments } from "@/lib/admin-tables";
import { PaymentsTable } from "@/components/admin-payments-table";

export default async function AdminPaymentsPage() {
  const rows = await adminPayments();
  return (
    <div className="animate-fade-up">
      <h1 className="mb-1 font-display text-[22px] font-extrabold">Paiements</h1>
      <p className="mb-4 text-[12px] text-muted-foreground">Vérifie et accorde manuellement les paiements en attente.</p>
      <PaymentsTable rows={rows} />
    </div>
  );
}
