import { redirect } from "next/navigation";

// Lien de parrainage joueur-à-joueur: /r/<code> redirige simplement vers
// l'onboarding avec le code en query param. La validation du code se fait
// côté serveur à la complétion de l'onboarding (jamais bloquant ici).
export default async function ReferralRedirectPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  redirect(`/onboarding?ref=${encodeURIComponent(code)}`);
}
