import Link from "next/link";
import { ChevronLeft, Shield } from "lucide-react";
import { requireAdmin } from "@/lib/admin-guard";
import { AdminNav } from "@/components/admin-admin-nav";

export const metadata = { title: "Admin — AVS Formation" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="app-mesh mx-auto min-h-screen w-full max-w-[440px] overflow-x-hidden px-4 pb-16 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 text-[13px] text-muted-foreground">
          <ChevronLeft className="h-4 w-4" /> Quitter
        </Link>
        <div className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[11px] font-bold text-gold">
          <Shield className="h-3.5 w-3.5" /> Admin · {admin.fullName.split(" ")[0]}
        </div>
      </div>
      <AdminNav />
      {children}
    </div>
  );
}
