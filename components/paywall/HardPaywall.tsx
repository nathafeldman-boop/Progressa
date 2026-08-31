"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { PlayerCardView } from "@/components/card/PlayerCardView";
import { trackClick } from "@/lib/analytics/track";
import { getOrCreateAnonId } from "@/lib/onboarding/storage";
import { getStoredAffCode } from "@/lib/affiliate-client";
import { AccessCodeForm } from "@/components/paywall/AccessCodeForm";
import type { PlayerCardStats } from "@/lib/player-card";
import type { PaywallPlan } from "@/lib/stripe";

const UNLOCKS = [
  { b: "Ton OVR et ton rang", t: "calculés sur tes 6 tests, débloqués tout de suite." },
  { b: "Le programme de Coach Brian", t: "bâti sur ton poste et ton axe le plus faible, sans limite de messages." },
  { b: "Ta carte qui évolue", t: "chaque séance terminée applique un delta réel." },
  { b: "Le classement", t: "amis, département, France — ta place chaque semaine." },
  { b: "Aucune publicité", t: "ni classique ni récompensée — jamais d'attente à raccourcir." },
];

const PLAN_LABELS: Record<PaywallPlan["id"], string> = {
  WEEKLY: "Semaine",
  MONTHLY: "Mensuel",
  ANNUAL: "Annuel",
};

function formatRating(avgRating: number): string {
  return avgRating.toFixed(1).replace(".", ",");
}

export function HardPaywall({
  firstName,
  cardStats,
  positionLabel,
  ageCategoryLabel,
  country,
  department,
  niveauLabel,
  photoUrl,
  avgRating,
  reviewCount,
  plans,
}: {
  firstName: string;
  cardStats: PlayerCardStats | null;
  positionLabel: string | null;
  ageCategoryLabel: string | null;
  country: string | null;
  department: string | null;
  niveauLabel: string | null;
  photoUrl: string | null;
  avgRating: number | null;
  reviewCount: number;
  plans: PaywallPlan[];
}) {
  // Le dernier plan de la liste (le plus engageant — annuel si présent,
  // sinon mensuel) est présélectionné, toujours librement changeable.
  const [selectedPlanId, setSelectedPlanId] = useState<PaywallPlan["id"]>(plans[plans.length - 1].id);
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? plans[0];
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [skipping, setSkipping] = useState(false);

  useEffect(() => {
    trackClick(getOrCreateAnonId(), "paywall_viewed", "/paywall");
  }, []);

  async function startCheckout() {
    setLoading(true);
    setError(false);
    trackClick(getOrCreateAnonId(), "checkout_started", "/paywall");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan.id, affCode: getStoredAffCode() }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function skipForNow() {
    setSkipping(true);
    trackClick(getOrCreateAnonId(), "paywall_skipped", "/paywall");
    try {
      await fetch("/api/paywall/skip-later", { method: "POST" });
    } finally {
      // Coach Brian est la seule page accessible sans abonnement (voir
      // app/(app)/coach/page.tsx) — inutile d'envoyer vers /dashboard pour
      // se faire renvoyer ici aussitôt.
      router.push("/coach");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-surface)]">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div
          className="relative overflow-hidden px-[22px] pb-[26px] text-white [padding-top:calc(env(safe-area-inset-top)+2.25rem)]"
          style={{ background: "#0b1a12" }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(420px 320px at 50% 0%, rgba(26,163,80,.4), transparent 70%)" }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0, #fff 2px, transparent 2px, transparent 14px)" }}
          />

          <div className="relative flex items-center justify-between">
            <div className="inline-flex items-center gap-[7px] rounded-full border border-white/[0.16] bg-white/10 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3ddc7f]" />
              <span className="font-mono text-[9px] tracking-[0.16em] text-[#3ddc7f]">CARTE GÉNÉRÉE</span>
            </div>
          </div>

          {cardStats && positionLabel && (
            <div className="relative mx-auto mt-[18px] max-w-[220px]">
              <div
                className="ev-glow pointer-events-none absolute -inset-3.5 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(61,220,127,.28), transparent 68%)" }}
              />
              <div className="relative max-h-[270px] overflow-hidden rounded-t-[18px]">
                <div className="pointer-events-none select-none blur-[5px]" aria-hidden>
                  <PlayerCardView
                    firstName={firstName}
                    positionLabel={positionLabel}
                    ageCategoryLabel={ageCategoryLabel}
                    country={country}
                    department={department}
                    niveauLabel={niveauLabel}
                    photoUrl={photoUrl}
                    stats={cardStats}
                  />
                </div>
                <div
                  className="ev-sheen pointer-events-none absolute -top-10 -bottom-10 w-14 blur-[3px]"
                  style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent)" }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: "rgba(11,26,18,.55)" }}>
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-[19px]"
                    style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.24)" }}
                  >
                    🔒
                  </div>
                  <p className="text-center font-mono text-[8.5px] leading-[1.8] tracking-[0.16em] text-white/70">
                    OVR · RANG · 6 AXES
                    <br />
                    VERROUILLÉS
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="relative mt-[22px] text-center">
            <h1 className="font-display text-[38px] font-extrabold uppercase leading-[.98]">
              Ta carte existe.
              <br />
              Elle t&apos;attend.
            </h1>
            <p className="mx-auto mt-2.5 max-w-[300px] text-sm leading-[1.55] text-white/68">
              Coach Brian a analysé tes résultats, {firstName}. Ton OVR, ton rang et ton programme sont prêts — il ne
              reste qu&apos;à ouvrir.
            </p>
          </div>
        </div>

        <div className="px-[22px] pb-6 pt-[22px]">
          {plans.length > 1 && (
            <div className="flex gap-[9px]">
              {plans.map((p) => {
                const on = p.id === selectedPlanId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanId(p.id)}
                    className="relative flex-1 rounded-[18px] border-2 px-2.5 py-3 text-left transition-colors"
                    style={{ background: on ? "var(--color-primary-soft)" : "var(--color-surface)", borderColor: on ? "var(--color-primary)" : "var(--color-border)" }}
                  >
                    {p.discountLabel && (
                      <span className="absolute right-3 -top-2.5 rounded-full bg-[var(--color-text)] px-2 py-[3px] text-[9px] font-extrabold tracking-[0.06em] text-white">
                        {p.discountLabel}
                      </span>
                    )}
                    <p
                      className="text-[10.5px] font-bold uppercase tracking-[0.08em]"
                      style={{ color: on ? "var(--color-primary-strong)" : "var(--color-text-muted)" }}
                    >
                      {PLAN_LABELS[p.id]}
                    </p>
                    <p className="mt-1.5 flex flex-wrap items-baseline gap-x-[3px]">
                      <span className="font-display text-2xl font-extrabold leading-[.9] text-[var(--color-text)]">{p.priceLabel}</span>
                      <span className="text-[10.5px] font-semibold text-[var(--color-text-muted)]">{p.perLabel}</span>
                    </p>
                    <p className="mt-1.5 font-mono text-[9.5px]" style={{ color: on ? "var(--color-primary-strong)" : "#8b9a91" }}>
                      {p.subLabel}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-[18px] flex flex-col gap-[11px]">
            {UNLOCKS.map((u) => (
              <div key={u.b} className="flex items-start gap-[11px]">
                <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-[7px] bg-[var(--color-primary-soft)] text-[11px] font-extrabold text-[var(--color-primary-strong)]">
                  ✓
                </span>
                <p className="flex-1 text-[13.5px] leading-[1.45] text-[var(--color-text)]">
                  <b>{u.b}</b> {u.t}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-[18px] flex items-center gap-[11px] rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-[15px] py-[13px]">
            <BrianAvatar state="confident" size={42} className="shrink-0" />
            <p className="flex-1 text-[12.5px] leading-[1.45] text-[var(--color-text)]">
              « Ta carte ne bougera pas toute seule. Donne-moi trois séances, je te montre. »
            </p>
          </div>

          {avgRating != null && (
            <div className="mt-3.5 flex items-center justify-center gap-[9px]">
              <p className="text-[11.5px] text-[var(--color-text-muted)]">
                ⭐ {formatRating(avgRating)}/5 · {reviewCount} avis
              </p>
              <div className="h-3 w-px bg-[var(--color-border)]" />
              <p className="text-[11.5px] text-[var(--color-text-muted)]">Résiliable en 1 clic</p>
            </div>
          )}
        </div>
      </div>

      <div
        className="shrink-0 px-[22px] pb-[calc(env(safe-area-inset-bottom)+1.375rem)] pt-3.5"
        style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", boxShadow: "0 -14px 26px -20px rgba(16,35,26,.35)" }}
      >
        <button
          type="button"
          onClick={startCheckout}
          disabled={loading}
          className="flex h-[60px] w-full items-center justify-center gap-[9px] rounded-2xl bg-[var(--color-primary)] font-display text-xl font-extrabold uppercase tracking-[0.04em] text-[var(--color-on-primary)] transition-transform active:scale-[.97] disabled:opacity-70"
          style={{ boxShadow: "0 16px 32px -12px rgba(26,163,80,.7)" }}
        >
          {loading ? "Préparation du paiement..." : `Ouvrir ma carte — ${selectedPlan.priceLabel}`}
        </button>

        {error && (
          <p className="mt-2 text-center text-xs text-[var(--color-danger)]">
            Impossible de lancer le paiement, réessaie dans un instant.
          </p>
        )}

        <p className="mt-2.5 text-center text-[10.5px] text-[var(--color-text-muted)]">
          {selectedPlan.priceLabel} {selectedPlan.perLabel} · Paiement Stripe · Sans engagement
        </p>
        <p className="mt-1.5 text-center text-[10px] leading-[1.4] text-[var(--color-text-muted)]">
          En continuant, tu acceptes les{" "}
          <a href="/cgv" target="_blank" rel="noopener noreferrer" className="underline">
            CGV
          </a>{" "}
          et reconnais que l&apos;accès Premium débute immédiatement (renonciation au délai de rétractation).
        </p>

        <div className="mt-2.5">
          <AccessCodeForm />
        </div>

        <button
          type="button"
          onClick={skipForNow}
          disabled={skipping}
          className="mx-auto mt-2 block text-center text-[11px] text-[var(--color-text-muted)] underline disabled:opacity-50"
        >
          {skipping ? "..." : "Payer ultérieurement"}
        </button>
      </div>
    </div>
  );
}
