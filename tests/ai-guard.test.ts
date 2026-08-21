import { test } from "node:test";
import assert from "node:assert/strict";
import { Objective, Position, Equipment, Weekday, ExerciseCategory } from "@prisma/client";
import { generateWeeklyProgram, type GenerateProgramInput } from "../lib/ai/generate-program";
import { validateProgramBusinessRules } from "../lib/ai/business-rules";
import { EXERCISE_CATALOG } from "../lib/exercises/catalog-data";

const REFERENCE_DATE = new Date("2026-08-17"); // hors saison FFF -> approxAge = 2026 - birthYear

const baseInput: GenerateProgramInput = {
  firstName: "Alex",
  birthYear: 2010, // ~16 ans -> bande 16-17
  position: Position.ATTACKING_MID,
  country: "FR",
  levelLabel: "Régional 1 (R1)",
  equipment: [Equipment.BALL, Equipment.CONES],
  objective: Objective.SHOOTING,
  weakPointNote: "Frappe du pied gauche",
  unresolvedPain: [],
  previousWeek: null,
  sessionCount: 1,
  targetWeekDays: [Weekday.MONDAY],
  matchAdjacentDays: [],
  referenceDate: REFERENCE_DATE,
};

const VALID_RESPONSE_TEXT = JSON.stringify({
  sessions: [
    {
      dayOfWeek: "MONDAY",
      title: "Séance technique",
      focusObjective: "SHOOTING",
      isMatchAdjacent: false,
      blocks: [
        {
          exerciseSlug: "sprints-courts-10m",
          phase: "WARMUP",
          sets: null,
          reps: null,
          restSeconds: 30,
          customInstruction: "Échauffement dynamique pour préparer les appuis avant la frappe.",
        },
        {
          exerciseSlug: "frappe-enroulee-cible",
          phase: "MAIN",
          sets: 3,
          reps: "10",
          restSeconds: 60,
          customInstruction: "Travaille ton enroulé du pied gauche, ton point faible déclaré.",
        },
        {
          exerciseSlug: "gainage-planche-ventrale",
          phase: "MAIN",
          sets: 3,
          reps: "30s",
          restSeconds: 30,
          customInstruction: "Renforce ton tronc pour mieux frapper en équilibre.",
        },
        {
          exerciseSlug: "mobilite-chevilles",
          phase: "COOLDOWN",
          sets: null,
          reps: null,
          restSeconds: 0,
          customInstruction: "Retour au calme, mobilise tes chevilles doucement.",
        },
      ],
    },
  ],
});

test("valid AI output is accepted on the first attempt", async () => {
  let calls = 0;
  const result = await generateWeeklyProgram(baseInput, {
    callModel: async () => {
      calls += 1;
      return { text: VALID_RESPONSE_TEXT, refused: false };
    },
  });

  assert.equal(result.source, "AI");
  assert.equal(calls, 1);
  assert.equal(result.program.sessions.length, 1);
});

test("a hallucinated slug (outside the filtered catalog) is rejected and never reaches the player", async () => {
  const hallucinated = JSON.stringify({
    sessions: [
      {
        dayOfWeek: "MONDAY",
        title: "Séance",
        focusObjective: "SHOOTING",
        isMatchAdjacent: false,
        blocks: [
          {
            exerciseSlug: "exercice-invente-par-lia",
            phase: "WARMUP",
            sets: null,
            reps: null,
            restSeconds: 30,
            customInstruction: "Un exercice qui n'existe pas dans le catalogue.",
          },
        ],
      },
    ],
  });

  let calls = 0;
  const result = await generateWeeklyProgram(baseInput, {
    callModel: async () => {
      calls += 1;
      return { text: hallucinated, refused: false };
    },
  });

  assert.equal(calls, 2, "should retry exactly once before falling back");
  assert.equal(result.source, "FALLBACK_TEMPLATE");

  const catalogSlugs = new Set(EXERCISE_CATALOG.map((e) => e.slug));
  for (const session of result.program.sessions) {
    for (const block of session.blocks) {
      assert.ok(catalogSlugs.has(block.exerciseSlug), `${block.exerciseSlug} must be a real catalog exercise`);
    }
  }
});

test("malformed JSON falls back to the deterministic template without throwing", async () => {
  const result = await generateWeeklyProgram(baseInput, {
    callModel: async () => ({ text: "this is not json at all {{{", refused: false }),
  });

  assert.equal(result.source, "FALLBACK_TEMPLATE");
  assert.ok(result.program.sessions.length > 0);
});

test("a model refusal falls back without throwing", async () => {
  const result = await generateWeeklyProgram(baseInput, {
    callModel: async () => ({ text: "", refused: true }),
  });

  assert.equal(result.source, "FALLBACK_TEMPLATE");
});

test("a business-rule violation (intense block on match day) is rejected", async () => {
  const matchAdjacentInput: GenerateProgramInput = {
    ...baseInput,
    matchAdjacentDays: [Weekday.MONDAY],
  };

  const invalidMatchDay = JSON.stringify({
    sessions: [
      {
        dayOfWeek: "MONDAY",
        title: "Séance",
        focusObjective: "SHOOTING",
        isMatchAdjacent: true,
        blocks: [
          {
            exerciseSlug: "sprints-courts-10m",
            phase: "WARMUP",
            sets: null,
            reps: null,
            restSeconds: 30,
            customInstruction: "Échauffement léger avant le match de demain.",
          },
          {
            // STRENGTH en bloc principal la veille de match: interdit
            exerciseSlug: "gainage-planche-ventrale",
            phase: "MAIN",
            sets: 3,
            reps: "30s",
            restSeconds: 30,
            customInstruction: "Renforcement du tronc juste avant le match, à ne jamais faire.",
          },
          {
            exerciseSlug: "mobilite-chevilles",
            phase: "COOLDOWN",
            sets: null,
            reps: null,
            restSeconds: 0,
            customInstruction: "Retour au calme.",
          },
        ],
      },
    ],
  });

  const result = await generateWeeklyProgram(matchAdjacentInput, {
    callModel: async () => ({ text: invalidMatchDay, refused: false }),
  });

  assert.equal(result.source, "FALLBACK_TEMPLATE");
  const session = result.program.sessions[0];
  assert.equal(session.isMatchAdjacent, true);
  for (const block of session.blocks.filter((b) => b.phase === "MAIN")) {
    const exercise = EXERCISE_CATALOG.find((e) => e.slug === block.exerciseSlug)!;
    assert.notEqual(exercise.category, ExerciseCategory.STRENGTH);
    assert.notEqual(exercise.category, ExerciseCategory.EXPLOSIVENESS);
  }
});

test("the fallback template itself always satisfies the business rules", async () => {
  const result = await generateWeeklyProgram(baseInput, {
    callModel: async () => ({ text: "invalid", refused: false }),
  });

  assert.equal(result.source, "FALLBACK_TEMPLATE");

  const catalogBySlug = new Map(EXERCISE_CATALOG.map((e) => [e.slug, e]));
  const check = validateProgramBusinessRules(result.program, {
    catalogBySlug,
    expectedSessionCount: baseInput.sessionCount,
    playerObjective: baseInput.objective,
  });

  assert.deepEqual(check.errors, []);
  assert.equal(check.valid, true);
});

test("free-tier accounts (isPremium: false) can still generate a valid fallback program for every objective", async () => {
  const catalogBySlug = new Map(EXERCISE_CATALOG.map((e) => [e.slug, e]));

  for (const objective of Object.values(Objective)) {
    const freeInput: GenerateProgramInput = { ...baseInput, objective, isPremium: false };
    const result = await generateWeeklyProgram(freeInput, {
      callModel: async () => ({ text: "invalid", refused: false }),
    });

    assert.equal(result.source, "FALLBACK_TEMPLATE");
    for (const session of result.program.sessions) {
      for (const block of session.blocks) {
        const exercise = catalogBySlug.get(block.exerciseSlug)!;
        assert.equal(exercise.isFreeTier, true, `${block.exerciseSlug} is not part of the freemium subset`);
      }
    }

    const check = validateProgramBusinessRules(result.program, {
      catalogBySlug,
      expectedSessionCount: freeInput.sessionCount,
      playerObjective: objective,
    });
    assert.deepEqual(check.errors, [], `objective ${objective} should still produce a valid free-tier program`);
  }
});

test("a premium 3-session week generates three distinct days via the fallback template", async () => {
  const premiumInput: GenerateProgramInput = {
    ...baseInput,
    sessionCount: 3,
    targetWeekDays: [Weekday.MONDAY, Weekday.WEDNESDAY, Weekday.FRIDAY],
  };

  const result = await generateWeeklyProgram(premiumInput, {
    callModel: async () => ({ text: "invalid", refused: false }),
  });

  assert.equal(result.program.sessions.length, 3);
  const days = result.program.sessions.map((s) => s.dayOfWeek);
  assert.deepEqual(new Set(days).size, 3);
});
