import { redirect } from "next/navigation";
import { getCurrentInternalUser } from "@/lib/auth";
import { connectFriendsByCode } from "@/lib/friends";

// Lien personnel /r/<code>: deux effets selon le visiteur. Un nouveau
// visiteur part dans l'onboarding classique (parrainage, bonus Premium à
// la conversion). Un joueur déjà connecté est directement ajouté en ami
// (classement entre amis) — pas de bonus Premium ici, juste la connexion.
export default async function ReferralRedirectPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const user = await getCurrentInternalUser();
  if (user) {
    const result = await connectFriendsByCode(user.id, code);
    redirect(`/classement?ami=${result.status}`);
  }

  redirect(`/onboarding?ref=${encodeURIComponent(code)}`);
}
