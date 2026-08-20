import Link from "next/link";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPremiumActive } from "@/lib/subscription";
import { getLeaderboard } from "@/lib/brian/leaderboard";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function ClassementPage() {
  const user = await getCurrentInternalUser();
  if (!user) return null;

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  const premium = isPremiumActive(subscription);

  if (!premium) {
    return (
      <div className="mx-auto max-w-md p-4">
        <Card className="p-6 text-center">
          <CardTitle>Le classement est une fonctionnalité Premium</CardTitle>
          <CardSubtitle className="mt-2">Vois où tu te situes face aux autres joueurs de Progressa.</CardSubtitle>
          <Link href="/parametres/abonnement" className="mt-4 block">
            <Button className="w-full">Découvrir Premium</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { entries, currentUserRank, isDemo } = await getLeaderboard(user.id);

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Classement</h1>

      {isDemo && (
        <Card className="border-[var(--color-info)] bg-[var(--color-surface-alt)] text-sm">
          <p className="font-semibold">Classement de démonstration</p>
          <p className="mt-1 text-[var(--color-text-muted)]">
            Pas encore assez de joueurs actifs pour un vrai classement — reviens quand la communauté aura grandi.
          </p>
        </Card>
      )}

      <Card>
        <ul className="space-y-2">
          {entries.map((entry, i) => (
            <li
              key={`${entry.label}-${i}`}
              className={`flex items-center justify-between rounded-[var(--radius-control)] px-3 py-2 text-sm ${
                entry.isCurrentUser ? "bg-[var(--color-primary-soft)] font-bold text-[var(--color-primary-strong)]" : ""
              }`}
            >
              <span>
                {i + 1}. {entry.label}
                {entry.isCurrentUser ? " (toi)" : ""}
              </span>
              <span className="font-display font-extrabold">{entry.overall}</span>
            </li>
          ))}
        </ul>
      </Card>

      {!isDemo && currentUserRank && currentUserRank > entries.length && (
        <p className="text-center text-sm text-[var(--color-text-muted)]">Tu es actuellement #{currentUserRank}.</p>
      )}
    </div>
  );
}
