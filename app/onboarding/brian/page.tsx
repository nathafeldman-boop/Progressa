import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { getCurrentWeeklyProgram } from "@/lib/programs/get-current-program";
import { composeFirstSessionIntro, composeWelcomeMessage } from "@/lib/brian/messages";
import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { Button } from "@/components/ui/Button";

/**
 * Premier vrai moment avec Coach Brian, juste après l'onboarding (section 1
 * du mécanisme Brian) — jamais une grosse note arbitraire ici: on explique
 * seulement que le premier exercice sert à établir le profil du joueur.
 */
export default async function OnboardingBrianPage() {
  const user = await getCurrentInternalUser();
  if (!user) {
    return (
      <div className="relative min-h-screen">
        <OnboardingBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <Link href="/dashboard">
            <Button>Continuer</Button>
          </Link>
        </div>
      </div>
    );
  }

  const [welcomeMessage, program] = await Promise.all([
    prisma.brianMessage.findFirst({ where: { userId: user.id, category: "WELCOME" }, orderBy: { createdAt: "desc" } }),
    getCurrentWeeklyProgram(user.id),
  ]);

  const firstSession = program?.sessions.find((s) => s.status === "PLANNED") ?? program?.sessions[0] ?? null;
  const welcomeText = welcomeMessage?.text ?? composeWelcomeMessage(user.firstName);
  const introText = composeFirstSessionIntro();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
      <BrianAvatar state="talking" size={96} />

      <div className="max-w-sm space-y-4">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left shadow-[var(--shadow-card)]">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-primary-strong)]">Coach Brian</p>
          <p className="mt-1 text-sm">{welcomeText}</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left shadow-[var(--shadow-card)]">
          <p className="mt-1 text-sm">{introText}</p>
        </div>
      </div>

      <Link href={firstSession ? `/seance/${firstSession.id}` : "/dashboard"} className="w-full max-w-sm">
        <Button className="w-full">
          {firstSession ? "Commencer mon premier entraînement" : "Aller à mon tableau de bord"}
        </Button>
      </Link>
    </div>
  );
}
