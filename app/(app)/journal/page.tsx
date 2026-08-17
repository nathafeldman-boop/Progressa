import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { JournalTabs } from "@/components/journal/JournalTabs";

function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export default async function JournalPage() {
  const user = await getCurrentInternalUser();
  if (!user) return null;

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
      <JournalTabs todayCheckin={todayCheckin} painLogs={painLogs} growthEntries={growthEntries} matchLogs={matchLogs} goals={goals} />
    </div>
  );
}
