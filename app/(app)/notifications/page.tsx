import Link from "next/link";
import { Bell, ChevronLeft } from "lucide-react";

export const metadata = { title: "Notifications — AVS Formation" };

export default function NotificationsPage() {
  return (
    <div className="animate-fade-up px-4 pt-4">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted-foreground">
        <ChevronLeft className="h-4 w-4" /> Retour
      </Link>
      <h1 className="font-display text-2xl font-extrabold">Notifications</h1>

      <div className="mt-10 flex flex-col items-center text-center">
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-card">
          <Bell className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold">Aucune notification</p>
        <p className="mx-auto mt-1.5 max-w-xs text-[13px] text-muted-foreground">
          Tes annonces, offres et rappels de formation apparaîtront ici.
        </p>
      </div>
    </div>
  );
}
