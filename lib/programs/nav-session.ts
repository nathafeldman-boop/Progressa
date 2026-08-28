import { prisma } from "@/lib/prisma";
import { getCurrentWeekStart, todayAsWeekday, tomorrowAsWeekday } from "@/lib/week";

/**
 * Séance vers laquelle pointe le bouton "Séance" de la barre de
 * navigation (un seul tap, pas de détour par le dashboard): celle du
 * jour si elle n'est pas encore terminée, sinon un aperçu de celle de
 * demain quand elle existe, sinon celle du jour quand même (repos ou
 * rien de plus à montrer). Requête volontairement légère (juste
 * id/status/dayOfWeek) — appelée sur chaque page de l'app via le layout,
 * jamais besoin des blocs/exercices ici contrairement à
 * getCurrentWeeklyProgram.
 */
export async function resolveNavSessionId(userId: string): Promise<string | null> {
  const weekStartDate = getCurrentWeekStart();
  const program = await prisma.weeklyProgram.findUnique({
    where: { userId_weekStartDate: { userId, weekStartDate } },
    select: { sessions: { select: { id: true, status: true, dayOfWeek: true } } },
  });
  if (!program) return null;

  const today = todayAsWeekday();
  const todaySession = program.sessions.find((s) => s.dayOfWeek === today) ?? null;
  if (todaySession && todaySession.status !== "COMPLETED") return todaySession.id;

  if (todaySession?.status === "COMPLETED") {
    const tomorrow = tomorrowAsWeekday();
    const tomorrowSession = program.sessions.find((s) => s.dayOfWeek === tomorrow) ?? null;
    if (tomorrowSession) return tomorrowSession.id;
  }

  return todaySession?.id ?? null;
}
