"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { BrianAvatar } from "@/components/brian/BrianAvatar";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app] uncaught error", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <BrianAvatar state="surprised" size={72} />
      <h1 className="font-display text-xl font-extrabold uppercase tracking-wide">Un problème est survenu</h1>
      <p className="max-w-sm text-sm text-[var(--color-text-muted)]">
        Quelque chose s&apos;est mal passé de notre côté. Réessaie — si ça continue, reviens un peu plus tard.
      </p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
