import { APP_NAME } from "@/lib/app-config";
import { Card, CardTitle } from "@/components/ui/Card";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Politique de confidentialité",
  `Quelles données ${APP_NAME} collecte, pourquoi, et qui les traite pour nous.`,
  "/confidentialite"
);

const SECTIONS = [
  {
    title: "Ce qu'on collecte",
    body: "Ton prénom, ton année de naissance, ton poste, ton niveau, et les infos que tu donnes volontairement (matériel, objectif, ressenti après les séances). L'usage de l'app — gratuit comme payant — ne dépend d'aucun accord parental : le compte t'appartient, quel que soit ton âge.",
  },
  {
    title: "Pourquoi on le collecte",
    body: "Uniquement pour construire et adapter ton programme d'entraînement, suivre ta progression, et t'envoyer les emails utiles (bienvenue, rappels). On n'utilise jamais tes données pour autre chose.",
  },
  {
    title: "Ce qu'on ne fait jamais",
    body: "Aucun tracking publicitaire, aucune revente de données, aucun partage avec des tiers en dehors des prestataires strictement nécessaires au fonctionnement du service.",
  },
  {
    title: "Qui traite tes données pour nous",
    body: "Supabase (authentification, base de données), Vercel (hébergement), Stripe (paiement, uniquement si tu prends Premium), Resend (emails), et Mistral (génération de ton programme et discussion avec Coach Brian — reçoit ton prénom, ton âge, ton poste et tes points faibles/douleurs signalées, jamais ton email ni tes identifiants). Certains de ces prestataires sont situés hors Union Européenne ; leurs garanties contractuelles (clauses contractuelles types) encadrent ce transfert.",
  },
  {
    title: "Combien de temps on garde tes données",
    body: "Tant que ton compte existe. Si tu le supprimes, tout est effacé immédiatement — sauf ce que la loi nous oblige à garder plus longtemps (ex: factures, pour des raisons comptables).",
  },
  {
    title: "Mesure d'audience",
    body: "On mesure les pages vues et les clics en interne (jamais partagé, jamais publicitaire) pour comprendre ce qui marche et corriger ce qui ne marche pas. Un visiteur anonyme est identifié par un identifiant technique aléatoire, pas par son identité.",
  },
  {
    title: "Douleurs et santé",
    body: "Les infos de santé que tu partages (douleurs, gênes, forme du jour) servent uniquement à adapter ton programme et éviter les blessures — y compris dans les instructions envoyées à l'IA qui génère ton programme (voir « Qui traite tes données »). Elles ne sont jamais partagées à d'autres fins.",
  },
  {
    title: "Avis publics",
    body: "Si tu publies un avis, seul ton prénom est affiché — jamais ton nom de famille.",
  },
  {
    title: "Tes droits",
    body: "Tu peux accéder à tes données, les corriger, les récupérer, ou supprimer ton compte et toutes tes données en un clic depuis Réglages → Mon compte (suppression définitive et immédiate). Pour toute autre demande, écris à contact@progressa.app — on répond personnellement. Tu peux aussi déposer une réclamation auprès de la CNIL (cnil.fr) si tu estimes que tes droits ne sont pas respectés.",
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
