import { prisma } from "@/lib/prisma";
import { RANK_TIERS, rankTierForOverall, nextRankProgress, type RankTier } from "@/lib/brian/stats-engine";

// Enlève le préfixe "Ligue [de/du/des/d'] " pour un affichage compact
// ("Ligue de Paris Île-de-France" -> "Paris Île-de-France") — le mot
// "Ligue" est déjà porté par le titre de section, inutile de le répéter
// devant chaque nom dans une liste.
function shortLigueName(ligue: string): string {
  return ligue.replace(/^Ligue\s+(de\s+la\s+|de\s+|du\s+|des\s+|d')?/i, "");
}

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

/** Nombre de joueurs promus depuis chaque ligue régionale vers le classement France. */
const PROMOTION_COUNT = 3;

export interface RegionEntry {
  userId: string;
  label: string;
  overall: number;
  isCurrentUser: boolean;
  /** Dans le top 3 de sa ligue — apparaît donc aussi dans le classement France. */
  isPromoted: boolean;
}

export interface FranceEntry {
  userId: string;
  label: string;
  overall: number;
  isCurrentUser: boolean;
  ligueLabel: string;
}

export interface RegionLeaderboardResult {
  /** null si le joueur n'a pas de ligue (hors France, ou onboarding incomplet) — l'onglet Région ne s'applique qu'aux joueurs en France. */
  ligue: string | null;
  ligueLabel: string | null;
  regionEntries: RegionEntry[];
  regionRank: number | null;
  regionIsDemo: boolean;
  franceEntries: FranceEntry[];
  franceRank: number | null;
  franceIsDemo: boolean;
  isPromoted: boolean;
}

/**
 * Classement Région -> France, recalculé en direct à chaque visite (pas de
 * saison ni d'état persisté): le top PROMOTION_COUNT de chaque ligue
 * régionale FFF apparaît dans le classement France, agrégé entre régions.
 * Un joueur qui sort du top 3 la fois suivante disparaît naturellement du
 * classement France au prochain calcul — la "descente" n'est jamais un
 * événement à gérer, juste l'absence de recalcul en sa faveur.
 */
export async function getRegionLeaderboard(currentUserId: string): Promise<RegionLeaderboardResult> {
  const me = await prisma.playerProfile.findUnique({
    where: { userId: currentUserId },
    select: { country: true, ligue: true },
  });

  if (me?.country !== "France" || !me.ligue) {
    return {
      ligue: null,
      ligueLabel: null,
      regionEntries: [],
      regionRank: null,
      regionIsDemo: false,
      franceEntries: [],
      franceRank: null,
      franceIsDemo: false,
      isPromoted: false,
    };
  }

  const cards = await prisma.playerCard.findMany({
    include: { user: { select: { id: true, firstName: true, profile: { select: { country: true, ligue: true } } } } },
  });

  const parsed = cards
    .filter((c) => c.user.profile?.country === "France" && c.user.profile.ligue)
    .map((c) => ({
      userId: c.userId,
      firstName: c.user.firstName,
      ligue: c.user.profile!.ligue!,
      overall: overallOf(c.stats),
    }));

  const byLigue = new Map<string, typeof parsed>();
  for (const p of parsed) {
    const arr = byLigue.get(p.ligue) ?? [];
    arr.push(p);
    byLigue.set(p.ligue, arr);
  }

  const regionPlayers = (byLigue.get(me.ligue) ?? []).sort((a, b) => b.overall - a.overall);
  const regionIsDemo = regionPlayers.length < MIN_REAL_ENTRIES;
  const ligueLabel = shortLigueName(me.ligue);

  const franceRaw: typeof parsed = [];
  for (const players of byLigue.values()) {
    franceRaw.push(...[...players].sort((a, b) => b.overall - a.overall).slice(0, PROMOTION_COUNT));
  }
  franceRaw.sort((a, b) => b.overall - a.overall);
  const franceIsDemo = franceRaw.length < MIN_REAL_ENTRIES;

  const isPromoted = regionPlayers.slice(0, PROMOTION_COUNT).some((p) => p.userId === currentUserId);

  if (regionIsDemo || franceIsDemo) {
    // Un seul jeu d'exemples partagé région/France — la fourchette 50-90
    // reste crédible dans les deux vues sans dépendre du rang du joueur.
    const demo: RegionEntry[] = [
      { userId: "demo-a", label: "Joueur exemple A", overall: 78, isCurrentUser: false, isPromoted: true },
      { userId: "demo-b", label: "Joueur exemple B", overall: 64, isCurrentUser: false, isPromoted: false },
      { userId: "demo-c", label: "Joueur exemple C", overall: 52, isCurrentUser: false, isPromoted: false },
    ];
    return {
      ligue: me.ligue,
      ligueLabel,
      regionEntries: demo,
      regionRank: null,
      regionIsDemo,
      franceEntries: demo.slice(0, PROMOTION_COUNT).map((d) => ({ ...d, ligueLabel: "Exemple" })),
      franceRank: null,
      franceIsDemo,
      isPromoted: false,
    };
  }

  const regionEntries: RegionEntry[] = regionPlayers.slice(0, 10).map((p, i) => ({
    userId: p.userId,
    label: p.firstName,
    overall: p.overall,
    isCurrentUser: p.userId === currentUserId,
    isPromoted: i < PROMOTION_COUNT,
  }));
  const regionRankIndex = regionPlayers.findIndex((p) => p.userId === currentUserId);

  const franceEntries: FranceEntry[] = franceRaw.slice(0, 15).map((p) => ({
    userId: p.userId,
    label: p.firstName,
    overall: p.overall,
    isCurrentUser: p.userId === currentUserId,
    ligueLabel: shortLigueName(p.ligue),
  }));
  const franceRankIndex = franceRaw.findIndex((p) => p.userId === currentUserId);

  return {
    ligue: me.ligue,
    ligueLabel,
    regionEntries,
    regionRank: regionRankIndex === -1 ? null : regionRankIndex + 1,
    regionIsDemo,
    franceEntries,
    franceRank: franceRankIndex === -1 ? null : franceRankIndex + 1,
    franceIsDemo,
    isPromoted,
  };
}
