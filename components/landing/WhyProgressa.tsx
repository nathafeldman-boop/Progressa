import { Reveal } from "./reveal";
import { APP_NAME } from "@/lib/app-config";

const ITEMS = ["Programme structuré", "Objectifs", "Suivi", "Statistiques", "Carte joueur", "Coach Brian", "Progression quotidienne"];

export function WhyProgressa() {
  return (
    <section className="lp-section relative">
      <div className="lp-container">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="lp-eyebrow justify-center">🤔 Pourquoi {APP_NAME} ?</span>
          <h2 className="lp-h2 mt-3">Des exercices, tu peux en trouver partout.</h2>
          <p className="mt-3 text-[var(--lp-text-muted)]">
            Le problème, c&apos;est de savoir lesquels faire, quand les faire, et comment mesurer tes progrès.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Reveal>
            <div className="lp-card flex h-full flex-col gap-3 p-6 opacity-70">
              <p className="font-display text-sm font-bold uppercase tracking-wide text-[var(--lp-text-muted)]">
                Exercices seuls
              </p>
              <ul className="flex flex-col gap-2 text-sm text-[var(--lp-text-dim)]">
                {ITEMS.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span aria-hidden>✗</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delayMs={100}>
            <div className="lp-card flex h-full flex-col gap-3 border-2 border-[var(--lp-accent-soft)] p-6">
              <p className="font-display text-sm font-bold uppercase tracking-wide text-[var(--lp-accent-strong)]">
                Ton parcours {APP_NAME}
              </p>
              <ul className="flex flex-col gap-2 text-sm text-[var(--lp-text)]">
                {ITEMS.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-[var(--lp-accent-strong)]" aria-hidden>
                      ✓
                    </span>{" "}
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
