import { NextResponse } from "next/server";
import { z } from "zod";
import { Equipment } from "@prisma/client";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  equipment: z.array(z.nativeEnum(Equipment)).min(1),
});

export async function PATCH(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const profile = await prisma.playerProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "no_profile" }, { status: 404 });

  await prisma.playerProfile.update({
    where: { userId: user.id },
    data: { equipment: parsed.data.equipment },
  });

  return NextResponse.json({ ok: true });
}
