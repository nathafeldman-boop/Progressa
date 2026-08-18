import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { buildTargetedSession, TRAINING_THEMES } from "@/lib/programs/build-targeted-session";

const bodySchema = z.object({
  theme: z.enum(TRAINING_THEMES),
});

export async function POST(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const session = await buildTargetedSession(user.id, parsed.data.theme);
  if (!session) return NextResponse.json({ error: "no_matching_exercises" }, { status: 422 });

  return NextResponse.json({ sessionId: session.id });
}
