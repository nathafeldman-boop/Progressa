"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible (permissions navigateur) — le lien reste affiché et sélectionnable à la main.
    }
  }

  return (
    <Button variant="secondary" className="w-full" onClick={copy}>
      {copied ? "Copié ✓" : "Copier le lien"}
    </Button>
  );
}
