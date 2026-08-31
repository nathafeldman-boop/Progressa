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
  // Créé directement dans le dashboard Stripe (voir capture) — pas encore
  // dans les variables d'env Vercel, donc valeur de repli en dur ici.
  // Un STRIPE_PRICE_ID_WEEKLY ajouté côté Vercel prendrait le dessus.
  WEEKLY: process.env.STRIPE_PRICE_ID_WEEKLY ?? "price_1UAVU7Rd6r34OMU65dv0J0UL",
  MONTHLY: process.env.STRIPE_PRICE_ID_MONTHLY ?? "",
  ANNUAL: process.env.STRIPE_PRICE_ID_ANNUAL ?? "",
} as const;

export interface PaywallPlan {
  id: "WEEKLY" | "MONTHLY" | "ANNUAL";
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
 * déploiement. Les plans hebdo/annuel n'apparaissent que si leur price ID
 * est configuré ET que Stripe renvoie un montant exploitable. Toute erreur
 * (Stripe indisponible, clé absente) retombe sur le prix mensuel connu —
 * jamais de page cassée pour l'écran le plus critique de l'app.
 * Ordre volontaire — engagement croissant, du plus flexible (hebdo, prix au
 * poids plus élevé) au plus engageant (annuel, le plus avantageux et
 * présélectionné par défaut côté UI).
 */
export async function getPaywallPlans(): Promise<PaywallPlan[]> {
  try {
    if (!STRIPE_PRICE_IDS.MONTHLY) return [FALLBACK_MONTHLY];
    const monthlyPrice = await getStripeClient().prices.retrieve(STRIPE_PRICE_IDS.MONTHLY);
    const monthlyCents = monthlyPrice.unit_amount;
    if (!monthlyCents) return [FALLBACK_MONTHLY];

    const plans: PaywallPlan[] = [];

    if (STRIPE_PRICE_IDS.WEEKLY) {
      const weeklyPrice = await getStripeClient().prices.retrieve(STRIPE_PRICE_IDS.WEEKLY);
      const weeklyCents = weeklyPrice.unit_amount;
      if (weeklyCents) {
        plans.push({
          id: "WEEKLY",
          priceLabel: EUR_FORMAT.format(weeklyCents / 100),
          perLabel: "/ semaine",
          subLabel: `${EUR_FORMAT.format(weeklyCents / 100 / 7)} par jour`,
          discountLabel: null,
        });
      }
    }

    plans.push({
      id: "MONTHLY",
      priceLabel: EUR_FORMAT.format(monthlyCents / 100),
      perLabel: "/ mois",
      subLabel: `${EUR_FORMAT.format(monthlyCents / 100 / 30)} par jour`,
      discountLabel: null,
    });

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
