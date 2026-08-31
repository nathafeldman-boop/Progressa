import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasSkippedPaywall, isPremiumActive } from "@/lib/subscription";
import { getBrianMessageQuota } from "@/lib/brian/message-quota";
import { answerQuickQuestion, QUICK_QUESTIONS } from "@/lib/brian/coach-qa";

const bodySchema = z.object({
  questionKey: z.enum(QUICK_QUESTIONS.map((q) => q.key) as [string, ...string[]]),
});

export async function POST(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

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

  const question = QUICK_QUESTIONS.find((q) => q.key === parsed.data.questionKey);
  if (question) {
    await prisma.brianMessage.create({
      data: { userId: user.id, category: "RETENTION", text: question.label, fromPlayer: true },
    });
  }

  const text = await answerQuickQuestion(user.id, parsed.data.questionKey);

  const message = await prisma.brianMessage.create({
    data: { userId: user.id, category: "RETENTION", text },
  });

  const updatedQuota = premium ? null : await getBrianMessageQuota(user.id, false);
  return NextResponse.json({ id: message.id, text, createdAt: message.createdAt, brianQuota: updatedQuota });
}
