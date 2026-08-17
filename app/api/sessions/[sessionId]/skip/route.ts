import { NextResponse } from "next/server";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { sessionId } = await params;
  const session = await prisma.programSession.findUnique({ where: { id: sessionId }, include: { weeklyProgram: true } });
  if (!session || session.weeklyProgram.userId !== user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await prisma.programSession.update({ where: { id: sessionId }, data: { status: "SKIPPED" } });
  return NextResponse.json({ ok: true });
}
