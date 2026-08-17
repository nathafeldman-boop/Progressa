import { Reveal } from "./reveal";
import { PhoneCarousel } from "./PhoneCarousel";

const STREAK_DAYS = 7;

const SCREENS = [
  {
    key: "objectif",
    label: "Objectif du jour",
    content: (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-display text-2xl font-extrabold text-[var(--lp-accent-strong)]">+2 Vitesse</span>
          <span className="font-display text-lg font-bold text-[var(--lp-text-muted)]">+1 Contrôle</span>
        </div>
        <div className="lp-bar-track lp-visible" style={{ ["--bar-w" as string]: "60%" }}>
          <div className="lp-bar-fill" />
        </div>
      </div>
    ),
  },
  {
    key: "serie",
    label: "Série",
    content: (
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-extrabold text-[var(--lp-text)]">{STREAK_DAYS}</span>
          <span className="font-display text-sm font-bold uppercase tracking-wide text-[var(--lp-text-muted)]">
            jours
          </span>
          <span aria-hidden>🔥</span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: STREAK_DAYS }).map((_, i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-[var(--lp-accent)]" />
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "classement",
    label: "Classement",
    content: (
      <div className="flex flex-col gap-1.5">
        <span className="font-display text-4xl font-extrabold text-[var(--lp-text)]">#124</span>
        <span className="text-xs font-bold text-[var(--lp-accent-strong)]">▲ +12 cette semaine</span>
      </div>
    ),
  },
];

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

        <Reveal delayMs={100} className="mt-12">
          <PhoneCarousel screens={SCREENS} />
        </Reveal>
      </div>
    </section>
  );
}
