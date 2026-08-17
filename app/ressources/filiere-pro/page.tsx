import { ArticlePage } from "@/components/editorial/ArticlePage";

export default function FilliereProPage() {
  return (
    <ArticlePage
      title="La vraie filière pro"
      intro="On préfère te dire la vérité plutôt que te vendre du rêve. Voici comment ça se passe vraiment, pour que tu puisses avancer avec les yeux ouverts — sans que ça t'empêche de viser haut."
      sections={[
        {
          heading: "Les chiffres, sans filtre",
          emoji: "📊",
          body: [
            "Sur l'ensemble des jeunes qui intègrent un centre de formation en France, seule une petite minorité signera un jour un contrat professionnel — et parmi eux, encore moins auront une carrière longue.",
            "Ce n'est pas dit pour décourager: c'est dit parce que construire un plan B solide (école, formation) n'est pas un aveu d'échec, c'est ce que font la plupart des joueurs qui réussissent le mieux leur vie après le foot — pro ou pas.",
          ],
        },
        {
          heading: "Ce qui compte vraiment à ton âge",
          emoji: "🌱",
          body: [
            "Avant 15-16 ans, la marge de progression physique et technique est énorme et très individuelle: un joueur \"moyen\" à 13 ans peut largement dépasser un joueur \"précoce\" à 17 ans. Les recruteurs le savent — rien n'est joué.",
            "Ce qui fait la différence sur la durée: la régularité à l'entraînement, l'attitude (écoute, envie d'apprendre, gestion de la frustration), et la santé (prévention des blessures, sommeil, alimentation) — bien plus qu'un exploit isolé.",
          ],
        },
        {
          heading: "L'école n'est pas un obstacle, c'est une protection",
          emoji: "🎓",
          body: [
            "Même dans les meilleurs centres de formation, la scolarité reste obligatoire et suivie de près — précisément parce que les clubs savent que la majorité des jeunes n'ira pas jusqu'au contrat pro.",
            "Garder un bon niveau scolaire ne ralentit pas la progression sportive: ça sécurise l'avenir, quel que soit le chemin que prend la carrière de joueur.",
          ],
        },
        {
          heading: "Le foot, ce n'est pas que joueur",
          emoji: "🧭",
          body: [
            "Préparateur physique, kiné du sport, entraîneur, analyste vidéo, agent, journaliste sportif, dirigeant de club, éducateur — il existe de nombreux métiers passionnants autour du football, souvent plus accessibles qu'une carrière de joueur professionnel, et tout aussi utiles pour rester dans ce milieu qu'on aime.",
          ],
        },
        {
          heading: "Ce qu'on peut t'aider à faire, concrètement",
          emoji: "💪",
          body: [
            "Progresser sérieusement à ton rythme, éviter les blessures évitables, suivre ta progression avec des chiffres réels plutôt que des impressions — c'est notre rôle. La suite dépendra de beaucoup de facteurs qui ne dépendent pas que de toi, et c'est normal.",
          ],
        },
      ]}
    />
  );
}
