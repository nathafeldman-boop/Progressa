import { prisma } from "../lib/prisma";
import { seedCatalog } from "../lib/exercises/seed-catalog";

async function main() {
  const result = await seedCatalog({ force: true });
  console.log(`Catalogue d'exercices: ${result.exercisesSynced} exercices synchronisés.`);
  console.log(`Badges: ${result.badgesSynced} badges synchronisés.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
