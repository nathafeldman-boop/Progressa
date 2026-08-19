"use client";

import { Button } from "@/components/ui/Button";
import { trackClick } from "@/lib/analytics/track";
import { getOrCreateAnonId } from "@/lib/onboarding/storage";

export function ShareCardButton({ shareSlug, firstName }: { shareSlug: string; firstName: string }) {
  async function share() {
    trackClick(getOrCreateAnonId(), "share_player_card");
    const url = `${window.location.origin}/carte/${shareSlug}`;
    if (navigator.share) {
      try {
        await navigator.share({ url, title: `Carte joueur de ${firstName}` });
        return;
      } catch {
        // annulé — pas grave
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // silencieux
    }
  }

  return (
    <Button className="w-full" onClick={share}>
      Partager ma carte
    </Button>
  );
}
