import { ArticlePage } from "@/components/editorial/ArticlePage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Préparation mentale du footballeur",
  "Gérer la pression, l'erreur, la confiance en soi : la préparation mentale du jeune footballeur expliquée simplement, avec des repères concrets à appliquer en match.",
  "/ressources/mental"
);

export default function MentalPage() {
  return (
    <ArticlePage
      title="Mental"
      intro="Le physique et la technique ne suffisent pas. Ce qui fait souvent la différence en match, c'est la tête — et ça se travaille comme le reste."
      sections={[
        {
          heading: "Avant le match: se concentrer sur ce que tu contrôles",
          emoji: "🎯",
          body: [
            "Tu ne contrôles pas l'adversaire, l'arbitre, ou le résultat. Tu contrôles ton placement, ton intensité, tes choix de passe.",
            "Fixe-toi 1 ou 2 objectifs simples et personnels pour le match (\"je gagne mes duels\", \"je suis disponible pour mes coéquipiers\") plutôt que de penser au score.",
          ],
        },
        {
          heading: "Gérer l'erreur",
          emoji: "🔄",
          body: [
            "Une erreur qui traîne dans la tête pendant 10 minutes coûte souvent plus cher que l'erreur elle-même. Le geste qui marche: reconnaître l'erreur en une seconde, puis passer à l'action suivante.",
            "Une phrase courte et neutre (\"suivant\", \"on efface\") peut suffire à couper le fil des ruminations en plein match.",
          ],
        },
        {
          heading: "La pression, ça se prépare",
          emoji: "💓",
          body: [
            "Avant un moment important (un penalty, un match décisif), respire lentement: 4 secondes d'inspiration, 6 secondes d'expiration. Ça fait redescendre le rythme cardiaque et clarifie les idées.",
            "Visualiser le geste juste avant de le faire (le tir, le contrôle) est une technique utilisée par beaucoup de joueurs pros — ça se travaille à l'entraînement, pas seulement en match.",
          ],
        },
        {
          heading: "La confiance se construit, elle ne tombe pas du ciel",
          emoji: "📈",
          body: [
            "La confiance vient de la préparation: plus tu as travaillé un geste à l'entraînement, plus il devient naturel sous pression en match.",
            "Note après chaque match une chose que tu as bien faite, même dans une défaite. Ça construit une image réaliste de ta progression, pas juste basée sur le résultat.",
          ],
        },
      ]}
    />
  );
}
