import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  bodyPart: z.string().min(1).max(60),
  intensity: z.number().int().min(1).max(5),
  note: z.string().max(300).optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const painLog = await prisma.painLog.create({ data: { userId: user.id, ...parsed.data } });
  return NextResponse.json({ ok: true, painLog });
}

const resolveSchema = z.object({ id: z.string().min(1) });

export async function PATCH(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = resolveSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const painLog = await prisma.painLog.findUnique({ where: { id: parsed.data.id } });
  if (!painLog || painLog.userId !== user.id) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await prisma.painLog.update({ where: { id: painLog.id }, data: { status: "RESOLVED", resolvedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
