import { adminUsers } from "@/lib/admin-tables";
import { UsersTable } from "@/components/admin-users-table";

export default async function AdminUsersPage() {
  const rows = await adminUsers();
  return (
    <div className="animate-fade-up">
      <h1 className="mb-1 font-display text-[22px] font-extrabold">Utilisateurs</h1>
      <p className="mb-4 text-[12px] text-muted-foreground">Gère les comptes et les rôles d'administrateur.</p>
      <UsersTable rows={rows} />
    </div>
  );
}
