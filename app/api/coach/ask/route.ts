import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { answerQuickQuestion, QUICK_QUESTIONS } from "@/lib/brian/coach-qa";

const bodySchema = z.object({
  questionKey: z.enum(QUICK_QUESTIONS.map((q) => q.key) as [string, ...string[]]),
});

export async function POST(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const text = await answerQuickQuestion(user.id, parsed.data.questionKey);

  const message = await prisma.brianMessage.create({
    data: { userId: user.id, category: "RETENTION", text },
  });

  return NextResponse.json({ id: message.id, text, createdAt: message.createdAt });
}
