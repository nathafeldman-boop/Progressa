import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasSkippedPaywall, isPremiumActive } from "@/lib/subscription";
import { getBrianMessageQuota } from "@/lib/brian/message-quota";
import { answerFreeQuestion, type CoachChatTurn } from "@/lib/brian/coach-chat";

const bodySchema = z.object({
  message: z.string().trim().min(1).max(500),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(500) }))
    .max(20)
    .optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  // Coach Brian n'est accessible (gratuit et limité, ou premium et
  // illimité) qu'à un joueur premium ou passé par "Payer ultérieurement"
  // — jamais à un compte qui n'a même pas encore vu le paywall. Vérifié
  // ici côté serveur, pas seulement par la redirection de la page.
  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  const premium = isPremiumActive(subscription);
  if (!premium && !hasSkippedPaywall(subscription)) {
    return NextResponse.json({ error: "payment_required" }, { status: 402 });
  }

  const quota = await getBrianMessageQuota(user.id, premium);
  if (quota.remaining <= 0) {
    return NextResponse.json({ error: "brian_quota_reached", brianQuota: quota }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const history: CoachChatTurn[] = parsed.data.history ?? [];

  await prisma.brianMessage.create({
    data: { userId: user.id, category: "RETENTION", text: parsed.data.message, fromPlayer: true },
  });

  const text = await answerFreeQuestion(user.id, user.firstName, parsed.data.message, history);

  const saved = await prisma.brianMessage.create({
    data: { userId: user.id, category: "RETENTION", text },
  });

  const updatedQuota = premium ? null : await getBrianMessageQuota(user.id, false);
  return NextResponse.json({ id: saved.id, text, createdAt: saved.createdAt, brianQuota: updatedQuota });
}
