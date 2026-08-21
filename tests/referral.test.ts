import { test } from "node:test";
import assert from "node:assert/strict";
import { computeBonusPremiumUntil, shouldCreditThreeFriendsBonus } from "../lib/referral";

test("bonus weeks stack on top of an active (not yet expired) bonus", () => {
  const now = new Date("2026-08-17");
  const currentBonusUntil = new Date("2026-08-24"); // 1 week left
  const result = computeBonusPremiumUntil(currentBonusUntil, 1, now);
  assert.equal(result.toISOString(), new Date("2026-08-31").toISOString());
});

test("bonus weeks restart from now when the previous bonus already expired", () => {
  const now = new Date("2026-08-17");
  const currentBonusUntil = new Date("2026-08-01"); // already in the past
  const result = computeBonusPremiumUntil(currentBonusUntil, 2, now);
  assert.equal(result.toISOString(), new Date("2026-08-31").toISOString());
});

test("a first-time referral bonus (no prior bonus) starts from now", () => {
  const now = new Date("2026-08-17");
  const result = computeBonusPremiumUntil(null, 1, now);
  assert.equal(result.toISOString(), new Date("2026-08-24").toISOString());
});

test("the three-friends bonus fires only on multiples of 3", () => {
  assert.equal(shouldCreditThreeFriendsBonus(1, 0), false);
  assert.equal(shouldCreditThreeFriendsBonus(2, 0), false);
  assert.equal(shouldCreditThreeFriendsBonus(3, 0), true);
  assert.equal(shouldCreditThreeFriendsBonus(6, 1), true);
});

test("the three-friends bonus is capped at MAX_ONBOARDED_CREDITS, even on a valid multiple of 3", () => {
  assert.equal(shouldCreditThreeFriendsBonus(15, 4), false); // already credited 4 times
  assert.equal(shouldCreditThreeFriendsBonus(12, 3), true); // 4th credit still allowed
});
