import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";

// Data URL compressée côté client (canvas, ~256px, JPEG) — large marge sous
// la limite Postgres TEXT pour ne jamais dépendre d'un bucket de stockage.
const MAX_DATA_URL_LENGTH = 500_000;

const bodySchema = z.object({
  photoDataUrl: z.string().min(1).max(MAX_DATA_URL_LENGTH).regex(/^data:image\/(jpeg|png|webp);base64,/),
});

export async function POST(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "invalid_photo" }, { status: 422 });

  await prisma.user.update({
    where: { id: user.id },
    data: { photoUrl: parsed.data.photoDataUrl },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await prisma.user.update({ where: { id: user.id }, data: { photoUrl: null } });
  return NextResponse.json({ ok: true });
}
