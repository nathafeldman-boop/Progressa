import { notFound, redirect } from "next/navigation";
import { TRAINING_THEMES, buildTargetedSession, type TrainingTheme } from "@/lib/programs/build-targeted-session";
import { getCurrentInternalUser } from "@/lib/auth";

/**
 * Plus d'écran "choisis un exercice parmi 5": le coach construit
 * directement une séance complète sur le besoin choisi et enchaîne sur le
 * lecteur de séance — cohérent avec le reste de l'app (un coach ne tend
 * pas un menu, il construit la séance).
 */
export default async function EntrainementCiblePage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme } = await params;
  if (!TRAINING_THEMES.includes(theme as TrainingTheme)) notFound();

  const user = await getCurrentInternalUser();
  if (!user) redirect("/connexion");

  const session = await buildTargetedSession(user.id, theme as TrainingTheme);
  if (!session) redirect("/dashboard?erreur=entrainement-cible-indisponible");

  redirect(`/seance/${session.id}`);
}
