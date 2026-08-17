import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  date: z.string().min(1),
  opponent: z.string().max(80).optional(),
  competition: z.string().max(80).optional(),
  minutesPlayed: z.number().int().min(0).max(150).optional(),
  goals: z.number().int().min(0).optional(),
  assists: z.number().int().min(0).optional(),
  feeling: z.number().int().min(1).max(10).optional(),
  note: z.string().max(500).optional(),
  focusNextTime: z.string().max(300).optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const matchLog = await prisma.matchLog.create({
    data: { userId: user.id, ...parsed.data, date: new Date(parsed.data.date) },
  });
  return NextResponse.json({ ok: true, matchLog });
}
