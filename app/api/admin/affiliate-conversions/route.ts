import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  id: z.string().min(1),
});

/** Marque une commission comme réellement versée (virement fait à la main) — jamais automatique. */
export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  await prisma.affiliateConversion.update({ where: { id: parsed.data.id }, data: { paidAt: new Date() } });

  return NextResponse.json({ ok: true });
}
