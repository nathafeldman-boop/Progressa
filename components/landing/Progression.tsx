import { Reveal, AnimatedNumber } from "./reveal";

const TIMELINE = [
  { day: "Jour 1", overall: 68 },
  { day: "Jour 7", overall: 71 },
  { day: "Jour 14", overall: 74 },
  { day: "Jour 30", overall: 78 },
];

const FINAL_STATS = [
  { label: "Vitesse", value: 82 },
  { label: "Tir", value: 74 },
  { label: "Passe", value: 79 },
  { label: "Dribble", value: 85 },
  { label: "Défense", value: 68 },
  { label: "Physique", value: 77 },
];

export function Progression() {
  return (
    <section className="lp-section relative overflow-hidden">
      <div className="lp-glow-ring" style={{ width: 500, height: 500, top: "10%", left: "50%", transform: "translateX(-50%)" }} />

      <div className="lp-container relative">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="lp-eyebrow justify-center">📅 Progression</span>
          <h2 className="lp-h2 mt-3">Imagine ta carte dans 30 jours.</h2>
          <p className="mt-3 text-[var(--lp-text-muted)]">
            Un exemple de progression pour un joueur qui enchaîne ses séances chaque semaine — pas une promesse, un
            objectif à te fixer.
          </p>
        </Reveal>

        <div className="lp-progress-card-wrap">
          <Reveal delayMs={80} className="lp-progress-card">
            <div
              aria-hidden
              className="lp-card relative overflow-hidden border-2 border-[var(--lp-accent-soft)] p-5 text-left shadow-[0_24px_50px_-24px_rgba(26,163,80,0.35)]"
            >
              <div className="lp-glow-ring" style={{ width: 160, height: 160, top: -60, right: -60 }} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-widest text-[var(--lp-text-dim)]">
                    Carte à J+30
                  </p>
                  <p className="font-display text-xs font-bold uppercase tracking-wide text-[var(--lp-text-muted)]">
                    Milieu offensif
                  </p>
                </div>
                <span className="lp-card rounded-full px-2.5 py-1 text-[0.65rem] font-bold text-[var(--lp-accent-strong)]">
                  U16
                </span>
              </div>

              <div className="relative mt-2 flex items-baseline gap-2">
                <span className="font-display text-5xl font-extrabold text-[var(--lp-text)]">78</span>
                <span className="text-[0.6rem] font-bold uppercase tracking-widest text-[var(--lp-text-dim)]">
                  Overall
                </span>
              </div>

              <div className="relative mt-4 flex flex-col gap-2">
                {FINAL_STATS.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <span className="w-14 shrink-0 text-[0.6rem] font-semibold uppercase tracking-wide text-[var(--lp-text-muted)]">
                      {stat.label}
                    </span>
                    <div className="lp-bar-track flex-1" style={{ ["--bar-w" as string]: `${stat.value}%` }}>
                      <div className="lp-bar-fill" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 md:mt-0">
          {TIMELINE.map((point, i) => (
            <Reveal key={point.day} delayMs={i * 100} className="relative">
              <div className="lp-card flex flex-col items-center gap-1.5 p-5 text-center">
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--lp-text-dim)]">
                  {point.day}
                </span>
                <AnimatedNumber
                  value={point.overall}
                  className="font-display text-3xl font-extrabold text-[var(--lp-accent-strong)] sm:text-4xl"
                />
                <span className="text-[0.65rem] uppercase tracking-widest text-[var(--lp-text-dim)]">Overall</span>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-[var(--lp-text-dim)]">
          Exemple illustratif basé sur un rythme régulier d&apos;entraînement. Ta progression réelle dépend de ton
          niveau de départ et de ton assiduité.
        </p>
      </div>
    </section>
  );
}
