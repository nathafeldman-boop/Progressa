import { NextResponse } from "next/server";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * "Payer ultérieurement": enregistre que le joueur a sauté le paiement
 * depuis le paywall. Ne débloque PAS l'app en général — seul
 * app/(app)/coach/page.tsx lit ce champ (via hasSkippedPaywall) pour
 * laisser passer un joueur non premium. Toutes les autres pages du groupe
 * (app) continuent de rediriger vers /paywall sans changement.
 */
export async function POST() {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: { userId: user.id, paywallSkippedAt: new Date() },
    update: { paywallSkippedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
