import { prisma } from "@/lib/prisma";

export interface LeaderboardEntry {
  label: string;
  overall: number;
  isCurrentUser: boolean;
}

export interface LeaderboardResult {
  entries: LeaderboardEntry[];
  currentUserRank: number | null;
  isDemo: boolean;
}

const MIN_REAL_ENTRIES = 5;

// Jamais présentés comme de vrais joueurs — clairement étiqueté "exemple"
// dans le libellé lui-même, pas seulement dans un texte à côté.
const DEMO_ENTRIES: LeaderboardEntry[] = [
  { label: "Joueur exemple A", overall: 91, isCurrentUser: false },
  { label: "Joueur exemple B", overall: 84, isCurrentUser: false },
  { label: "Joueur exemple C", overall: 78, isCurrentUser: false },
];

export async function getLeaderboard(currentUserId: string): Promise<LeaderboardResult> {
  const cards = await prisma.playerCard.findMany({
    include: { user: { select: { id: true, firstName: true } } },
  });

  const parsed = cards
    .map((c) => ({
      userId: c.userId,
      firstName: c.user.firstName,
      overall: typeof (c.stats as { overall?: number })?.overall === "number" ? (c.stats as { overall: number }).overall : 0,
    }))
    .sort((a, b) => b.overall - a.overall);

  if (parsed.length < MIN_REAL_ENTRIES) {
    return { entries: DEMO_ENTRIES, currentUserRank: null, isDemo: true };
  }

  const entries = parsed.slice(0, 10).map((p) => ({
    label: p.firstName,
    overall: p.overall,
    isCurrentUser: p.userId === currentUserId,
  }));
  const rankIndex = parsed.findIndex((p) => p.userId === currentUserId);

  return { entries, currentUserRank: rankIndex === -1 ? null : rankIndex + 1, isDemo: false };
}
