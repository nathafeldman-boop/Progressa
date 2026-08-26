import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAffiliate } from "@/lib/affiliate";
import { getResendClient, EMAIL_FROM } from "@/lib/email/resend";
import { affiliateWelcomeEmail } from "@/lib/email/templates";

const bodySchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(160),
});

function sendWelcomeEmail(affiliate: { name: string; email: string; code: string; dashboardToken: string }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const dashboardUrl = `${appUrl}/affiliation/dashboard/${affiliate.dashboardToken}`;
  const { subject, html } = affiliateWelcomeEmail(affiliate.name, dashboardUrl, affiliate.code);
  // Best-effort: en cas d'échec, l'affilié voit quand même son lien via la
  // redirection immédiate vers son dashboard (nouvelle inscription seulement).
  getResendClient()
    .emails.send({ from: EMAIL_FROM, to: affiliate.email, subject, html })
    .catch((err) => console.error("[affiliate/signup] welcome email failed", err));
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await prisma.affiliate.findUnique({ where: { email } });
  if (existing) {
    // On ne renvoie jamais le dashboardToken directement dans la réponse
    // (un tiers pourrait deviner l'email d'un autre), mais on peut sans
    // risque le renvoyer PAR EMAIL à cette adresse — seul le vrai
    // propriétaire de la boîte mail peut le lire. Ça permet à un affilié
    // qui a perdu son lien de le récupérer lui-même, sans passer par l'admin.
    sendWelcomeEmail(existing);
    return NextResponse.json({ error: "already_registered" }, { status: 409 });
  }

  const affiliate = await createAffiliate({ name: parsed.data.name.trim(), email });
  sendWelcomeEmail(affiliate);

  return NextResponse.json({ ok: true, dashboardToken: affiliate.dashboardToken });
}
