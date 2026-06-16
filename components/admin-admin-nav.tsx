"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, CalendarClock, CreditCard, LayoutDashboard, Layers, MessageSquare, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/courses", label: "Formations", icon: BookOpen },
  { href: "/admin/bundles", label: "Offres groupées", icon: Layers },
  { href: "/admin/events", label: "Évènements", icon: CalendarClock },
  { href: "/admin/payments", label: "Paiements", icon: CreditCard },
  { href: "/admin/reviews", label: "Avis", icon: MessageSquare },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4">
      {ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-colors",
              active ? "border-gold bg-gold text-[#1a1208]" : "border-border bg-card text-muted-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
