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
import { prisma } from "@/lib/prisma";
import { isPremiumActive, hasSkippedPaywall } from "@/lib/subscription";
import { getFreeTargetedSessionStatus } from "@/lib/programs/free-targeted-cooldown";
import { TargetedSessionVariantPicker } from "@/components/dashboard/TargetedSessionVariantPicker";
import { FreeTierAdSlot } from "@/components/ads/FreeTierAdSlot";
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

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  const premium = isPremiumActive(subscription);
  // Accessible à un joueur premium (illimité) ou ayant sauté le paiement
  // ("Payer ultérieurement") — dans ce dernier cas, limité à 1 séance
  // gratuite toutes les 48h, réductible par pub (voir free-targeted-cooldown.ts).
  // Un compte qui n'a même pas vu le paywall reste bloqué, inchangé.
  if (!premium && !hasSkippedPaywall(subscription)) redirect("/paywall");

  const cooldown = premium ? null : await getFreeTargetedSessionStatus(user.id);
  const cooldownNextEligibleAtIso = cooldown?.nextEligibleAt?.toISOString() ?? null;

  if (cooldown && !cooldown.eligible) {
    return (
      <>
        <TargetedSessionVariantPicker
          theme={theme as TrainingTheme}
          label={THEME_LABELS[theme as TrainingTheme]}
          emoji={THEME_EMOJI[theme as TrainingTheme]}
          intro={NEED_INTRO[theme as TrainingTheme]}
          brianState={THEME_BRIAN_STATE[theme as TrainingTheme]}
          variants={[]}
          cooldownNextEligibleAtIso={cooldownNextEligibleAtIso}
        />
        <FreeTierAdSlot />
      </>
    );
  }

  const trainingTheme = theme as TrainingTheme;
  const variants = await previewTargetedSessionVariants(user.id, trainingTheme);
  if (variants.length === 0) redirect("/dashboard?erreur=entrainement-cible-indisponible");

  return (
    <>
      <TargetedSessionVariantPicker
        theme={trainingTheme}
        label={THEME_LABELS[trainingTheme]}
        emoji={THEME_EMOJI[trainingTheme]}
        intro={NEED_INTRO[trainingTheme]}
        brianState={THEME_BRIAN_STATE[trainingTheme]}
        variants={variants}
        cooldownNextEligibleAtIso={null}
      />
      {!premium && <FreeTierAdSlot />}
    </>
  );
}
