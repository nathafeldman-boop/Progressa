import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  return NextResponse.json({ id: saved.id, text, createdAt: saved.createdAt });
}
