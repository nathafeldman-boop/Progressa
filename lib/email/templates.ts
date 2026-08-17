import { APP_NAME } from "@/lib/app-config";

function wrapper(bodyHtml: string): string {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #10231a;">
      <h1 style="font-size: 20px; text-transform: uppercase; letter-spacing: 0.02em;">${APP_NAME}</h1>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #5c6b63;">
        Tu reçois cet email car tu as un compte sur ${APP_NAME}.
      </p>
    </div>
  `;
}

export function welcomeEmail(firstName: string, appUrl: string) {
  return {
    subject: `${firstName}, ton premier programme t'attend 💪`,
    html: wrapper(`
      <p>Salut ${firstName},</p>
      <p>Ton profil est prêt et ton premier programme personnalisé aussi.</p>
      <p><a href="${appUrl}/dashboard" style="display:inline-block;background:#1c8a4b;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Voir ma première séance</a></p>
    `),
  };
}

export function j1ReminderEmail(firstName: string, appUrl: string) {
  return {
    subject: "Ta séance de la semaine t'attend",
    html: wrapper(`
      <p>Salut ${firstName},</p>
      <p>Tu n'as pas encore fait ta séance cette semaine. 10 minutes suffisent pour commencer.</p>
      <p><a href="${appUrl}/dashboard" style="display:inline-block;background:#1c8a4b;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Reprendre</a></p>
    `),
  };
}

export function j3PremiumPitchEmail(firstName: string, appUrl: string) {
  return {
    subject: "Un préparateur physique, mais accessible",
    html: wrapper(`
      <p>Salut ${firstName},</p>
      <p>Un préparateur physique individuel coûte 30-50€ la séance. Avec Premium, tu as un programme 100% personnalisé,
      jusqu'à 3 séances par semaine, et un suivi complet — pour beaucoup moins.</p>
      <p><a href="${appUrl}/parametres/abonnement" style="display:inline-block;background:#1c8a4b;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Découvrir Premium</a></p>
    `),
  };
}
