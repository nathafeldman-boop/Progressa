import { redirect } from "next/navigation";
import { getCurrentInternalUser } from "@/lib/auth";
import { AppTour } from "@/components/onboarding/AppTour";

/**
 * Tour rapide de l'app, juste après le tout premier test d'évaluation —
 * le joueur vient de calibrer sa carte et atterrit sinon directement sur
 * l'appli sans comprendre à quoi servent les onglets (Séances/Coach/
 * Progression/Réglages). Un seul passage, jamais imposé une deuxième fois.
 */
export default async function AppTourPage() {
  const user = await getCurrentInternalUser();
  if (!user) redirect("/connexion");

  return <AppTour firstName={user.firstName} />;
}
