import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { isPremiumActive } from "@/lib/subscription";
import { meetsMinAge } from "@/lib/age-category";
import { EXERCISE_CATALOG } from "@/lib/exercises/catalog-data";
import { Equipment } from "@prisma/client";
import { ExerciseLibrary, type LibraryEntry } from "@/components/exercises/ExerciseLibrary";

export default async function ExercicesPage() {
  const user = await getCurrentInternalUser();
  if (!user) notFound();

  const [profile, subscription] = await Promise.all([
    prisma.playerProfile.findUnique({ where: { userId: user.id } }),
    prisma.subscription.findUnique({ where: { userId: user.id } }),
  ]);
  if (!profile) notFound();

  const premium = isPremiumActive(subscription);
  const available = new Set(profile.equipment.length ? profile.equipment : [Equipment.NONE]);

  // Portes "dures" (âge, poste): un joueur de champ ne verra jamais les
  // exercices de gardien, inutile de les afficher même verrouillés.
  const eligible = EXERCISE_CATALOG.filter((e) => {
    if (!meetsMinAge(profile.birthYear, e.minAge)) return false;
    if (e.positions.length > 0 && !e.positions.includes(profile.position)) return false;
    return true;
  });

  const entries: LibraryEntry[] = eligible.map((e) => {
    const equipmentOk = e.equipment.every((eq) => eq === Equipment.NONE || available.has(eq));
    const premiumOk = premium || e.isFreeTier;
    const lockReason: "premium" | "equipment" | null = !premiumOk ? "premium" : !equipmentOk ? "equipment" : null;
    return {
      slug: e.slug,
      name: e.name,
      emoji: e.emoji,
      category: e.category,
      description: e.description,
      matchBenefit: e.matchBenefit,
      steps: e.steps,
      commonMistakes: e.commonMistakes,
      easyVariant: e.easyVariant,
      hardVariant: e.hardVariant,
      durationMinutes: e.durationMinutes,
      locked: lockReason !== null,
      lockReason,
    };
  });

  return <ExerciseLibrary entries={entries} />;
}
