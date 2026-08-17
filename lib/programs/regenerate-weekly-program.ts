import { prisma } from "@/lib/prisma";
import { generateWeeklyProgram } from "@/lib/ai/generate-program";
import { getCurrentWeekStart } from "@/lib/week";
import { isPremiumActive, sessionCountForTier } from "@/lib/subscription";
import { pickTargetWeekDays } from "@/lib/scheduling";
import type { Weekday } from "@prisma/client";

const REGEN_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes anti-spam

export type RegenerateResult =
  | { ok: true }
  | { ok: false; reason: "cooldown"; retryAfterMs: number }
  | { ok: false; reason: "no_profile" };

/**
 * Régénération manuelle du programme de la semaine en cours. Règle non
 * négociable: une séance déjà validée par le joueur n'est JAMAIS écrasée —
 * on ne touche qu'aux jours dont la séance n'a pas encore été complétée.
 */
export async function regenerateWeeklyProgram(userId: string): Promise<RegenerateResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, reason: "no_profile" };

  if (user.lastManualRegenAt) {
    const elapsed = Date.now() - user.lastManualRegenAt.getTime();
    if (elapsed < REGEN_COOLDOWN_MS) {
      return { ok: false, reason: "cooldown", retryAfterMs: REGEN_COOLDOWN_MS - elapsed };
    }
  }

  const [profile, subscription, unresolvedPain] = await Promise.all([
    prisma.playerProfile.findUnique({ where: { userId } }),
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.painLog.findMany({ where: { userId, status: "UNRESOLVED" } }),
  ]);
  if (!profile) return { ok: false, reason: "no_profile" };

  const weekStartDate = getCurrentWeekStart();
  const existing = await prisma.weeklyProgram.findUnique({
    where: { userId_weekStartDate: { userId, weekStartDate } },
    include: { sessions: true },
  });

  const sessionCount = sessionCountForTier(subscription);
  const existingDays = existing?.sessions.map((s) => s.dayOfWeek) ?? [];
  const { targetWeekDays, matchAdjacentDays } =
    existingDays.length > 0
      ? { targetWeekDays: existingDays.slice(0, sessionCount) as Weekday[], matchAdjacentDays: [] as Weekday[] }
      : pickTargetWeekDays(sessionCount, profile.matchDay);

  const result = await generateWeeklyProgram({
    firstName: user.firstName,
    birthYear: profile.birthYear,
    position: profile.position,
    country: profile.country,
    levelLabel: profile.levelLabel,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    clubSessionsPerWeek: profile.clubSessionsPerWeek,
    matchDay: profile.matchDay,
    equipment: profile.equipment,
    objective: profile.objective,
    weakPointNote: profile.weakPointNote,
    unresolvedPain: unresolvedPain.map((p) => ({ bodyPart: p.bodyPart, note: p.note })),
    previousWeek: null,
    sessionCount,
    targetWeekDays,
    matchAdjacentDays,
    isPremium: isPremiumActive(subscription),
  });

  const weeklyProgram =
    existing ??
    (await prisma.weeklyProgram.create({
      data: { userId, weekStartDate, source: result.source },
    }));

  const existingByDay = new Map((existing?.sessions ?? []).map((s) => [s.dayOfWeek, s]));
  const slugs = Array.from(new Set(result.program.sessions.flatMap((s) => s.blocks.map((b) => b.exerciseSlug))));
  const exercises = await prisma.exercise.findMany({ where: { slug: { in: slugs } } });
  const exerciseIdBySlug = new Map(exercises.map((e) => [e.slug, e.id]));

  for (const [sessionIndex, session] of result.program.sessions.entries()) {
    const existingSession = existingByDay.get(session.dayOfWeek);
    if (existingSession?.status === "COMPLETED") {
      continue; // ne jamais écraser une séance déjà validée
    }
    if (existingSession) {
      await prisma.programSession.delete({ where: { id: existingSession.id } });
    }
    await prisma.programSession.create({
      data: {
        weeklyProgramId: weeklyProgram.id,
        dayOfWeek: session.dayOfWeek,
        order: sessionIndex,
        title: session.title,
        focusObjective: session.focusObjective ?? undefined,
        isMatchAdjacent: session.isMatchAdjacent,
        blocks: {
          create: session.blocks.map((block, blockIndex) => {
            const exerciseId = exerciseIdBySlug.get(block.exerciseSlug);
            if (!exerciseId) throw new Error(`regenerateWeeklyProgram: unknown slug ${block.exerciseSlug}`);
            return {
              exerciseId,
              order: blockIndex,
              phase: block.phase,
              sets: block.sets ?? undefined,
              reps: block.reps ?? undefined,
              restSeconds: block.restSeconds ?? undefined,
              customInstruction: block.customInstruction,
            };
          }),
        },
      },
    });
  }

  await prisma.user.update({ where: { id: userId }, data: { lastManualRegenAt: new Date() } });

  return { ok: true };
}
