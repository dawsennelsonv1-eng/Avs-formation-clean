"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui-button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-destructive/15">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="font-display text-xl font-extrabold">Une erreur est survenue</h1>
      <p className="mx-auto mt-2 max-w-xs text-[13px] text-muted-foreground">
        Quelque chose s'est mal passé. Réessaie.
      </p>
      <Button className="mt-5" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}
