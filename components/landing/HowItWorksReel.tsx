"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";

const EXERCISES = ["Échauffement", "Passes courtes", "Sprint 20m"];

function SceneCreate() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5">
      <div
        className="lp-reel-anim relative flex h-16 w-16 items-center justify-center rounded-full bg-[var(--lp-accent-soft)] text-3xl"
        style={{ animation: "lp-reel-pop 500ms cubic-bezier(0.16,1,0.3,1) both" }}
      >
        🧑
        <span
          className="lp-reel-anim absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lp-accent)] text-xs text-white shadow"
          style={{ animation: "lp-reel-pop 400ms cubic-bezier(0.16,1,0.3,1) 900ms both" }}
        >
          ✓
        </span>
      </div>
      <div className="flex w-48 flex-col gap-2.5">
        {["Prénom", "Poste"].map((label, i) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-bold uppercase tracking-widest text-[var(--lp-text-dim)]">
              {label}
            </span>
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--lp-surface-2)]">
              <div
                className="lp-reel-bar h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, var(--lp-accent-strong), var(--lp-accent))",
                  animation: `lp-reel-grow-x 650ms cubic-bezier(0.16,1,0.3,1) ${300 + i * 500}ms both`,
                  ["--w" as string]: "100%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneTrain() {
  const r = 15;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      {EXERCISES.map((label, i) => {
        const delay = i * 700;
        return (
          <div key={label} className="flex w-52 items-center gap-3">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
              <svg
                viewBox="0 0 36 36"
                className="lp-reel-anim h-9 w-9 -rotate-90"
                style={{ animation: `lp-reel-fade-up 300ms ease ${delay}ms both` }}
              >
                <circle cx="18" cy="18" r={r} fill="none" stroke="var(--lp-surface-2)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r={r}
                  fill="none"
                  stroke="var(--lp-accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  className="lp-reel-ring"
                  style={{
                    animation: `lp-reel-ring-fill 700ms ease ${delay + 150}ms both`,
                    ["--circ" as string]: circ,
                  }}
                />
              </svg>
              <span
                className="lp-reel-anim absolute inset-0 flex items-center justify-center rounded-full bg-[var(--lp-accent)] text-xs font-bold text-white"
                style={{ animation: `lp-reel-pop 350ms cubic-bezier(0.16,1,0.3,1) ${delay + 850}ms both` }}
              >
                ✓
              </span>
            </span>
            <span className="text-sm font-semibold text-[var(--lp-text)]">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

const STAT_STEPS = [
  { label: "Vitesse", value: 78 },
  { label: "Technique", value: 65 },
  { label: "Endurance", value: 82 },
  { label: "Mental", value: 70 },
];

function SceneStats() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-2">
      <div className="flex w-56 flex-col gap-2.5">
        {STAT_STEPS.map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--lp-text-muted)]">
              {stat.label}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--lp-surface-2)]">
              <div
                className="lp-reel-bar h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, var(--lp-accent-strong), var(--lp-accent))",
                  animation: `lp-reel-grow-x 750ms cubic-bezier(0.16,1,0.3,1) ${200 + i * 220}ms both`,
                  ["--w" as string]: `${stat.value}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <span
        className="lp-reel-anim rounded-full bg-[var(--lp-accent)] px-3 py-1 text-xs font-bold text-white shadow"
        style={{
          animation:
            "lp-reel-pop 400ms cubic-bezier(0.16,1,0.3,1) 1700ms both, lp-float 2.4s ease-in-out 2100ms infinite",
        }}
      >
        + 3 Vitesse
      </span>
    </div>
  );
}

function SceneCard() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center">
      <div
        className="lp-glow-ring lp-reel-anim"
        style={{ width: 140, height: 140, animation: "lp-reel-pop 700ms cubic-bezier(0.16,1,0.3,1) both" }}
      />
      <div
        className="lp-reel-anim lp-card relative flex w-40 flex-col items-center gap-2 border-2 border-[var(--lp-accent-soft)] p-4 text-center"
        style={{ animation: "lp-reel-levelup 1400ms cubic-bezier(0.16,1,0.3,1) 250ms both" }}
      >
        <span className="text-3xl" aria-hidden>
          🃏
        </span>
        <span className="font-display text-2xl font-extrabold text-[var(--lp-text)]">78</span>
        <span className="relative block h-4 w-24 text-[0.65rem] font-bold uppercase tracking-widest">
          <span
            className="lp-reel-anim absolute inset-0 text-[var(--lp-text-dim)]"
            style={{ animation: "lp-reel-swap-out 400ms ease 1600ms both" }}
          >
            Bronze
          </span>
          <span
            className="lp-reel-anim absolute inset-0 text-[var(--lp-accent-strong)]"
            style={{ animation: "lp-reel-swap-in 400ms ease 1700ms both" }}
          >
            Argent
          </span>
        </span>
      </div>
    </div>
  );
}

const STEPS: {
  n: string;
  title: string;
  caption: string;
  durationMs: number;
  Scene: ComponentType;
}[] = [
  {
    n: "01",
    title: "Crée ton joueur",
    caption: "Poste, âge, objectifs — ta fiche joueur en une minute.",
    durationMs: 4400,
    Scene: SceneCreate,
  },
  {
    n: "02",
    title: "Fais ton premier entraînement",
    caption: "Une séance guidée, exercice par exercice, avec Coach Brian.",
    durationMs: 4800,
    Scene: SceneTrain,
  },
  {
    n: "03",
    title: "Gagne des stats",
    caption: "Chaque exercice réussi fait progresser tes statistiques réelles.",
    durationMs: 4400,
    Scene: SceneStats,
  },
  {
    n: "04",
    title: "Fais évoluer ta carte",
    caption: "Ta carte change de rang à chaque vraie progression.",
    durationMs: 4800,
    Scene: SceneCard,
  },
];

export function HowItWorksReel() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduceMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || reduceMotion) return;
    const id = setTimeout(() => {
      setActive((i) => (i + 1) % STEPS.length);
    }, STEPS[active].durationMs);
    return () => clearTimeout(id);
  }, [active, playing, reduceMotion]);

  const ActiveScene = STEPS[active].Scene;

  return (
    <div ref={containerRef} className="lp-card mx-auto w-full max-w-md overflow-hidden p-5 sm:p-6">
      <div className="flex gap-1.5">
        {STEPS.map((step, i) => (
          <button
            key={step.n}
            type="button"
            onClick={() => setActive(i)}
            className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--lp-surface-2)]"
            aria-label={`Étape ${step.n} : ${step.title}`}
          >
            {i < active && <span className="block h-full w-full rounded-full bg-[var(--lp-accent)]" />}
            {i === active && (
              <span
                key={active}
                className="block h-full rounded-full bg-[var(--lp-accent)]"
                style={
                  playing && !reduceMotion
                    ? { animation: `lp-reel-progress ${STEPS[i].durationMs}ms linear forwards` }
                    : { width: "100%" }
                }
              />
            )}
          </button>
        ))}
      </div>

      <div
        key={`stage-${active}`}
        className="lp-reel-anim mt-5 flex h-56 items-center justify-center rounded-2xl bg-[var(--lp-surface-2)] sm:h-64"
        style={{ animation: "lp-reel-stage-in 320ms ease both" }}
      >
        <ActiveScene />
      </div>

      <div key={`meta-${active}`} className="lp-reel-anim mt-5 text-center" style={{ animation: "lp-reel-stage-in 320ms ease both" }}>
        <span className="font-display text-xs font-extrabold text-[var(--lp-accent-strong)]">{STEPS[active].n}</span>
        <h3 className="font-display mt-1 text-lg font-extrabold uppercase tracking-wide text-[var(--lp-text)]">
          {STEPS[active].title}
        </h3>
        <p className="mt-1 text-sm text-[var(--lp-text-muted)]">{STEPS[active].caption}</p>
      </div>
    </div>
  );
}
