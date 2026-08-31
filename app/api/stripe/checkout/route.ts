import { NextResponse } from "next/server";
import { z } from "zod";
import type Stripe from "stripe";
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

  const baseParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription" as const,
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
  };

  // Le compte Stripe est partagé avec d'autres SaaS du fondateur — sa marque
  // de compte (nom, couleur) ne peut donc pas être changée globalement sans
  // affecter les autres produits. `branding_settings` permet de surcharger
  // l'affichage juste pour CETTE session de paiement, sans toucher au compte.
  // Fonctionnalité Stripe récente, pas encore dans les types du SDK
  // installé (voir docs.stripe.com/api/checkout/sessions/create
  // #create_checkout_session-branding_settings) — d'où le cast. Si Stripe
  // la rejette pour une raison quelconque, on retente aussitôt sans elle:
  // jamais bloquer un paiement pour une simple personnalisation visuelle.
  let session;
  try {
    session = await getStripeClient().checkout.sessions.create({
      ...baseParams,
      branding_settings: {
        display_name: "Progressa Foot",
        button_color: "#1aa350",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- branding_settings absent des types du SDK Stripe installé
    } as any);
  } catch (err) {
    console.error("[stripe] checkout session with branding_settings failed, retrying without it", err);
    session = await getStripeClient().checkout.sessions.create(baseParams);
  }

  return NextResponse.json({ url: session.url });
}
