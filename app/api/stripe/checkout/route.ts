import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";

const bodySchema = z.object({
  plan: z.enum(["MONTHLY", "ANNUAL"]),
  // Un mineur ne peut pas payer lui-même: un parent/tuteur doit confirmer
  // explicitement avant qu'on ouvre la session de paiement (section 7).
  parentConfirmed: z.boolean().optional(),
});

/**
 * Paiement direct, sans essai gratuit: la session Stripe démarre
 * l'abonnement immédiatement (débit à la souscription). Les réductions
 * (codes affiliés, offres de lancement) sont configurées côté Stripe —
 * jamais en dur ici — via `allow_promotion_codes`.
 */
export async function POST(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  if (user.isMinor && !parsed.data.parentConfirmed) {
    return NextResponse.json({ error: "parent_confirmation_required" }, { status: 400 });
  }
  if (user.isMinor && parsed.data.parentConfirmed && !user.parentConsentAt) {
    await prisma.user.update({ where: { id: user.id }, data: { parentConsentAt: new Date() } });
  }

  const priceId = parsed.data.plan === "MONTHLY" ? STRIPE_PRICE_IDS.MONTHLY : STRIPE_PRICE_IDS.ANNUAL;
  if (!priceId) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 500 });
  }

  const existingSubscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: existingSubscription?.stripeCustomerId ?? undefined,
    customer_email: existingSubscription?.stripeCustomerId ? undefined : user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${origin}/parametres/abonnement?success=1`,
    cancel_url: `${origin}/parametres/abonnement?canceled=1`,
    client_reference_id: user.id,
    subscription_data: {
      metadata: { userId: user.id, payerIsParent: String(user.isMinor) },
    },
    metadata: { userId: user.id, plan: parsed.data.plan },
  });

  return NextResponse.json({ url: session.url });
}
