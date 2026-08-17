import { test } from "node:test";
import assert from "node:assert/strict";
import { Objective, Position } from "@prisma/client";
import { EXERCISE_CATALOG } from "../lib/exercises/catalog-data";

// Piège identifié dans le produit (section 10): un objectif proposé à
// l'onboarding sans aucun exercice associé. On le vérifie mécaniquement
// pour ne jamais le réintroduire par accident.
const ONBOARDING_OBJECTIVES: Objective[] = [
  Objective.SPEED_EXPLOSIVENESS,
  Objective.TECHNIQUE_DRIBBLING,
  Objective.PHYSICAL_DUELS,
  Objective.ENDURANCE,
  Objective.SHOOTING,
  Objective.ALL_ROUND,
];

test("every onboarding objective has at least 3 catalog exercises", () => {
  for (const objective of ONBOARDING_OBJECTIVES) {
    const matches = EXERCISE_CATALOG.filter((e) => e.objectives.includes(objective));
    assert.ok(
      matches.length >= 3,
      `objective ${objective} only has ${matches.length} exercise(s) — every onboarding objective needs real coverage`
    );
  }
});

test("shooting ('frappe') objective specifically has dedicated exercises", () => {
  const shooting = EXERCISE_CATALOG.filter((e) => e.objectives.includes(Objective.SHOOTING));
  assert.ok(shooting.length >= 5, "frappe was the exact pitfall called out in the product brief — needs real coverage");
});

test("goalkeeper-only exercises exist and are scoped to GOALKEEPER position", () => {
  const gkExercises = EXERCISE_CATALOG.filter((e) => e.category === "GOALKEEPER");
  assert.ok(gkExercises.length >= 8);
  for (const e of gkExercises) {
    assert.deepEqual(e.positions, [Position.GOALKEEPER], `${e.slug} should be scoped to goalkeepers only`);
  }
});

test("all slugs are unique", () => {
  const slugs = EXERCISE_CATALOG.map((e) => e.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("minAge is always 13 or 15", () => {
  for (const e of EXERCISE_CATALOG) {
    assert.ok(e.minAge === 13 || e.minAge === 15, `${e.slug} has invalid minAge ${e.minAge}`);
  }
});

test("every category is represented", () => {
  const categories = new Set(EXERCISE_CATALOG.map((e) => e.category));
  assert.equal(categories.size, 6);
});

test("catalog is large enough for real weekly variety (>= 50 exercises)", () => {
  assert.ok(EXERCISE_CATALOG.length >= 50);
});

test("a meaningful free-tier subset exists (roughly the ~15% freemium slice)", () => {
  const free = EXERCISE_CATALOG.filter((e) => e.isFreeTier);
  assert.ok(free.length >= 5, "freemium accounts need a real, non-empty free subset");
  assert.ok(free.length < EXERCISE_CATALOG.length / 2, "free tier should stay a minority slice, not the whole catalog");
});
