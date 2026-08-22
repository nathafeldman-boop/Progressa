import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import {
  TRAINING_THEMES,
  TARGETED_SESSION_VARIANT_COUNT,
  buildTargetedSession,
  type TrainingTheme,
} from "@/lib/programs/build-targeted-session";

const bodySchema = z.object({
  variantIndex: z.number().int().min(0).max(TARGETED_SESSION_VARIANT_COUNT - 1),
});

export async function POST(request: Request, { params }: { params: Promise<{ theme: string }> }) {
  const { theme } = await params;
  if (!TRAINING_THEMES.includes(theme as TrainingTheme)) {
    return NextResponse.json({ error: "unknown_theme" }, { status: 404 });
  }

  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const session = await buildTargetedSession(user.id, theme as TrainingTheme, parsed.data.variantIndex);
  if (!session) return NextResponse.json({ error: "unavailable" }, { status: 409 });

  return NextResponse.json({ sessionId: session.id });
}
