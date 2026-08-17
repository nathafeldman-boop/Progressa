import { Reveal } from "./reveal";

export function Gamification() {
  return (
    <section className="lp-section relative">
      <div className="lp-container">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="lp-eyebrow justify-center">🏆 Mode carrière</span>
          <h2 className="lp-h2 mt-3">Chaque jour fait avancer ton dossard.</h2>
          <p className="mt-3 text-[var(--lp-text-muted)]">
            Objectifs quotidiens, séries de jours, niveaux et classement — ta progression se joue comme une vraie
            carrière, pas comme une checklist.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Reveal>
            <div className="lp-card flex h-full flex-col gap-3 p-6">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--lp-text-dim)]">
                Objectif du jour
              </span>
              <div className="flex flex-col gap-1">
                <span className="font-display text-2xl font-extrabold text-[var(--lp-accent-strong)]">
                  +2 Vitesse
                </span>
                <span className="font-display text-lg font-bold text-[var(--lp-text-muted)]">+1 Contrôle</span>
              </div>
            </div>
          </Reveal>

          <Reveal delayMs={100}>
            <div className="lp-card flex h-full flex-col gap-3 p-6">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--lp-text-dim)]">
                Série
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-extrabold">7</span>
                <span className="font-display text-sm font-bold uppercase tracking-wide text-[var(--lp-text-muted)]">
                  jours
                </span>
                <span aria-hidden>🔥</span>
              </div>
            </div>
          </Reveal>

          <Reveal delayMs={200}>
            <div className="lp-card flex h-full flex-col gap-3 p-6">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--lp-text-dim)]">
                Classement
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold">#124</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
