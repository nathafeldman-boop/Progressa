import { test } from "node:test";
import assert from "node:assert/strict";
import { computePlayerCardStats } from "../lib/player-card";
import type { EvaluationResult } from "@prisma/client";

function makeResult(overrides: Partial<EvaluationResult>): EvaluationResult {
  return {
    id: "r1",
    userId: "u1",
    testType: "SPRINT_20M",
    value: 3.5,
    unit: "secondes",
    recordedAt: new Date(),
    ...overrides,
  } as EvaluationResult;
}

test("an elite sprint time scores near 100, a beginner time scores near 0", () => {
  const elite = computePlayerCardStats([makeResult({ testType: "SPRINT_20M", value: 2.6 })]);
  const beginner = computePlayerCardStats([makeResult({ testType: "SPRINT_20M", value: 4.5 })]);
  assert.equal(elite.skills["Vitesse"], 100);
  assert.equal(beginner.skills["Vitesse"], 0);
});

test("higher-is-better tests (juggling, plank) score in the expected direction", () => {
  const goodJuggling = computePlayerCardStats([makeResult({ testType: "JUGGLING", value: 150, unit: "touches" })]);
  const badJuggling = computePlayerCardStats([makeResult({ testType: "JUGGLING", value: 5, unit: "touches" })]);
  assert.ok(goodJuggling.skills["Technique"] > badJuggling.skills["Technique"]);
});

test("only the best result per test type counts toward the card", () => {
  const stats = computePlayerCardStats([
    makeResult({ id: "a", testType: "SPRINT_20M", value: 4.0 }),
    makeResult({ id: "b", testType: "SPRINT_20M", value: 3.0 }), // meilleur (plus bas)
    makeResult({ id: "c", testType: "SPRINT_20M", value: 3.8 }),
  ]);
  const fromBestOnly = computePlayerCardStats([makeResult({ testType: "SPRINT_20M", value: 3.0 })]);
  assert.equal(stats.skills["Vitesse"], fromBestOnly.skills["Vitesse"]);
});

test("overall is the average of the per-skill scores", () => {
  const stats = computePlayerCardStats([
    makeResult({ testType: "SPRINT_20M", value: 2.6 }), // 100
    makeResult({ testType: "PLANK", value: 20, unit: "secondes" }), // 0
  ]);
  assert.equal(stats.overall, 50);
});

test("no results yields a zeroed-out card, not a crash", () => {
  const stats = computePlayerCardStats([]);
  assert.equal(stats.overall, 0);
  assert.deepEqual(stats.skills, {});
});
