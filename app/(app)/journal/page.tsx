import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { isPremiumActive } from "@/lib/subscription";
import { JournalTabs } from "@/components/journal/JournalTabs";
import { BrianTip } from "@/components/brian/BrianTip";
import { PremiumFeatureCard } from "@/components/paywall/PremiumFeatureCard";
import { FreeTierAdSlot } from "@/components/ads/FreeTierAdSlot";

function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export default async function JournalPage() {
  const user = await getCurrentInternalUser();
  if (!user) return null;

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (!isPremiumActive(subscription)) {
    return (
      <div className="mx-auto max-w-md p-4">
        <h1 className="mb-4 font-display text-2xl font-extrabold uppercase tracking-wide">Journal</h1>
        <PremiumFeatureCard
          title="Le journal est une fonctionnalité Premium"
          subtitle="Note tes ressentis, douleurs, matchs et objectifs — Coach Brian s'en sert pour adapter tes séances."
        />
        <FreeTierAdSlot />
      </div>
    );
  }

  const [todayCheckin, painLogs, growthEntries, matchLogs, goals] = await Promise.all([
    prisma.dailyCheckin.findUnique({ where: { userId_date: { userId: user.id, date: todayUtc() } } }),
    prisma.painLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.growthEntry.findMany({ where: { userId: user.id }, orderBy: { date: "desc" } }),
    prisma.matchLog.findMany({ where: { userId: user.id }, orderBy: { date: "desc" } }),
    prisma.personalGoal.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="mb-4 font-display text-2xl font-extrabold uppercase tracking-wide">Journal</h1>
      <div className="mb-4">
        <BrianTip
          tipKey="journal-intro"
          text="Note tes ressentis, douleurs, matchs et objectifs ici — je m'en sers pour adapter tes séances à ta forme réelle."
        />
      </div>
      <JournalTabs todayCheckin={todayCheckin} painLogs={painLogs} growthEntries={growthEntries} matchLogs={matchLogs} goals={goals} />
    </div>
  );
}
