import { redirect } from "next/navigation";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Créer un compte",
  "Crée ton compte et commence gratuitement ton premier programme d'entraînement personnalisé de football.",
  "/inscription"
);

export default async function InscriptionPage() {
  const user = await getCurrentInternalUser();
  if (user) {
    // Un compte déjà créé mais dont l'onboarding n'a jamais été fini
    // (ex: session coupée en cours de route) doit reprendre l'assistant,
    // pas rebondir sur un dashboard vide qui le renverrait de toute façon.
    const profile = await prisma.playerProfile.findUnique({ where: { userId: user.id } });
    redirect(profile ? "/dashboard" : "/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-surface-alt)] p-4">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Créer un compte</h1>
      <EmailAuthForm redirectTo="/onboarding" />
    </div>
  );
}
