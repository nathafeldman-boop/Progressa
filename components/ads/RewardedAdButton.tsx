"use client";

import { useEffect, useRef, useState } from "react";
import { trackClick } from "@/lib/analytics/track";
import { getOrCreateAnonId } from "@/lib/onboarding/storage";

type Phase = "idle" | "starting" | "watching" | "completing" | "error";

const ANALYTICS_LABELS: Record<"BRIAN_MESSAGES" | "SESSION_TIMER", { started: string; completed: string }> = {
  BRIAN_MESSAGES: { started: "rewarded_ad_brian_started", completed: "rewarded_ad_brian_completed" },
  SESSION_TIMER: { started: "rewarded_ad_timer_started", completed: "rewarded_ad_timer_completed" },
};

/**
 * Bouton "Regarder une pub → récompense", utilisé pour Coach Brian
 * (+5 messages) et le cooldown des séances ciblées (-5h). La récompense
 * annoncée (`rewardLabel`) est toujours visible AVANT le clic — jamais de
 * surprise après coup.
 *
 * Le compte à rebours affiché ici est cosmétique: la vraie garantie que la
 * "pub" a bien duré son temps minimum est recalculée côté serveur dans
 * /api/ads/complete (lib/ads/mock-provider.ts) à partir de l'horodatage du
 * jeton signé, jamais depuis ce timer client.
 */
export function RewardedAdButton({
  kind,
  rewardLabel,
  onGranted,
}: {
  kind: "BRIAN_MESSAGES" | "SESSION_TIMER";
  rewardLabel: string;
  onGranted: (data: Record<string, unknown>) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const watchTokenRef = useRef<string | null>(null);

  async function complete() {
    setPhase("completing");
    try {
      const res = await fetch("/api/ads/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, watchToken: watchTokenRef.current }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage("La validation a échoué, réessaie.");
        setPhase("error");
        return;
      }
      trackClick(getOrCreateAnonId(), ANALYTICS_LABELS[kind].completed);
      onGranted(data);
      setPhase("idle");
    } catch {
      setErrorMessage("La validation a échoué, réessaie.");
      setPhase("error");
    }
  }

  // Un seul minuteur: à chaque tick il décrémente, ou déclenche la
  // validation une fois à zéro — toujours via un callback de setTimeout
  // (jamais un setState synchrone dans le corps de l'effet) pour rester
  // conforme à react-hooks/set-state-in-effect.
  useEffect(() => {
    if (phase !== "watching") return;
    if (secondsLeft <= 0) {
      const timer = window.setTimeout(() => void complete(), 0);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- complete() est stable pour ce composant, pas besoin de la lister
  }, [phase, secondsLeft]);

  async function start() {
    setPhase("starting");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/ads/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage("Publicité indisponible pour le moment, réessaie dans un instant.");
        setPhase("error");
        return;
      }
      watchTokenRef.current = data.watchToken;
      setSecondsLeft(data.minWatchSeconds);
      setTotalSeconds(data.minWatchSeconds);
      setPhase("watching");
      trackClick(getOrCreateAnonId(), ANALYTICS_LABELS[kind].started);
    } catch {
      setErrorMessage("Publicité indisponible pour le moment, réessaie dans un instant.");
      setPhase("error");
    }
  }

  if (phase === "watching" || phase === "completing") {
    return (
      <div className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          {phase === "completing" ? "Validation..." : "Publicité en cours..."}
        </p>
        {phase === "watching" && (
          <>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              <div
                className="h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-1000 ease-linear"
                style={{ width: `${totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-1.5 text-lg font-extrabold tabular-nums text-[var(--color-text)]">{secondsLeft}s</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={start}
        disabled={phase === "starting"}
        className="w-full rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-3 text-sm font-bold uppercase tracking-wide text-[var(--color-on-primary)] transition-transform active:scale-[.97] disabled:opacity-60"
      >
        {phase === "starting" ? "Chargement..." : `Regarder une pub → ${rewardLabel}`}
      </button>
      {errorMessage && <p className="mt-1.5 text-center text-xs text-[var(--color-danger)]">{errorMessage}</p>}
    </div>
  );
}
