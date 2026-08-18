/**
 * Vidéos de démonstration par exercice (clips courts, générés puis
 * recadrés/compressés côté build) — indexées par slug, ajoutées au fur et
 * à mesure. Un exercice sans entrée ici retombe sur l'emoji dans
 * ActiveExerciseScreen (SessionPlayer.tsx), jamais d'écran cassé.
 */
export const EXERCISE_VIDEO: Partial<Record<string, string>> = {
  "jonglages-progressifs": "/exercises/jonglages-progressifs.mp4",
  "squats-poids-du-corps": "/exercises/squats-poids-du-corps.mp4",
};
