"use client";

import { useRef, useState } from "react";
import { RankCardBadge } from "@/components/card/RankCardBadge";

const CREATE_FIELDS = [
  { label: "Prénom", value: "Léo" },
  { label: "Poste", value: "Milieu offensif" },
];

const EXERCISES = ["Échauffement", "Passes courtes", "Sprint 20m"];

const FIRST_SESSION_STATS = [
  { label: "Vitesse", value: 78 },
  { label: "Technique", value: 65 },
  { label: "Endurance", value: 82 },
];

const STEPS = [
  { n: "01", title: "Crée ton joueur", caption: "Poste, âge, objectifs — ta fiche joueur en une minute." },
  { n: "02", title: "Fais ton premier entraînement", caption: "Une séance guidée, exercice par exercice, avec Coach Brian." },
  { n: "03", title: "Gagne des stats", caption: "Chaque exercice réussi fait progresser tes statistiques réelles." },
  { n: "04", title: "Fais évoluer ta carte", caption: "Ta carte change de rang à chaque vraie progression." },
] as const;

function FicheCreate() {
  return (
    <div className="flex w-full flex-col gap-2.5 px-1">
      {CREATE_FIELDS.map((field) => (
        <div key={field.label} className="rounded-[var(--radius-control)] bg-[var(--lp-surface-2)] px-3 py-2">
          <span className="block text-[0.6rem] font-bold uppercase tracking-widest text-[var(--lp-text-dim)]">
            {field.label}
          </span>
          <span className="text-sm font-semibold text-[var(--lp-text)]">{field.value}</span>
        </div>
      ))}
    </div>
  );
}

function FicheTrain() {
  return (
    <div className="flex w-full flex-col gap-2.5 px-1">
      {EXERCISES.map((label) => (
        <div key={label} className="flex items-center gap-3 rounded-[var(--radius-control)] bg-[var(--lp-surface-2)] px-3 py-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--lp-accent)] text-xs font-bold text-white">
            ✓
          </span>
          <span className="text-sm font-semibold text-[var(--lp-text)]">{label}</span>
        </div>
      ))}
    </div>
  );
}

function FicheStats() {
  return (
    <div className="flex w-full flex-col gap-2.5 px-1">
      {FIRST_SESSION_STATS.map((stat) => (
        <div key={stat.label} className="flex items-center gap-2">
          <span className="w-20 shrink-0 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--lp-text-muted)]">
            {stat.label}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--lp-surface-2)]">
            <div
              className="h-full rounded-full"
              style={{ width: `${stat.value}%`, background: "linear-gradient(90deg, var(--lp-accent-strong), var(--lp-accent))" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function FicheCard() {
  return (
    <div className="flex w-full items-center justify-center gap-3 px-1">
      <RankCardBadge rankKey="confirme" size={40} />
      <div className="text-left">
        <p className="font-display text-2xl font-extrabold text-[var(--lp-text)]">78</p>
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--lp-accent-strong)]">Confirmé</p>
      </div>
    </div>
  );
}

const FICHES = [FicheCreate, FicheTrain, FicheStats, FicheCard];

/**
 * Fiches statiques et stylisées, en carrousel vertical (swipe/scroll-snap
 * sur l'axe Y) — pas d'auto-play façon "vidéo": le joueur parcourt à son
 * rythme, comme une pile de fiches qu'on feuillette.
 */
export function HowItWorksReel() {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  function goTo(i: number) {
    const track = trackRef.current;
    if (track) track.scrollTo({ top: i * track.clientHeight, behavior: "smooth" });
    setActive(i);
  }

  function handleScrollEnd() {
    const track = trackRef.current;
    if (!track) return;
    const i = Math.round(track.scrollTop / track.clientHeight);
    setActive(Math.min(STEPS.length - 1, Math.max(0, i)));
  }

  return (
    <div className="lp-card mx-auto flex w-full max-w-md gap-3 p-5 sm:p-6">
      <div
        ref={trackRef}
        onScroll={handleScrollEnd}
        className="flex h-72 flex-1 snap-y snap-mandatory flex-col overflow-y-auto rounded-xl sm:h-80"
      >
        {STEPS.map((step, i) => {
          const StepFiche = FICHES[i];
          return (
            <div
              key={step.n}
              className="flex h-full w-full shrink-0 snap-start flex-col items-center justify-center gap-4 bg-[var(--lp-surface-2)] px-4 text-center"
            >
              <span className="font-display text-xs font-extrabold text-[var(--lp-accent-strong)]">{step.n}</span>
              <h3 className="font-display -mt-2 text-base font-extrabold uppercase tracking-wide text-[var(--lp-text)]">
                {step.title}
              </h3>
              <StepFiche />
              <p className="text-xs text-[var(--lp-text-muted)]">{step.caption}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col justify-center gap-2">
        {STEPS.map((step, i) => (
          <button
            key={step.n}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Étape ${step.n} : ${step.title}`}
            className="h-6 w-1.5 rounded-full transition-[background-color]"
            style={{ background: i === active ? "var(--lp-accent)" : "var(--lp-surface-2)" }}
          />
        ))}
      </div>
    </div>
  );
}
