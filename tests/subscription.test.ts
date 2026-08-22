import { test } from "node:test";
import assert from "node:assert/strict";
import type { Subscription } from "@prisma/client";
import { isPremiumActive, sessionCountForTier } from "../lib/subscription";

function makeSubscription(overrides: Partial<Subscription>): Subscription {
  return {
    id: "s1",
    userId: "u1",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    status: "NONE",
    plan: null,
    currentPeriodEnd: null,
    payerIsParent: false,
    bonusPremiumUntil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Subscription;
}

test("hard paywall: no subscription at all is never premium", () => {
  assert.equal(isPremiumActive(null), false);
  assert.equal(isPremiumActive(undefined), false);
  assert.equal(sessionCountForTier(null), 0);
});

test("an ACTIVE Stripe subscription is premium regardless of other fields", () => {
  assert.equal(isPremiumActive(makeSubscription({ status: "ACTIVE" })), true);
  assert.equal(sessionCountForTier(makeSubscription({ status: "ACTIVE" })), 3);
});

test("PAST_DUE or CANCELED without a referral bonus is not premium", () => {
  assert.equal(isPremiumActive(makeSubscription({ status: "PAST_DUE" })), false);
  assert.equal(isPremiumActive(makeSubscription({ status: "CANCELED" })), false);
});

test("a referral bonus grants premium independently of Stripe status", () => {
  const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
  assert.equal(isPremiumActive(makeSubscription({ status: "NONE", bonusPremiumUntil: future })), true);
  assert.equal(isPremiumActive(makeSubscription({ status: "NONE", bonusPremiumUntil: past })), false);
});
