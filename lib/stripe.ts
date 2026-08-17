import Stripe from "stripe";

// Instanciation paresseuse: le SDK Stripe lève une erreur dès le
// constructeur si la clé API est vide, ce qui ferait planter le build (et
// toute route qui importe ce module) tant que STRIPE_SECRET_KEY n'est pas
// configurée. On ne construit le client qu'au premier appel réel.
let cached: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!cached) {
    cached = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_dev_placeholder", {
      apiVersion: "2026-07-29.dahlia",
    });
  }
  return cached;
}

export const STRIPE_PRICE_IDS = {
  MONTHLY: process.env.STRIPE_PRICE_ID_MONTHLY ?? "",
  ANNUAL: process.env.STRIPE_PRICE_ID_ANNUAL ?? "",
} as const;
