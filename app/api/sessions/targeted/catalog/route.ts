import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { getTargetedCatalog } from "@/lib/programs/get-targeted-catalog";
import { TRAINING_THEMES } from "@/lib/programs/build-targeted-session";

const querySchema = z.object({ theme: z.enum(TRAINING_THEMES) });

export async function GET(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ theme: searchParams.get("theme") });
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const entries = await getTargetedCatalog(user.id, parsed.data.theme);
  if (entries === null) return NextResponse.json({ error: "no_profile" }, { status: 422 });

  return NextResponse.json({ entries });
}
