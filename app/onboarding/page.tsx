import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

/**
 * "/onboarding" est public (proxy.ts) donc joignable même en étant déjà
 * connecté — sans ce garde, un joueur qui revient sur la LP et clique
 * "Commencer mon parcours" retombait dans tout l'onboarding + création de
 * compte à chaque fois, alors qu'il a déjà un compte et un profil complets.
 */
export default async function OnboardingPage() {
  const user = await getCurrentInternalUser();
  if (user) {
    const profile = await prisma.playerProfile.findUnique({ where: { userId: user.id } });
    if (profile) redirect("/dashboard");
  }

  return <OnboardingWizard />;
}
