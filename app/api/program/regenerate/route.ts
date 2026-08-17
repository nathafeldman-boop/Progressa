import { NextResponse } from "next/server";
import { getCurrentInternalUser } from "@/lib/auth";
import { regenerateWeeklyProgram } from "@/lib/programs/regenerate-weekly-program";

export async function POST() {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const result = await regenerateWeeklyProgram(user.id);

  if (!result.ok && result.reason === "cooldown") {
    return NextResponse.json({ error: "cooldown", retryAfterMs: result.retryAfterMs }, { status: 429 });
  }
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
