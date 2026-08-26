import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAffiliateClick } from "@/lib/affiliate";

const bodySchema = z.object({
  code: z.string().min(1).max(64),
  anonId: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const valid = await recordAffiliateClick(parsed.data.code, parsed.data.anonId);
  return NextResponse.json({ ok: valid });
}
