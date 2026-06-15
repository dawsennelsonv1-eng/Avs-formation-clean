"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Home, LayoutGrid, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDict } from "@/config/i18n";

export function BottomNav() {
  const pathname = usePathname();
  const d = getDict();

  const items = [
    { href: "/", label: d.nav.home, icon: Home },
    { href: "/courses", label: d.nav.courses, icon: LayoutGrid },
    { href: "/learning", label: d.nav.learning, icon: GraduationCap },
    { href: "/profile", label: d.nav.profile, icon: User },
  ];

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-[440px] border-t border-border px-2 pb-3.5 pt-2">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-1 transition-colors",
              active ? "text-gold" : "text-muted-foreground"
            )}
          >
            <Icon
              className="h-[22px] w-[22px]"
              strokeWidth={active ? 2.2 : 1.8}
              fill={active ? "currentColor" : "none"}
            />
            <span className={cn("text-[10px]", active ? "font-bold" : "font-medium")}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
