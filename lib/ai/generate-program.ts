import Anthropic from "@anthropic-ai/sdk";
import type { Weekday, Objective, Position, Equipment } from "@prisma/client";
import { getAiAgeBand } from "@/lib/age-category";
import { filterCatalogForProfile, excludePainfulAreas } from "@/lib/ai/catalog-filter";
import { buildProgramSchema, type ProgramOutput } from "@/lib/ai/program-schema";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { buildUserPrompt, type PreviousWeekSummary } from "@/lib/ai/user-prompt";
import { validateProgramBusinessRules } from "@/lib/ai/business-rules";
import { buildFallbackProgram } from "@/lib/ai/fallback-template";
import { EXERCISE_CATALOG } from "@/lib/exercises/catalog-data";

export interface GenerateProgramInput {
  firstName: string;
  birthYear: number;
  position: Position;
  country: string;
  levelLabel: string;
  heightCm?: number | null;
  weightKg?: number | null;
  clubSessionsPerWeek?: number | null;
  matchDay?: Weekday | null;
  equipment: Equipment[];
  objective: Objective;
  weakPointNote?: string | null;
  unresolvedPain: { bodyPart: string; note?: string | null }[];
  previousWeek?: PreviousWeekSummary | null;
  sessionCount: number; // 1 (gratuit) à 3 (premium)
  targetWeekDays: Weekday[];
  matchAdjacentDays: Weekday[];
  referenceDate?: Date;
  weekSeed?: number;
  isPremium?: boolean;
}

export interface GenerateProgramResult {
  program: ProgramOutput;
  source: "AI" | "FALLBACK_TEMPLATE";
  rawModelOutput: unknown;
}

type ModelCaller = (system: string, user: string) => Promise<{ text: string; refused: boolean }>;

async function callClaude(system: string, user: string): Promise<{ text: string; refused: boolean }> {
  const client = new Anthropic();
  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 8000,
    system,
    messages: [{ role: "user", content: user }],
  });

  if (response.stop_reason === "refusal") {
    return { text: "", refused: true };
  }

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  return { text: textBlock?.text ?? "", refused: false };
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fenced ? fenced[1] : trimmed;
  return JSON.parse(jsonText);
}

/**
 * Génère le programme hebdomadaire d'un joueur.
 *
 * Garde-fou anti-hallucination: le schéma Zod est construit à partir des
 * SEULS slugs du catalogue déjà filtré pour ce profil — toute réponse IA
 * contenant un slug hors catalogue est rejetée par le parsing lui-même,
 * avant même d'atteindre la validation métier.
 *
 * Ne lève jamais d'exception: en cas d'échec (IA indisponible, sortie
 * invalide deux fois de suite), bascule sur un programme-template
 * déterministe. Le joueur n'a jamais d'écran d'erreur.
 */
export async function generateWeeklyProgram(
  input: GenerateProgramInput,
  options?: { callModel?: ModelCaller }
): Promise<GenerateProgramResult> {
  const callModel = options?.callModel ?? callClaude;
  const referenceDate = input.referenceDate ?? new Date();

  const baseCatalog = filterCatalogForProfile({
    birthYear: input.birthYear,
    position: input.position,
    equipment: input.equipment,
    referenceDate,
    isPremium: input.isPremium,
  });
  const filteredCatalog = excludePainfulAreas(
    baseCatalog,
    input.unresolvedPain.map((p) => p.bodyPart)
  );

  const allowedSlugs = filteredCatalog.map((e) => e.slug);
  const schema = buildProgramSchema(allowedSlugs);
  const catalogBySlug = new Map(EXERCISE_CATALOG.map((e) => [e.slug, e]));

  const ageBand = getAiAgeBand(input.birthYear, referenceDate);
  const systemPrompt = buildSystemPrompt({ ageBand, sessionCount: input.sessionCount });
  const basePrompt = buildUserPrompt({
    firstName: input.firstName,
    position: input.position,
    country: input.country,
    levelLabel: input.levelLabel,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    clubSessionsPerWeek: input.clubSessionsPerWeek,
    matchDay: input.matchDay,
    objective: input.objective,
    weakPointNote: input.weakPointNote,
    unresolvedPain: input.unresolvedPain,
    previousWeek: input.previousWeek,
    filteredCatalog,
    targetWeekDays: input.targetWeekDays,
    matchAdjacentDays: input.matchAdjacentDays,
  });

  const attempt = async (userPrompt: string): Promise<{ program: ProgramOutput; raw: unknown } | null> => {
    try {
      const { text, refused } = await callModel(systemPrompt, userPrompt);
      if (refused || !text) return null;

      const parsedJson = extractJson(text);
      const result = schema.safeParse(parsedJson);
      if (!result.success) return null;

      const businessRules = validateProgramBusinessRules(result.data, {
        catalogBySlug,
        expectedSessionCount: input.sessionCount,
        playerObjective: input.objective,
      });
      if (!businessRules.valid) return null;

      return { program: result.data, raw: parsedJson };
    } catch {
      return null;
    }
  };

  const first = await attempt(basePrompt);
  if (first) {
    return { program: first.program, source: "AI", rawModelOutput: first.raw };
  }

  // Retry unique, avec un rappel explicite des contraintes.
  const retryPrompt = `${basePrompt}\n\nATTENTION: ta précédente réponse était invalide (JSON mal formé, slug hors catalogue, ou règle de composition non respectée). Corrige et renvoie un JSON strictement conforme.`;
  const second = await attempt(retryPrompt);
  if (second) {
    return { program: second.program, source: "AI", rawModelOutput: second.raw };
  }

  // Repli déterministe: jamais d'écran d'erreur pour le joueur.
  const fallback = buildFallbackProgram({
    sessionCount: input.sessionCount,
    targetWeekDays: input.targetWeekDays,
    matchAdjacentDays: input.matchAdjacentDays,
    filteredCatalog,
    objective: input.objective,
    weekSeed: input.weekSeed,
  });

  return { program: fallback, source: "FALLBACK_TEMPLATE", rawModelOutput: null };
}
