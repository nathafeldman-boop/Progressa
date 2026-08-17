import Stripe from "stripe";

const globalForStripe = globalThis as unknown as { stripe?: Stripe };

export const stripe =
  globalForStripe.stripe ??
  new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2026-07-29.dahlia",
  });

if (process.env.NODE_ENV !== "production") {
  globalForStripe.stripe = stripe;
}

export const STRIPE_PRICE_IDS = {
  MONTHLY: process.env.STRIPE_PRICE_ID_MONTHLY ?? "",
  ANNUAL: process.env.STRIPE_PRICE_ID_ANNUAL ?? "",
} as const;
