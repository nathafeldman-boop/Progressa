import { test } from "node:test";
import assert from "node:assert/strict";
import { Weekday } from "@prisma/client";
import { pickTargetWeekDays } from "../lib/scheduling";

test("no match day: picks the first N weekdays, nothing match-adjacent", () => {
  const { targetWeekDays, matchAdjacentDays } = pickTargetWeekDays(3, null);
  assert.deepEqual(targetWeekDays, [Weekday.MONDAY, Weekday.TUESDAY, Weekday.WEDNESDAY]);
  assert.deepEqual(matchAdjacentDays, []);
});

test("match day itself is never picked as a training day (full rest)", () => {
  const { targetWeekDays } = pickTargetWeekDays(6, Weekday.SUNDAY);
  assert.ok(!targetWeekDays.includes(Weekday.SUNDAY));
});

test("the eve of the match is included as a light (match-adjacent) session when it falls within the picked days", () => {
  // Match mardi -> veille = lundi, forcément dans les 2 premiers jours disponibles.
  const { targetWeekDays, matchAdjacentDays } = pickTargetWeekDays(2, Weekday.TUESDAY);
  assert.ok(targetWeekDays.includes(Weekday.MONDAY));
  assert.deepEqual(matchAdjacentDays, [Weekday.MONDAY]);
});

test("a low session count that never reaches the eve leaves it untouched (not match-adjacent)", () => {
  // Match dimanche -> veille = samedi, hors des 2 premiers jours disponibles (lundi, mardi).
  const { targetWeekDays, matchAdjacentDays } = pickTargetWeekDays(2, Weekday.SUNDAY);
  assert.ok(!targetWeekDays.includes(Weekday.SATURDAY));
  assert.deepEqual(matchAdjacentDays, []);
});
