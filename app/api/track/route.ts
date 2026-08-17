import { NextResponse } from "next/server";
import { logClick, logOnboardingFunnelEvent, logPageView, recordMicroSurveyResponse } from "@/lib/analytics/server";

// Endpoint d'ingestion analytics first-party. Toujours répondre 204 même en
// cas d'erreur interne: le tracking ne doit jamais faire échouer le client
// (sendBeacon n'a de toute façon pas de gestion de réponse côté appelant).
export async function POST(request: Request) {
  try {
    const body = await request.json();

    switch (body.type) {
      case "page_view":
        await logPageView(body.anonId, body.path, body.userId, body.referrer);
        break;
      case "click":
        await logClick(body.anonId, body.label, body.userId, body.path);
        break;
      case "onboarding_funnel":
        await logOnboardingFunnelEvent(body.anonId, body.screen, body.screenKey, body.action);
        break;
      case "micro_survey":
        if (body.userId) {
          await recordMicroSurveyResponse(body.userId, body.surveyKey, body.question, body.answer ?? null, !!body.skipped);
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
