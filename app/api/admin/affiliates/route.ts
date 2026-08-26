import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { createAffiliate } from "@/lib/affiliate";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(160),
});

/** Création manuelle d'un compte affilié (secours si le lien d'inscription self-serve casse, ou pour l'équipe interne). */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await prisma.affiliate.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "email_already_used" }, { status: 409 });

  const affiliate = await createAffiliate({ name: parsed.data.name.trim(), email, createdByAdmin: true });

  return NextResponse.json({ ok: true, affiliate });
}
