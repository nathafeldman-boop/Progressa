import { test } from "node:test";
import assert from "node:assert/strict";
import { EXERCISE_CATALOG } from "../lib/exercises/catalog-data";

test("every exercise states a concrete count (reps, sets, duration or attempts) somewhere in its steps", () => {
  const missing = EXERCISE_CATALOG.filter((e) => !e.steps.some((s) => /\d/.test(s)));
  assert.deepEqual(
    missing.map((e) => e.slug),
    [],
    "these exercises never tell the player how many times / how long to do them"
  );
});
