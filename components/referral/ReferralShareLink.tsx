"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function ReferralShareLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/r/${code}` : `/r/${code}`;

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ url, title: "Rejoins-moi sur Progressa" });
        return;
      } catch {
        // annulé ou non supporté — on retombe sur la copie du lien
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silencieux
    }
  }

  return (
    <div className="mt-4 flex items-center gap-2">
      <code className="flex-1 truncate rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-sm">
        {url}
      </code>
      <Button onClick={share}>{copied ? "Copié !" : "Partager"}</Button>
    </div>
  );
}
