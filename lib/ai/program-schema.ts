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

  const blockSchema = z
    .object({
      exerciseSlug: slugEnum,
      phase: z.enum(BlockPhase),
      sets: z.number().int().positive().nullable(),
      reps: z.string().min(1).nullable(),
      restSeconds: z.number().int().nonnegative().nullable(),
      // Consigne personnalisée pour CE bloc précis — jamais la description
      // générique du catalogue. On impose une longueur minimale comme proxy
      // de personnalisation réelle.
      customInstruction: z.string().min(12),
    })
    // Un bloc à séries sans nombre de répétitions laisse le joueur deviner
    // combien en faire — si l'IA ne s'y conforme pas, la réponse est
    // rejetée (retry, puis repli sur le template déterministe qui, lui,
    // fournit toujours des reps).
    .refine((block) => block.sets === null || block.reps !== null, {
      message: "reps ne peut pas être null quand sets est renseigné",
      path: ["reps"],
    })
    // Symétrique: un repos entre séries n'a de sens que s'il y a des
    // séries. Sans cette règle, un bloc "sets: null, restSeconds: 30"
    // passe la validation mais affiche "30s repos" côté joueur sans jamais
    // dire combien de répétitions faire — exactement l'écran vide
    // rapporté par un joueur (sauts en squat en échauffement).
    .refine((block) => !block.restSeconds || block.sets !== null, {
      message: "restSeconds ne peut pas être renseigné quand sets est null",
      path: ["restSeconds"],
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
