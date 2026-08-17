import { NextResponse } from "next/server";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

/** Résiliation/gestion en 1 clic via le portail client Stripe (section 3). */
export async function POST(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (!subscription?.stripeCustomerId) return NextResponse.json({ error: "no_subscription" }, { status: 400 });

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
  const session = await getStripeClient().billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${origin}/parametres/abonnement`,
  });

  return NextResponse.json({ url: session.url });
}
