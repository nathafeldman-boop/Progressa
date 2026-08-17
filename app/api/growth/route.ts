import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  heightCm: z.number().int().positive().nullable().optional(),
  weightKg: z.number().int().positive().nullable().optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  if (!parsed.data.heightCm && !parsed.data.weightKg) {
    return NextResponse.json({ error: "empty_entry" }, { status: 400 });
  }

  const entry = await prisma.growthEntry.create({
    data: { userId: user.id, date: new Date(), heightCm: parsed.data.heightCm, weightKg: parsed.data.weightKg },
  });
  return NextResponse.json({ ok: true, entry });
}
