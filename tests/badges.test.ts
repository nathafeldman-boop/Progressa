import { test } from "node:test";
import assert from "node:assert/strict";
import { badgeSlugsToAward } from "../lib/badges";

test("first completed session ever awards the first-session badge", () => {
  assert.deepEqual(badgeSlugsToAward(1, 1), ["premiere-seance"]);
});

test("a 3-day streak awards serie-3, independent of total session count", () => {
  assert.deepEqual(badgeSlugsToAward(5, 3), ["serie-3"]);
});

test("a 7-day streak awards serie-7, not serie-3 again", () => {
  assert.deepEqual(badgeSlugsToAward(8, 7), ["serie-7"]);
});

test("10th and 25th completed session award milestone badges", () => {
  assert.deepEqual(badgeSlugsToAward(10, 1), ["dix-seances"]);
  assert.deepEqual(badgeSlugsToAward(25, 1), ["vingt-cinq-seances"]);
});

test("session count and streak milestones can both fire on the same completion", () => {
  assert.deepEqual(badgeSlugsToAward(10, 7), ["serie-7", "dix-seances"]);
});

test("an ordinary session (no milestone reached) awards nothing", () => {
  assert.deepEqual(badgeSlugsToAward(4, 4), []);
});
