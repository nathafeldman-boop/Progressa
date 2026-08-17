import { ArticlePage } from "@/components/editorial/ArticlePage";

export default function NutritionPage() {
  return (
    <ArticlePage
      title="Nutrition"
      intro="Pas besoin d'un régime compliqué: quelques repères simples, calés sur ton calendrier de match, font déjà une vraie différence."
      sections={[
        {
          heading: "2-3 jours avant le match",
          emoji: "🍚",
          body: [
            "Mange normalement, sans excès. L'objectif n'est pas de \"faire le plein\" la veille, mais d'avoir des réserves d'énergie correctes sur plusieurs jours: féculents (pâtes, riz, pain), légumes, un peu de protéines à chaque repas.",
            "Hydrate-toi régulièrement dans la journée, pas seulement pendant l'entraînement.",
          ],
        },
        {
          heading: "La veille du match",
          emoji: "🍝",
          body: [
            "Un repas riche en glucides simples à digérer (pâtes, riz), avec une portion de protéines maigres (poulet, poisson, œufs) et des légumes cuits plutôt que crus si tu as l'estomac sensible.",
            "Évite les plats trop gras, trop épicés ou totalement nouveaux — ce n'est jamais le bon moment pour tester un nouvel aliment.",
          ],
        },
        {
          heading: "Le jour J",
          emoji: "🍌",
          body: [
            "Dernier vrai repas 3 à 4h avant le coup d'envoi: féculents + protéines légères, peu de fibres et de matières grasses pour ne pas alourdir la digestion.",
            "Dans l'heure qui précède: une collation légère si besoin (banane, compote, quelques biscuits secs) et de l'eau par petites gorgées régulières.",
            "Pendant le match: de l'eau, voire une boisson isotonique si le match est intense ou qu'il fait chaud.",
          ],
        },
        {
          heading: "Après le match",
          emoji: "🥛",
          body: [
            "Les 30 minutes qui suivent sont les plus utiles pour la récupération: un mélange glucides + protéines (yaourt et fruit, pain et jambon, boisson de récupération) aide à relancer la réparation musculaire.",
            "Continue de boire régulièrement dans les heures qui suivent, surtout si tu as beaucoup transpiré.",
          ],
        },
        {
          heading: "Au quotidien",
          emoji: "🥦",
          body: [
            "Trois repas réguliers, des fruits et légumes tous les jours, une hydratation constante (pas seulement quand tu as soif) — c'est ça qui construit la vraie différence sur la durée, bien plus qu'un repas \"parfait\" ponctuel.",
          ],
        },
      ]}
    />
  );
}
