import { headers } from "next/headers";
import { detectInAppBrowser } from "@/lib/in-app-browser";
import { OpenInBrowserOverlay } from "@/components/OpenInBrowserOverlay";

/**
 * Servie par proxy.ts (rewrite, jamais un lien direct) à la place de
 * n'importe quelle page quand la requête vient d'un navigateur intégré
 * (TikTok, Instagram, Facebook...) — l'URL affichée reste celle d'origine
 * (LP, lien d'affilié avec ?aff=..., etc.), seul le contenu servi change.
 */
export default async function OuvrirDansNavigateurPage() {
  const headerList = await headers();
  const { appLabel } = detectInAppBrowser(headerList.get("user-agent"));
  return <OpenInBrowserOverlay appLabel={appLabel} />;
}
