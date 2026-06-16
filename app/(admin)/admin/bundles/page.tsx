import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { Button } from "@/components/ui-button";
import { getBundles } from "@/lib/bundles";
import { formatHTG } from "@/lib/utils";

export default async function AdminBundlesPage() {
  const bundles = await getBundles();
  return (
    <div className="animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-[22px] font-extrabold">Offres groupées</h1>
        <Button asChild size="sm">
          <Link href="/admin/bundles/new"><Plus className="h-4 w-4" /> Nouvelle</Link>
        </Button>
      </div>
      <div className="grid gap-2.5">
        {bundles.map((b) => (
          <Link key={b.id} href={`/admin/bundles/${b.id}`} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <div className="h-12 w-12 shrink-0 rounded-xl" style={{ backgroundImage: `linear-gradient(150deg, ${b.color}, #0c0f17)` }} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 truncate text-[14px] font-bold">
                {b.title}
                {b.featured && <Star className="h-3.5 w-3.5 shrink-0 text-gold" fill="#E8B84B" />}
              </div>
              <div className="text-[11px] text-muted-foreground">{b.count} formations · {formatHTG(b.price)}</div>
            </div>
          </Link>
        ))}
        {bundles.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-4 text-center text-[12px] text-muted-foreground">
            Aucune offre groupée. Crée-en une pour l'afficher sur l'accueil.
          </p>
        )}
      </div>
    </div>
  );
}
