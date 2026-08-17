import { APP_NAME } from "@/lib/app-config";
import { Card, CardTitle } from "@/components/ui/Card";

const SECTIONS = [
  {
    title: "Ce qu'on collecte",
    body: "Ton prénom, ton année de naissance, ton poste, ton niveau, et les infos que tu donnes volontairement (matériel, objectif, ressenti après les séances). Si tu es mineur, l'email d'un parent est facultatif pour l'usage gratuit — il devient nécessaire seulement pour payer l'abonnement.",
  },
  {
    title: "Pourquoi on le collecte",
    body: "Uniquement pour construire et adapter ton programme d'entraînement, suivre ta progression, et t'envoyer les emails utiles (bienvenue, rappels). On n'utilise jamais tes données pour autre chose.",
  },
  {
    title: "Ce qu'on ne fait jamais",
    body: "Aucun tracking publicitaire, aucune revente de données, aucun partage avec des tiers en dehors des prestataires strictement nécessaires au fonctionnement du service (hébergement, paiement, emails).",
  },
  {
    title: "Douleurs et santé",
    body: "Les infos de santé que tu partages (douleurs, gênes, forme du jour) servent uniquement à adapter ton programme et éviter les blessures. Elles ne sont jamais partagées.",
  },
  {
    title: "Avis publics",
    body: "Si tu publies un avis, seul ton prénom est affiché — jamais ton nom de famille.",
  },
  {
    title: "Tes droits",
    body: "Tu peux supprimer ton compte et toutes tes données en un clic depuis Réglages → Mon compte. La suppression est définitive et immédiate.",
  },
];

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 py-10">
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide">Confidentialité</h1>
      <p className="text-[var(--color-text-muted)]">
        Chez {APP_NAME}, on garde ça simple: on ne prend que ce dont on a besoin pour t&apos;aider à progresser, et
        rien d&apos;autre. Voici tout, en clair.
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
