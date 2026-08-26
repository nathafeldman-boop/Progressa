import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAffiliate } from "@/lib/affiliate";

const bodySchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(160),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await prisma.affiliate.findUnique({ where: { email } });
  if (existing) {
    // Ne jamais renvoyer le dashboardToken d'un tiers à qui connaît/devine
    // son email — un admin peut le retrouver depuis /admin en cas de perte.
    return NextResponse.json({ error: "already_registered" }, { status: 409 });
  }

  const affiliate = await createAffiliate({ name: parsed.data.name.trim(), email });
  return NextResponse.json({ ok: true, dashboardToken: affiliate.dashboardToken });
}
