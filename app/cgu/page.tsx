import { APP_NAME } from "@/lib/app-config";
import { Card, CardTitle } from "@/components/ui/Card";

const SECTIONS = [
  {
    title: "Le service",
    body: `${APP_NAME} propose des programmes d'entraînement physique et technique personnalisés, un suivi de progression, et une carte joueur qui évolue avec tes résultats. Le service est un complément aux entraînements de ton club, jamais un remplacement.`,
  },
  {
    title: "Ton compte",
    body: "Tu es responsable des informations que tu fournis et de la confidentialité de tes identifiants. Si tu es mineur, l'usage gratuit ne nécessite pas d'accord parental ; il devient nécessaire pour souscrire à l'abonnement payant.",
  },
  {
    title: "Abonnement et paiement",
    body: "L'abonnement Premium est facturé mensuellement ou annuellement selon la formule choisie, sans période d'essai gratuite déguisée. Tu peux résilier à tout moment depuis ton compte ; la résiliation prend effet à la fin de la période déjà payée.",
  },
  {
    title: "Usage raisonnable",
    body: "Le contenu (exercices, textes, carte joueur) est réservé à un usage personnel. Toute reproduction ou redistribution du catalogue sans autorisation n'est pas autorisée.",
  },
  {
    title: "Suppression de compte",
    body: "Tu peux supprimer ton compte et toutes tes données à tout moment depuis Réglages → Mon compte. La suppression est définitive.",
  },
];

export default function CguPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 py-10">
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide">
        Conditions générales d&apos;utilisation
      </h1>
      {SECTIONS.map((section) => (
        <Card key={section.title}>
          <CardTitle className="text-base">{section.title}</CardTitle>
          <p className="mt-2 text-sm text-[var(--color-text)]">{section.body}</p>
        </Card>
      ))}
    </div>
  );
}
