"use client";

import Link from "next/link";

export interface TestimonialItem {
  id: string;
  name: string;
  rating: number;
  text: string;
}

/**
 * Défilement horizontal continu (façon bandeau), rapide sur mobile — pas
 * un carrousel qui avance case par case. La liste est dupliquée pour
 * boucler sans à-coup ; la durée d'animation s'adapte au nombre d'avis
 * pour garder une vitesse de défilement constante quel que soit leur
 * nombre.
 */
export function TestimonialsCarousel({ items }: { items: TestimonialItem[] }) {
  if (items.length === 0) return null;

  const looped = [...items, ...items];
  const durationSeconds = Math.max(14, items.length * 4);

  return (
    <section className="lp-section">
      <div className="lp-container">
        <span className="lp-eyebrow">Ils progressent avec Coach Brian</span>
        <h2 className="lp-h2 mt-2">Ce qu&apos;en disent les joueurs</h2>
      </div>

      <div className="mt-6 overflow-hidden">
        <div className="lp-reviews-track" style={{ animationDuration: `${durationSeconds}s` }}>
          {looped.map((t, i) => (
            <div key={`${t.id}-${i}`} className="lp-reviews-card px-2">
              <div className="h-full rounded-[1.25rem] border border-[var(--lp-border)] bg-[var(--lp-surface)] p-4 shadow-[0_10px_30px_-18px_rgba(16,35,26,0.25)]">
                <p className="text-sm text-[var(--lp-accent)]">{"⭐".repeat(t.rating)}</p>
                <p className="mt-2 text-sm leading-snug text-[var(--lp-text)]">{t.text}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--lp-text-dim)]">{t.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lp-container mt-4 text-center">
        <Link href="/avis" className="text-sm font-semibold text-[var(--lp-accent)] underline">
          Voir tous les avis, ou laisser le tien
        </Link>
      </div>
    </section>
  );
}
