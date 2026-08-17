import { NextResponse } from "next/server";
import { z } from "zod";
import { FeltDifficulty } from "@prisma/client";
import { getCurrentInternalUser } from "@/lib/auth";
import { recordBlockTelemetry } from "@/lib/brian/service";

const bodySchema = z.object({
  status: z.enum(["COMPLETED", "SKIPPED", "ABANDONED"]),
  feltDifficulty: z.enum(FeltDifficulty).nullable().optional(),
  actualDurationSeconds: z.number().int().min(0).max(3600).nullable().optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ sessionId: string; blockId: string }> }) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { blockId } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const result = await recordBlockTelemetry({
    userId: user.id,
    blockId,
    status: parsed.data.status,
    feltDifficulty: parsed.data.feltDifficulty ?? null,
    actualDurationSeconds: parsed.data.actualDurationSeconds ?? null,
  });

  if (!result) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json(result);
}
