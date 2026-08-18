import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { EXERCISE_CATALOG } from "@/lib/exercises/catalog-data";
import { BADGE_CATALOG } from "@/lib/badges-data";

/**
 * Synchronise en base le catalogue d'exercices et de badges définis dans le
 * code (lib/exercises/catalog-data.ts, lib/badges-data.ts) — même logique
 * que prisma/seed.ts, exposée ici en route admin pour pouvoir la relancer
 * en production sans jamais toucher Supabase à la main: modifier le
 * catalogue dans le code, déployer, puis cliquer "Synchroniser" sur /admin.
 * Idempotent (upsert par slug) — sans danger à rejouer plusieurs fois.
 */
export async function POST() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let exercisesSynced = 0;
  for (const exercise of EXERCISE_CATALOG) {
    await prisma.exercise.upsert({ where: { slug: exercise.slug }, create: exercise, update: exercise });
    exercisesSynced++;
  }

  let badgesSynced = 0;
  for (const badge of BADGE_CATALOG) {
    await prisma.badge.upsert({ where: { slug: badge.slug }, create: badge, update: badge });
    badgesSynced++;
  }

  return NextResponse.json({ exercisesSynced, badgesSynced });
}
