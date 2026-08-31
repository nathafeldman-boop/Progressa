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

/**
 * Code de connexion — envoyé nous-mêmes via Resend (au lieu du mailer
 * intégré de Supabase) pour garder un email français et cohérent avec ce
 * que dit l'app, sans dépendre du template par défaut de Supabase (anglais,
 * "Your sign-in link"). Le code lui-même (`{{ .Token }}` côté Supabase) est
 * généré par supabase.auth.admin.generateLink() — voir
 * app/api/auth/send-code/route.ts. Sa longueur dépend du réglage OTP du
 * projet Supabase (pas forcément 6), d'où l'absence de nombre en dur ici.
 */
export function otpCodeEmail(code: string, actionLink?: string) {
  return {
    subject: "Ton code de connexion",
    html: wrapper(`
      <p>Entre ce code dans l'application pour te connecter :</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 24px 0; text-align: center;">${code}</p>
      <p style="font-size: 13px; color: #5c6b63;">Ce code expire rapidement et ne peut servir qu'une fois.</p>
      ${
        actionLink
          ? `<p>Tu peux aussi cliquer directement sur ce lien :</p>
      <p><a href="${actionLink}" style="display:inline-block;background:#1c8a4b;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Se connecter</a></p>`
          : ""
      }
    `),
  };
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

export function affiliateWelcomeEmail(name: string, dashboardUrl: string, code: string) {
  return {
    subject: "Ton lien et ton code d'affilié",
    html: wrapper(`
      <p>Salut ${name},</p>
      <p>Voici ton tableau de bord d'affilié — garde ce lien précieusement, c'est le seul moyen d'y accéder :</p>
      <p><a href="${dashboardUrl}" style="display:inline-block;background:#1c8a4b;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Voir mon tableau de bord</a></p>
      <p>Ton code personnel (à donner à un joueur pour lui offrir 30 jours de Premium) :</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 16px 0; text-align: center;">${code}</p>
    `),
  };
}

export function paywallNudgeEmail(firstName: string, appUrl: string) {
  return {
    subject: `${firstName}, ta carte est prête depuis un moment`,
    html: wrapper(`
      <p>Salut ${firstName},</p>
      <p>Ton évaluation est terminée et ta carte t'attend — OVR, rang et programme personnalisé, déjà calculés.
      Il ne reste qu'à débloquer pour les voir.</p>
      <p><a href="${appUrl}/paywall" style="display:inline-block;background:#1c8a4b;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Découvrir ma carte</a></p>
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
