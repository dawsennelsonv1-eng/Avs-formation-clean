import { adminUsers } from "@/lib/admin-tables";
import { adminListCourses } from "@/lib/admin-courses";
import { getBundles } from "@/lib/bundles";
import { UsersTable } from "@/components/admin-users-table";

export default async function AdminUsersPage() {
  const [rows, courses, bundles] = await Promise.all([adminUsers(), adminListCourses(), getBundles()]);
  return (
    <div className="animate-fade-up">
      <h1 className="mb-1 font-display text-[22px] font-extrabold">Utilisateurs</h1>
      <p className="mb-4 text-[12px] text-muted-foreground">Cherche un utilisateur, gère les rôles, accorde des accès.</p>
      <UsersTable rows={rows} courses={courses} bundles={bundles} />
    </div>
  );
}
