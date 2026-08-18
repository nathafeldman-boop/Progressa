/**
 * S'exécute une fois au démarrage de chaque instance serveur, avant que
 * celle-ci ne traite la moindre requête. Sert ici à synchroniser
 * automatiquement le catalogue d'exercices/badges en base de données —
 * plus aucune étape manuelle (Supabase, /admin) n'est nécessaire après un
 * déploiement: la base se met à jour toute seule au premier cold start.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    const { seedCatalog } = await import("@/lib/exercises/seed-catalog");
    const result = await seedCatalog();
    if (!result.skipped) {
      console.log(
        `[instrumentation] Catalogue synchronisé automatiquement: ${result.exercisesSynced} exercices, ${result.badgesSynced} badges.`
      );
    }
  } catch (err) {
    console.error("[instrumentation] Échec de la synchronisation automatique du catalogue", err);
  }
}
