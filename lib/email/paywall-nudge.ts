import { prisma } from "@/lib/prisma";
import { isPremiumActive } from "@/lib/subscription";
import { getResendClient, EMAIL_FROM } from "@/lib/email/resend";
import { paywallNudgeEmail } from "@/lib/email/templates";

const DAY_MS = 24 * 60 * 60 * 1000;
const NUDGE_COOLDOWN_MS = 4 * DAY_MS;
const DAILY_MIN = 20;
const DAILY_MAX = 70;

/**
 * Relance des joueurs qui sont allés jusqu'au paywall (`paywall_viewed`,
 * voir HardPaywall.tsx) sans s'abonner — signal d'intention plus fort que
 * la relance J1/J3 générique (âge du compte), qui ne sait pas si le joueur
 * a même vu le paywall.
 *
 * Répétée tous les NUDGE_COOLDOWN_MS par joueur tant qu'il n'est pas
 * devenu premium. Contrairement à EmailSendLog (contrainte unique
 * [userId, emailKey] — un seul envoi par clé, à vie), PaywallNudgeEmail
 * garde une seule ligne par joueur mise à jour à chaque envoi ; `sentAt`
 * sert de cooldown.
 *
 * Le volume envoyé par run est plafonné et tiré au sort entre DAILY_MIN et
 * DAILY_MAX plutôt que d'envoyer tout le lot éligible d'un coup — étale
 * l'envoi sur plusieurs jours (déliverabilité: pas de pic suspect pour
 * Resend ou les boîtes mail des joueurs). Le surplus du jour n'est pas
 * perdu, il attend simplement le run suivant — son cooldown de 4 jours
 * reste acquis dès qu'il a été atteint.
 */
export async function runPaywallNudgeSweep(appUrl: string): Promise<{ sent: number; eligible: number }> {
  const now = Date.now();

  const viewers = await prisma.clickEvent.findMany({
    where: { label: "paywall_viewed", userId: { not: null } },
    select: { userId: true },
    distinct: ["userId"],
  });
  const viewerIds = viewers.map((v) => v.userId).filter((id): id is string => id !== null);
  if (viewerIds.length === 0) return { sent: 0, eligible: 0 };

  const users = await prisma.user.findMany({
    where: { id: { in: viewerIds } },
    include: { subscription: true, paywallNudgeEmail: true },
  });

  const eligible = users.filter((user) => {
    if (isPremiumActive(user.subscription)) return false;
    const lastSentMs = user.paywallNudgeEmail?.sentAt.getTime();
    if (lastSentMs != null && now - lastSentMs < NUDGE_COOLDOWN_MS) return false;
    return true;
  });
  if (eligible.length === 0) return { sent: 0, eligible: 0 };

  const dailyTarget = DAILY_MIN + Math.floor(Math.random() * (DAILY_MAX - DAILY_MIN + 1));
  const batch = shuffle(eligible).slice(0, dailyTarget);

  let sent = 0;
  for (const user of batch) {
    try {
      const { subject, html } = paywallNudgeEmail(user.firstName, appUrl);
      await getResendClient().emails.send({ from: EMAIL_FROM, to: user.email, subject, html });
      await prisma.paywallNudgeEmail.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: { sentAt: new Date(), sendCount: { increment: 1 } },
      });
      sent++;
    } catch (err) {
      // Best-effort, comme sendEmailOnce: un échec Resend isolé ne doit
      // jamais interrompre la boucle pour les joueurs suivants.
      console.error("[email] paywallNudgeEmail failed", err);
    }
  }

  return { sent, eligible: eligible.length };
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
