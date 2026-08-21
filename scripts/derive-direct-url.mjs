#!/usr/bin/env node
// Dérive DIRECT_URL depuis DATABASE_URL au moment du build, sans ajout manuel
// de variable d'environnement sur Vercel.
//
// `prisma migrate deploy` a besoin d'une connexion qui supporte les verrous
// de session (advisory locks). DATABASE_URL pointe en production sur le
// pooler Supabase en mode transaction (port 6543), qui ne les supporte pas
// et fait planter/bloquer indéfiniment les migrations (vécu: 45 minutes
// avant timeout). Le même hôte sert aussi un mode session sur le port 5432,
// utilisable tel quel pour les migrations.
//
// Si DIRECT_URL est déjà défini explicitement (ex: en dev local), ce script
// ne fait rien. Sinon il écrit un fichier .env (auto-chargé par le CLI
// Prisma) avec la connexion dérivée. Si DATABASE_URL ne contient pas
// ":6543", la valeur est reprise telle quelle (déjà utilisable en mode
// session — ne change rien à un DATABASE_URL déjà en connexion directe).
import { appendFileSync } from "node:fs";

if (process.env.DIRECT_URL) {
  console.log("DIRECT_URL déjà défini — rien à dériver.");
  process.exit(0);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.log("DATABASE_URL absent — rien à dériver (prisma migrate deploy échouera avec un message clair).");
  process.exit(0);
}

const derived = databaseUrl.replace(":6543", ":5432");
appendFileSync(".env", `\nDIRECT_URL="${derived}"\n`);
console.log("DIRECT_URL dérivé de DATABASE_URL (mode session du pooler).");
