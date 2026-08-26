import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  grantsDays: z.number().int().min(1).max(365).default(30),
  affiliateId: z.string().min(1).nullable().optional(),
});

function generateCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

/** Code d'accès manuel — fallback admin si un lien d'inscription affilié casse, ou promo ponctuelle. */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const accessCode = await prisma.accessCode.create({
    data: {
      code: generateCode(),
      grantsDays: parsed.data.grantsDays,
      affiliateId: parsed.data.affiliateId || null,
      createdByAdmin: true,
    },
  });

  return NextResponse.json({ ok: true, accessCode });
}
