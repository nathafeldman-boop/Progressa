import { Reveal } from "./reveal";
import { PlayerCardView } from "@/components/card/PlayerCardView";

/**
 * Carte de démonstration — mêmes composant et styles de rang que la vraie
 * carte joueur de l'app (components/card/PlayerCardView.tsx), pour que la
 * LP montre le vrai visuel plutôt qu'une maquette approximative.
 */
const DEMO_STATS = {
  overall: 68,
  skills: { Vitesse: 74, Tir: 61, Passe: 67, Dribble: 78, Défense: 54, Physique: 69 },
  rankTier: "Espoir",
  rankKey: "espoir",
  lastUpdated: new Date().toISOString(),
};

const MILESTONES = [
  { week: "Semaine 1", overall: 68 },
  { week: "Semaine 2", overall: 72 },
  { week: "Semaine 4", overall: 76 },
];

export function PlayerCardShowcase() {
  return (
    <section className="lp-section relative">
      <div className="lp-container grid gap-12 md:grid-cols-[1fr_1.1fr] md:items-center">
        <Reveal className="flex flex-col gap-5">
          <span className="lp-eyebrow">🃏 Carte joueur</span>
          <h2 className="lp-h2">Ton joueur évolue avec toi.</h2>
          <p className="max-w-md text-[var(--lp-text-muted)]">
            Chaque entraînement complété, chaque test réussi met à jour tes statistiques. Ta carte n&apos;est pas un
            trophée figé — c&apos;est ton reflet, semaine après semaine.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {MILESTONES.map((m, i) => (
              <div key={m.week} className="flex items-center gap-2">
                <div className="lp-card flex flex-col items-center gap-0.5 px-4 py-2">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-[var(--lp-text-dim)]">
                    {m.week}
                  </span>
                  <span className="font-display text-xl font-extrabold text-[var(--lp-accent-strong)]">
                    {m.overall}
                  </span>
                </div>
                {i < MILESTONES.length - 1 && (
                  <span className="text-[var(--lp-text-dim)]" aria-hidden>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delayMs={120} className="mx-auto w-full max-w-sm">
          <PlayerCardView
            firstName="Toi"
            positionLabel="Milieu offensif"
            ageCategoryLabel="U16"
            stats={DEMO_STATS}
          />
        </Reveal>
      </div>
    </section>
  );
}
