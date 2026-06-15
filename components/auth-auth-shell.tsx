import Link from "next/link";
import { SITE } from "@/config/site";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col justify-center px-5 py-8">
      <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-gold to-gold-deep font-display text-xl font-extrabold text-[#1a1208] shadow-lg shadow-gold/25">
          {SITE.brandLetter}
        </div>
        <div className="font-display text-xl font-extrabold tracking-tight">
          AVS <span className="text-gold">Formation</span>
        </div>
      </Link>

      <div className="mx-auto w-full max-w-sm">
        <h1 className="font-display text-2xl font-extrabold">{title}</h1>
        <p className="mb-6 mt-1.5 text-[13px] text-muted-foreground">{subtitle}</p>
        {children}
        <div className="mt-6 text-center text-[13px] text-muted-foreground">{footer}</div>
      </div>
    </div>
  );
}
