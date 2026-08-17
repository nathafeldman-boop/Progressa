import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(1).max(120),
  targetDate: z.string().optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const goal = await prisma.personalGoal.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : undefined,
    },
  });
  return NextResponse.json({ ok: true, goal });
}

const toggleSchema = z.object({ id: z.string().min(1) });

export async function PATCH(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = toggleSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const goal = await prisma.personalGoal.findUnique({ where: { id: parsed.data.id } });
  if (!goal || goal.userId !== user.id) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const goal2 = await prisma.personalGoal.update({
    where: { id: goal.id },
    data: { status: goal.status === "DONE" ? "IN_PROGRESS" : "DONE" },
  });
  return NextResponse.json({ ok: true, goal: goal2 });
}
