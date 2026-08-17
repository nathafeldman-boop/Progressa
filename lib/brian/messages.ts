import type { BlockStatus, FeltDifficulty, StatAxis } from "@prisma/client";
import { STAT_AXES, STAT_LABELS } from "./types";

/**
 * Personnalité de Brian, à respecter dans TOUT nouveau message ajouté ici:
 * motivant, direct, crédible. Jamais de faux-positif ("INCROYABLE !!!" sur
 * une performance moyenne) et jamais infantilisant. Honnête d'abord —
 * c'est ce qui le rend crédible.
 *
 * Ces messages sont pour l'instant des gabarits déterministes (plusieurs
 * variantes par catégorie, tirées au hasard pour éviter la répétition).
 * Le point d'extension pour Mistral: remplacer `pick(...)` par un appel LLM
 * contraint aux mêmes catégories — la fonction resterait
 * `(contexte) => { category, text }`, rien d'autre ne change en aval.
 */

function pick(variants: string[]): string {
  return variants[Math.floor(Math.random() * variants.length)];
}

export function composeWelcomeMessage(firstName: string): string {
  return `Salut ${firstName}, moi c'est Brian. Je vais suivre ta progression et t'aider à devenir meilleur, entraînement après entraînement.`;
}

/**
 * Brian pose lui-même les questions de l'onboarding — jamais un formulaire
 * générique. Un ton direct et utile: chaque question dit pourquoi elle sert.
 */
export function composeOnboardingIntro(): string {
  return "Salut, moi c'est Brian, ton coach ici sur Progressa. Je vais t'accompagner à chaque entraînement. On commence par faire connaissance : comment tu t'appelles ?";
}

export function composeOnboardingBirthYear(firstName: string): string {
  return `${firstName ? `${firstName}, quelle` : "Quelle"} est ton année de naissance ? Ça me sert à caler ton programme sur ta catégorie d'âge.`;
}

export function composeOnboardingPosition(): string {
  return "À quel poste tu joues sur le terrain ?";
}

export function composeOnboardingCountryLevel(): string {
  return "Dans quel pays et à quel niveau tu évolues ? Ça m'aide à adapter l'intensité de tes séances.";
}

export function composeOnboardingBodyRhythm(): string {
  return "Quelques infos sur ton gabarit et ton rythme au club — tout est facultatif, réponds à ce que tu sais.";
}

export function composeOnboardingEquipment(): string {
  return "Qu'est-ce que tu as sous la main pour t'entraîner ? Je construis tes séances avec ce que tu coches.";
}

export function composeOnboardingObjective(): string {
  return "Quel est ton objectif principal en ce moment ?";
}

export function composeOnboardingRevelation(firstName: string): string {
  return `Ton profil est prêt, ${firstName || "champion"}. Crée ton compte et on commence ton premier entraînement ensemble.`;
}

export function composeFirstSessionIntro(): string {
  return pick([
    "On va commencer simplement. Fais cet exercice comme tu le ferais normalement, je regarde ta performance pour établir tes premières stats.",
    "Pas besoin de te mettre la pression pour ce premier exercice. Fais-le à ton rythme naturel, ça me suffit pour démarrer ton profil.",
  ]);
}

export type ExerciseCategoryKind =
  | "EXERCISE_EXCELLENT"
  | "EXERCISE_GOOD"
  | "EXERCISE_AVERAGE"
  | "EXERCISE_HARD"
  | "EXERCISE_ABANDONED"
  | "EXERCISE_PERSONAL_RECORD";

export function pickExerciseCategory(input: {
  status: BlockStatus;
  feltDifficulty: FeltDifficulty | null;
  isPersonalRecord: boolean;
}): ExerciseCategoryKind {
  if (input.status === "ABANDONED" || input.status === "SKIPPED") return "EXERCISE_ABANDONED";
  if (input.isPersonalRecord) return "EXERCISE_PERSONAL_RECORD";
  if (input.feltDifficulty === "HARD" || input.feltDifficulty === "VERY_HARD") return "EXERCISE_HARD";
  if (input.feltDifficulty === "VERY_EASY") return "EXERCISE_EXCELLENT";
  if (input.feltDifficulty === "EASY") return "EXERCISE_GOOD";
  return "EXERCISE_AVERAGE";
}

const EXERCISE_TEMPLATES: Record<ExerciseCategoryKind, string[]> = {
  EXERCISE_EXCELLENT: [
    "Excellent. Tu as clairement le niveau au-dessus sur cet exercice.",
    "Propre du début à la fin. On va pouvoir corser un peu la suite.",
    "Très bon rythme, et tu le confirmes toi-même : ça devient facile pour toi.",
  ],
  EXERCISE_GOOD: [
    "Bien joué. Bonne exécution, rien à redire.",
    "Solide. Continue comme ça.",
    "Bonne séance sur cet exercice, tu progresses bien.",
  ],
  EXERCISE_AVERAGE: [
    "Pas mal. Il y a encore de la marge, mais c'est une bonne base.",
    "Correct. On va travailler ça pour que ce soit plus naturel la prochaine fois.",
    "C'est fait, proprement. Rien d'exceptionnel, mais c'est le travail qui compte.",
  ],
  EXERCISE_HARD: [
    "Ça t'a coûté, mais tu n'as pas lâché. C'est exactement ce genre d'effort qui paie sur la durée.",
    "Exercice exigeant pour toi, et tu es allé au bout. On va continuer à travailler ce point.",
  ],
  EXERCISE_ABANDONED: [
    "Tu n'as pas terminé cet exercice. Pas grave, mais ça ne compte pas comme une vraie progression.",
    "Exercice interrompu. La prochaine fois, essaie d'aller jusqu'au bout, même à un rythme plus lent.",
    "Tu as sauté celui-ci. Rappelle-toi : c'est en le faisant que tu progresses, pas en le regardant.",
  ],
  EXERCISE_PERSONAL_RECORD: [
    "Nouveau record personnel sur cet exercice. Tu progresses vraiment.",
    "C'est ta meilleure performance sur cet exercice depuis que tu as commencé. Bravo.",
  ],
};

function formatDeltas(deltas: Partial<Record<StatAxis, number>>): string {
  const parts = STAT_AXES.filter((axis) => deltas[axis]).map((axis) => `+${deltas[axis]} en ${STAT_LABELS[axis]}`);
  if (parts.length === 0) return "";
  if (parts.length === 1) return `Je te donne ${parts[0]}.`;
  return `Je te donne ${parts.slice(0, -1).join(", ")} et ${parts[parts.length - 1]}.`;
}

export function composeExerciseMessage(input: {
  category: ExerciseCategoryKind;
  deltas: Partial<Record<StatAxis, number>>;
}): string {
  const intro = pick(EXERCISE_TEMPLATES[input.category]);
  const deltaLine = formatDeltas(input.deltas);
  return deltaLine ? `${intro} ${deltaLine}` : intro;
}

export function composeSessionSummaryMessage(input: {
  exercisesCompleted: number;
  exercisesTotal: number;
  totalMinutes: number;
  strongestAxisLabel: string | null;
  weakestAxisLabel: string | null;
}): string {
  if (input.exercisesCompleted === 0) {
    return pick([
      "Séance légère aujourd'hui. Essaie de t'y remettre sérieusement demain — c'est la régularité qui fait la différence.",
      "Peu d'exercices terminés cette fois. Ce n'est pas dramatique, mais ta progression dépend de ce que tu termines vraiment.",
    ]);
  }

  const opener = pick(["Bon travail aujourd'hui.", "Séance solide.", "Bonne séance."]);
  const focus =
    input.strongestAxisLabel && input.weakestAxisLabel && input.strongestAxisLabel !== input.weakestAxisLabel
      ? ` Tu as surtout progressé en ${input.strongestAxisLabel}. Ton point faible reste encore ${input.weakestAxisLabel.toLowerCase()}.`
      : "";
  const closing = pick([
    " Demain, je vais te préparer quelque chose de plus ciblé.",
    " On continue sur cette lancée demain.",
  ]);

  return `${opener}${focus}${closing}`;
}

export function composeWeeklyTrendLine(axisLabel: string, delta: number): string {
  if (delta <= 0) return `Ton niveau en ${axisLabel.toLowerCase()} n'a pas bougé cette semaine — on va s'y remettre.`;
  return `Tu as gagné ${delta} point${delta > 1 ? "s" : ""} en ${axisLabel.toLowerCase()} cette semaine.`;
}

export function composeRetentionMessage(): string {
  return pick([
    "Ton entraînement est terminé. Reviens demain, je te prépare la suite.",
    "Prêt pour la suite ? Je te prépare ton prochain entraînement pour demain.",
  ]);
}
