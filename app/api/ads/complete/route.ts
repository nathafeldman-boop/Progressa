import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPremiumActive } from "@/lib/subscription";
import { completeRewardedAd } from "@/lib/ads/reward";
import { getBrianMessageQuota } from "@/lib/brian/message-quota";
import { getFreeTargetedSessionStatus } from "@/lib/programs/free-targeted-cooldown";

const bodySchema = z.object({
  kind: z.enum(["BRIAN_MESSAGES", "SESSION_TIMER"]),
  watchToken: z.string().min(1),
});

/**
 * Valide un visionnage de pub récompensée et retourne l'état à jour
 * (quota Brian ou cooldown séance ciblée) pour que le client n'ait pas à
 * refaire un aller-retour séparé. Voir lib/ads/reward.ts pour les
 * garanties anti-triche (jamais de confiance dans une simple déclaration
 * du frontend).
 */
export async function POST(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const result = await completeRewardedAd(user.id, parsed.data.kind, parsed.data.watchToken);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason, providerReason: result.providerReason }, { status: 400 });
  }

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  const premium = isPremiumActive(subscription);

  if (parsed.data.kind === "BRIAN_MESSAGES") {
    const quota = await getBrianMessageQuota(user.id, premium);
    return NextResponse.json({ ok: true, brianQuota: quota });
  }

  const cooldown = await getFreeTargetedSessionStatus(user.id);
  return NextResponse.json({ ok: true, targetedSessionCooldown: cooldown });
}
