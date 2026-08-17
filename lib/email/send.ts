import { prisma } from "@/lib/prisma";
import { getResendClient, EMAIL_FROM } from "@/lib/email/resend";

/**
 * Envoi d'email idempotent (jamais deux fois le même email, section 9) et
 * toujours best-effort: ne doit jamais faire échouer l'appelant.
 */
export async function sendEmailOnce(
  userId: string,
  email: string,
  emailKey: string,
  content: { subject: string; html: string }
): Promise<boolean> {
  try {
    const existing = await prisma.emailSendLog.findUnique({ where: { userId_emailKey: { userId, emailKey } } });
    if (existing) return false;

    await getResendClient().emails.send({ from: EMAIL_FROM, to: email, subject: content.subject, html: content.html });
    await prisma.emailSendLog.create({ data: { userId, emailKey } });
    return true;
  } catch (err) {
    console.error(`[email] sendEmailOnce(${emailKey}) failed`, err);
    return false;
  }
}
