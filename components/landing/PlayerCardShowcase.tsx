import { Reveal, AnimatedNumber } from "./reveal";

const STATS = [
  { label: "Vitesse", value: 74 },
  { label: "Tir", value: 61 },
  { label: "Passe", value: 67 },
  { label: "Dribble", value: 78 },
  { label: "Défense", value: 54 },
  { label: "Physique", value: 69 },
];

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
          <div className="lp-card relative overflow-hidden border-2 border-[var(--lp-accent-soft)] p-6 shadow-[0_30px_70px_-30px_rgba(53,214,124,0.4)]">
            <div className="lp-glow-ring" style={{ width: 220, height: 220, top: -80, right: -80 }} />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--lp-text-dim)]">
                  Carte de départ
                </p>
                <p className="font-display text-sm font-bold uppercase tracking-wide text-[var(--lp-text-muted)]">
                  Milieu offensif
                </p>
              </div>
              <span className="lp-card rounded-full px-3 py-1 text-xs font-bold text-[var(--lp-accent-strong)]">
                U16
              </span>
            </div>

            <div className="relative mt-3 flex items-baseline gap-2">
              <AnimatedNumber
                value={68}
                className="font-display text-6xl font-extrabold text-[var(--lp-text)]"
              />
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--lp-text-dim)]">Overall</span>
            </div>

            <div className="relative mt-6 flex flex-col gap-3">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wide text-[var(--lp-text-muted)]">
                    {stat.label}
                  </span>
                  <div className="lp-bar-track flex-1" style={{ ["--bar-w" as string]: `${stat.value}%` }}>
                    <div className="lp-bar-fill" />
                  </div>
                  <span className="w-7 text-right text-xs font-bold text-[var(--lp-text)]">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
