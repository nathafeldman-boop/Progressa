import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const PAYOUT_DELAY_MS = 5 * 24 * 60 * 60 * 1000; // Stripe reverse les fonds ~5 jours après le prélèvement.
export const BONUS_TIER_CENTS = 500 * 100; // 500€ de commissions cumulées...
export const BONUS_AMOUNT_CENTS = 50 * 100; // ...déclenchent +50€ de bonus.

function randomToken(bytes: number): string {
  return randomBytes(bytes).toString("hex");
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 20);
}

export async function createAffiliate(input: { name: string; email: string; createdByAdmin?: boolean }) {
  const base = slugify(input.name) || "partenaire";
  let code = `${base}-${randomToken(2)}`;
  // Collision extrêmement improbable (code court + suffixe aléatoire), mais
  // on vérifie explicitement plutôt que de laisser la contrainte unique
  // planter la requête.
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await prisma.affiliate.findUnique({ where: { code } });
    if (!existing) break;
    code = `${base}-${randomToken(2)}`;
  }

  return prisma.affiliate.create({
    data: {
      code,
      name: input.name,
      email: input.email,
      dashboardToken: randomToken(24),
      createdByAdmin: input.createdByAdmin ?? false,
    },
  });
}

export async function recordAffiliateClick(code: string, anonId: string): Promise<boolean> {
  const affiliate = await prisma.affiliate.findUnique({ where: { code, active: true } });
  if (!affiliate) return false;
  await prisma.affiliateClick.create({ data: { affiliateId: affiliate.id, anonId } });
  return true;
}

/**
 * Enregistre une conversion + commission pour une facture Stripe payée,
 * verrouillé par stripeInvoiceId (idempotent si le webhook est rejoué).
 * Accorde aussi le bonus de palier (+50€ tous les 500€ de commissions
 * cumulées) quand il vient d'être franchi.
 */
/** Commission arrondie à l'euro cent près — jamais de reste de centime perdu ni dupliqué. */
export function computeCommissionCents(amountCents: number, commissionRate: number): number {
  return Math.round(amountCents * commissionRate);
}

/** Stripe reverse les fonds au marchand ~5 jours après le prélèvement — la commission n'est réellement payable qu'à partir de cette date. */
export function computePayableAt(chargedAt: Date): Date {
  return new Date(chargedAt.getTime() + PAYOUT_DELAY_MS);
}

/** Nombre de paliers de 500€ atteints par un total de commissions cumulées. */
export function computeBonusTiersEarned(totalCommissionCents: number): number {
  return Math.floor(totalCommissionCents / BONUS_TIER_CENTS);
}

export async function recordAffiliateConversion(input: {
  affiliateCode: string;
  userId: string;
  stripeInvoiceId: string;
  amountCents: number;
  chargedAt: Date;
}): Promise<void> {
  const affiliate = await prisma.affiliate.findUnique({ where: { code: input.affiliateCode } });
  if (!affiliate) return;

  const existing = await prisma.affiliateConversion.findUnique({ where: { stripeInvoiceId: input.stripeInvoiceId } });
  if (existing) return;

  const commissionCents = computeCommissionCents(input.amountCents, affiliate.commissionRate);
  const payableAt = computePayableAt(input.chargedAt);

  await prisma.affiliateConversion.create({
    data: {
      affiliateId: affiliate.id,
      userId: input.userId,
      stripeInvoiceId: input.stripeInvoiceId,
      amountCents: input.amountCents,
      commissionCents,
      chargedAt: input.chargedAt,
      payableAt,
    },
  });

  await maybeGrantBonusTier(affiliate.id);
}

/**
 * Le bonus de palier n'est PAS une ligne AffiliateConversion (pas de
 * facture Stripe ni d'utilisateur réel derrière) — juste un compteur sur
 * Affiliate. Le total affiché à l'affilié ajoute bonusesGranted × 50€ aux
 * commissions réelles, voir affiliateEarningsSummary().
 */
async function maybeGrantBonusTier(affiliateId: string): Promise<void> {
  const affiliate = await prisma.affiliate.findUnique({ where: { id: affiliateId } });
  if (!affiliate) return;

  const totalCommission = await prisma.affiliateConversion.aggregate({
    where: { affiliateId },
    _sum: { commissionCents: true },
  });
  const total = totalCommission._sum.commissionCents ?? 0;
  const tiersEarned = computeBonusTiersEarned(total);
  if (tiersEarned <= affiliate.bonusesGranted) return;

  await prisma.affiliate.update({ where: { id: affiliateId }, data: { bonusesGranted: tiersEarned } });
}

export interface AffiliateEarningsSummary {
  clickCount: number;
  conversionCount: number;
  pendingCents: number;
  payableCents: number;
  paidCents: number;
  bonusCents: number;
  totalEarnedCents: number;
}

export async function affiliateEarningsSummary(affiliateId: string): Promise<AffiliateEarningsSummary> {
  const [clickCount, conversions, affiliate] = await Promise.all([
    prisma.affiliateClick.count({ where: { affiliateId } }),
    prisma.affiliateConversion.findMany({ where: { affiliateId } }),
    prisma.affiliate.findUnique({ where: { id: affiliateId } }),
  ]);

  const now = Date.now();
  let pendingCents = 0;
  let payableCents = 0;
  let paidCents = 0;
  for (const c of conversions) {
    if (c.paidAt) paidCents += c.commissionCents;
    else if (c.payableAt.getTime() <= now) payableCents += c.commissionCents;
    else pendingCents += c.commissionCents;
  }

  const bonusCents = (affiliate?.bonusesGranted ?? 0) * BONUS_AMOUNT_CENTS;

  return {
    clickCount,
    conversionCount: conversions.length,
    pendingCents,
    payableCents,
    paidCents,
    bonusCents,
    totalEarnedCents: pendingCents + payableCents + paidCents + bonusCents,
  };
}

/** Les codes sont toujours générés en majuscules — sans cette normalisation, un joueur qui tape le code en minuscules (clavier mobile, autocorrection...) se voit refuser un code pourtant valide. */
export function normalizeAccessCode(code: string): string {
  return code.trim().toUpperCase();
}

export async function redeemAccessCode(code: string, userId: string): Promise<{ ok: boolean; days?: number }> {
  const accessCode = await prisma.accessCode.findUnique({ where: { code: normalizeAccessCode(code) } });
  if (!accessCode || accessCode.usedAt) return { ok: false };

  const bonusPremiumUntil = new Date(Date.now() + accessCode.grantsDays * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.accessCode.update({ where: { id: accessCode.id }, data: { usedByUserId: userId, usedAt: new Date() } }),
    prisma.subscription.upsert({
      where: { userId },
      create: { userId, bonusPremiumUntil },
      update: { bonusPremiumUntil },
    }),
  ]);

  return { ok: true, days: accessCode.grantsDays };
}
