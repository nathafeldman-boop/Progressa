import type { Character3DPreset } from "@/components/exercises/Character3D";

/**
 * Mappe un slug du catalogue vers un preset d'animation 3D (Character3D).
 * Un exercice absent d'ici retombe sur la séquence de photos (EXERCISE_FRAMES)
 * ou la vidéo — jamais d'écran cassé.
 *
 * Ajouter un exercice: ne mappe QUE si le mouvement réel correspond
 * vraiment au preset (le patron articulaire de chaque preset a été validé
 * pour un geste précis) — un mauvais mapping recrée le problème initial
 * ("articulation anatomiquement pas compréhensible"). Dans le doute, ne
 * mappe pas: la photo reste une démonstration correcte.
 */
export const EXERCISE_3D_PRESETS: Partial<Record<string, Character3DPreset>> = {
  "squats-poids-du-corps": "squat",
  "squat-jumps": "squat-jump",
  "skipping-genoux-hauts": "high-knees",
  "fentes-avant-alternees": "lunge",
  "talons-fesses": "butt-kick",
  "elastique-marche-laterale": "shuffle",
  "jockey-defensif-pas-chasses": "shuffle",
  "repositionnement-lateral-pas-chasses": "shuffle",
  "bondissements-lateraux": "bound",
  "sprints-courts-10m": "sprint",
  "course-cote-courte": "sprint",
  "course-lente-relachement": "light-jog",
  "equilibre-unipodal-genoux": "balance-hold",
  "proprioception-cheville-serviette": "balance-hold",
  // Duel aérien = même mécanique qu'un saut vertical accroupi-puis-explosif.
  "duel-aerien-defensif": "squat-jump",
};

export function getExercise3DPreset(slug: string): Character3DPreset | null {
  return EXERCISE_3D_PRESETS[slug] ?? null;
}
