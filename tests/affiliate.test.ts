import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeCommissionCents,
  computePayableAt,
  computeBonusTiersEarned,
  BONUS_TIER_CENTS,
} from "../lib/affiliate";

test("commission is 80% of the charged amount by default", () => {
  assert.equal(computeCommissionCents(699, 0.8), 559);
});

test("commission rounds to the nearest cent, never dropping or duplicating a fraction", () => {
  assert.equal(computeCommissionCents(101, 0.8), 81); // 80.8 -> 81
  assert.equal(computeCommissionCents(103, 0.8), 82); // 82.4 -> 82
});

test("commission is zero when the affiliate has no commission rate", () => {
  assert.equal(computeCommissionCents(699, 0), 0);
});

test("payout becomes payable exactly 5 days after the charge, matching Stripe's transfer delay", () => {
  const chargedAt = new Date("2026-08-01T10:00:00Z");
  const payableAt = computePayableAt(chargedAt);
  assert.equal(payableAt.toISOString(), "2026-08-06T10:00:00.000Z");
});

test("no bonus tier below 500€ of cumulative commissions", () => {
  assert.equal(computeBonusTiersEarned(0), 0);
  assert.equal(computeBonusTiersEarned(BONUS_TIER_CENTS - 1), 0);
});

test("exactly one bonus tier at 500€, two at 1000€", () => {
  assert.equal(computeBonusTiersEarned(BONUS_TIER_CENTS), 1);
  assert.equal(computeBonusTiersEarned(BONUS_TIER_CENTS * 2), 2);
});

test("a partial amount past a tier doesn't grant the next tier early", () => {
  assert.equal(computeBonusTiersEarned(BONUS_TIER_CENTS + 1), 1);
});
