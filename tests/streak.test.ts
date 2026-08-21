import { test } from "node:test";
import assert from "node:assert/strict";
import { computeStreakTransition, type StreakState } from "../lib/streak";

const NO_STREAK: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedAt: null,
  currentTier: null,
};

test("first ever completion starts the streak at 1", () => {
  const result = computeStreakTransition(NO_STREAK, new Date("2026-08-17"));
  assert.equal(result.currentStreak, 1);
  assert.equal(result.longestStreak, 1);
});

test("completing the next calendar day extends the streak", () => {
  const state: StreakState = { currentStreak: 4, longestStreak: 4, lastCompletedAt: new Date("2026-08-17"), currentTier: null };
  const result = computeStreakTransition(state, new Date("2026-08-18"));
  assert.equal(result.currentStreak, 5);
});

test("a second completion the same day does not double-count the streak", () => {
  const state: StreakState = { currentStreak: 4, longestStreak: 4, lastCompletedAt: new Date("2026-08-17T08:00:00Z"), currentTier: null };
  const result = computeStreakTransition(state, new Date("2026-08-17T20:00:00Z"));
  assert.equal(result.currentStreak, 4);
});

test("skipping a day breaks the streak back down to 1", () => {
  const state: StreakState = { currentStreak: 10, longestStreak: 10, lastCompletedAt: new Date("2026-08-15"), currentTier: "Sérieux" };
  const result = computeStreakTransition(state, new Date("2026-08-17"));
  assert.equal(result.currentStreak, 1);
});

test("longestStreak never decreases even after the current streak breaks", () => {
  const state: StreakState = { currentStreak: 20, longestStreak: 20, lastCompletedAt: new Date("2026-08-01"), currentTier: "Élite" };
  const result = computeStreakTransition(state, new Date("2026-08-20"));
  assert.equal(result.currentStreak, 1);
  assert.equal(result.longestStreak, 20);
});

test("tierJustChanged fires only when the tier actually changes", () => {
  const state: StreakState = { currentStreak: 2, longestStreak: 2, lastCompletedAt: new Date("2026-08-17"), currentTier: null };

  const dayThree = computeStreakTransition(state, new Date("2026-08-18")); // streak -> 3, tier "Régulier"
  assert.equal(dayThree.currentTier, "Régulier");
  assert.equal(dayThree.tierJustChanged, true);

  const stillRegulier: StreakState = { ...state, currentStreak: 3, currentTier: "Régulier", lastCompletedAt: new Date("2026-08-18") };
  const dayFour = computeStreakTransition(stillRegulier, new Date("2026-08-19")); // streak -> 4, still "Régulier"
  assert.equal(dayFour.currentTier, "Régulier");
  assert.equal(dayFour.tierJustChanged, false);
});
