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

test("AI age bands split at 18 and 25 (public cible 16-30 ans)", () => {
  const ref = new Date("2026-08-17");
  assert.equal(getAiAgeBand(2010, ref), "16-17"); // 16 ans
  assert.equal(getAiAgeBand(2009, ref), "16-17"); // 17 ans
  assert.equal(getAiAgeBand(2008, ref), "18-24"); // 18 ans
  assert.equal(getAiAgeBand(2002, ref), "18-24"); // 24 ans
  assert.equal(getAiAgeBand(2001, ref), "25-30"); // 25 ans
  assert.equal(getAiAgeBand(1996, ref), "25-30"); // 30 ans
});

test("age category caps at Senior beyond U19 (adult players in the 16-30 range)", () => {
  const ref = new Date("2026-08-17");
  const category = getAgeCategory(1998, ref); // ~28 ans
  assert.equal(category.categoryNumber, 29);
  assert.equal(category.label, "Senior");
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
