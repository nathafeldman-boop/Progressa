import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { RewardedAdKind } from "@prisma/client";
import type { RewardedAdProvider, RewardedAdVerification, RewardedAdWatch } from "./provider";

/**
 * ⚠️ FOURNISSEUR PLACEHOLDER — PAS UN VRAI FOURNISSEUR PUBLICITAIRE.
 *
 * En attendant le choix d'un fournisseur réel de pub récompensée web (le
 * SDK AdMob est mobile-natif, inutilisable dans cette PWA — voir l'audit),
 * ce module simule le contrat serveur d'un vrai fournisseur SANS jamais
 * prétendre qu'une publicité existe ni inventer de revenu: l'UI affiche un
 * simple compte à rebours "chargement", pas une créature publicitaire.
 *
 * Ce qui reste néanmoins réel et non-contournable, exactement comme avec
 * un vrai fournisseur:
 * - le jeton de visionnage est signé HMAC (jamais généré/validé côté client)
 * - la validation exige qu'un temps minimum réel se soit écoulé
 * - une même récompense ne peut être validée qu'une fois (contrainte SQL
 *   unique sur RewardedAdEvent.providerTransactionId, voir lib/ads/reward.ts)
 *
 * À la connexion d'un vrai fournisseur: remplacer uniquement ce fichier,
 * en respectant l'interface RewardedAdProvider — rien d'autre ne change.
 */

const SECRET = process.env.ADS_MOCK_SECRET ?? "progressa-mock-ads-not-a-real-provider";
export const MIN_WATCH_SECONDS = 15;
const TOKEN_TTL_MS = 10 * 60 * 1000;

function sign(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Fabrique testable: `clock` est injectable pour les tests (voir
 * tests/rewarded-ads.test.ts) — jamais utilisé en production où
 * `mockAdProvider` ci-dessous s'en tient à l'horloge système réelle.
 */
export function createMockAdProvider(secret: string, clock: () => number = Date.now): RewardedAdProvider {
  return {
    startWatch(userId: string, kind: RewardedAdKind): RewardedAdWatch {
      const issuedAtMs = clock();
      const nonce = randomBytes(8).toString("hex");
      const payload = `${userId}.${kind}.${issuedAtMs}.${nonce}`;
      const watchToken = `${payload}.${sign(secret, payload)}`;
      return { watchToken, minWatchSeconds: MIN_WATCH_SECONDS, expiresAt: new Date(issuedAtMs + TOKEN_TTL_MS) };
    },

    verifyWatch(userId: string, kind: RewardedAdKind, watchToken: string): RewardedAdVerification {
      const parts = watchToken.split(".");
      if (parts.length !== 5) return { ok: false, reason: "malformed_token" };
      const [tokenUserId, tokenKind, issuedAtRaw, nonce, mac] = parts;

      const payload = `${tokenUserId}.${tokenKind}.${issuedAtRaw}.${nonce}`;
      if (!safeEqual(mac, sign(secret, payload))) return { ok: false, reason: "invalid_signature" };

      if (tokenUserId !== userId) return { ok: false, reason: "user_mismatch" };
      if (tokenKind !== kind) return { ok: false, reason: "kind_mismatch" };

      const issuedAtMs = Number(issuedAtRaw);
      if (!Number.isFinite(issuedAtMs)) return { ok: false, reason: "malformed_token" };

      const now = clock();
      if (now > issuedAtMs + TOKEN_TTL_MS) return { ok: false, reason: "token_expired" };
      // Le coeur de la vérification "réelle": impossible de valider avant que
      // le temps de visionnage minimum se soit écoulé, quoi que le client
      // prétende — recalculé ici sur l'horloge serveur, jamais sur un
      // timestamp envoyé par le navigateur.
      if (now < issuedAtMs + MIN_WATCH_SECONDS * 1000) return { ok: false, reason: "watch_too_short" };

      return { ok: true, providerTransactionId: watchToken };
    },
  };
}

export const mockAdProvider: RewardedAdProvider = createMockAdProvider(SECRET);
