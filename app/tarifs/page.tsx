import Link from "next/link";
import { APP_NAME } from "@/lib/app-config";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Tarifs",
  "Un seul abonnement Premium à 6,99€/mois, sans essai déguisé : Coach Brian personnel, entraînements adaptés à ton profil, carte joueur évolutive et catalogue complet d'exercices.",
  "/tarifs"
);

const BENEFITS = [
  "Coach Brian personnel, qui suit tes vraies performances",
  "Entraînements adaptés à ton profil, ton poste et ton niveau",
  "Progression de tes statistiques après chaque séance",
  "Carte joueur qui évolue avec toi",
  "Catalogue d'exercices complet",
  "Tests d'évaluation réguliers",
];

export default function TarifsPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 p-4 py-10">
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide">Tarifs</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Une seule offre, un prix clair. Ton test d&apos;évaluation et ta première carte joueur sont gratuits — la
          suite débloque tout {APP_NAME}.
        </p>
      </div>

      <Card>
        <CardTitle className="text-center text-base">Accès complet {APP_NAME}</CardTitle>
        <ul className="mt-3 space-y-1.5 text-sm">
          {BENEFITS.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className="text-[var(--color-primary-strong)]">✓</span> {f}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center font-display text-3xl font-extrabold">
          6,99 €<span className="text-base font-bold text-[var(--color-text-muted)]"> / mois</span>
        </p>
      </Card>

      <Link href="/inscription">
        <Button className="w-full">Commencer mon évaluation</Button>
      </Link>

      <p className="text-center text-xs text-[var(--color-text-muted)]">
        Pas de deuxième plan, pas de fausse promotion. Tu peux arrêter ton abonnement à tout moment, directement
        depuis ton compte.
      </p>
    </div>
  );
}
