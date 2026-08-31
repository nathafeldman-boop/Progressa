import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripeClient, STRIPE_PRICE_IDS } from "@/lib/stripe";

const bodySchema = z.object({
  plan: z.enum(["WEEKLY", "MONTHLY", "ANNUAL"]),
  affCode: z.string().max(64).nullable().optional(),
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

  const priceId = STRIPE_PRICE_IDS[parsed.data.plan];
  if (!priceId) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 500 });
  }

  const existingSubscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

  const session = await getStripeClient().checkout.sessions.create({
    mode: "subscription",
    customer: existingSubscription?.stripeCustomerId ?? undefined,
    customer_email: existingSubscription?.stripeCustomerId ? undefined : user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    // Après paiement, le joueur entre directement dans l'app (jamais vers
    // la landing ni un simple écran de confirmation) — /onboarding/brian
    // gère déjà l'accueil + le lien vers le premier entraînement.
    success_url: `${origin}/onboarding/brian?success=1`,
    cancel_url: `${origin}/paywall?canceled=1`,
    client_reference_id: user.id,
    subscription_data: {
      metadata: parsed.data.affCode ? { userId: user.id, affCode: parsed.data.affCode } : { userId: user.id },
    },
    metadata: { userId: user.id, plan: parsed.data.plan },
  });

  return NextResponse.json({ url: session.url });
}
