import { Weekday } from "@prisma/client";

const WEEK_ORDER: Weekday[] = [
  Weekday.MONDAY,
  Weekday.TUESDAY,
  Weekday.WEDNESDAY,
  Weekday.THURSDAY,
  Weekday.FRIDAY,
  Weekday.SATURDAY,
  Weekday.SUNDAY,
];

/**
 * Choisit les jours de la semaine pour les séances. Le jour du match reste
 * un repos complet — jamais de séance ce jour-là. La veille du match, elle,
 * n'est PAS écartée: si elle tombe parmi les jours retenus, elle devient une
 * séance légère ("matchAdjacentDays", section 1 du produit — technique/
 * prévention uniquement, jamais de renforcement ou d'explosivité) plutôt
 * qu'un jour de repos de plus. C'est ce qui permet à Coach Brian de parler
 * du match à venir pendant cette séance au lieu de la sauter en silence.
 */
export function pickTargetWeekDays(
  sessionCount: number,
  matchDay: Weekday | null
): { targetWeekDays: Weekday[]; matchAdjacentDays: Weekday[] } {
  if (!matchDay) {
    return { targetWeekDays: WEEK_ORDER.slice(0, sessionCount), matchAdjacentDays: [] };
  }

  const matchIndex = WEEK_ORDER.indexOf(matchDay);
  const eveDay = WEEK_ORDER[(matchIndex - 1 + WEEK_ORDER.length) % WEEK_ORDER.length];

  const available = WEEK_ORDER.filter((day) => day !== matchDay);
  const targetWeekDays = available.slice(0, sessionCount);
  const matchAdjacentDays = targetWeekDays.includes(eveDay) ? [eveDay] : [];

  return { targetWeekDays, matchAdjacentDays };
}
