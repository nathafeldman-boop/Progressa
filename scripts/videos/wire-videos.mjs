#!/usr/bin/env node
/**
 * Régénère lib/exercises/exercise-media.ts à partir de ce qui existe
 * réellement dans public/exercises/*.mp4 — aucune édition manuelle du
 * fichier après un run de fetch-pexels.mjs + prepare-videos.sh.
 *
 * Idempotent : relit le dossier au complet à chaque run, donc les vidéos
 * déjà présentes avant ce run restent dans la carte.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const VIDEO_DIR = path.join(ROOT, "public", "exercises");
const TARGET = path.join(ROOT, "lib", "exercises", "exercise-media.ts");

const slugs = fs.existsSync(VIDEO_DIR)
  ? fs
      .readdirSync(VIDEO_DIR)
      .filter((f) => f.endsWith(".mp4"))
      .map((f) => f.replace(/\.mp4$/, ""))
      .sort((a, b) => a.localeCompare(b))
  : [];

const entries = slugs.map((slug) => `  "${slug}": "/exercises/${slug}.mp4",`).join("\n");

const content = `/**
 * Vidéos de démonstration par exercice (clips courts, générés puis
 * recadrés/compressés côté build) — indexées par slug, ajoutées au fur et
 * à mesure. Un exercice sans entrée ici retombe sur l'emoji dans
 * ActiveExerciseScreen (SessionPlayer.tsx), jamais d'écran cassé.
 *
 * Généré automatiquement par scripts/videos/wire-videos.mjs à partir du
 * contenu de public/exercises/ — ne pas éditer à la main, relancer le
 * workflow "Vidéos d'exercices" à la place.
 */
export const EXERCISE_VIDEO: Partial<Record<string, string>> = {
${entries}
};
`;

fs.writeFileSync(TARGET, content);
console.log(`${slugs.length} vidéo(s) répertoriée(s) dans lib/exercises/exercise-media.ts`);
