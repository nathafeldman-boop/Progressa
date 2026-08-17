import { PrismaClient } from "@prisma/client";
import { EXERCISE_CATALOG } from "../lib/exercises/catalog-data";
import { BADGE_CATALOG } from "../lib/badges-data";

const prisma = new PrismaClient();

async function main() {
  for (const exercise of EXERCISE_CATALOG) {
    await prisma.exercise.upsert({
      where: { slug: exercise.slug },
      create: exercise,
      update: exercise,
    });
  }
  console.log(`Catalogue d'exercices: ${EXERCISE_CATALOG.length} exercices synchronisés.`);

  for (const badge of BADGE_CATALOG) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      create: badge,
      update: badge,
    });
  }
  console.log(`Badges: ${BADGE_CATALOG.length} badges synchronisés.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
