import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPremiumActive } from "@/lib/subscription";
import { getLeaderboard } from "@/lib/brian/leaderboard";
import { getFriendsLeaderboard } from "@/lib/friends";
import { ensureReferralCode } from "@/lib/referral";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { ReferralShareLink } from "@/components/referral/ReferralShareLink";
import { FriendConnectForm } from "@/components/friends/FriendConnectForm";
import { cn } from "@/lib/cn";

const AMI_MESSAGES: Record<string, string> = {
  connected: "Pote ajouté à ton classement entre amis !",
  already_friends: "Vous étiez déjà amis.",
  invalid_code: "Ce lien n'est plus valide.",
  self: "C'est ton propre lien !",
};

export default async function ClassementPage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string; ami?: string }>;
}) {
  const user = await getCurrentInternalUser();
  if (!user) return null;

  const { vue, ami } = await searchParams;
  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  const premium = isPremiumActive(subscription);

  if (!premium) redirect("/paywall");

  const view = vue === "amis" ? "amis" : "global";
  const amiMessage = ami ? AMI_MESSAGES[ami] : null;

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Classement</h1>

      {amiMessage && (
        <Card className="border-[var(--color-info)] bg-[var(--color-surface-alt)] text-sm">
          <p>{amiMessage}</p>
        </Card>
      )}

      <div className="flex gap-2 rounded-[var(--radius-control)] bg-[var(--color-surface-alt)] p-1 text-sm font-bold uppercase">
        <Link
          href="/classement?vue=global"
          className={cn(
            "flex-1 rounded-[calc(var(--radius-control)-4px)] py-2 text-center",
            view === "global" ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "text-[var(--color-text-muted)]"
          )}
        >
          Global
        </Link>
        <Link
          href="/classement?vue=amis"
          className={cn(
            "flex-1 rounded-[calc(var(--radius-control)-4px)] py-2 text-center",
            view === "amis" ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "text-[var(--color-text-muted)]"
          )}
        >
          Amis
        </Link>
      </div>

      {view === "global" ? <GlobalView userId={user.id} /> : <FriendsView userId={user.id} />}
    </div>
  );
}

async function GlobalView({ userId }: { userId: string }) {
  const { entries, currentUserRank, isDemo } = await getLeaderboard(userId);

  return (
    <>
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
    </>
  );
}

async function FriendsView({ userId }: { userId: string }) {
  const [entries, code] = await Promise.all([getFriendsLeaderboard(userId), ensureReferralCode(userId)]);
  const hasFriends = entries.length > 1;

  return (
    <>
      <Card>
        <CardTitle>Invite tes potes</CardTitle>
        <CardSubtitle className="mt-1">Partage ton lien pour comparer vos notes générales.</CardSubtitle>
        <ReferralShareLink code={code} />
        <FriendConnectForm />
      </Card>

      {hasFriends ? (
        <Card>
          <ul className="space-y-2">
            {entries.map((entry, i) => (
              <li
                key={entry.userId}
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
      ) : (
        <Card className="text-center text-sm text-[var(--color-text-muted)]">
          Aucun pote connecté pour l&apos;instant — partage ton lien ci-dessus.
        </Card>
      )}
    </>
  );
}
