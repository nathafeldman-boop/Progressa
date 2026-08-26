import { test } from "node:test";
import assert from "node:assert/strict";
import { estimateMinimumSeconds } from "../lib/pacing";

test("45 abdos (3x15) prend environ 30-35 secondes en comptant les pauses", () => {
  const seconds = estimateMinimumSeconds("15", 3, "STRENGTH", 120);
  assert.ok(seconds >= 30 && seconds <= 35, `expected 30-35, got ${seconds}`);
});

test("un maintien chronométré (ex: 30 secondes) utilise directement la durée déclarée", () => {
  const seconds = estimateMinimumSeconds("30 secondes", 1, "STRENGTH", 120);
  assert.equal(seconds, 30);
});

test("un texte sans nombre exploitable retombe sur la durée globale de l'exercice", () => {
  const seconds = estimateMinimumSeconds("à volonté", null, "TECHNIQUE", 90);
  assert.equal(seconds, 90);
});

test("reps absentes retombe sur la durée globale de l'exercice", () => {
  const seconds = estimateMinimumSeconds(null, null, "CARDIO", 60);
  assert.equal(seconds, 60);
});

test("le plancher minimum ne descend jamais sous 8 secondes même pour très peu de répétitions", () => {
  const seconds = estimateMinimumSeconds("2", 1, "STRENGTH", 120);
  assert.ok(seconds >= 8);
});
