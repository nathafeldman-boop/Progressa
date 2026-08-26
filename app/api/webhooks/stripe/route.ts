import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { creditReferralOnFriendPayment } from "@/lib/referral";
import { recordAffiliateConversion } from "@/lib/affiliate";

function planFromPriceId(priceId: string | undefined): "MONTHLY" | "ANNUAL" | undefined {
  if (priceId === STRIPE_PRICE_IDS.MONTHLY) return "MONTHLY";
  if (priceId === STRIPE_PRICE_IDS.ANNUAL) return "ANNUAL";
  return undefined;
}

function mapStripeStatus(status: Stripe.Subscription.Status): "ACTIVE" | "PAST_DUE" | "CANCELED" {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "past_due":
    case "unpaid":
      return "PAST_DUE";
    default:
      return "CANCELED";
  }
}

async function syncSubscriptionFromStripe(subscription: Stripe.Subscription, userId?: string) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const priceId = subscription.items.data[0]?.price?.id;
  const currentPeriodEndSeconds = subscription.items.data[0]?.current_period_end;

  const resolvedUserId = userId ?? subscription.metadata?.userId;
  const data = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    status: mapStripeStatus(subscription.status),
    plan: planFromPriceId(priceId),
    currentPeriodEnd: currentPeriodEndSeconds ? new Date(currentPeriodEndSeconds * 1000) : undefined,
    payerIsParent: subscription.metadata?.payerIsParent === "true",
  };

  if (resolvedUserId) {
    await prisma.subscription.upsert({
      where: { userId: resolvedUserId },
      create: { userId: resolvedUserId, ...data },
      update: data,
    });
    return resolvedUserId;
  }

  // Retrouver l'utilisateur via le customer Stripe si le metadata userId est absent.
  const existing = await prisma.subscription.findUnique({ where: { stripeCustomerId: customerId } });
  if (existing) {
    await prisma.subscription.update({ where: { userId: existing.userId }, data });
    return existing.userId;
  }
  return null;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[webhooks/stripe] signature verification failed", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          const subscription = await getStripeClient().subscriptions.retrieve(subscriptionId);
          const userId = await syncSubscriptionFromStripe(subscription, session.metadata?.userId ?? session.client_reference_id ?? undefined);
          if (userId) {
            // Un seul crédit possible par filleul, verrouillé par la
            // contrainte unique (relatedReferralId, source) — sûr même si
            // Stripe rejoue l'événement.
            await creditReferralOnFriendPayment(userId);
          }
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionFromStripe(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: "CANCELED" },
        });
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        // Snapshot immuable des metadata de l'abonnement au moment de la
        // facture — pas besoin d'un appel API supplémentaire pour lire affCode.
        const affCode = invoice.parent?.subscription_details?.metadata?.affCode;

        if (customerId && invoice.amount_paid > 0) {
          const localSub = await prisma.subscription.findUnique({ where: { stripeCustomerId: customerId } });
          if (localSub) {
            // Idempotent: un même paiement Stripe ne doit jamais compter deux
            // fois côté LTV, même si le webhook est rejoué.
            await prisma.payment
              .create({
                data: { userId: localSub.userId, stripeInvoiceId: invoice.id!, amountCents: invoice.amount_paid },
              })
              .catch(() => {
                // Contrainte unique sur stripeInvoiceId: rejeu du webhook, on ignore.
              });

            if (affCode) {
              await recordAffiliateConversion({
                affiliateCode: affCode,
                userId: localSub.userId,
                stripeInvoiceId: invoice.id!,
                amountCents: invoice.amount_paid,
                chargedAt: new Date(),
              });
            }
          }
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (customerId) {
          await prisma.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: { status: "PAST_DUE" },
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error(`[webhooks/stripe] handling ${event.type} failed`, err);
    // On répond quand même 200: Stripe réessaiera un event "error" via son
    // propre mécanisme de retry si on renvoie une erreur HTTP, mais une
    // erreur applicative ici ne doit pas bloquer indéfiniment la queue.
  }

  return NextResponse.json({ received: true });
}
