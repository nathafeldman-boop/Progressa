import { prisma } from "@/lib/prisma";
import { getMistralClient } from "@/lib/ai/mistral-client";
import { STAT_AXES, STAT_LABELS } from "./types";
import { computeOverall, rankTierForOverall } from "./stats-engine";
import { POSITION_LABELS } from "@/lib/labels";

const FALLBACK_NO_KEY =
  "La discussion libre avec Coach Brian n'est pas encore activée sur ce serveur. En attendant, utilise les questions rapides ci-dessous — j'ai de vraies réponses calculées sur tes données.";

const FALLBACK_ERROR =
  "Je n'arrive pas à te répondre là tout de suite. Réessaie dans un instant, ou utilise une question rapide ci-dessous.";

export interface CoachChatTurn {
  role: "user" | "assistant";
  text: string;
}

/**
 * Construit le contexte factuel envoyé au modèle: uniquement des données
 * réelles du joueur (jamais de valeurs inventées), pour que Brian réponde
 * en connaissant vraiment l'historique et les stats de l'utilisateur.
 */
async function buildPlayerContext(userId: string): Promise<string> {
  const [profile, statState, streak, completedTotal, completedThisWeek] = await Promise.all([
    prisma.playerProfile.findUnique({ where: { userId } }),
    prisma.playerStatState.findUnique({ where: { userId } }),
    prisma.streakState.findUnique({ where: { userId } }),
    prisma.programSession.count({ where: { status: "COMPLETED", weeklyProgram: { userId } } }),
    prisma.programSession.count({
      where: {
        status: "COMPLETED",
        completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        weeklyProgram: { userId },
      },
    }),
  ]);

  const lines: string[] = [];
  if (profile) {
    lines.push(`Poste: ${POSITION_LABELS[profile.position]}. Niveau: ${profile.levelLabel}. Pays: ${profile.country}.`);
  }

  if (statState) {
    const values: Record<string, number> = {
      VITESSE: statState.vitesse,
      TIR: statState.tir,
      PASSE: statState.passe,
      CONDUITE: statState.conduite,
      DEFENSE: statState.defense,
      PHYSIQUE: statState.physique,
    };
    const overall = computeOverall(values as never);
    const tier = rankTierForOverall(overall);
    const statsLine = STAT_AXES.map((axis) => `${STAT_LABELS[axis]}: ${values[axis]}`).join(", ");
    const sorted = [...STAT_AXES].sort((a, b) => values[b] - values[a]);
    lines.push(`Note générale: ${overall}/100, rang ${tier.label}.`);
    lines.push(`Stats détaillées — ${statsLine}.`);
    lines.push(`Point fort: ${STAT_LABELS[sorted[0]]}. Point faible: ${STAT_LABELS[sorted[sorted.length - 1]]}.`);
  } else {
    lines.push("Le joueur n'a pas encore de stats enregistrées (aucun test ni séance terminée).");
  }

  lines.push(`Séances terminées au total: ${completedTotal}. Cette semaine: ${completedThisWeek}.`);
  lines.push(`Série actuelle (jours consécutifs): ${streak?.currentStreak ?? 0}.`);

  return lines.join("\n");
}

const SYSTEM_PROMPT = `Tu es Coach Brian, le coach virtuel de l'application Progressa (entraînement de football pour jeunes joueurs).
Ta personnalité: motivant, direct, crédible. Jamais de faux compliment excessif, jamais infantilisant. L'honnêteté d'abord.
Règles strictes:
- Réponds uniquement en français, en 1 à 4 phrases courtes, ton oral et naturel.
- Utilise UNIQUEMENT les données du joueur fournies ci-dessous. N'invente jamais un chiffre, une séance ou une statistique qui n'est pas donnée.
- Si tu n'as pas l'information pour répondre précisément, dis-le honnêtement et propose ce que le joueur peut faire (ex: passer un test, terminer une séance).
- Reste toujours dans le cadre du football, de l'entraînement sportif et de l'application Progressa. Si la question sort de ce cadre, ramène poliment la conversation vers l'entraînement.
- Ne donne jamais de conseil médical précis (blessure, douleur) au-delà de "repose-toi et consulte un professionnel si ça persiste".`;

export async function answerFreeQuestion(
  userId: string,
  firstName: string,
  message: string,
  history: CoachChatTurn[]
): Promise<string> {
  const client = getMistralClient();
  if (!client) return FALLBACK_NO_KEY;

  const context = await buildPlayerContext(userId);

  const messages = [
    { role: "system" as const, content: `${SYSTEM_PROMPT}\n\nDonnées réelles du joueur (${firstName}):\n${context}` },
    ...history.slice(-8).map((turn) => ({ role: turn.role, content: turn.text })),
    { role: "user" as const, content: message },
  ];

  try {
    const response = await client.chat.complete({
      model: "mistral-small-latest",
      messages,
      maxTokens: 300,
      temperature: 0.6,
    });
    const text = response.choices?.[0]?.message?.content;
    if (typeof text === "string" && text.trim()) return text.trim();
    return FALLBACK_ERROR;
  } catch (err) {
    console.error("[coach-chat] Mistral call failed", err);
    return FALLBACK_ERROR;
  }
}
