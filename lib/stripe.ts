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

export interface PaywallPlan {
  id: "MONTHLY" | "ANNUAL";
  priceLabel: string;
  perLabel: string;
  subLabel: string;
  discountLabel: string | null;
}

const EUR_FORMAT = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

/** Prix mensuel connu, répété partout ailleurs dans l'app (tarifs, réglages) — jamais un montant inventé. */
const FALLBACK_MONTHLY: PaywallPlan = {
  id: "MONTHLY",
  priceLabel: "6,99 €",
  perLabel: "/ mois",
  subLabel: "0,23 € par jour",
  discountLabel: null,
};

/**
 * Prix affichés sur le paywall, lus en direct sur Stripe — jamais codés en
 * dur: si un montant change côté Stripe, l'affichage reste juste sans
 * déploiement. Le plan annuel n'apparaît que si STRIPE_PRICE_ID_ANNUAL est
 * configuré ET que Stripe renvoie un montant exploitable. Toute erreur
 * (Stripe indisponible, clé absente) retombe sur le prix mensuel connu —
 * jamais de page cassée pour l'écran le plus critique de l'app.
 */
export async function getPaywallPlans(): Promise<PaywallPlan[]> {
  try {
    if (!STRIPE_PRICE_IDS.MONTHLY) return [FALLBACK_MONTHLY];
    const monthlyPrice = await getStripeClient().prices.retrieve(STRIPE_PRICE_IDS.MONTHLY);
    const monthlyCents = monthlyPrice.unit_amount;
    if (!monthlyCents) return [FALLBACK_MONTHLY];

    const plans: PaywallPlan[] = [
      {
        id: "MONTHLY",
        priceLabel: EUR_FORMAT.format(monthlyCents / 100),
        perLabel: "/ mois",
        subLabel: `${EUR_FORMAT.format(monthlyCents / 100 / 30)} par jour`,
        discountLabel: null,
      },
    ];

    if (STRIPE_PRICE_IDS.ANNUAL) {
      const annualPrice = await getStripeClient().prices.retrieve(STRIPE_PRICE_IDS.ANNUAL);
      const annualCents = annualPrice.unit_amount;
      if (annualCents) {
        const perMonthCents = annualCents / 12;
        const discountPct = Math.round((1 - perMonthCents / monthlyCents) * 100);
        plans.push({
          id: "ANNUAL",
          priceLabel: EUR_FORMAT.format(annualCents / 100),
          perLabel: "/ an",
          subLabel: `soit ${EUR_FORMAT.format(perMonthCents / 100)} / mois`,
          discountLabel: discountPct > 0 ? `−${discountPct} %` : null,
        });
      }
    }

    return plans;
  } catch {
    return [FALLBACK_MONTHLY];
  }
}
