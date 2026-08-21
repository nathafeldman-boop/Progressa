import { NextResponse } from "next/server";
import { getCurrentInternalUser } from "@/lib/auth";
import { logClick, logOnboardingFunnelEvent, logPageView, recordMicroSurveyResponse } from "@/lib/analytics/server";

// Endpoint d'ingestion analytics first-party. Toujours répondre 204 même en
// cas d'erreur interne: le tracking ne doit jamais faire échouer le client
// (sendBeacon n'a de toute façon pas de gestion de réponse côté appelant).
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Le userId ne vient jamais du client (un visiteur pourrait attribuer
    // ses events, voire des réponses de micro-sondage, à n'importe quel
    // autre compte) — seule la session serveur authentifiée fait foi.
    // undefined pour un visiteur anonyme, ce qui est la valeur légitime.
    const user = await getCurrentInternalUser();
    const userId = user?.id;

    switch (body.type) {
      case "page_view":
        await logPageView(body.anonId, body.path, userId, body.referrer);
        break;
      case "click":
        await logClick(body.anonId, body.label, userId, body.path);
        break;
      case "onboarding_funnel":
        await logOnboardingFunnelEvent(body.anonId, body.screen, body.screenKey, body.action);
        break;
      case "micro_survey":
        if (userId) {
          await recordMicroSurveyResponse(userId, body.surveyKey, body.question, body.answer ?? null, !!body.skipped);
        }
        break;
      default:
        break;
    }
  } catch (err) {
    console.error("[api/track] failed", err);
  }

  return new NextResponse(null, { status: 204 });
}
