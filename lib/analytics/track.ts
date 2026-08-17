"use client";

/**
 * Toutes les fonctions ici sont "best-effort": elles ne doivent jamais
 * bloquer ni faire planter le flux principal si l'envoi échoue (offline,
 * ad-blocker, etc.) — cf. section 9 du produit sur les notifications.
 */
function post(body: Record<string, unknown>) {
  try {
    const payload = JSON.stringify(body);
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      const ok = navigator.sendBeacon("/api/track", blob);
      if (ok) return;
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // best-effort: on ignore silencieusement
  }
}

export function trackPageView(anonId: string, path: string) {
  post({ type: "page_view", anonId, path, referrer: typeof document !== "undefined" ? document.referrer : undefined });
}

export function trackClick(anonId: string, label: string, path?: string) {
  post({ type: "click", anonId, label, path });
}

export function trackOnboardingFunnel(
  anonId: string,
  screen: number,
  screenKey: string,
  action: "VIEWED" | "COMPLETED" | "SKIPPED"
) {
  post({ type: "onboarding_funnel", anonId, screen, screenKey, action });
}

export function trackMicroSurveyAnswer(surveyKey: string, question: string, answer: string | null, skipped: boolean) {
  post({ type: "micro_survey", surveyKey, question, answer, skipped });
}
