import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui-button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-gold/15">
        <Compass className="h-8 w-8 text-gold" />
      </div>
      <h1 className="font-display text-xl font-extrabold">Page introuvable</h1>
      <p className="mx-auto mt-2 max-w-xs text-[13px] text-muted-foreground">
        Cette page n'existe pas ou a été déplacée.
      </p>
      <Button asChild className="mt-5">
        <Link href="/">Retour à l'accueil</Link>
      </Button>
    </div>
  );
}
