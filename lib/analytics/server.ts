import { prisma } from "@/lib/prisma";

/**
 * Couche first-party — ne dépend d'aucun outil tiers. Toutes les fonctions
 * sont "best-effort": une erreur d'écriture analytics ne doit jamais faire
 * échouer la requête qui l'a déclenchée.
 */

export async function logPageView(anonId: string, path: string, userId?: string, referrer?: string) {
  try {
    await prisma.pageView.create({ data: { anonId, path, userId, referrer } });
  } catch (err) {
    console.error("[analytics] logPageView failed", err);
  }
}

export async function logClick(anonId: string, label: string, userId?: string, path?: string) {
  try {
    await prisma.clickEvent.create({ data: { anonId, label, userId, path } });
  } catch (err) {
    console.error("[analytics] logClick failed", err);
  }
}

export async function logOnboardingFunnelEvent(
  anonId: string,
  screen: number,
  screenKey: string,
  action: "VIEWED" | "COMPLETED" | "SKIPPED" | "ABANDONED"
) {
  try {
    await prisma.onboardingFunnelEvent.create({ data: { anonId, screen, screenKey, action } });
  } catch (err) {
    console.error("[analytics] logOnboardingFunnelEvent failed", err);
  }
}

/**
 * Micro-sondage: "passer" compte comme répondu (skipped=true) pour ne
 * jamais reposer la même question, et une réponse déjà donnée n'est
 * jamais écrasée.
 */
export async function recordMicroSurveyResponse(
  userId: string,
  surveyKey: string,
  question: string,
  answer: string | null,
  skipped: boolean
) {
  try {
    const existing = await prisma.microSurveyResponse.findUnique({
      where: { userId_surveyKey: { userId, surveyKey } },
    });
    if (existing) return existing;
    return await prisma.microSurveyResponse.create({
      data: { userId, surveyKey, question, answer, skipped },
    });
  } catch (err) {
    console.error("[analytics] recordMicroSurveyResponse failed", err);
    return null;
  }
}
