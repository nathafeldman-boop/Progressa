import { test } from "node:test";
import assert from "node:assert/strict";
import { createMockAdProvider, MIN_WATCH_SECONDS } from "../lib/ads/mock-provider";
import { computeBrianMessageQuota, startOfTodayParis, FREE_DAILY_BASE, BONUS_PER_AD } from "../lib/brian/message-quota";
import { computeFreeTargetedSessionStatus, FREE_COOLDOWN_MS, AD_REDUCTION_MS } from "../lib/programs/free-targeted-cooldown";

const SECRET = "test-secret";

// ---------------------------------------------------------------------------
// Mock ad provider (lib/ads/mock-provider.ts) — la seule partie de tout le
// système à jamais faire confiance au client (le token) est ici, donc c'est
// la partie la plus critique à vérifier: signature, horodatage serveur,
// durée minimale réelle. `clock` est injecté pour ne jamais attendre
// MIN_WATCH_SECONDS pour de vrai dans les tests.
// ---------------------------------------------------------------------------

test("CAS 3 (partie fournisseur): un visionnage validé après le temps minimum réel est accepté", () => {
  let now = 1_000_000;
  const provider = createMockAdProvider(SECRET, () => now);
  const watch = provider.startWatch("user1", "SESSION_TIMER");
  assert.equal(watch.minWatchSeconds, MIN_WATCH_SECONDS);

  now += MIN_WATCH_SECONDS * 1000; // exactement la durée minimale écoulée
  const result = provider.verifyWatch("user1", "SESSION_TIMER", watch.watchToken);
  assert.equal(result.ok, true);
});

test("jamais de confiance dans le frontend: valider avant la durée minimale échoue, quoi que le client prétende", () => {
  let now = 1_000_000;
  const provider = createMockAdProvider(SECRET, () => now);
  const watch = provider.startWatch("user1", "BRIAN_MESSAGES");

  now += (MIN_WATCH_SECONDS - 1) * 1000; // une seconde trop tôt
  const result = provider.verifyWatch("user1", "BRIAN_MESSAGES", watch.watchToken);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "watch_too_short");
});

test("CAS 9: un jeton falsifié (signature modifiée) est rejeté", () => {
  const provider = createMockAdProvider(SECRET, () => 1_000_000);
  const watch = provider.startWatch("user1", "BRIAN_MESSAGES");
  const tampered = watch.watchToken.slice(0, -1) + (watch.watchToken.at(-1) === "0" ? "1" : "0");
  const result = provider.verifyWatch("user1", "BRIAN_MESSAGES", tampered);
  assert.equal(result.ok, false);
});

test("un jeton émis pour un autre joueur ne peut pas être réclamé", () => {
  const provider = createMockAdProvider(SECRET, () => 1_000_000);
  const watch = provider.startWatch("user1", "BRIAN_MESSAGES");
  const result = provider.verifyWatch("user2", "BRIAN_MESSAGES", watch.watchToken);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "user_mismatch");
});

test("un jeton émis pour SESSION_TIMER ne peut pas être réclamé comme BRIAN_MESSAGES", () => {
  const provider = createMockAdProvider(SECRET, () => 1_000_000);
  const watch = provider.startWatch("user1", "SESSION_TIMER");
  const result = provider.verifyWatch("user1", "BRIAN_MESSAGES", watch.watchToken);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "kind_mismatch");
});

test("un jeton expiré (au-delà de sa fenêtre de validité) est rejeté", () => {
  let now = 1_000_000;
  const provider = createMockAdProvider(SECRET, () => now);
  const watch = provider.startWatch("user1", "BRIAN_MESSAGES");
  now = watch.expiresAt.getTime() + 1;
  const result = provider.verifyWatch("user1", "BRIAN_MESSAGES", watch.watchToken);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "token_expired");
});

test("deux visionnages génèrent deux jetons différents (chacun redeviendra une ligne unique en base)", () => {
  const provider = createMockAdProvider(SECRET, () => 1_000_000);
  const a = provider.startWatch("user1", "BRIAN_MESSAGES");
  const b = provider.startWatch("user1", "BRIAN_MESSAGES");
  assert.notEqual(a.watchToken, b.watchToken);
});

// ---------------------------------------------------------------------------
// Quota Coach Brian (lib/brian/message-quota.ts)
// ---------------------------------------------------------------------------

test("CAS 1: nouvel utilisateur gratuit a bien 5 messages disponibles", () => {
  const quota = computeBrianMessageQuota(0, 0, false);
  assert.equal(quota.unlimited, false);
  assert.equal(quota.limit, FREE_DAILY_BASE);
  assert.equal(quota.remaining, FREE_DAILY_BASE);
});

test("CAS 4: après 5 messages envoyés, le quota gratuit est à zéro", () => {
  const quota = computeBrianMessageQuota(FREE_DAILY_BASE, 0, false);
  assert.equal(quota.remaining, 0);
});

test("CAS 5: une pub validée ajoute exactement 5 messages", () => {
  const before = computeBrianMessageQuota(FREE_DAILY_BASE, 0, false);
  const after = computeBrianMessageQuota(FREE_DAILY_BASE, 1, false);
  assert.equal(before.remaining, 0);
  assert.equal(after.limit - before.limit, BONUS_PER_AD);
  assert.equal(after.remaining, BONUS_PER_AD);
});

test("le quota ne descend jamais sous zéro même si used dépasse limit", () => {
  const quota = computeBrianMessageQuota(FREE_DAILY_BASE + 3, 0, false);
  assert.equal(quota.remaining, 0);
});

test("CAS 6/7: un utilisateur premium est toujours illimité, quel que soit l'usage", () => {
  const quota = computeBrianMessageQuota(999, 0, true);
  assert.equal(quota.unlimited, true);
  assert.equal(quota.remaining, Infinity);
});

test("CAS 11: startOfTodayParis place bien un message de 23h50 Paris dans le jour où il a été envoyé", () => {
  // 31 août 2026, 23:50 heure de Paris (été, UTC+2) = 21:50 UTC.
  const lateEveningParis = new Date("2026-08-31T21:50:00.000Z");
  const startOfDay = startOfTodayParis(lateEveningParis);
  // Minuit Paris le 31/08 (UTC+2) = 30/08 22:00 UTC.
  assert.equal(startOfDay.toISOString(), "2026-08-30T22:00:00.000Z");
  // Le message est bien après le début du jour calculé (donc compté "aujourd'hui").
  assert.ok(lateEveningParis.getTime() >= startOfDay.getTime());
});

test("CAS 11: le lendemain à 00:10 Paris tombe dans un nouveau jour (reset)", () => {
  const justAfterMidnightParis = new Date("2026-08-31T22:10:00.000Z"); // 00:10 le 01/09 à Paris
  const startOfDay = startOfTodayParis(justAfterMidnightParis);
  assert.equal(startOfDay.toISOString(), "2026-08-31T22:00:00.000Z");
  // Un message envoyé juste avant minuit Paris (donc juste avant ce début de journée) ne compte plus.
  const justBeforeMidnightParis = new Date("2026-08-31T21:55:00.000Z");
  assert.ok(justBeforeMidnightParis.getTime() < startOfDay.getTime());
});

// ---------------------------------------------------------------------------
// Cooldown séances ciblées gratuites (lib/programs/free-targeted-cooldown.ts)
// ---------------------------------------------------------------------------

test("CAS 1: un joueur qui n'a jamais utilisé de séance gratuite est éligible immédiatement", () => {
  const status = computeFreeTargetedSessionStatus(null, 0, Date.now());
  assert.equal(status.eligible, true);
  assert.equal(status.nextEligibleAt, null);
});

test("CAS 2: juste après une séance gratuite, le joueur est bloqué ~48h", () => {
  const now = 1_000_000_000;
  const lastUsedAt = new Date(now);
  const status = computeFreeTargetedSessionStatus(lastUsedAt, 0, now);
  assert.equal(status.eligible, false);
  assert.equal(status.nextEligibleAt?.getTime(), now + FREE_COOLDOWN_MS);
});

test("CAS 3: une pub validée réduit l'attente restante d'exactement 5h", () => {
  const now = 1_000_000_000;
  const lastUsedAt = new Date(now);
  const withoutAd = computeFreeTargetedSessionStatus(lastUsedAt, 0, now);
  const withOneAd = computeFreeTargetedSessionStatus(lastUsedAt, 1, now);
  assert.equal(withoutAd.nextEligibleAt!.getTime() - withOneAd.nextEligibleAt!.getTime(), AD_REDUCTION_MS);
  assert.equal(AD_REDUCTION_MS, 5 * 60 * 60 * 1000);
});

test("CAS 12: assez de pubs regardées rend le joueur immédiatement éligible (attente ramenée à 0)", () => {
  const now = 1_000_000_000;
  const lastUsedAt = new Date(now);
  // 48h / 5h = 9.6 -> 10 pubs suffisent à ramener l'attente à 0 ou moins.
  const status = computeFreeTargetedSessionStatus(lastUsedAt, 10, now);
  assert.equal(status.eligible, true);
  assert.equal(status.nextEligibleAt, null);
});

test("CAS 12: à l'instant exact où le cooldown expire, le joueur redevient éligible", () => {
  const lastUsedAt = new Date(1_000_000_000);
  const exactlyAtBoundary = lastUsedAt.getTime() + FREE_COOLDOWN_MS;
  const status = computeFreeTargetedSessionStatus(lastUsedAt, 0, exactlyAtBoundary);
  assert.equal(status.eligible, true);
});

test("une seconde avant l'expiration du cooldown, le joueur reste bloqué", () => {
  const lastUsedAt = new Date(1_000_000_000);
  const justBefore = lastUsedAt.getTime() + FREE_COOLDOWN_MS - 1000;
  const status = computeFreeTargetedSessionStatus(lastUsedAt, 0, justBefore);
  assert.equal(status.eligible, false);
});
