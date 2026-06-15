import Link from "next/link";
import { ChevronLeft, MessageCircle, Mail } from "lucide-react";

export const metadata = { title: "Aide & support" };

export default function SupportPage() {
  return (
    <div className="animate-fade-up px-4 pt-4">
      <Link href="/profile" className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted-foreground">
        <ChevronLeft className="h-4 w-4" /> Profil
      </Link>
      <h1 className="font-display text-2xl font-extrabold">Aide & support</h1>
      <p className="mb-5 mt-1 text-[12px] text-muted-foreground">Une question ? On est là pour t'aider.</p>
      <div className="grid gap-3">
        <a href="https://wa.me/50900000000" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15"><MessageCircle className="h-5 w-5 text-emerald-400" /></span>
          <div>
            <div className="text-sm font-bold">WhatsApp</div>
            <div className="text-[12px] text-muted-foreground">Réponse rapide</div>
          </div>
        </a>
        <a href="mailto:support@avsformation.com" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/15"><Mail className="h-5 w-5 text-sky-400" /></span>
          <div>
            <div className="text-sm font-bold">Email</div>
            <div className="text-[12px] text-muted-foreground">support@avsformation.com</div>
          </div>
        </a>
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground">Remplace ces coordonnées par les tiennes dans le code avant le lancement.</p>
    </div>
  );
}
