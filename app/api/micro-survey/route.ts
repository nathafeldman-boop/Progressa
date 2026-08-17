import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { recordMicroSurveyResponse } from "@/lib/analytics/server";

const bodySchema = z.object({
  surveyKey: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().nullable().optional(),
  skipped: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  await recordMicroSurveyResponse(user.id, parsed.data.surveyKey, parsed.data.question, parsed.data.answer ?? null, parsed.data.skipped);
  return NextResponse.json({ ok: true });
}
