import { Reveal } from "./reveal";

export function ShareSection() {
  return (
    <section className="lp-section relative overflow-hidden">
      <div className="lp-glow-ring" style={{ width: 380, height: 380, top: -100, right: -100 }} />

      <div className="lp-container relative grid gap-10 md:grid-cols-2 md:items-center">
        <Reveal className="flex flex-col gap-4">
          <span className="lp-eyebrow">📤 Partage</span>
          <h2 className="lp-h2">Montre où tu en es.</h2>
          <p className="max-w-md text-[var(--lp-text-muted)]">
            Ta carte évolue à chaque semaine — partage-la à tes coéquipiers, ton coach ou tes proches, et montre ta
            progression au fil du temps.
          </p>
        </Reveal>

        <Reveal delayMs={100} className="mx-auto w-full max-w-xs">
          <div className="lp-card flex flex-col items-center gap-4 p-6 text-center">
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--lp-text-dim)]">
              Overall
            </span>
            <span className="font-display text-6xl font-extrabold text-[var(--lp-accent-strong)]">72</span>
            <span className="lp-btn-secondary w-full cursor-default select-none">📤 Partager ma carte</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
