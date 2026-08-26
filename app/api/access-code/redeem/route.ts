import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { redeemAccessCode } from "@/lib/affiliate";

const bodySchema = z.object({
  code: z.string().min(1).max(64),
});

export async function POST(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const result = await redeemAccessCode(parsed.data.code.trim(), user.id);
  if (!result.ok) return NextResponse.json({ error: "invalid_or_used_code" }, { status: 400 });

  return NextResponse.json({ ok: true, days: result.days });
}
