import type { RankTier } from "@/lib/brian/stats-engine";

/**
 * Identité visuelle originale Progressa pour chaque rang de la carte joueur
 * (section 10 du cahier des charges) — pas une réplique d'un jeu existant,
 * juste un dégradé + un accent + une lueur par rang, du plus sobre
 * (Débutant) au plus premium (Élite Suprême). Clé stable = `RankTier.key`
 * dans lib/brian/stats-engine.ts : changer un libellé de rang n'a jamais
 * besoin de toucher ce fichier, et vice-versa.
 */
export interface RankStyle {
  /** Dégradé de fond de la carte, du haut vers le bas. */
  gradient: [string, string];
  /** Couleur de bordure et de la lueur portée. */
  border: string;
  /** Couleur de la note générale et du badge de rang. */
  accent: string;
  /** Texte sur fond `accent` (badge de rang). */
  onAccent: string;
  /** Habillage "premium" réservé au rang le plus haut (particules/éclat). */
  premium?: boolean;
}

export const RANK_STYLES: Record<RankTier["key"], RankStyle> = {
  debutant: {
    gradient: ["#3a2c22", "#1c140f"],
    border: "#8a5a35",
    accent: "#c99a6c",
    onAccent: "#241a12",
  },
  intermediaire: {
    gradient: ["#4a5258", "#262b2e"],
    border: "#9aa5ad",
    accent: "#d4dbe0",
    onAccent: "#20252a",
  },
  avance: {
    gradient: ["#5c4a12", "#2b2205"],
    border: "#c9a227",
    accent: "#f0cc4e",
    onAccent: "#2b2205",
  },
  confirme: {
    gradient: ["#123a24", "#081d13"],
    border: "#1aa350",
    accent: "#3ddc7f",
    onAccent: "#052210",
  },
  espoir: {
    gradient: ["#0f2c52", "#081729"],
    border: "#2f6fed",
    accent: "#6fa2ff",
    onAccent: "#071227",
  },
  pro: {
    gradient: ["#301a52", "#170b29"],
    border: "#7c3aed",
    accent: "#b58bff",
    onAccent: "#160a29",
  },
  elite: {
    gradient: ["#4a1414", "#220707"],
    border: "#dc2626",
    accent: "#ff6b6b",
    onAccent: "#210606"
  },
  elite_supreme: {
    gradient: ["#161616", "#000000"],
    border: "#d4af37",
    accent: "#f3d67c",
    onAccent: "#171006",
    premium: true,
  },
};

export function rankStyleFor(rankKey: string | undefined): RankStyle {
  return RANK_STYLES[rankKey as RankTier["key"]] ?? RANK_STYLES.debutant;
}
