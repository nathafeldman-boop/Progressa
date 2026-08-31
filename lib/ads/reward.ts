import { Prisma, type RewardedAdKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { mockAdProvider } from "./mock-provider";
import type { RewardedAdProvider } from "./provider";

// Fournisseur unique branché ici — swap vers un vrai fournisseur en changeant
// uniquement cette ligne une fois choisi (voir mock-provider.ts).
const provider: RewardedAdProvider = mockAdProvider;

const START_RATE_LIMIT = 20;
const START_RATE_WINDOW_MS = 60 * 60 * 1000;

export type StartRewardedAdResult =
  | { ok: true; watchToken: string; minWatchSeconds: number; expiresAt: Date }
  | { ok: false; reason: "rate_limited" };

/**
 * Démarre un visionnage. Le rate-limit ici est une première ligne de
 * défense contre un script qui appellerait cette route en boucle — la
 * vraie garantie anti-rejeu/anti-double-validation est la contrainte SQL
 * unique sur RewardedAdEvent (voir completeRewardedAd ci-dessous), pas ce
 * compteur en mémoire (voir lib/rate-limit.ts).
 */
export function startRewardedAd(userId: string, kind: RewardedAdKind): StartRewardedAdResult {
  if (!checkRateLimit(`ads:start:${userId}`, START_RATE_LIMIT, START_RATE_WINDOW_MS)) {
    return { ok: false, reason: "rate_limited" };
  }
  const watch = provider.startWatch(userId, kind);
  return { ok: true, ...watch };
}

export type CompleteRewardedAdResult =
  | { ok: true }
  | { ok: false; reason: "verification_failed" | "already_granted"; providerReason?: string };

/**
 * Valide un visionnage et écrit la récompense. `providerTransactionId`
 * (le watchToken lui-même pour le fournisseur mock) porte la contrainte
 * unique en base — si ce même jeton a déjà été inséré (double clic, retry
 * réseau, requêtes concurrentes), Prisma lève une violation de contrainte
 * (P2002) qu'on traduit ici en "already_granted" plutôt que d'accorder la
 * récompense deux fois.
 */
export async function completeRewardedAd(userId: string, kind: RewardedAdKind, watchToken: string): Promise<CompleteRewardedAdResult> {
  const verification = provider.verifyWatch(userId, kind, watchToken);
  if (!verification.ok) {
    return { ok: false, reason: "verification_failed", providerReason: verification.reason };
  }

  try {
    await prisma.rewardedAdEvent.create({
      data: { userId, kind, providerTransactionId: verification.providerTransactionId },
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { ok: false, reason: "already_granted" };
    }
    throw err;
  }
}
