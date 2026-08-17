import Link from "next/link";
import { APP_NAME } from "@/lib/app-config";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const PLANS = [
  {
    name: "Gratuit",
    tagline: "Pour découvrir ton niveau de départ",
    features: ["1 entraînement par semaine", "Accès à une sélection du catalogue", "Ta première carte joueur"],
  },
  {
    name: "Premium",
    tagline: "Pour progresser à ton rythme",
    features: [
      "Jusqu'à 3 entraînements par semaine",
      "Catalogue d'exercices complet",
      "Tests d'évaluation réguliers",
      "Carte joueur détaillée",
      "Conseils nutrition calés sur tes matchs",
    ],
  },
];

export default function TarifsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 py-10">
      <div>
        <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide">Tarifs</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Pas d&apos;essai gratuit déguisé : ton premier entraînement est réellement gratuit, sans carte bancaire. Le
          prix exact de l&apos;abonnement Premium s&apos;affiche directement dans l&apos;app au moment de passer au
          niveau supérieur.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <Card key={plan.name}>
            <CardTitle className="text-base">{plan.name}</CardTitle>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{plan.tagline}</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="text-[var(--color-primary-strong)]">✓</span> {f}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Link href="/onboarding">
        <Button className="w-full">Commencer mon parcours</Button>
      </Link>

      <p className="text-xs text-[var(--color-text-muted)]">
        Tu peux arrêter ton abonnement {APP_NAME} à tout moment, directement depuis ton compte.
      </p>
    </div>
  );
}
