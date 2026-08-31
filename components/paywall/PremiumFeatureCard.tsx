import Link from "next/link";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Bloc réutilisé partout où une page reste navigable pour un joueur
 * gratuit mais son contenu principal reste Premium (classement, journal,
 * tableau de bord...) — le joueur voit que la page existe et pourquoi
 * elle est verrouillée, plutôt qu'une redirection muette vers /paywall.
 */
export function PremiumFeatureCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Card className="p-6 text-center">
      <CardTitle>{title}</CardTitle>
      <CardSubtitle className="mt-2">{subtitle}</CardSubtitle>
      <Link href="/paywall" className="mt-4 block">
        <Button className="w-full">Débloquer avec Premium</Button>
      </Link>
    </Card>
  );
}
