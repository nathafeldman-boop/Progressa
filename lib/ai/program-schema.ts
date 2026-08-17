import { z } from "zod";
import { Objective, Weekday, BlockPhase } from "@prisma/client";

/**
 * Construit dynamiquement le schéma Zod pour la sortie IA, à partir de la
 * liste des slugs AUTORISÉS pour ce joueur (catalogue déjà filtré par
 * âge/poste/matériel). C'est le garde-fou anti-hallucination: Zod rejette
 * lui-même toute réponse qui contient un slug hors catalogue, avant même
 * qu'on essaie de l'interpréter.
 */
export function buildProgramSchema(allowedSlugs: string[]) {
  const slugEnum =
    allowedSlugs.length > 0
      ? z.enum(allowedSlugs as [string, ...string[]])
      : z.never({ message: "Aucun exercice disponible pour ce profil" });

  const blockSchema = z.object({
    exerciseSlug: slugEnum,
    phase: z.enum(BlockPhase),
    sets: z.number().int().positive().nullable(),
    reps: z.string().min(1).nullable(),
    restSeconds: z.number().int().nonnegative().nullable(),
    // Consigne personnalisée pour CE bloc précis — jamais la description
    // générique du catalogue. On impose une longueur minimale comme proxy
    // de personnalisation réelle.
    customInstruction: z.string().min(12),
  });

  const sessionSchema = z.object({
    dayOfWeek: z.enum(Weekday),
    title: z.string().min(3),
    focusObjective: z.enum(Objective).nullable(),
    isMatchAdjacent: z.boolean(),
    blocks: z.array(blockSchema).min(2),
  });

  return z.object({
    sessions: z.array(sessionSchema).min(1).max(3),
  });
}

export type ProgramOutput = z.infer<ReturnType<typeof buildProgramSchema>>;
export type ProgramSessionOutput = ProgramOutput["sessions"][number];
export type ProgramBlockOutput = ProgramSessionOutput["blocks"][number];
