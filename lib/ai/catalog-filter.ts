import { Equipment, Position } from "@prisma/client";
import { EXERCISE_CATALOG, type ExerciseSeed } from "@/lib/exercises/catalog-data";
import { meetsMinAge } from "@/lib/age-category";

export interface CatalogFilterInput {
  birthYear: number;
  position: Position;
  equipment: Equipment[];
  /** Parties du corps avec une douleur non résolue: on écarte les exercices qui les sollicitent. */
  unresolvedPainBodyParts?: string[];
  referenceDate?: Date;
  /** Compte gratuit: restreint au sous-ensemble freemium (~15% du catalogue, section 3). */
  isPremium?: boolean;
}

const equipmentSet = (equipment: Equipment[]) => new Set(equipment.length ? equipment : [Equipment.NONE]);

/**
 * Matériel "substituable": des plots ne sont jamais un vrai blocage — une
 * paire de chaussettes, un sac ou une bouteille au sol font l'affaire. On ne
 * retire donc jamais un exercice du catalogue pour cette seule raison; c'est
 * à l'IA (system-prompt) de préciser la substitution dans sa consigne quand
 * le joueur n'a pas coché "Plots" dans son matériel.
 */
const SUBSTITUTABLE_EQUIPMENT = new Set<Equipment>([Equipment.CONES]);

/**
 * Filtre le catalogue AVANT de le donner à l'IA: âge minimum, poste,
 * matériel réellement disponible. L'IA ne voit jamais un exercice qu'elle
 * ne pourrait pas prescrire — elle choisit uniquement dans ce sous-ensemble.
 */
export function filterCatalogForProfile(input: CatalogFilterInput): ExerciseSeed[] {
  const available = equipmentSet(input.equipment);

  return EXERCISE_CATALOG.filter((exercise) => {
    const minAgeOk = meetsMinAge(input.birthYear, exercise.minAge, input.referenceDate);
    if (!minAgeOk) return false;

    const positionOk = exercise.positions.length === 0 || exercise.positions.includes(input.position);
    if (!positionOk) return false;

    const equipmentOk = exercise.equipment.every(
      (eq) => eq === Equipment.NONE || SUBSTITUTABLE_EQUIPMENT.has(eq) || available.has(eq)
    );
    if (!equipmentOk) return false;

    if (input.isPremium === false && !exercise.isFreeTier) return false;

    return true;
  });
}

/**
 * Exclut en plus les exercices qui ciblent une zone de douleur non résolue
 * signalée par le joueur (prévention avant tout). Séparé du filtre
 * principal car la correspondance zone-de-douleur -> exercice est une
 * heuristique par mots-clés, volontairement conservatrice.
 */
const BODY_PART_KEYWORDS: Record<string, string[]> = {
  cheville: ["cheville", "mollet", "pointe"],
  genou: ["genou", "squat", "fente", "saut", "bondissement"],
  ischio: ["ischio", "sprint", "talon"],
  aine: ["adducteur", "aine", "latéral"],
  dos: ["lombaire", "dos", "gainage"],
  epaule: ["épaule", "plongeon"],
};

export function excludePainfulAreas(catalog: ExerciseSeed[], unresolvedPainBodyParts: string[] = []): ExerciseSeed[] {
  if (unresolvedPainBodyParts.length === 0) return catalog;

  const keywords = unresolvedPainBodyParts
    .flatMap((part) => BODY_PART_KEYWORDS[part.toLowerCase()] ?? [part.toLowerCase()])
    .map((k) => k.toLowerCase());

  return catalog.filter((exercise) => {
    const haystack = `${exercise.name} ${exercise.description} ${exercise.slug}`.toLowerCase();
    return !keywords.some((k) => haystack.includes(k));
  });
}
