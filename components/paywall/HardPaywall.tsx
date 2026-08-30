"use client";

import { useEffect, useState } from "react";
import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PlayerCardView } from "@/components/card/PlayerCardView";
import { trackClick } from "@/lib/analytics/track";
import { getOrCreateAnonId } from "@/lib/onboarding/storage";
import { getStoredAffCode } from "@/lib/affiliate-client";
import { AccessCodeForm } from "@/components/paywall/AccessCodeForm";
import type { PlayerCardStats } from "@/lib/player-card";

const BENEFITS = [
  "Coach Brian personnel, qui suit tes vraies performances",
  "Entraînements adaptés à ton profil, ton poste et ton niveau",
  "Progression de tes statistiques après chaque séance",
  "Évolution de ta carte joueur, séance après séance",
  "Suivi complet de tes performances et de tes records",
  "Nouveaux entraînements régulièrement",
];

/** Projection illustrative — jamais une promesse de note précise, juste le concept d'évolution. */
const EVOLUTION_TEASER = [
  { label: "Vitesse", delta: 3 },
  { label: "Technique", delta: 2 },
  { label: "Endurance", delta: 1 },
];

export interface PaywallTestimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
}

/** Trouve l'axe le plus faible de la carte pour cibler le message sur un besoin réel, pas générique. */
function weakestSkill(cardStats: PlayerCardStats | null): { label: string; score: number } | null {
  if (!cardStats) return null;
  const entries = Object.entries(cardStats.skills);
  if (entries.length === 0) return null;
  const [label, score] = entries.reduce((worst, current) => (current[1] < worst[1] ? current : worst));
  return { label, score };
}

export function HardPaywall({
  firstName,
  cardStats,
  positionLabel,
  objectiveLabel,
  weakPointNote,
  ageCategoryLabel,
  country,
  department,
  niveauLabel,
  photoUrl,
  testimonials,
  avgRating,
  reviewCount,
}: {
  firstName: string;
  cardStats: PlayerCardStats | null;
  positionLabel: string | null;
  objectiveLabel: string | null;
  weakPointNote: string | null;
  ageCategoryLabel: string | null;
  country: string | null;
  department: string | null;
  niveauLabel: string | null;
  photoUrl: string | null;
  testimonials: PaywallTestimonial[];
  avgRating: number | null;
  reviewCount: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const weakest = weakestSkill(cardStats);

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
        body: JSON.stringify({ plan: "MONTHLY", affCode: getStoredAffCode() }),
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

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #0b1410 0%, #0e1a14 55%, #050a07 100%)" }}
    >
      <div className="mx-auto flex min-h-screen max-w-md flex-col gap-5 p-4 pb-8 pt-10 text-white">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrianAvatar state="confident" size={84} />
          <div>
            <h1 className="font-display text-2xl font-extrabold uppercase leading-tight tracking-wide">
              {objectiveLabel ? `Prêt à progresser en ${objectiveLabel.toLowerCase()}, ${firstName} ?` : "Continue ta progression avec Coach Brian"}
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Ta carte est prête. Sans Premium elle reste figée — débloque le programme que Coach Brian a construit à
              partir de tes résultats pour la faire évoluer.
            </p>
          </div>
        </div>

        {cardStats && positionLabel && (
          <div className="w-full">
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
            <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-center">
              {EVOLUTION_TEASER.map((s) => (
                <span key={s.label} className="text-xs font-bold text-[var(--color-primary)]">
                  {s.label} +{s.delta}
                </span>
              ))}
            </div>
            <p className="mt-1 text-center text-[0.65rem] text-white/40">
              Exemple d&apos;évolution possible sur tes premières séances — jamais garanti, ça dépend de toi.
            </p>
          </div>
        )}

        {weakest && (
          <Card className="border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 text-white">
            <p className="text-[0.65rem] font-bold uppercase tracking-wide text-[var(--color-primary)]">
              Ton point à travailler en priorité
            </p>
            <p className="mt-1.5 font-display text-xl font-extrabold">
              {weakest.label} · {weakest.score}/100
            </p>
            <p className="mt-1.5 text-sm text-white/80">
              {weakPointNote
                ? `Tu nous l'as dit toi-même : « ${weakPointNote} ». Coach Brian a construit ton programme autour de ça.`
                : `C'est l'axe où Coach Brian peut t'apporter le plus, dès ta première séance — sans programme ciblé, il ne bouge pas tout seul.`}
            </p>
          </Card>
        )}

        <Card className="border-white/10 bg-white/[0.04] text-white">
          <ul className="space-y-2.5">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-white/90">
                <span className="mt-0.5 shrink-0 text-[var(--color-primary)]">✓</span>
                {b}
              </li>
            ))}
          </ul>
        </Card>

        {testimonials.length > 0 && (
          <div className="w-full">
            {avgRating != null && (
              <p className="text-center text-xs font-semibold text-white/70">
                {"⭐".repeat(Math.round(avgRating))} {avgRating.toFixed(1)}/5 sur {reviewCount} avis de joueurs
              </p>
            )}
            <div className="mt-2 space-y-2">
              {testimonials.map((t) => (
                <Card key={t.id} className="border-white/10 bg-white/[0.04] text-white">
                  <p className="text-xs text-[var(--color-primary)]">{"⭐".repeat(t.rating)}</p>
                  <p className="mt-1 text-sm leading-snug text-white/85">&laquo; {t.text} &raquo;</p>
                  <p className="mt-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-white/45">{t.name}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto space-y-3">
          <div className="text-center">
            <p className="font-display text-4xl font-extrabold">
              6,99 €<span className="text-lg font-bold text-white/60"> / mois</span>
            </p>
            <p className="mt-1 text-xs text-white/50">Moins de 25 centimes par jour. Résilie en un clic, quand tu veux.</p>
          </div>

          <Button className="w-full" onClick={startCheckout} disabled={loading}>
            {loading ? "Préparation du paiement..." : "Débloquer mon programme personnalisé"}
          </Button>

          {error && (
            <p className="text-center text-xs text-[var(--color-danger)]">
              Impossible de lancer le paiement, réessaie dans un instant.
            </p>
          )}

          <p className="text-center text-[0.65rem] text-white/40">
            {firstName}, paiement sécurisé par Stripe. Aucun engagement de durée. En continuant, tu acceptes les{" "}
            <a href="/cgv" target="_blank" rel="noopener noreferrer" className="underline">
              CGV
            </a>{" "}
            et reconnais que l&apos;accès Premium débute immédiatement (renonciation au délai de rétractation).
          </p>

          <AccessCodeForm />
        </div>
      </div>
    </div>
  );
}
