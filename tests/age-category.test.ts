import { test } from "node:test";
import assert from "node:assert/strict";
import { getAgeCategory, getSeasonEndYear, getAiAgeBand, isMinor, meetsMinAge } from "../lib/age-category";

test("season end year is the current year once July has started", () => {
  assert.equal(getSeasonEndYear(new Date("2026-07-15")), 2027);
  assert.equal(getSeasonEndYear(new Date("2026-08-17")), 2027);
});

test("season end year is the current year before July", () => {
  assert.equal(getSeasonEndYear(new Date("2026-06-30")), 2026);
  assert.equal(getSeasonEndYear(new Date("2026-01-01")), 2026);
});

test("age category label matches U(seasonEndYear - birthYear)", () => {
  const category = getAgeCategory(2010, new Date("2026-08-17"));
  assert.equal(category.seasonEndYear, 2027);
  assert.equal(category.categoryNumber, 17);
  assert.equal(category.label, "U17");
});

test("age category flips forward on July 1st, not on the birthday", () => {
  const beforeSeason = getAgeCategory(2011, new Date("2026-06-30"));
  const afterSeason = getAgeCategory(2011, new Date("2026-07-01"));
  assert.equal(beforeSeason.label, "U15");
  assert.equal(afterSeason.label, "U16");
});

test("AI age bands split at 15 and 18", () => {
  const ref = new Date("2026-08-17");
  assert.equal(getAiAgeBand(2013, ref), "13-14"); // 13 ans
  assert.equal(getAiAgeBand(2012, ref), "13-14"); // 14 ans
  assert.equal(getAiAgeBand(2011, ref), "15-17"); // 15 ans
  assert.equal(getAiAgeBand(2009, ref), "15-17"); // 17 ans
  assert.equal(getAiAgeBand(2007, ref), "18+"); // 19 ans
});

test("isMinor is true under 18", () => {
  const ref = new Date("2026-08-17");
  assert.equal(isMinor(2009, ref), true); // 17 ans
  assert.equal(isMinor(2008, ref), false); // 18 ans
});

test("meetsMinAge gates 15+ exercises correctly", () => {
  const ref = new Date("2026-08-17");
  assert.equal(meetsMinAge(2012, 15, ref), false); // 14 ans
  assert.equal(meetsMinAge(2011, 15, ref), true); // 15 ans
  assert.equal(meetsMinAge(2013, 13, ref), true); // 13 ans
});
