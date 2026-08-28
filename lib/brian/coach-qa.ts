import { prisma } from "@/lib/prisma";
import { STAT_AXES, STAT_LABELS } from "./types";
import { rankTierForOverall, RANK_TIERS } from "./stats-engine";
import { getPlayerCardStats } from "@/lib/player-card";

/**
 * Questions rapides du Coach: pas de conversation libre (aucun LLM branché
 * pour l'instant — voir le commentaire d'extension dans messages.ts), mais
 * de vraies réponses calculées à partir des données du joueur, jamais un
 * texte générique. Étendre QUICK_QUESTIONS est le seul endroit à toucher
 * pour ajouter une question.
 */
export interface QuickQuestion {
  key: string;
  label: string;
}

export const QUICK_QUESTIONS: QuickQuestion[] = [
  { key: "progression", label: "Comment je progresse ?" },
  { key: "point_fort_faible", label: "Mes points forts et faibles ?" },
  { key: "semaine", label: "Mon activité cette semaine ?" },
  { key: "prochain_rang", label: "Je suis à combien du prochain rang ?" },
];

function axisFieldValue(stats: Record<string, number>, axis: (typeof STAT_AXES)[number]): number {
  return stats[axis] ?? 0;
}

export async function answerQuickQuestion(userId: string, questionKey: string): Promise<string> {
  // Lue depuis PlayerCard (même valeur que celle affichée sur la carte),
  // jamais recalculée à partir des stats brutes seules — voir coach-chat.ts.
  const cardStats = await getPlayerCardStats(userId);

  if (!cardStats) {
    return "Tu n'as pas encore de stats enregistrées — termine ta première séance et reviens me poser la question, j'aurai de quoi te répondre.";
  }

  const values: Record<string, number> = {};
  for (const axis of STAT_AXES) values[axis] = cardStats.skills[STAT_LABELS[axis]] ?? 0;
  const overall = cardStats.overall;

  switch (questionKey) {
    case "progression": {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentDeltas = await prisma.statDelta.findMany({ where: { userId, createdAt: { gte: since } } });
      const totalGain = recentDeltas.reduce((sum, d) => sum + d.delta, 0);
      if (totalGain <= 0) {
        return "Pas encore de progression mesurée sur les 30 derniers jours — enchaîne quelques séances et je pourrai te donner un vrai chiffre.";
      }
      const tier = rankTierForOverall(overall);
      return `Sur les 30 derniers jours, tu as gagné ${totalGain} point${totalGain > 1 ? "s" : ""} cumulés sur l'ensemble de tes stats. Ta note générale est à ${overall} — rang ${tier.label}.`;
    }

    case "point_fort_faible": {
      const sorted = [...STAT_AXES].sort((a, b) => axisFieldValue(values, b) - axisFieldValue(values, a));
      const strongest = sorted[0];
      const weakest = sorted[sorted.length - 1];
      if (axisFieldValue(values, strongest) === axisFieldValue(values, weakest)) {
        return "Tes stats sont encore très proches les unes des autres — pas de point fort ou faible marqué pour l'instant, ça va se dessiner avec plus de séances.";
      }
      return `Ton point fort en ce moment : ${STAT_LABELS[strongest]} (${axisFieldValue(values, strongest)}). Ton axe à travailler en priorité : ${STAT_LABELS[weakest]} (${axisFieldValue(values, weakest)}).`;
    }

    case "semaine": {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const completedThisWeek = await prisma.programSession.count({
        where: { status: "COMPLETED", completedAt: { gte: weekAgo }, weeklyProgram: { userId } },
      });
      if (completedThisWeek === 0) {
        return "Aucune séance terminée cette semaine pour l'instant. C'est le moment de t'y remettre — je t'ai préparé un programme.";
      }
      return `${completedThisWeek} séance${completedThisWeek > 1 ? "s" : ""} terminée${completedThisWeek > 1 ? "s" : ""} cette semaine. Continue sur cette lancée.`;
    }

    case "prochain_rang": {
      const currentTier = rankTierForOverall(overall);
      const currentIndex = RANK_TIERS.findIndex((t) => t.key === currentTier.key);
      const nextTier = currentIndex > 0 ? RANK_TIERS[currentIndex - 1] : null;
      if (!nextTier) {
        return `Tu es déjà au rang le plus haut : ${currentTier.label}. Continue à t'entraîner pour garder ton niveau.`;
      }
      const pointsNeeded = nextTier.min - overall;
      return `Tu es ${currentTier.label} avec ${overall} de note générale. Il te manque ${pointsNeeded} point${pointsNeeded > 1 ? "s" : ""} pour passer ${nextTier.label}.`;
    }

    default:
      return "Je n'ai pas encore de réponse pour cette question.";
  }
}
