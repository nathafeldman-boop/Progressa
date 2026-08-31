import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { startRewardedAd } from "@/lib/ads/reward";

const bodySchema = z.object({ kind: z.enum(["BRIAN_MESSAGES", "SESSION_TIMER"]) });

/** Démarre le visionnage d'une pub récompensée — voir lib/ads/reward.ts pour les garanties serveur. */
export async function POST(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const result = startRewardedAd(user.id, parsed.data.kind);
  if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 429 });

  return NextResponse.json({ watchToken: result.watchToken, minWatchSeconds: result.minWatchSeconds, expiresAt: result.expiresAt });
}
