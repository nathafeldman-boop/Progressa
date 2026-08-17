import { BlockPhase, ExerciseCategory, type Objective } from "@prisma/client";
import type { ExerciseSeed } from "@/lib/exercises/catalog-data";
import type { ProgramOutput } from "@/lib/ai/program-schema";

export interface BusinessRuleContext {
  catalogBySlug: Map<string, ExerciseSeed>;
  expectedSessionCount: number;
  playerObjective: Objective;
}

export interface BusinessRuleResult {
  valid: boolean;
  errors: string[];
}

const INTENSE_CATEGORIES: ExerciseCategory[] = [ExerciseCategory.STRENGTH, ExerciseCategory.EXPLOSIVENESS];

/**
 * Règles de composition NON NÉGOCIABLES (section 6.2 du produit), vérifiées
 * mécaniquement sur la sortie de l'IA (et sur le programme de repli, qui
 * doit lui aussi les respecter). Si une règle échoue, l'appelant retente
 * une fois puis bascule sur le programme-template déterministe.
 */
export function validateProgramBusinessRules(program: ProgramOutput, ctx: BusinessRuleContext): BusinessRuleResult {
  const errors: string[] = [];

  if (program.sessions.length !== ctx.expectedSessionCount) {
    errors.push(`expected ${ctx.expectedSessionCount} sessions, got ${program.sessions.length}`);
  }

  let objectiveCovered = false;

  for (const session of program.sessions) {
    const phases = new Set(session.blocks.map((b) => b.phase));
    if (!phases.has(BlockPhase.WARMUP)) errors.push(`session ${session.dayOfWeek}: missing WARMUP block`);
    if (!phases.has(BlockPhase.MAIN)) errors.push(`session ${session.dayOfWeek}: missing MAIN block`);
    if (!phases.has(BlockPhase.COOLDOWN)) errors.push(`session ${session.dayOfWeek}: missing COOLDOWN block`);

    for (const block of session.blocks) {
      const exercise = ctx.catalogBySlug.get(block.exerciseSlug);
      if (!exercise) {
        // Défense en profondeur: ne devrait jamais arriver, Zod l'a déjà
        // rejeté via l'enum de slugs autorisés.
        errors.push(`session ${session.dayOfWeek}: unknown slug ${block.exerciseSlug}`);
        continue;
      }

      if (session.isMatchAdjacent && block.phase === BlockPhase.MAIN && INTENSE_CATEGORIES.includes(exercise.category)) {
        errors.push(
          `session ${session.dayOfWeek} is match-adjacent but includes an intense ${exercise.category} block (${exercise.slug}) — jamais d'intensité la veille/jour de match`
        );
      }

      if (exercise.objectives.includes(ctx.playerObjective)) {
        objectiveCovered = true;
      }
    }
  }

  if (!objectiveCovered) {
    errors.push(`no block across the week targets the player's declared objective (${ctx.playerObjective})`);
  }

  return { valid: errors.length === 0, errors };
}
