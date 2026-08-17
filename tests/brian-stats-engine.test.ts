import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyDeltas,
  computeBlockStatDeltas,
  computeOverall,
  qualityMultiplier,
  rankTierForOverall,
} from "../lib/brian/stats-engine";
import { pickExerciseCategory } from "../lib/brian/messages";

test("a skipped exercise never produces any stat delta", () => {
  const deltas = computeBlockStatDeltas({
    category: "CARDIO",
    objectives: [],
    phase: "MAIN",
    status: "SKIPPED",
    feltDifficulty: null,
    actualDurationSeconds: null,
    expectedDurationSeconds: 300,
  });
  assert.deepEqual(deltas, {});
});

test("an abandoned exercise gains far less than a completed one", () => {
  const completed = computeBlockStatDeltas({
    category: "CARDIO",
    objectives: [],
    phase: "MAIN",
    status: "COMPLETED",
    feltDifficulty: "MEDIUM",
    actualDurationSeconds: 300,
    expectedDurationSeconds: 300,
  });
  const abandoned = computeBlockStatDeltas({
    category: "CARDIO",
    objectives: [],
    phase: "MAIN",
    status: "ABANDONED",
    feltDifficulty: null,
    actualDurationSeconds: 20,
    expectedDurationSeconds: 300,
  });
  assert.ok((completed.ENDURANCE ?? 0) > (abandoned.ENDURANCE ?? 0));
});

test("a cardio exercise grows endurance, a strength exercise grows physique", () => {
  const cardio = computeBlockStatDeltas({
    category: "CARDIO",
    objectives: [],
    phase: "MAIN",
    status: "COMPLETED",
    feltDifficulty: "MEDIUM",
    actualDurationSeconds: 300,
    expectedDurationSeconds: 300,
  });
  const strength = computeBlockStatDeltas({
    category: "STRENGTH",
    objectives: [],
    phase: "MAIN",
    status: "COMPLETED",
    feltDifficulty: "MEDIUM",
    actualDurationSeconds: 300,
    expectedDurationSeconds: 300,
  });
  assert.ok((cardio.ENDURANCE ?? 0) > 0);
  assert.equal(cardio.VITESSE ?? 0, 0);
  assert.ok((strength.PHYSIQUE ?? 0) > 0);
});

test("every completed exercise gives at least a small MENTAL bonus", () => {
  const deltas = computeBlockStatDeltas({
    category: "TECHNIQUE",
    objectives: [],
    phase: "MAIN",
    status: "COMPLETED",
    feltDifficulty: "MEDIUM",
    actualDurationSeconds: 300,
    expectedDurationSeconds: 300,
  });
  assert.ok((deltas.MENTAL ?? 0) >= 1);
});

test("finishing far too fast without declaring it easy is treated as suspect, not excellent", () => {
  const suspicious = qualityMultiplier("COMPLETED", "MEDIUM", 10, 300);
  const genuinelyEasy = qualityMultiplier("COMPLETED", "VERY_EASY", 10, 300);
  assert.ok(suspicious < genuinelyEasy);
  assert.ok(suspicious <= 0.6);
});

test("applyDeltas clamps stats between 0 and 99", () => {
  const base = { VITESSE: 98, TECHNIQUE: 1, CONDUITE: 50, ENDURANCE: 50, PHYSIQUE: 50, MENTAL: 50 };
  const updated = applyDeltas({ ...base }, { VITESSE: 10, TECHNIQUE: -10 });
  assert.equal(updated.VITESSE, 99);
  assert.equal(updated.TECHNIQUE, 0);
});

test("rank tiers follow the overall thresholds", () => {
  assert.equal(rankTierForOverall(10), "Débutant");
  assert.equal(rankTierForOverall(40), "Amateur");
  assert.equal(rankTierForOverall(60), "Confirmé");
  assert.equal(rankTierForOverall(70), "Avancé");
  assert.equal(rankTierForOverall(80), "Élite");
  assert.equal(rankTierForOverall(90), "Pro");
});

test("overall is the average across all six axes, not just the ones that changed", () => {
  const stats = { VITESSE: 60, TECHNIQUE: 60, CONDUITE: 60, ENDURANCE: 60, PHYSIQUE: 60, MENTAL: 60 };
  assert.equal(computeOverall(stats), 60);
});

test("an abandoned exercise is always categorized as EXERCISE_ABANDONED regardless of felt difficulty", () => {
  const category = pickExerciseCategory({ status: "ABANDONED", feltDifficulty: "VERY_EASY", isPersonalRecord: false });
  assert.equal(category, "EXERCISE_ABANDONED");
});

test("a personal record takes priority over the felt-difficulty category", () => {
  const category = pickExerciseCategory({ status: "COMPLETED", feltDifficulty: "MEDIUM", isPersonalRecord: true });
  assert.equal(category, "EXERCISE_PERSONAL_RECORD");
});
