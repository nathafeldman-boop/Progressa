import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { isPremiumActive, hasSkippedPaywall } from "@/lib/subscription";
import { composeWelcomeMessage } from "@/lib/brian/messages";
import { CoachChat } from "@/components/coach/CoachChat";
import { BrianTip } from "@/components/brian/BrianTip";
import Link from "next/link";

export default async function CoachPage() {
  const user = await getCurrentInternalUser();
  if (!user) return null;

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  const premium = isPremiumActive(subscription);
  // Seule page accessible à un joueur ayant sauté le paiement ("Payer
  // ultérieurement" sur le paywall) — voir hasSkippedPaywall(). Toutes les
  // autres pages du groupe (app) restent un hard paywall classique.
  if (!premium && !hasSkippedPaywall(subscription)) redirect("/paywall");

  const messages = await prisma.brianMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  const initialMessages = messages.length
    ? messages.map((m) => ({
        id: m.id,
        category: m.category,
        text: m.text,
        fromPlayer: m.fromPlayer,
        createdAt: m.createdAt.toISOString(),
      }))
    : [
        {
          id: "welcome",
          category: "WELCOME" as const,
          text: composeWelcomeMessage(user.firstName),
          createdAt: new Date().toISOString(),
        },
      ];

  return (
    <div className="mx-auto flex h-[calc(100dvh-8.5rem)] max-w-md flex-col p-4">
      <h1 className="mb-3 font-display text-2xl font-extrabold uppercase tracking-wide">Coach Brian</h1>

      {!premium && (
        <Link
          href="/paywall"
          className="mb-3 flex items-center justify-between gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3.5 py-2.5"
        >
          <p className="text-[12.5px] leading-[1.4] text-[var(--color-text)]">
            <b>Accès limité</b> — carte, séances et classement restent verrouillés.
          </p>
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary-strong)]">
            Débloquer →
          </span>
        </Link>
      )}

      <div className="mb-3">
        <BrianTip
          tipKey="coach-intro"
          text="Pose-moi n'importe quelle question sur ton entraînement — je réponds en fonction de tes vraies stats, pas de généralités."
        />
      </div>
      <CoachChat initialMessages={initialMessages} />
    </div>
  );
}
