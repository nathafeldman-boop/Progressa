import Link from "next/link";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPremiumActive } from "@/lib/subscription";
import { getLeaderboard, getRegionLeaderboard } from "@/lib/brian/leaderboard";
import { getFriendsLeaderboard } from "@/lib/friends";
import { ensureReferralCode } from "@/lib/referral";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { ReferralShareLink } from "@/components/referral/ReferralShareLink";
import { FriendConnectForm } from "@/components/friends/FriendConnectForm";
import { RankCardBadge } from "@/components/card/RankCardBadge";
import { rankStyleFor } from "@/lib/card/rank-styles";
import { FreeTierAdSlot } from "@/components/ads/FreeTierAdSlot";
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

  const view = vue === "amis" ? "amis" : vue === "region" ? "region" : "global";
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
          href="/classement?vue=region"
          className={cn(
            "flex-1 rounded-[calc(var(--radius-control)-4px)] py-2 text-center",
            view === "region" ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "text-[var(--color-text-muted)]"
          )}
        >
          Région
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

      {view === "global" ? <GlobalView userId={user.id} /> : view === "region" ? <RegionView userId={user.id} /> : <FriendsView userId={user.id} />}

      {!premium && <FreeTierAdSlot />}
    </div>
  );
}

async function GlobalView({ userId }: { userId: string }) {
  const { entries, currentUserRank, isDemo, league, promotion } = await getLeaderboard(userId);
  const style = rankStyleFor(league.key);

  return (
    <>
      <Card
        className="text-center"
        style={{ background: `linear-gradient(165deg, ${style.gradient[0]}, ${style.gradient[1]})`, borderColor: style.border }}
      >
        <div className="flex items-center justify-center gap-2">
          <RankCardBadge rankKey={league.key} size={22} />
          <p className="font-display text-sm font-bold uppercase tracking-widest" style={{ color: style.accent }}>
            Ligue {league.label}
          </p>
        </div>
        {promotion ? (
          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded-full bg-black/25">
              <div className="h-full rounded-full" style={{ width: `${promotion.percent}%`, background: style.accent }} />
            </div>
            <p className="mt-1.5 text-xs text-white/70">
              {promotion.pointsToGo} pt{promotion.pointsToGo > 1 ? "s" : ""} avant la promotion en ligue {promotion.nextLabel}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-xs text-white/70">Ligue la plus haute — reste au sommet !</p>
        )}
      </Card>

      {isDemo && (
        <Card className="border-[var(--color-info)] bg-[var(--color-surface-alt)] text-sm">
          <p className="font-semibold">Classement de démonstration</p>
          <p className="mt-1 text-[var(--color-text-muted)]">
            Pas encore assez de joueurs dans cette ligue pour un vrai classement — reviens quand la communauté aura grandi.
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
        <p className="text-center text-sm text-[var(--color-text-muted)]">Tu es actuellement #{currentUserRank} de ta ligue.</p>
      )}
    </>
  );
}

async function RegionView({ userId }: { userId: string }) {
  const { ligueLabel, regionEntries, regionRank, regionIsDemo, franceEntries, franceRank, franceIsDemo, isPromoted } =
    await getRegionLeaderboard(userId);

  if (!ligueLabel) {
    return (
      <Card className="text-center text-sm text-[var(--color-text-muted)]">
        Le classement par région n&apos;est disponible que pour les joueurs en France pour l&apos;instant.
      </Card>
    );
  }

  const isDemo = regionIsDemo || franceIsDemo;

  return (
    <>
      {isPromoted && (
        <Card className="border-[var(--color-info)] bg-[var(--color-surface-alt)] text-center text-sm font-semibold">
          🇫🇷 Tu fais partie du Top France de ta région !
        </Card>
      )}

      {isDemo && (
        <Card className="border-[var(--color-info)] bg-[var(--color-surface-alt)] text-sm">
          <p className="font-semibold">Classement de démonstration</p>
          <p className="mt-1 text-[var(--color-text-muted)]">
            Pas encore assez de joueurs dans ta région pour un vrai classement — reviens quand la communauté aura grandi.
          </p>
        </Card>
      )}

      <section>
        <CardTitle className="mb-2 text-base">Classement France</CardTitle>
        <CardSubtitle className="mb-2 -mt-1">Le top 3 de chaque région, réuni.</CardSubtitle>
        <Card>
          <ul className="space-y-2">
            {franceEntries.map((entry, i) => (
              <li
                key={entry.userId}
                className={`flex items-center justify-between rounded-[var(--radius-control)] px-3 py-2 text-sm ${
                  entry.isCurrentUser ? "bg-[var(--color-primary-soft)] font-bold text-[var(--color-primary-strong)]" : ""
                }`}
              >
                <span>
                  {i + 1}. {entry.label}
                  {entry.isCurrentUser ? " (toi)" : ""}
                  <span className="ml-1.5 text-xs font-normal text-[var(--color-text-muted)]">{entry.ligueLabel}</span>
                </span>
                <span className="font-display font-extrabold">{entry.overall}</span>
              </li>
            ))}
          </ul>
        </Card>
        {!isDemo && franceRank && franceRank > franceEntries.length && (
          <p className="mt-2 text-center text-sm text-[var(--color-text-muted)]">Tu es actuellement #{franceRank} en France.</p>
        )}
      </section>

      <section>
        <CardTitle className="mb-2 text-base">Ta région : {ligueLabel}</CardTitle>
        <Card>
          <ul className="space-y-2">
            {regionEntries.map((entry, i) => (
              <li
                key={entry.userId}
                className={`flex items-center justify-between rounded-[var(--radius-control)] px-3 py-2 text-sm ${
                  entry.isCurrentUser ? "bg-[var(--color-primary-soft)] font-bold text-[var(--color-primary-strong)]" : ""
                }`}
              >
                <span>
                  {i + 1}. {entry.label}
                  {entry.isCurrentUser ? " (toi)" : ""}
                  {entry.isPromoted && <span className="ml-1.5 text-xs font-normal text-[var(--color-text-muted)]">🇫🇷 France</span>}
                </span>
                <span className="font-display font-extrabold">{entry.overall}</span>
              </li>
            ))}
          </ul>
        </Card>
        {!isDemo && regionRank && regionRank > regionEntries.length && (
          <p className="mt-2 text-center text-sm text-[var(--color-text-muted)]">Tu es actuellement #{regionRank} de ta région.</p>
        )}
      </section>
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
                <span className="flex items-center gap-2">
                  <span className="text-[var(--color-text-muted)]">{i + 1}.</span>
                  <RankCardBadge rankKey={entry.rankKey} size={16} />
                  <span>
                    {entry.label}
                    {entry.isCurrentUser ? " (toi)" : ""}
                  </span>
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
