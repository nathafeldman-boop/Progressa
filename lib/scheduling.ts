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
 * Choisit les jours de la semaine pour les séances, en écartant
 * systématiquement le jour du match ET la veille — jamais un complément
 * intense (ou même léger) ne doit s'y glisser (section 1 du produit).
 */
export function pickTargetWeekDays(
  sessionCount: number,
  matchDay: Weekday | null
): { targetWeekDays: Weekday[]; matchAdjacentDays: Weekday[] } {
  if (!matchDay) {
    return { targetWeekDays: WEEK_ORDER.slice(0, sessionCount), matchAdjacentDays: [] };
  }

  const matchIndex = WEEK_ORDER.indexOf(matchDay);
  const eveIndex = (matchIndex - 1 + WEEK_ORDER.length) % WEEK_ORDER.length;
  const forbidden = new Set([matchIndex, eveIndex]);

  const available = WEEK_ORDER.filter((_, i) => !forbidden.has(i));
  const targetWeekDays = available.slice(0, sessionCount);

  return { targetWeekDays, matchAdjacentDays: [] };
}
