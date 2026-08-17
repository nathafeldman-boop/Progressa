/** Lundi 00:00 de la semaine contenant referenceDate (semaine ISO). */
export function getCurrentWeekStart(referenceDate: Date = new Date()): Date {
  const date = new Date(Date.UTC(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate()));
  const day = date.getUTCDay(); // 0 = dimanche
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diffToMonday);
  return date;
}
