import { prisma } from "@/lib/prisma";
import type { ProgramOutput } from "@/lib/ai/program-schema";
import type { ProgramSource } from "@prisma/client";

export async function persistWeeklyProgram(
  userId: string,
  weekStartDate: Date,
  program: ProgramOutput,
  source: ProgramSource,
  rawModelOutput: unknown
) {
  const slugs = Array.from(new Set(program.sessions.flatMap((s) => s.blocks.map((b) => b.exerciseSlug))));
  const exercises = await prisma.exercise.findMany({ where: { slug: { in: slugs } } });
  const exerciseIdBySlug = new Map(exercises.map((e) => [e.slug, e.id]));

  return prisma.weeklyProgram.create({
    data: {
      userId,
      weekStartDate,
      source,
      rawModelOutput: rawModelOutput ? JSON.parse(JSON.stringify(rawModelOutput)) : undefined,
      sessions: {
        create: program.sessions.map((session, sessionIndex) => ({
          dayOfWeek: session.dayOfWeek,
          order: sessionIndex,
          title: session.title,
          focusObjective: session.focusObjective ?? undefined,
          isMatchAdjacent: session.isMatchAdjacent,
          blocks: {
            create: session.blocks.map((block, blockIndex) => {
              const exerciseId = exerciseIdBySlug.get(block.exerciseSlug);
              if (!exerciseId) {
                throw new Error(`persistWeeklyProgram: exercise slug ${block.exerciseSlug} not found in DB`);
              }
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
        })),
      },
    },
    include: { sessions: { include: { blocks: true } } },
  });
}
