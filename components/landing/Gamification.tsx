import { Reveal } from "./reveal";
import { PhoneCarousel } from "./PhoneCarousel";

const STREAK_DAYS = 7;
const WEEK_LETTERS = ["L", "M", "M", "J", "V", "S", "D"];

const LEADERBOARD = [
  { rank: 123, name: "Yanis", you: false },
  { rank: 124, name: "Toi", you: true },
  { rank: 125, name: "Sofiane", you: false },
];

const TASKS = [
  { label: "Échauffement dynamique", done: true },
  { label: "3 séries de sprints", done: true },
  { label: "Étirements", done: false },
];

const SCREENS = [
  {
    key: "objectif",
    label: "Objectif du jour",
    content: (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-display text-2xl font-extrabold text-[var(--lp-accent-strong)]">+2 Vitesse</span>
          <span className="font-display text-lg font-bold text-[var(--lp-text-muted)]">+1 Contrôle</span>
        </div>
        <div className="lp-bar-track lp-visible" style={{ ["--bar-w" as string]: "60%" }}>
          <div className="lp-bar-fill" />
        </div>
        <div className="flex flex-col gap-1.5 border-t border-[var(--lp-border)] pt-3">
          {TASKS.map((task) => (
            <div key={task.label} className="flex items-center gap-2">
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.55rem] ${
                  task.done ? "bg-[var(--lp-accent)] text-white" : "border border-[var(--lp-border-strong)]"
                }`}
              >
                {task.done && "✓"}
              </span>
              <span
                className={`text-[0.68rem] font-semibold ${
                  task.done ? "text-[var(--lp-text-muted)] line-through" : "text-[var(--lp-text)]"
                }`}
              >
                {task.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "serie",
    label: "Série",
    content: (
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-extrabold text-[var(--lp-text)]">{STREAK_DAYS}</span>
          <span className="font-display text-sm font-bold uppercase tracking-wide text-[var(--lp-text-muted)]">
            jours
          </span>
          <span aria-hidden>🔥</span>
        </div>
        <div className="flex gap-2">
          {WEEK_LETTERS.map((letter, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.6rem] font-bold ${
                  i < STREAK_DAYS
                    ? "bg-[var(--lp-accent)] text-white"
                    : "border border-[var(--lp-border-strong)] text-[var(--lp-text-dim)]"
                }`}
              >
                {i < STREAK_DAYS ? "✓" : ""}
              </span>
              <span className="text-[0.55rem] font-bold uppercase text-[var(--lp-text-dim)]">{letter}</span>
            </div>
          ))}
        </div>
        <p className="border-t border-[var(--lp-border)] pt-3 text-[0.7rem] font-semibold text-[var(--lp-accent-strong)]">
          Plus que 3 jours avant le palier suivant
        </p>
      </div>
    ),
  },
  {
    key: "classement",
    label: "Classement",
    content: (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-display text-4xl font-extrabold text-[var(--lp-text)]">#124</span>
          <span className="text-xs font-bold text-[var(--lp-accent-strong)]">▲ +12 cette semaine</span>
        </div>
        <div className="flex flex-col gap-1.5 border-t border-[var(--lp-border)] pt-3">
          {LEADERBOARD.map((row) => (
            <div
              key={row.rank}
              className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-[0.68rem] font-semibold ${
                row.you ? "bg-[var(--lp-accent-soft)] text-[var(--lp-accent-strong)]" : "text-[var(--lp-text-muted)]"
              }`}
            >
              <span>
                #{row.rank} {row.name}
              </span>
              {row.you && <span aria-hidden>👑</span>}
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function Gamification() {
  return (
    <section className="lp-section relative">
      <div className="lp-container">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="lp-eyebrow justify-center">Mode carrière</span>
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
