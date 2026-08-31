import type { RewardedAdKind } from "@prisma/client";

/**
 * Abstraction volontairement minimale pour brancher un vrai fournisseur de
 * publicité récompensée (AppLixir, Google Ad Manager H5, etc.) sans toucher
 * au reste du système (quotas Brian, cooldown séances ciblées, routes API).
 * Un seul module à remplacer: voir mock-provider.ts pour l'implémentation
 * actuelle (placeholder en attendant le choix du fournisseur — jamais
 * présentée comme un vrai fournisseur, aucun revenu simulé).
 */
export interface RewardedAdWatch {
  watchToken: string;
  minWatchSeconds: number;
  expiresAt: Date;
}

export type RewardedAdVerification = { ok: true; providerTransactionId: string } | { ok: false; reason: string };

export interface RewardedAdProvider {
  /** Démarre un visionnage: le token encode ce qui doit être vérifié côté serveur au moment de la validation. */
  startWatch(userId: string, kind: RewardedAdKind): RewardedAdWatch;
  /** Vérifie le visionnage côté serveur — ne fait JAMAIS confiance à une simple déclaration du client. */
  verifyWatch(userId: string, kind: RewardedAdKind, watchToken: string): RewardedAdVerification;
}
