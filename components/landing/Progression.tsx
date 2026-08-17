import { Reveal, AnimatedNumber } from "./reveal";

const TIMELINE = [
  { day: "Jour 1", overall: 68 },
  { day: "Jour 7", overall: 71 },
  { day: "Jour 14", overall: 74 },
  { day: "Jour 30", overall: 78 },
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

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
