import { test } from "node:test";
import assert from "node:assert/strict";
import { Objective, Weekday } from "@prisma/client";
import { buildFallbackProgram } from "../lib/ai/fallback-template";
import { validateProgramBusinessRules } from "../lib/ai/business-rules";
import { EXERCISE_CATALOG } from "../lib/exercises/catalog-data";

const catalogBySlug = new Map(EXERCISE_CATALOG.map((e) => [e.slug, e]));

// Le programme de repli (aucun appel IA) doit lui-même respecter les règles
// non négociables — c'est le filet de sécurité quand l'IA échoue deux fois
// de suite, il ne doit jamais produire un programme invalide.
test("fallback program respects the same non-negotiable business rules as the AI path", () => {
  const program = buildFallbackProgram({
    sessionCount: 3,
    targetWeekDays: [Weekday.MONDAY, Weekday.WEDNESDAY, Weekday.FRIDAY],
    matchAdjacentDays: [],
    filteredCatalog: EXERCISE_CATALOG,
    objective: Objective.SPEED_EXPLOSIVENESS,
  });

  const result = validateProgramBusinessRules(program, {
    catalogBySlug,
    expectedSessionCount: 3,
    playerObjective: Objective.SPEED_EXPLOSIVENESS,
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test("fallback program produces exactly sessionCount sessions, one per requested day", () => {
  const program = buildFallbackProgram({
    sessionCount: 2,
    targetWeekDays: [Weekday.TUESDAY, Weekday.THURSDAY, Weekday.SATURDAY],
    matchAdjacentDays: [],
    filteredCatalog: EXERCISE_CATALOG,
    objective: Objective.ALL_ROUND,
  });

  assert.equal(program.sessions.length, 2);
  assert.deepEqual(
    program.sessions.map((s) => s.dayOfWeek),
    [Weekday.TUESDAY, Weekday.THURSDAY]
  );
});

test("a match-adjacent day never gets an intense (STRENGTH/EXPLOSIVENESS) main block", () => {
  const program = buildFallbackProgram({
    sessionCount: 1,
    targetWeekDays: [Weekday.SATURDAY],
    matchAdjacentDays: [Weekday.SATURDAY],
    filteredCatalog: EXERCISE_CATALOG,
    objective: Objective.SHOOTING,
  });

  const result = validateProgramBusinessRules(program, {
    catalogBySlug,
    expectedSessionCount: 1,
    playerObjective: Objective.SHOOTING,
  });

  assert.deepEqual(result.errors, []);
  const session = program.sessions[0];
  assert.equal(session.isMatchAdjacent, true);
});

test("no exercise appears twice within the same fallback session", () => {
  const program = buildFallbackProgram({
    sessionCount: 3,
    targetWeekDays: [Weekday.MONDAY, Weekday.TUESDAY, Weekday.WEDNESDAY],
    matchAdjacentDays: [],
    filteredCatalog: EXERCISE_CATALOG,
    objective: Objective.TECHNIQUE_DRIBBLING,
  });

  for (const session of program.sessions) {
    const slugs = session.blocks.map((b) => b.exerciseSlug);
    assert.equal(new Set(slugs).size, slugs.length, `duplicate exercise within session ${session.dayOfWeek}`);
  }
});

test("changing weekSeed varies which exercises are picked (no frozen program week after week)", () => {
  const input = {
    sessionCount: 1,
    targetWeekDays: [Weekday.MONDAY],
    matchAdjacentDays: [],
    filteredCatalog: EXERCISE_CATALOG,
    objective: Objective.ENDURANCE,
  };

  const week1 = buildFallbackProgram({ ...input, weekSeed: 0 });
  const week2 = buildFallbackProgram({ ...input, weekSeed: 3 });

  const slugs1 = week1.sessions[0].blocks.map((b) => b.exerciseSlug).join(",");
  const slugs2 = week2.sessions[0].blocks.map((b) => b.exerciseSlug).join(",");
  assert.notEqual(slugs1, slugs2);
});
