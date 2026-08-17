import { Reveal } from "./reveal";

const STEPS = [
  { n: "01", emoji: "🧑‍💼", title: "Crée ton joueur" },
  { n: "02", emoji: "🏃", title: "Fais ton premier entraînement" },
  { n: "03", emoji: "📈", title: "Gagne des stats" },
  { n: "04", emoji: "🃏", title: "Fais évoluer ta carte" },
];

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="lp-section relative scroll-mt-16">
      <div className="lp-container">
        <Reveal className="mx-auto max-w-lg text-center">
          <span className="lp-eyebrow justify-center">📋 Comment ça marche</span>
          <h2 className="lp-h2 mt-3">Quatre étapes. Zéro friction.</h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delayMs={i * 90}>
              <div className="lp-card flex h-full flex-col items-center gap-2 p-6 text-center">
                <span className="font-display text-3xl font-extrabold text-[var(--lp-accent-soft)]" aria-hidden>
                  {step.n}
                </span>
                <span className="text-3xl" aria-hidden>
                  {step.emoji}
                </span>
                <p className="font-display text-base font-bold uppercase tracking-wide">{step.title}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
