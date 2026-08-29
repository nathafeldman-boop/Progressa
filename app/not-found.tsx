import Link from "next/link";
import { getCurrentInternalUser } from "@/lib/auth";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * 404 personnalisée — sans ça, un lien mort (favori, ancienne URL, faute de
 * frappe) affichait la page Next.js par défaut: blanche, sans logo, sans
 * aucun moyen de revenir dans l'app. Un compte déjà authentifié mais avec
 * un onboarding jamais fini s'y retrouvait bloqué (vu en admin: un joueur
 * inscrit resté coincé sur une URL inexistante). /dashboard sait déjà
 * rediriger vers /onboarding ou /paywall selon l'état du compte — inutile
 * de dupliquer cette logique ici, un connecté est toujours renvoyé là.
 */
export default async function NotFound() {
  const user = await getCurrentInternalUser();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-surface-alt)] p-4">
      <Card className="max-w-sm space-y-4 p-6 text-center">
        <div>
          <CardTitle className="text-2xl">Page introuvable</CardTitle>
          <CardSubtitle className="mt-2">Ce lien n&apos;existe pas ou plus.</CardSubtitle>
        </div>
        <Link href={user ? "/dashboard" : "/"} className="block">
          <Button className="w-full">{user ? "Retourner dans l'app" : "Retour à l'accueil"}</Button>
        </Link>
      </Card>
    </div>
  );
}
