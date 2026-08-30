import { APP_NAME } from "@/lib/app-config";
import { Card, CardTitle } from "@/components/ui/Card";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Conditions générales de vente",
  `Conditions générales de vente de l'abonnement Premium ${APP_NAME}.`,
  "/cgv"
);

const SECTIONS = [
  {
    title: "1. Objet",
    body: `Les présentes conditions générales de vente (CGV) régissent la souscription à l'abonnement Premium ${APP_NAME}, vendu directement depuis l'application par carte bancaire via notre prestataire de paiement Stripe. Elles complètent, sans s'y substituer, les conditions générales d'utilisation (CGU) qui régissent l'usage du service.`,
  },
  {
    title: "2. Prix et caractéristiques",
    body: "Le prix de l'abonnement Premium, toutes taxes comprises, est affiché de façon claire sur la page Tarifs et sur l'écran de paiement avant toute confirmation. Il n'y a qu'une seule offre, sans promotion factice ni période d'essai déguisée. Le contenu de l'offre (programmes personnalisés, suivi de progression, catalogue d'exercices complet, carte joueur) est décrit sur la page Tarifs.",
  },
  {
    title: "3. Commande et paiement",
    body: "La commande est passée en ligne, en confirmant le paiement sur la page de paiement sécurisée Stripe. Le paiement est prélevé immédiatement à la souscription, puis automatiquement à chaque échéance (mensuelle) tant que l'abonnement n'a pas été résilié. Aucune donnée de carte bancaire n'est stockée ou traitée par nos soins : Stripe, prestataire de paiement agréé, s'en charge intégralement.",
  },
  {
    title: "4. Droit de rétractation",
    body: "Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas à la fourniture d'un contenu numérique non fourni sur un support matériel dont l'exécution a commencé après accord préalable exprès du consommateur, qui a renoncé expressément à son droit de rétractation. En confirmant le paiement, tu acceptes que l'accès Premium débute immédiatement et tu renonces expressément à ton droit de rétractation de 14 jours pour cet accès.",
  },
  {
    title: "5. Durée, renouvellement et résiliation",
    body: `L'abonnement est sans engagement de durée : il se renouvelle automatiquement à chaque échéance jusqu'à résiliation. Tu peux résilier à tout moment, sans justification ni frais, depuis Réglages → Abonnement dans l'application. La résiliation prend effet à la fin de la période déjà payée : tu conserves l'accès Premium jusqu'à cette date, sans remboursement au prorata de la période en cours.`,
  },
  {
    title: "6. Défaut de paiement",
    body: "Si un prélèvement échoue (carte expirée, fonds insuffisants), Stripe retente automatiquement le paiement selon son calendrier standard. En cas d'échecs répétés, l'accès Premium est suspendu jusqu'à régularisation ; tes données et ta progression restent conservées.",
  },
  {
    title: "7. Réclamation et médiation",
    body: "Pour toute question ou réclamation relative à une commande, contacte-nous via la page Contact. À défaut de résolution amiable, tu peux recourir gratuitement à un médiateur de la consommation dans les conditions prévues par le Code de la consommation.",
  },
];

export default function CgvPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 py-10">
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide">Conditions générales de vente</h1>
      <p className="text-sm text-[var(--color-text-muted)]">
        Ces CGV s&apos;appliquent à toute souscription à l&apos;abonnement Premium {APP_NAME}. Pour l&apos;usage général
        de l&apos;application (compte gratuit compris), voir les{" "}
        <a href="/cgu" className="text-[var(--color-primary-strong)] underline">
          CGU
        </a>
        .
      </p>
      {SECTIONS.map((section) => (
        <Card key={section.title}>
          <CardTitle className="text-base">{section.title}</CardTitle>
          <p className="mt-2 text-sm text-[var(--color-text)]">{section.body}</p>
        </Card>
      ))}
    </div>
  );
}
