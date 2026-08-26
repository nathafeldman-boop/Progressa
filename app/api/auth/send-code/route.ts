import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResendClient, EMAIL_FROM } from "@/lib/email/resend";
import { otpCodeEmail } from "@/lib/email/templates";

const bodySchema = z.object({
  email: z.string().email().max(160),
  redirectTo: z.string().max(2000).nullable().optional(),
});

/**
 * Envoie le code de connexion nous-mêmes via Resend au lieu de laisser
 * Supabase déclencher son propre mailer (anglais, template par défaut hors
 * de notre contrôle). supabase.auth.admin.generateLink() ne fait qu'émettre
 * le code/lien sans jamais envoyer d'email lui-même — exactement fait pour
 * ce cas ("to be sent via a custom email provider").
 * verifyOtp() côté client (EmailAuthForm) fonctionne ensuite normalement,
 * ce code est un vrai code Supabase.
 */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const email = parsed.data.email.trim().toLowerCase();

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: parsed.data.redirectTo ? { redirectTo: parsed.data.redirectTo } : undefined,
    });

    if (error || !data?.properties?.email_otp) {
      console.error("[auth/send-code] generateLink failed", error);
      return NextResponse.json({ error: "send_failed" }, { status: 500 });
    }

    const { subject, html } = otpCodeEmail(data.properties.email_otp, data.properties.action_link);
    // L'API Resend ne lève jamais d'exception sur un échec (domaine non
    // vérifié, clé invalide...): elle renvoie { error } — sans cette
    // vérification explicite, un envoi refusé passait pour un succès (200
    // renvoyé au client alors qu'aucun email n'était réellement parti).
    const { error: resendError } = await getResendClient().emails.send({ from: EMAIL_FROM, to: email, subject, html });
    if (resendError) {
      console.error("[auth/send-code] Resend send failed", resendError);
      return NextResponse.json({ error: "send_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth/send-code] failed", err);
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }
}
