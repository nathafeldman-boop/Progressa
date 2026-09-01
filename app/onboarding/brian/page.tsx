import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { getCurrentWeeklyProgram } from "@/lib/programs/get-current-program";
import { composeCardIntroMessage, composeTestPrompt, composeWelcomeMessage } from "@/lib/brian/messages";
import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { CalibratingCardTeaser } from "@/components/card/CalibratingCardTeaser";
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

  const [welcomeMessage, program, testsTaken] = await Promise.all([
    prisma.brianMessage.findFirst({ where: { userId: user.id, category: "WELCOME" }, orderBy: { createdAt: "desc" } }),
    getCurrentWeeklyProgram(user.id),
    prisma.evaluationResult.count({ where: { userId: user.id } }),
  ]);

  const firstSession = program?.sessions.find((s) => s.status === "PLANNED") ?? program?.sessions[0] ?? null;
  const welcomeText = welcomeMessage?.text ?? composeWelcomeMessage(user.firstName);

  // Le tout premier passage (aucun test encore passé) doit établir le
  // niveau du joueur avant tout entraînement — section 2 du cahier des
  // charges carte joueur. Un joueur qui a déjà testé revient directement
  // sur son entraînement, comme avant.
  if (testsTaken === 0) {
    return (
      <div className="relative min-h-screen">
        <OnboardingBackground />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
          <BrianAvatar state="talking" size={96} />

          <div className="max-w-sm space-y-4">
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left shadow-[var(--shadow-card)]">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-primary-strong)]">Coach Brian</p>
              <p className="mt-1 text-sm">{welcomeText}</p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left shadow-[var(--shadow-card)]">
              <p className="text-sm">{composeCardIntroMessage()}</p>
              <p className="mt-2 text-sm">{composeTestPrompt()}</p>
            </div>
          </div>

          <CalibratingCardTeaser firstName={user.firstName} />

          <div className="w-full max-w-sm space-y-2">
            <Link href="/tests" className="block">
              <Button className="w-full">Commencer mon test</Button>
            </Link>
            {firstSession && (
              <Link href={`/seance/${firstSession.id}`} className="block text-center text-xs font-semibold text-[var(--color-text-muted)] underline">
                Plus tard, aller directement à l&apos;entraînement
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
      <BrianAvatar state="talking" size={96} />

      <div className="max-w-sm space-y-4">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left shadow-[var(--shadow-card)]">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-primary-strong)]">Coach Brian</p>
          <p className="mt-1 text-sm">{welcomeText}</p>
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
