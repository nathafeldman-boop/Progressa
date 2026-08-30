import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { isPremiumActive } from "@/lib/subscription";
import { getAgeCategory } from "@/lib/age-category";
import { POSITION_LABELS, OBJECTIVE_LABELS } from "@/lib/labels";
import { HardPaywall } from "@/components/paywall/HardPaywall";
import type { PlayerCardStats } from "@/lib/player-card";

/**
 * Hard paywall — palier unique (6,99 €/mois), pas de compte gratuit.
 * Un abonné actif ne voit jamais cet écran (redirigé direct vers l'app).
 */
export default async function PaywallPage() {
  const user = await getCurrentInternalUser();
  if (!user) redirect("/connexion");

  const [profile, subscription, card, approvedTestimonials] = await Promise.all([
    prisma.playerProfile.findUnique({ where: { userId: user.id } }),
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.playerCard.findUnique({ where: { userId: user.id } }),
    // Avis approuvés uniquement — jamais un chiffre inventé: la note
    // moyenne et le nombre affichés sont calculés sur ce même jeu de
    // données, pas sur un total marketing différent.
    prisma.testimonial.findMany({ where: { status: "APPROVED" }, orderBy: [{ rating: "desc" }, { createdAt: "desc" }] }),
  ]);

  if (isPremiumActive(subscription)) redirect("/dashboard");
  // Un compte sans profil (onboarding jamais fini) n'a ni test ni carte à
  // montrer — un paywall vide n'a aucune chance de convertir. Renvoie
  // finir l'onboarding, où le funnel normal le ramènera ici avec sa carte.
  if (!profile) redirect("/onboarding");

  const stats = card ? (card.stats as unknown as PlayerCardStats) : null;
  const ageCategory = getAgeCategory(profile.birthYear);
  const reviewCount = approvedTestimonials.length;
  const avgRating = reviewCount > 0 ? approvedTestimonials.reduce((sum, t) => sum + t.rating, 0) / reviewCount : null;
  const testimonials = approvedTestimonials
    .slice(0, 3)
    .map((t) => ({ id: t.id, name: t.firstNameSnapshot, rating: t.rating, text: t.text }));

  return (
    <HardPaywall
      firstName={user.firstName}
      cardStats={stats}
      positionLabel={POSITION_LABELS[profile.position]}
      objectiveLabel={OBJECTIVE_LABELS[profile.objective]}
      weakPointNote={profile.weakPointNote || null}
      ageCategoryLabel={ageCategory.label}
      country={profile.country}
      department={profile.district}
      niveauLabel={profile.levelLabel}
      photoUrl={user.photoUrl}
      testimonials={testimonials}
      avgRating={avgRating}
      reviewCount={reviewCount}
    />
  );
}
