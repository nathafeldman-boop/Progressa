"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { Button } from "@/components/ui/Button";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { PlayerCardView } from "@/components/card/PlayerCardView";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import type { PlayerCardStats } from "@/lib/player-card";
import {
  composeCardRevealFocus,
  composeCardRevealOpening,
  composeCardRevealStrength,
  composeCardRevealTransition,
} from "@/lib/brian/messages";
import { trackClick } from "@/lib/analytics/track";
import { getOrCreateAnonId } from "@/lib/onboarding/storage";

const ANALYSIS_STEPS = ["Analyse de tes résultats...", "Évaluation de ta performance...", "Calcul des statistiques..."];

export function CardRevealSequence({
  firstName,
  positionLabel,
  ageCategoryLabel,
  country,
  department,
  niveauLabel,
  photoUrl,
  stats,
  strongestLabel,
  strongestValue,
  weakestLabel,
}: {
  firstName: string;
  positionLabel: string;
  ageCategoryLabel: string | null;
  country: string | null;
  department: string | null;
  niveauLabel: string | null;
  photoUrl: string | null;
  stats: PlayerCardStats;
  strongestLabel: string;
  strongestValue: number;
  weakestLabel: string;
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<"analysing" | "feedback" | "revealed">("analysing");
  const [messageCount, setMessageCount] = useState(0);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);

  useEffect(() => {
    if (phase !== "analysing") return;
    if (stepIndex >= ANALYSIS_STEPS.length) {
      // On demande l'avis du joueur ici, à froid, juste avant la révélation
      // — c'est le pic d'anticipation du funnel (section "avis avant la
      // carte"), le meilleur moment pour capter un avis honnête plutôt que
      // d'attendre qu'il pense à aller sur /avis de lui-même.
      const timer = window.setTimeout(() => setPhase("feedback"), 500);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setStepIndex((i) => i + 1), 1100);
    return () => window.clearTimeout(timer);
  }, [phase, stepIndex]);

  async function submitFeedback() {
    if (feedbackText.trim().length < 10) return;
    setSubmittingFeedback(true);
    setFeedbackError(false);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, text: feedbackText }),
      });
      if (!res.ok) {
        setFeedbackError(true);
        return;
      }
      trackClick(getOrCreateAnonId(), "prereveal_feedback_submitted", "/onboarding/carte");
      setPhase("revealed");
    } catch {
      setFeedbackError(true);
    } finally {
      setSubmittingFeedback(false);
    }
  }

  function skipFeedback() {
    trackClick(getOrCreateAnonId(), "prereveal_feedback_skipped", "/onboarding/carte");
    setPhase("revealed");
  }

  useEffect(() => {
    if (phase !== "revealed") return;
    trackClick(getOrCreateAnonId(), "card_revealed", "/onboarding/carte");
    if (messageCount >= 3) return;
    const timer = window.setTimeout(() => setMessageCount((c) => c + 1), messageCount === 0 ? 900 : 1400);
    return () => window.clearTimeout(timer);
  }, [phase, messageCount]);

  const messages = [
    composeCardRevealOpening(firstName),
    composeCardRevealStrength(strongestLabel, strongestValue),
    composeCardRevealFocus(weakestLabel),
  ];

  if (phase === "analysing") {
    return (
      <div className="relative min-h-screen">
        <OnboardingBackground />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
          <BrianAvatar state="thinking" size={96} />
          <div>
            <p className="font-display text-xl font-extrabold uppercase tracking-wide">Profil en cours</p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)] transition-opacity duration-300">
              {stepIndex < ANALYSIS_STEPS.length ? ANALYSIS_STEPS[stepIndex] : "Profil terminé."}
            </p>
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            {ANALYSIS_STEPS.map((_, i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
                style={{ background: i <= stepIndex ? "var(--color-primary)" : "var(--color-border)" }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "feedback") {
    return (
      <div className="relative min-h-screen">
        <OnboardingBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-xs space-y-3.5 p-6 text-center">
            <BrianAvatar state="talking" size={72} className="mx-auto" />
            <div>
              <CardTitle>Avant de découvrir ta carte...</CardTitle>
              <CardSubtitle className="mt-1.5">
                {firstName}, donne-moi ton avis sur l&apos;app jusqu&apos;ici — même en une phrase, ça compte.
              </CardSubtitle>
            </div>

            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} className="text-2xl" aria-label={`${n} étoiles`}>
                  {n <= rating ? "⭐" : "☆"}
                </button>
              ))}
            </div>

            <textarea
              className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-left text-sm text-[var(--color-text)]"
              placeholder="Ce que tu en penses..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              maxLength={600}
              rows={3}
            />

            {feedbackError && <p className="text-xs text-[var(--color-danger)]">Envoi impossible, réessaie.</p>}

            <Button className="w-full" onClick={submitFeedback} disabled={submittingFeedback || feedbackText.trim().length < 10}>
              {submittingFeedback ? "Envoi..." : "Envoyer et voir ma carte"}
            </Button>
            <button type="button" onClick={skipFeedback} className="text-xs text-[var(--color-text-muted)] underline">
              Plus tard
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <OnboardingBackground />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-5 p-4">
        <div className="w-full animate-[cardReveal_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
          <PlayerCardView
            firstName={firstName}
            positionLabel={positionLabel}
            ageCategoryLabel={ageCategoryLabel}
            country={country}
            department={department}
            niveauLabel={niveauLabel}
            photoUrl={photoUrl}
            stats={stats}
            animateFromOverall={0}
          />
        </div>

        <div className="w-full space-y-2">
          {messages.slice(0, messageCount).map((text, i) => (
            <div
              key={i}
              className="flex animate-[fadeInUp_0.4s_ease-out_both] items-start gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)]"
            >
              <BrianAvatar state={i === 1 && strongestValue >= 40 ? "celebrating" : "talking"} size={32} className="shrink-0" />
              <p className="text-sm text-[var(--color-text)]">{text}</p>
            </div>
          ))}
        </div>

        {messageCount >= 3 && (
          <div className="w-full animate-[fadeInUp_0.4s_ease-out_both] space-y-3">
            <p className="text-center text-sm text-[var(--color-text-muted)]">{composeCardRevealTransition(firstName)}</p>
            <Button
              className="w-full"
              onClick={() => {
                trackClick(getOrCreateAnonId(), "card_reveal_continue", "/onboarding/carte");
                router.push("/paywall");
              }}
            >
              Continuer
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes cardReveal {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
