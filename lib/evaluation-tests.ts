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
  TIR_PRECISION: {
    type: "TIR_PRECISION",
    name: "Précision de tir",
    emoji: "🎯",
    unit: "tirs cadrés /10",
    lowerIsBetter: false,
    protocol: [
      "Place une cible (cône, sac, ou zone marquée d'environ 1m) dans un coin du but, ou entre deux repères si tu n'as pas de but.",
      "Place-toi à 11m (distance d'un penalty) et tire, en visant la cible à chaque fois.",
      "10 tirs au total: compte uniquement ceux qui touchent réellement la cible.",
    ],
  },
  PASSE_PRECISION: {
    type: "PASSE_PRECISION",
    name: "Précision de passe",
    emoji: "🎯",
    unit: "passes réussies /10",
    lowerIsBetter: false,
    protocol: [
      "Place deux plots (ou objets) espacés d'1m pour former une petite porte, à 10m de toi.",
      "Fais des passes précises pour faire passer le ballon entre les deux plots.",
      "10 tentatives au total: compte uniquement les passes qui traversent vraiment la porte.",
    ],
  },
};

/**
 * Plancher de plausibilité physique (secondes) sous lequel le chrono ne peut
 * pas encore être arrêté — évite un résultat impossible (ex: sprint de 20m
 * en 0,8s) obtenu en appuyant sur "Arrêter" immédiatement. Uniquement sur
 * les tests où finir trop vite fausse le résultat dans le bon sens
 * (chronométrés ou comptage nécessitant un vrai temps d'exécution) — pas sur
 * JUGGLING, où un temps très court (perte immédiate du ballon) est un
 * résultat réel et légitime.
 */
export const MIN_PLAUSIBLE_SECONDS: Partial<Record<EvaluationTestType, number>> = {
  SHUTTLE_5X10: 11,
  SPRINT_20M: 2.3,
  TIR_PRECISION: 45,
  PASSE_PRECISION: 35,
};

export interface ValueBounds {
  min: number;
  max: number;
}

/**
 * Bornes de plausibilité sur la VALEUR soumise elle-même (à ne pas
 * confondre avec MIN_PLAUSIBLE_SECONDS ci-dessus, qui borne le temps passé
 * sur l'écran du test, pas la valeur — pour TIR_PRECISION/PASSE_PRECISION
 * la valeur est un compte sur 10, sans rapport avec les secondes). Vérifiées
 * côté serveur dans /api/tests/submit: sans ça, un appel direct à l'API
 * (hors chrono de l'app) pouvait soumettre n'importe quel nombre positif et
 * fausser la carte joueur + les classements. Volontairement généreuses —
 * jamais bloquer un vrai résultat fort, seulement ce qui ne peut
 * physiquement ou logiquement pas être réel.
 */
export const VALUE_BOUNDS: Record<EvaluationTestType, ValueBounds> = {
  JUGGLING: { min: 0, max: 5000 },
  SHUTTLE_5X10: { min: MIN_PLAUSIBLE_SECONDS.SHUTTLE_5X10!, max: 120 },
  PLANK: { min: 0, max: 1800 },
  // 15s rejetait des temps de débutant réels saisis à la main (ex: 20s pour
  // un jeune sur 20m) — cette borne ne doit exclure que l'impossible, pas le
  // simplement lent, surtout que la saisie manuelle ("estimer mon niveau")
  // passe par le même endpoint que le chrono.
  SPRINT_20M: { min: MIN_PLAUSIBLE_SECONDS.SPRINT_20M!, max: 30 },
  TIR_PRECISION: { min: 0, max: 10 },
  PASSE_PRECISION: { min: 0, max: 10 },
};

/** Cooldown anti-triche (section 6.6): ~4 semaines entre deux passages du même test. */
export const TEST_COOLDOWN_DAYS = 28;

export function nextEligibleDate(lastRecordedAt: Date): Date {
  return new Date(lastRecordedAt.getTime() + TEST_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
}
