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

const FULL_STATS = {
  VITESSE: 50,
  TIR: 50,
  PASSE: 50,
  CONDUITE: 50,
  DEFENSE: 50,
  PHYSIQUE: 50,
  TECHNIQUE: 50,
  ENDURANCE: 50,
  MENTAL: 50,
};

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
  assert.ok((completed.PHYSIQUE ?? 0) > (abandoned.PHYSIQUE ?? 0));
});

test("a cardio exercise grows physique, a shooting objective grows tir", () => {
  const cardio = computeBlockStatDeltas({
    category: "CARDIO",
    objectives: [],
    phase: "MAIN",
    status: "COMPLETED",
    feltDifficulty: "MEDIUM",
    actualDurationSeconds: 300,
    expectedDurationSeconds: 300,
  });
  const shooting = computeBlockStatDeltas({
    category: "TECHNIQUE",
    objectives: ["SHOOTING"],
    phase: "MAIN",
    status: "COMPLETED",
    feltDifficulty: "MEDIUM",
    actualDurationSeconds: 300,
    expectedDurationSeconds: 300,
  });
  assert.ok((cardio.PHYSIQUE ?? 0) > 0);
  assert.equal(cardio.VITESSE ?? 0, 0);
  assert.ok((shooting.TIR ?? 0) > 0);
});

test("a hard exercise gives a small physique discipline bonus, a medium one doesn't", () => {
  const hard = computeBlockStatDeltas({
    category: "TECHNIQUE",
    objectives: [],
    phase: "MAIN",
    status: "COMPLETED",
    feltDifficulty: "HARD",
    actualDurationSeconds: 300,
    expectedDurationSeconds: 300,
  });
  const medium = computeBlockStatDeltas({
    category: "TECHNIQUE",
    objectives: [],
    phase: "MAIN",
    status: "COMPLETED",
    feltDifficulty: "MEDIUM",
    actualDurationSeconds: 300,
    expectedDurationSeconds: 300,
  });
  assert.ok((hard.PHYSIQUE ?? 0) > (medium.PHYSIQUE ?? 0));
});

test("finishing far too fast without declaring it easy is treated as suspect, not excellent", () => {
  const suspicious = qualityMultiplier("COMPLETED", "MEDIUM", 10, 300);
  const genuinelyEasy = qualityMultiplier("COMPLETED", "VERY_EASY", 10, 300);
  assert.ok(suspicious < genuinelyEasy);
  assert.ok(suspicious <= 0.6);
});

test("applyDeltas clamps stats between 0 and 99", () => {
  const base = { ...FULL_STATS, VITESSE: 98, TIR: 1 };
  const updated = applyDeltas({ ...base }, { VITESSE: 10, TIR: -10 });
  assert.equal(updated.VITESSE, 99);
  assert.equal(updated.TIR, 0);
});

test("rank tiers follow the overall thresholds", () => {
  assert.equal(rankTierForOverall(10).label, "Débutant");
  assert.equal(rankTierForOverall(35).label, "Intermédiaire");
  assert.equal(rankTierForOverall(45).label, "Avancé");
  assert.equal(rankTierForOverall(55).label, "Confirmé");
  assert.equal(rankTierForOverall(65).label, "Espoir");
  assert.equal(rankTierForOverall(75).label, "Pro");
  assert.equal(rankTierForOverall(85).label, "Élite");
  assert.equal(rankTierForOverall(95).label, "Élite Suprême");
});

test("overall is the average across the six card axes, not just the ones that changed", () => {
  const stats = { ...FULL_STATS, VITESSE: 60, TIR: 60, PASSE: 60, CONDUITE: 60, DEFENSE: 60, PHYSIQUE: 60 };
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
