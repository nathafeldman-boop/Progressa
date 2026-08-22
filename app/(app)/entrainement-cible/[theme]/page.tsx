import { notFound, redirect } from "next/navigation";
import {
  TRAINING_THEMES,
  THEME_LABELS,
  THEME_EMOJI,
  NEED_INTRO,
  previewTargetedSessionVariants,
  type TrainingTheme,
} from "@/lib/programs/build-targeted-session";
import { getCurrentInternalUser } from "@/lib/auth";
import { TargetedSessionVariantPicker } from "@/components/dashboard/TargetedSessionVariantPicker";
import type { BrianState } from "@/components/brian/BrianAvatar";

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

/**
 * Écran de choix: le joueur pique un besoin (ex: "pied faible"), puis choisit
 * parmi plusieurs séances déjà construites sur ce besoin — pas un unique
 * enchaînement automatique, pour laisser le joueur sentir qu'il a le choix
 * plutôt que de recevoir toujours la même séance.
 */
export default async function EntrainementCiblePage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme } = await params;
  if (!TRAINING_THEMES.includes(theme as TrainingTheme)) notFound();

  const user = await getCurrentInternalUser();
  if (!user) redirect("/connexion");

  const trainingTheme = theme as TrainingTheme;
  const variants = await previewTargetedSessionVariants(user.id, trainingTheme);
  if (variants.length === 0) redirect("/dashboard?erreur=entrainement-cible-indisponible");

  return (
    <TargetedSessionVariantPicker
      theme={trainingTheme}
      label={THEME_LABELS[trainingTheme]}
      emoji={THEME_EMOJI[trainingTheme]}
      intro={NEED_INTRO[trainingTheme]}
      brianState={THEME_BRIAN_STATE[trainingTheme]}
      variants={variants}
    />
  );
}
