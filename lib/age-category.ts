/**
 * Catégorie d'âge FFF: U(année de fin de saison - année de naissance).
 * La saison démarre le 1er juillet (ex: saison 2025/2026 se termine en 2026).
 * On ne collecte que l'année de naissance à l'onboarding (pas la date
 * complète), donc l'âge est toujours une approximation par année civile —
 * c'est la convention standard du football amateur pour les catégories.
 */

const SEASON_START_MONTH_INDEX = 6; // juillet, 0-indexé

export function getSeasonEndYear(referenceDate: Date = new Date()): number {
  const month = referenceDate.getMonth();
  const year = referenceDate.getFullYear();
  return month >= SEASON_START_MONTH_INDEX ? year + 1 : year;
}

export interface AgeCategory {
  seasonEndYear: number;
  categoryNumber: number;
  label: string; // ex: "U16"
  approxAge: number;
}

// Au-delà de cette catégorie, "U27" ou "U30" ne veut plus rien dire pour un
// joueur amateur — la convention du foot amateur passe à "Senior" (public
// cible 16 ans et plus, sans limite haute, donc la majorité des joueurs
// est en senior).
const MAX_YOUTH_CATEGORY = 19;

export function getAgeCategory(birthYear: number, referenceDate: Date = new Date()): AgeCategory {
  const seasonEndYear = getSeasonEndYear(referenceDate);
  const categoryNumber = seasonEndYear - birthYear;
  return {
    seasonEndYear,
    categoryNumber,
    label: categoryNumber <= MAX_YOUTH_CATEGORY ? `U${categoryNumber}` : "Senior",
    approxAge: referenceDate.getFullYear() - birthYear,
  };
}

/** Bande d'âge utilisée par les règles de génération IA (section 6.2 du produit). Public cible: 16 ans et plus, sans limite haute. */
export type AiAgeBand = "16-17" | "18-24" | "25+";

export function getAiAgeBand(birthYear: number, referenceDate: Date = new Date()): AiAgeBand {
  const { approxAge } = getAgeCategory(birthYear, referenceDate);
  if (approxAge <= 17) return "16-17";
  if (approxAge <= 24) return "18-24";
  return "25+";
}

export function isMinor(birthYear: number, referenceDate: Date = new Date()): boolean {
  return getAgeCategory(birthYear, referenceDate).approxAge < 18;
}

/** Un exercice avec minAge=15 n'est éligible qu'à partir de la bande 15-17. */
export function meetsMinAge(birthYear: number, minAge: 13 | 15, referenceDate: Date = new Date()): boolean {
  const { approxAge } = getAgeCategory(birthYear, referenceDate);
  return approxAge >= minAge;
}
