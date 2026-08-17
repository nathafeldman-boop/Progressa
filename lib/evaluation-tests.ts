import { EvaluationTestType } from "@prisma/client";

export interface TestProtocol {
  type: EvaluationTestType;
  name: string;
  emoji: string;
  unit: string;
  /** true si une valeur plus basse est meilleure (ex: un temps) */
  lowerIsBetter: boolean;
  protocol: string[];
}

export const TEST_PROTOCOLS: Record<EvaluationTestType, TestProtocol> = {
  JUGGLING: {
    type: "JUGGLING",
    name: "Jonglages max",
    emoji: "🤹",
    unit: "touches",
    lowerIsBetter: false,
    protocol: [
      "Ballon en main, laisse-le tomber et jongle avec les pieds, cuisses ou tête.",
      "Compte chaque touche jusqu'à ce que le ballon touche le sol ou sorte de ton contrôle.",
      "Un seul essai retenu: ton meilleur total.",
    ],
  },
  SHUTTLE_5X10: {
    type: "SHUTTLE_5X10",
    name: "Navette 5×10m",
    emoji: "🏃",
    unit: "secondes",
    lowerIsBetter: true,
    protocol: [
      "Trace deux lignes espacées de 10m.",
      "Fais 5 allers-retours le plus vite possible, en touchant la ligne à chaque fois.",
      "Chronomètre 2 essais avec récupération complète entre les deux, garde le meilleur temps.",
    ],
  },
  PLANK: {
    type: "PLANK",
    name: "Planche max",
    emoji: "🧱",
    unit: "secondes",
    lowerIsBetter: false,
    protocol: [
      "Position de planche ventrale, corps aligné des épaules aux talons.",
      "Tiens la position le plus longtemps possible sans casser l'alignement.",
      "Arrête le chrono dès que les hanches tombent ou remontent trop.",
    ],
  },
  SPRINT_20M: {
    type: "SPRINT_20M",
    name: "Sprint 20m",
    emoji: "💨",
    unit: "secondes",
    lowerIsBetter: true,
    protocol: [
      "Trace un départ et une arrivée à 20m.",
      "Départ arrêté, sprint à fond jusqu'à la ligne d'arrivée.",
      "Chronomètre 2 essais avec récupération complète, garde le meilleur temps.",
    ],
  },
};

/** Cooldown anti-triche (section 6.6): ~4 semaines entre deux passages du même test. */
export const TEST_COOLDOWN_DAYS = 28;

export function nextEligibleDate(lastRecordedAt: Date): Date {
  return new Date(lastRecordedAt.getTime() + TEST_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
}
