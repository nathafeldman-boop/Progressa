import Link from "next/link";
import { MonetagInPagePush } from "@/components/ads/MonetagInPagePush";

/**
 * Bloc pub gratuit complet: la bannière Monetag + un rappel explicite
 * juste à côté ("pourquoi tu vois ça, ce que Premium change" — section 8
 * du cahier des charges: jamais de pub sans que le joueur comprenne le
 * lien avec Premium). Toujours utilisés ensemble, jamais l'un sans l'autre.
 */
export function FreeTierAdSlot() {
  return (
    <div className="mt-3">
      <Link
        href="/paywall"
        className="flex items-center justify-between gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3.5 py-2.5"
      >
        <p className="text-[12.5px] leading-[1.4] text-[var(--color-text)]">
          <b>Envie de zéro pub ?</b> Passe Premium.
        </p>
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary-strong)]">
          Débloquer →
        </span>
      </Link>
      <MonetagInPagePush />
    </div>
  );
}
