import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { isPremiumActive } from "@/lib/subscription";
import { sendEmailOnce } from "@/lib/email/send";
import { j1ReminderEmail, j3PremiumPitchEmail } from "@/lib/email/templates";
import { runPaywallNudgeSweep } from "@/lib/email/paywall-nudge";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Relance des comptes gratuits inactifs (section 9): J+1 rappel doux,
 * J+3 argumentaire Premium. Filtre strict sur les comptes déjà premium et
 * dédoublonnage via EmailSendLog — jamais le même email deux fois.
 *
 * Fait aussi tourner ici, dans le même run quotidien plutôt qu'un cron
 * séparé, la relance des joueurs qui sont allés jusqu'au paywall sans
 * s'abonner — voir lib/email/paywall-nudge.ts.
 */
export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const now = Date.now();

  const candidates = await prisma.user.findMany({
    where: {
      createdAt: { lte: new Date(now - DAY_MS) },
      role: "PLAYER",
    },
    include: {
      subscription: true,
      weeklyPrograms: { include: { sessions: true } },
    },
  });

  let j1Sent = 0;
  let j3Sent = 0;

  for (const user of candidates) {
    if (isPremiumActive(user.subscription)) continue;

    const hasCompletedAnySession = user.weeklyPrograms.some((program) => program.sessions.some((s) => s.status === "COMPLETED"));
    if (hasCompletedAnySession) continue;

    const accountAgeMs = now - user.createdAt.getTime();

    if (accountAgeMs >= DAY_MS) {
      const sent = await sendEmailOnce(user.id, user.email, "j1_reminder", j1ReminderEmail(user.firstName, appUrl));
      if (sent) j1Sent++;
    }

    if (accountAgeMs >= 3 * DAY_MS) {
      const sent = await sendEmailOnce(user.id, user.email, "j3_premium_pitch", j3PremiumPitchEmail(user.firstName, appUrl));
      if (sent) j3Sent++;
    }
  }

  const paywallNudge = await runPaywallNudgeSweep(appUrl);

  return NextResponse.json({
    j1Sent,
    j3Sent,
    evaluated: candidates.length,
    paywallNudgeSent: paywallNudge.sent,
    paywallNudgeEligible: paywallNudge.eligible,
  });
}
