import { prisma } from "@/lib/prisma";
import { RANK_TIERS, rankTierForOverall, nextRankProgress, type RankTier } from "@/lib/brian/stats-engine";

export interface LeaderboardEntry {
  label: string;
  overall: number;
  isCurrentUser: boolean;
}

export interface LeaderboardResult {
  entries: LeaderboardEntry[];
  currentUserRank: number | null;
  isDemo: boolean;
  /** Ligue affichée = le rang actuel du joueur — le classement ne mélange jamais deux rangs. */
  league: RankTier;
  /** Progression vers la ligue suivante (promotion) — null si déjà au rang maximum. */
  promotion: { percent: number; nextLabel: string; pointsToGo: number } | null;
}

const MIN_REAL_ENTRIES = 5;

/** Bornes [min, max] d'une ligue, pour générer des exemples de démo crédibles dans la bonne fourchette. */
function leagueRange(league: RankTier): [number, number] {
  const idx = RANK_TIERS.findIndex((t) => t.key === league.key);
  const upper = idx === 0 ? 99 : RANK_TIERS[idx - 1].min - 1;
  return [league.min, upper];
}

// Jamais présentés comme de vrais joueurs — clairement étiqueté "exemple"
// dans le libellé lui-même, pas seulement dans un texte à côté. Générés
// dans la fourchette de la ligue affichée pour rester crédibles (un
// Débutant ne doit jamais voir des exemples à 91 de moyenne).
function demoEntriesForLeague(league: RankTier): LeaderboardEntry[] {
  const [min, max] = leagueRange(league);
  const span = max - min;
  return [
    { label: "Joueur exemple A", overall: Math.round(min + span * 0.85), isCurrentUser: false },
    { label: "Joueur exemple B", overall: Math.round(min + span * 0.55), isCurrentUser: false },
    { label: "Joueur exemple C", overall: Math.round(min + span * 0.25), isCurrentUser: false },
  ];
}

function overallOf(stats: unknown): number {
  return typeof (stats as { overall?: number })?.overall === "number" ? (stats as { overall: number }).overall : 0;
}

/**
 * Classement en ligues: un joueur n'affronte que les joueurs de son propre
 * rang (Débutant, Intermédiaire, ... Élite Suprême — cf. RANK_TIERS). En
 * passant au rang supérieur, on est automatiquement "promu" dans la ligue
 * suivante au prochain calcul, sans action manuelle — c'est le passage de
 * rang lui-même qui fait office de promotion.
 */
export async function getLeaderboard(currentUserId: string): Promise<LeaderboardResult> {
  const cards = await prisma.playerCard.findMany({
    include: { user: { select: { id: true, firstName: true } } },
  });

  const parsed = cards.map((c) => ({
    userId: c.userId,
    firstName: c.user.firstName,
    overall: overallOf(c.stats),
  }));

  const me = parsed.find((p) => p.userId === currentUserId);
  const myOverall = me?.overall ?? 0;
  const league = rankTierForOverall(myOverall);
  const promotion = nextRankProgress(myOverall);

  const inLeague = parsed.filter((p) => rankTierForOverall(p.overall).key === league.key).sort((a, b) => b.overall - a.overall);

  if (inLeague.length < MIN_REAL_ENTRIES) {
    return { entries: demoEntriesForLeague(league), currentUserRank: null, isDemo: true, league, promotion };
  }

  const entries = inLeague.slice(0, 10).map((p) => ({
    label: p.firstName,
    overall: p.overall,
    isCurrentUser: p.userId === currentUserId,
  }));
  const rankIndex = inLeague.findIndex((p) => p.userId === currentUserId);

  return { entries, currentUserRank: rankIndex === -1 ? null : rankIndex + 1, isDemo: false, league, promotion };
}
