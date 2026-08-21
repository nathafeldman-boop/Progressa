import { prisma } from "@/lib/prisma";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans caractères ambigus (0/O, 1/I)

function randomCode(length = 7): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

const WEEKS_PER_THREE_ONBOARDED = 1;
const MAX_ONBOARDED_CREDITS = 4; // cumulable jusqu'à 4 semaines (section 3)
const WEEKS_PER_FRIEND_PAID = 2;

/**
 * Pure — le bonus se cumule sur ce qui reste d'un bonus déjà en cours (pas
 * de reset si un bonus précédent n'est pas encore expiré), sinon repart de
 * maintenant. Séparé du I/O pour être testable sans DB.
 */
export function computeBonusPremiumUntil(currentBonusUntil: Date | null, weeks: number, now: Date = new Date()): Date {
  const extraMs = weeks * 7 * 24 * 60 * 60 * 1000;
  const base = currentBonusUntil && currentBonusUntil.getTime() > now.getTime() ? currentBonusUntil.getTime() : now.getTime();
  return new Date(base + extraMs);
}

/** Pure — tous les 3 filleuls onboardés, plafonné à MAX_ONBOARDED_CREDITS crédits. */
export function shouldCreditThreeFriendsBonus(totalOnboarded: number, alreadyCredited: number): boolean {
  if (totalOnboarded % 3 !== 0) return false;
  if (alreadyCredited >= MAX_ONBOARDED_CREDITS) return false;
  return true;
}

async function grantBonusWeeks(userId: string, weeks: number) {
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  const bonusPremiumUntil = computeBonusPremiumUntil(existing?.bonusPremiumUntil ?? null, weeks);

  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, bonusPremiumUntil },
    update: { bonusPremiumUntil },
  });
}

/**
 * Appelé à la fin de l'onboarding si le joueur est arrivé via un lien de
 * parrainage (/r/<code>). Tous les 3 filleuls qui terminent l'onboarding,
 * le parrain reçoit +1 semaine de Premium, cumulable jusqu'à 4 semaines.
 * Idempotent grâce à la contrainte unique (relatedReferralId, source).
 */
export async function recordReferralOnboarding(referralCode: string | null | undefined, refereeId: string) {
  if (!referralCode) return;

  const codeRow = await prisma.referralCode.findUnique({ where: { code: referralCode } });
  if (!codeRow || codeRow.userId === refereeId) return;

  let referral;
  try {
    referral = await prisma.referral.create({
      data: { referrerId: codeRow.userId, refereeId, status: "ONBOARDED" },
    });
  } catch {
    return; // déjà parrainé (contrainte unique sur refereeId) — pas de double comptage
  }

  const totalOnboarded = await prisma.referral.count({ where: { referrerId: codeRow.userId } });
  const alreadyCredited = await prisma.referralCredit.count({
    where: { userId: codeRow.userId, source: "THREE_FRIENDS_ONBOARDED" },
  });
  if (!shouldCreditThreeFriendsBonus(totalOnboarded, alreadyCredited)) return;

  try {
    await prisma.referralCredit.create({
      data: {
        userId: codeRow.userId,
        source: "THREE_FRIENDS_ONBOARDED",
        weeksGranted: WEEKS_PER_THREE_ONBOARDED,
        relatedReferralId: referral.id,
      },
    });
    await grantBonusWeeks(codeRow.userId, WEEKS_PER_THREE_ONBOARDED);
  } catch {
    // déjà crédité pour ce référencement précis — no-op (verrou anti double-crédit)
  }
}

/**
 * Appelé depuis le webhook Stripe au tout premier paiement réussi d'un
 * filleul. Bonus plus fort que l'onboarding seul: 2 semaines offertes au
 * parrain, déclenché une seule fois grâce à la contrainte unique.
 */
export async function creditReferralOnFriendPayment(payingUserId: string) {
  const referral = await prisma.referral.findUnique({ where: { refereeId: payingUserId } });
  if (!referral) return;

  if (referral.status !== "CONVERTED_PAYING") {
    await prisma.referral.update({
      where: { id: referral.id },
      data: { status: "CONVERTED_PAYING", convertedAt: new Date() },
    });
  }

  try {
    await prisma.referralCredit.create({
      data: {
        userId: referral.referrerId,
        source: "FRIEND_PAID",
        weeksGranted: WEEKS_PER_FRIEND_PAID,
        relatedReferralId: referral.id,
      },
    });
    await grantBonusWeeks(referral.referrerId, WEEKS_PER_FRIEND_PAID);
  } catch {
    // déjà crédité pour ce filleul (webhook Stripe rejoué) — no-op
  }
}

export async function ensureReferralCode(userId: string): Promise<string> {
  const existing = await prisma.referralCode.findUnique({ where: { userId } });
  if (existing) return existing.code;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    try {
      const created = await prisma.referralCode.create({ data: { userId, code } });
      return created.code;
    } catch {
      // collision sur le code unique: on retente avec un nouveau tirage
    }
  }
  throw new Error("ensureReferralCode: unable to generate a unique code after 5 attempts");
}
