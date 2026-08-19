import { Reveal, AnimatedNumber } from "./reveal";
import { ExerciseChipDemo } from "./ExerciseChipDemo";

const FLOW = [
  { emoji: null, label: "Exercice" },
  { emoji: "⏱️", label: "Performance" },
  { emoji: "📊", label: "Stats" },
  { emoji: null, label: "Carte" },
];

const DELTAS = [
  { label: "Vitesse", delta: "+2" },
  { label: "Dribble", delta: "+3" },
  { label: "Endurance", delta: "+1" },
];

export function FirstTraining() {
  return (
    <section className="lp-section lp-section-alt relative">
      <div className="lp-container grid gap-12 md:grid-cols-2 md:items-center">
        <Reveal className="flex flex-col gap-5">
          <span className="lp-eyebrow">Premier entraînement</span>
          <h2 className="lp-h2">Commence par nous montrer ce que tu sais faire.</h2>
          <p className="max-w-md text-[var(--lp-text-muted)]">
            Ton premier exercice, gratuit, sert de point de départ : il pose les toutes premières statistiques de ta
            carte joueur. Rien à préparer — juste toi et un ballon.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {FLOW.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <span className="lp-card flex items-center gap-2 px-3 py-2 text-sm font-semibold">
                  {step.label === "Exercice" ? (
                    <ExerciseChipDemo />
                  ) : step.label === "Carte" ? (
                    <span aria-hidden className="h-4 w-3 shrink-0 rounded-sm bg-[var(--lp-accent)]" />
                  ) : (
                    <span aria-hidden>{step.emoji}</span>
                  )}
                  {step.label}
                </span>
                {i < FLOW.length - 1 && (
                  <span className="text-[var(--lp-text-dim)]" aria-hidden>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delayMs={120} className="mx-auto w-full max-w-sm">
          <div className="lp-card p-6">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--lp-text-dim)]">
              Résultat de ta première séance
            </p>
            <div className="mt-4 flex flex-col gap-2.5">
              {DELTAS.map((d) => (
                <div key={d.label} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--lp-text-muted)]">{d.label}</span>
                  <span className="font-display text-lg font-extrabold text-[var(--lp-accent-strong)]">
                    {d.delta}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[var(--lp-border)] pt-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--lp-text-dim)]">Overall</span>
              <div className="flex items-center gap-2 font-display text-2xl font-extrabold">
                <span className="text-[var(--lp-text-dim)]">68</span>
                <span className="text-[var(--lp-text-dim)]" aria-hidden>
                  →
                </span>
                <AnimatedNumber value={69} className="text-[var(--lp-accent-strong)]" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
