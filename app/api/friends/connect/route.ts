import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { connectFriendsByCode } from "@/lib/friends";

const bodySchema = z.object({
  code: z.string().min(1).max(32),
});

export async function POST(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const result = await connectFriendsByCode(user.id, parsed.data.code.trim().toUpperCase());

  if (result.status === "invalid_code") return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  if (result.status === "self") return NextResponse.json({ error: "self" }, { status: 400 });

  return NextResponse.json({ status: result.status, friendName: result.friendName });
}
