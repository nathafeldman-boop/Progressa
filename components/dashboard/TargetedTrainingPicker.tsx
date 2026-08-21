import Link from "next/link";
import type { Position } from "@prisma/client";
import { Card, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { BrianAvatar, type BrianState } from "@/components/brian/BrianAvatar";
import { BrianTip } from "@/components/brian/BrianTip";
import { THEME_LABELS, TRAINING_THEMES, type TrainingTheme } from "@/lib/programs/build-targeted-session";

const THEME_BRIAN_STATE: Record<TrainingTheme, BrianState> = {
  pied_faible: "motivated",
  dribble: "confident",
  tir: "celebrating",
  defense: "confident",
  vitesse: "motivated",
  cardio: "encouraging",
  muscu: "encouraging",
  prevention: "happy",
  gardien: "confident",
};

const DEFENSIVE_POSITIONS: Position[] = ["CENTER_BACK", "FULLBACK", "DEFENSIVE_MID"];

export function TargetedTrainingPicker({ position }: { position: Position | null }) {
  // "gardien" et "défense" reposent sur des exercices réservés à certains
  // postes: les proposer à qui n'y a pas accès mènerait droit à une
  // séance vide (voir exercisesForNeed).
  const themes = TRAINING_THEMES.filter((theme) => {
    if (theme === "gardien") return position === "GOALKEEPER";
    if (theme === "defense") return !!position && DEFENSIVE_POSITIONS.includes(position);
    return true;
  });

  return (
    <Card>
      <CardTitle className="text-base">Entraînement ciblé</CardTitle>
      <CardSubtitle className="mt-0.5">Choisis ce que tu veux travailler aujourd&apos;hui.</CardSubtitle>
      <div className="mt-2">
        <BrianTip
          tipKey="entrainement-cible-intro"
          text="Choisis un besoin précis, je te construis une vraie séance complète dessus — pas une liste où piocher."
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {themes.map((theme) => (
          <Link
            key={theme}
            href={`/entrainement-cible/${theme}`}
            className="group relative flex aspect-square flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl border-2 border-[var(--color-primary-strong)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-strong)] p-2 text-center shadow-[0_6px_16px_-4px_rgba(14,122,60,0.45)] transition-transform active:scale-95"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:repeating-linear-gradient(0deg,#fff_0,#fff_2px,transparent_2px,transparent_10px),repeating-linear-gradient(90deg,#fff_0,#fff_2px,transparent_2px,transparent_10px)]"
            />
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-inner">
              <BrianAvatar state={THEME_BRIAN_STATE[theme]} size={30} />
            </span>
            <span className="relative text-[0.7rem] font-extrabold uppercase leading-tight tracking-wide text-white">
              {THEME_LABELS[theme]}
            </span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
