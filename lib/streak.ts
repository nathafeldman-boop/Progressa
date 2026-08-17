import { prisma } from "@/lib/prisma";

interface Tier {
  min: number;
  name: string;
}

// Paliers de progression (section 6.5). Triés du plus haut au plus bas.
const TIERS: Tier[] = [
  { min: 25, name: "Élite" },
  { min: 15, name: "Discipliné" },
  { min: 7, name: "Sérieux" },
  { min: 3, name: "Régulier" },
  { min: 1, name: "Départ" },
];

function tierForStreak(streak: number): string | null {
  return TIERS.find((t) => streak >= t.min)?.name ?? null;
}

function daysBetween(a: Date, b: Date): number {
  const dayA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const dayB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((dayB - dayA) / (1000 * 60 * 60 * 24));
}

export interface StreakUpdateResult {
  currentStreak: number;
  longestStreak: number;
  currentTier: string | null;
  tierJustChanged: boolean;
}

/**
 * Série cassée dès qu'une séance est sautée (section 6.5). Une deuxième
 * séance le même jour ne fait pas progresser la série une seconde fois.
 */
export async function updateStreakOnCompletion(userId: string, completedAt: Date = new Date()): Promise<StreakUpdateResult> {
  const state = await prisma.streakState.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  let currentStreak = state.currentStreak;
  if (!state.lastCompletedAt) {
    currentStreak = 1;
  } else {
    const diff = daysBetween(state.lastCompletedAt, completedAt);
    if (diff === 0) {
      currentStreak = state.currentStreak || 1;
    } else if (diff === 1) {
      currentStreak = state.currentStreak + 1;
    } else {
      currentStreak = 1; // série cassée
    }
  }

  const longestStreak = Math.max(state.longestStreak, currentStreak);
  const previousTier = state.currentTier;
  const currentTier = tierForStreak(currentStreak);
  const tierJustChanged = currentTier !== null && currentTier !== previousTier;

  await prisma.streakState.update({
    where: { userId },
    data: {
      currentStreak,
      longestStreak,
      lastCompletedAt: completedAt,
      currentTier,
      ...(tierJustChanged ? { lastTierCelebratedAt: completedAt } : {}),
    },
  });

  return { currentStreak, longestStreak, currentTier, tierJustChanged };
}
