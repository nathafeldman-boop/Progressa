export interface BadgeSeed {
  slug: string;
  name: string;
  emoji: string;
  description: string;
}

export const BADGE_CATALOG: BadgeSeed[] = [
  { slug: "premiere-seance", name: "Première séance", emoji: "🎬", description: "Tu as terminé ta toute première séance." },
  { slug: "serie-3", name: "Série de 3", emoji: "🔥", description: "3 séances validées d'affilée." },
  { slug: "serie-7", name: "Série de 7", emoji: "🔥", description: "7 séances validées d'affilée." },
  { slug: "dix-seances", name: "10 séances", emoji: "💪", description: "10 séances complétées au total." },
  { slug: "vingt-cinq-seances", name: "25 séances", emoji: "🏆", description: "25 séances complétées au total." },
  { slug: "premier-test", name: "Premier test", emoji: "📊", description: "Tu as passé ton premier test d'évaluation." },
  { slug: "progression-mesuree", name: "Progression mesurée", emoji: "📈", description: "Amélioration constatée sur un test d'évaluation." },
];
