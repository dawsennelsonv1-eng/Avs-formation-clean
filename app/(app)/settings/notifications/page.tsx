import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NotificationToggles } from "@/components/profile-notification-toggles";

export const metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <div className="animate-fade-up px-4 pt-4">
      <Link href="/profile" className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted-foreground">
        <ChevronLeft className="h-4 w-4" /> Profil
      </Link>
      <h1 className="font-display text-2xl font-extrabold">Notifications</h1>
      <p className="mb-5 mt-1 text-[12px] text-muted-foreground">Choisis ce que tu veux recevoir.</p>
      <NotificationToggles />
    </div>
  );
}
