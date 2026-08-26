/**
 * Détection des navigateurs intégrés (TikTok, Instagram, Facebook,
 * Snapchat...) — leur webview casse souvent la connexion Google et parfois
 * le paiement Stripe. On ne peut pas laisser un joueur venu depuis un lien
 * TikTok/affilié se cogner à une connexion Google qui échoue sans
 * comprendre pourquoi: mieux vaut lui dire tout de suite d'ouvrir dans son
 * vrai navigateur.
 */
const IN_APP_BROWSER_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: "TikTok", pattern: /musical_ly|tiktok/i },
  { label: "Instagram", pattern: /instagram/i },
  { label: "Facebook", pattern: /FBAN|FBAV|FB_IAB/i },
  { label: "Snapchat", pattern: /snapchat/i },
  { label: "Line", pattern: /\bLine\//i },
  { label: "WeChat", pattern: /MicroMessenger/i },
];

export function detectInAppBrowser(userAgent: string | null | undefined): { detected: boolean; appLabel: string | null } {
  if (!userAgent) return { detected: false, appLabel: null };
  for (const { label, pattern } of IN_APP_BROWSER_PATTERNS) {
    if (pattern.test(userAgent)) return { detected: true, appLabel: label };
  }
  return { detected: false, appLabel: null };
}
