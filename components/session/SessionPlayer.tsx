"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StatAxis } from "@prisma/client";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { MicroSurveyPrompt } from "@/components/session/MicroSurveyPrompt";
import { BrianMessageCard } from "@/components/brian/BrianMessageCard";
import { PlayerCardView } from "@/components/card/PlayerCardView";
import type { PlayerCardStats } from "@/lib/player-card";
import { elapsedSeconds, nowMs } from "@/lib/time";

export interface SessionBlockView {
  id: string;
  phase: "WARMUP" | "MAIN" | "COOLDOWN";
  sets: number | null;
  reps: string | null;
  restSeconds: number | null;
  customInstruction: string;
  status: "PLANNED" | "COMPLETED" | "SKIPPED" | "ABANDONED";
  exercise: {
    name: string;
    emoji: string;
    description: string;
    matchBenefit: string;
    steps: string[];
    commonMistakes: string[];
    easyVariant: string;
    hardVariant: string;
    durationMinutes: number;
  };
}

const PHASE_LABELS: Record<SessionBlockView["phase"], string> = {
  WARMUP: "Échauffement",
  MAIN: "Corps de séance",
  COOLDOWN: "Retour au calme",
};

const DIFFICULTY_OPTIONS: { value: "VERY_EASY" | "EASY" | "MEDIUM" | "HARD" | "VERY_HARD"; label: string }[] = [
  { value: "VERY_EASY", label: "Très facile" },
  { value: "EASY", label: "Facile" },
  { value: "MEDIUM", label: "Moyen" },
  { value: "HARD", label: "Difficile" },
  { value: "VERY_HARD", label: "Très difficile" },
];

type BlockPhaseState = "idle" | "active" | "rating" | "done";

interface BlockLocalState {
  phase: BlockPhaseState;
  startedAt: number | null;
  reaction: { category: string; text: string; deltas: Partial<Record<StatAxis, number>> } | null;
}

function initialStateFor(block: SessionBlockView): BlockLocalState {
  return { phase: block.status === "PLANNED" ? "idle" : "done", startedAt: null, reaction: null };
}

export function SessionPlayer({
  sessionId,
  title,
  chips,
  blocks,
  alreadyCompleted,
  showPremiumBanner,
}: {
  sessionId: string;
  title: string;
  chips: string[];
  blocks: SessionBlockView[];
  alreadyCompleted: boolean;
  showPremiumBanner: boolean;
}) {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [recoveryNote, setRecoveryNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedVariant, setExpandedVariant] = useState<Record<string, "easy" | "hard" | null>>({});
  const [pendingSurvey, setPendingSurvey] = useState<{ surveyKey: string; question: string; options: string[] } | null>(null);
  const [blockStates, setBlockStates] = useState<Record<string, BlockLocalState>>(() =>
    Object.fromEntries(blocks.map((b) => [b.id, initialStateFor(b)]))
  );
  const [sessionSummary, setSessionSummary] = useState<{
    text: string;
    deltas: Partial<Record<StatAxis, number>>;
    totalCompleted: number | undefined;
    overallBefore: number;
    overallAfter: number;
    rankedUp: boolean;
    rankTierAfter: string;
    card: PlayerCardStats | null;
    firstName: string;
    positionLabel: string;
  } | null>(null);

  function updateBlock(id: string, patch: Partial<BlockLocalState>) {
    setBlockStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  async function postTelemetry(
    blockId: string,
    body: { status: "COMPLETED" | "SKIPPED" | "ABANDONED"; feltDifficulty?: string | null; actualDurationSeconds?: number | null }
  ) {
    const res = await fetch(`/api/sessions/${sessionId}/blocks/${blockId}/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return res.json();
  }

  function startBlock(blockId: string) {
    updateBlock(blockId, { phase: "active", startedAt: nowMs() });
  }

  async function skipBlock(blockId: string) {
    updateBlock(blockId, { phase: "done" });
    const data = await postTelemetry(blockId, { status: "SKIPPED" });
    if (data) updateBlock(blockId, { reaction: { ...data.brianMessage, deltas: data.deltas } });
  }

  async function abandonBlock(blockId: string) {
    const actualDurationSeconds = elapsedSeconds(blockStates[blockId]?.startedAt ?? null);
    updateBlock(blockId, { phase: "done" });
    const data = await postTelemetry(blockId, { status: "ABANDONED", actualDurationSeconds });
    if (data) updateBlock(blockId, { reaction: { ...data.brianMessage, deltas: data.deltas } });
  }

  function finishBlock(blockId: string) {
    updateBlock(blockId, { phase: "rating" });
  }

  async function submitBlockDifficulty(blockId: string, feltDifficulty: string) {
    const actualDurationSeconds = elapsedSeconds(blockStates[blockId]?.startedAt ?? null);
    updateBlock(blockId, { phase: "done" });
    const data = await postTelemetry(blockId, { status: "COMPLETED", feltDifficulty, actualDurationSeconds });
    if (data) updateBlock(blockId, { reaction: { ...data.brianMessage, deltas: data.deltas } });
  }

  function goToDashboard() {
    router.push("/dashboard");
    router.refresh();
  }

  async function complete() {
    if (!difficulty) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficultyRating: difficulty, recoveryNote: recoveryNote || undefined }),
      });
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      const totalCompleted: number | undefined = data.totalCompleted;
      if (data.summary) {
        setSessionSummary({
          text: data.summary.brianMessage.text,
          deltas: data.summary.totalDeltas,
          totalCompleted,
          overallBefore: data.summary.overallBefore,
          overallAfter: data.summary.overallAfter,
          rankedUp: data.summary.rankedUp,
          rankTierAfter: data.summary.rankTierAfter,
          card: data.card ?? null,
          firstName: data.firstName ?? "",
          positionLabel: data.positionLabel ?? "",
        });
        return;
      }

      continueAfterCompletion(totalCompleted);
    } finally {
      setSubmitting(false);
    }
  }

  function continueAfterCompletion(totalCompleted: number | undefined) {
    if (totalCompleted === 1) {
      setPendingSurvey({
        surveyKey: "comment_connu",
        question: "Comment as-tu connu [APP] ?",
        options: ["Un ami", "Réseaux sociaux", "Mon club", "Recherche Google", "Autre"],
      });
    } else if (showPremiumBanner && (totalCompleted === 2 || totalCompleted === 3)) {
      setPendingSurvey({
        surveyKey: "pourquoi_pas_premium",
        question: "Pourquoi Premium ne t'intéresse pas (pour l'instant) ?",
        options: ["Trop cher", "Je veux tester encore", "Pas convaincu par l'utilité", "Je vais demander à mes parents"],
      });
    } else {
      goToDashboard();
    }
  }

  if (pendingSurvey) {
    return (
      <div className="mx-auto max-w-md p-4">
        <MicroSurveyPrompt {...pendingSurvey} onDone={goToDashboard} />
      </div>
    );
  }

  if (sessionSummary) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary-strong)]">
            Entraînement terminé
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold uppercase tracking-wide">Bilan de la séance</h1>
        </div>

        <BrianMessageCard category="SESSION_SUMMARY" text={sessionSummary.text} deltas={sessionSummary.deltas} />

        {sessionSummary.card && (
          <div className="space-y-3">
            {sessionSummary.rankedUp && (
              <div className="animate-[pulse_1.6s_ease-in-out_2] rounded-[var(--radius-control)] border border-[var(--color-primary)] bg-[var(--color-primary-soft)] p-3 text-center text-sm font-bold text-[var(--color-primary-strong)]">
                🎉 Nouveau rang débloqué : {sessionSummary.rankTierAfter} !
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm font-semibold text-[var(--color-text-muted)]">Note générale</span>
              <span className="font-display text-lg font-extrabold text-[var(--color-primary-strong)]">
                {sessionSummary.overallBefore} → {sessionSummary.overallAfter}
              </span>
            </div>
            <PlayerCardView
              firstName={sessionSummary.firstName}
              positionLabel={sessionSummary.positionLabel}
              ageCategoryLabel={null}
              stats={sessionSummary.card}
              animateFromOverall={sessionSummary.overallBefore}
            />
          </div>
        )}

        <Button className="w-full" onClick={() => continueAfterCompletion(sessionSummary.totalCompleted)}>
          Voir mon tableau de bord
        </Button>
      </div>
    );
  }

  async function skip() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/skip`, { method: "POST" });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">{title}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          {chips.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </div>
      </div>

      {showPremiumBanner && (
        <Card className="border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-sm">
          <p className="font-semibold text-[var(--color-primary-strong)]">
            ⭐ Passe Premium pour un programme 100% personnalisé, jusqu&apos;à 3 séances/semaine et la bibliothèque complète.
          </p>
        </Card>
      )}

      {blocks.map((block) => {
        const variant = expandedVariant[block.id] ?? null;
        const state = blockStates[block.id];

        return (
          <Card key={block.id}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {PHASE_LABELS[block.phase]}
            </p>
            <CardTitle className="mt-1">
              {block.exercise.emoji} {block.exercise.name}
            </CardTitle>
            <p className="mt-2 text-sm text-[var(--color-text)]">{block.customInstruction}</p>
            <p className="mt-2 text-xs italic text-[var(--color-text-muted)]">{block.exercise.matchBenefit}</p>

            <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-[var(--color-text-muted)]">
              {block.sets && <span>{block.sets} séries</span>}
              {block.reps && <span>· {block.reps}</span>}
              {block.restSeconds ? <span>· {block.restSeconds}s repos</span> : null}
              <span>· ~{block.exercise.durationMinutes} min</span>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setExpandedVariant((prev) => ({ ...prev, [block.id]: variant === "easy" ? null : "easy" }))}
                className="text-xs font-semibold text-[var(--color-primary-strong)] underline"
              >
                Variante facile
              </button>
              <button
                type="button"
                onClick={() => setExpandedVariant((prev) => ({ ...prev, [block.id]: variant === "hard" ? null : "hard" }))}
                className="text-xs font-semibold text-[var(--color-primary-strong)] underline"
              >
                Variante difficile
              </button>
            </div>
            {variant === "easy" && <p className="mt-2 text-sm text-[var(--color-text-muted)]">{block.exercise.easyVariant}</p>}
            {variant === "hard" && <p className="mt-2 text-sm text-[var(--color-text-muted)]">{block.exercise.hardVariant}</p>}

            {!alreadyCompleted && state?.phase === "idle" && (
              <div className="mt-4 flex gap-2 border-t border-[var(--color-border)] pt-4">
                <Button variant="ghost" onClick={() => skipBlock(block.id)}>
                  Passer
                </Button>
                <Button className="flex-1" onClick={() => startBlock(block.id)}>
                  Commencer
                </Button>
              </div>
            )}

            {!alreadyCompleted && state?.phase === "active" && (
              <div className="mt-4 flex gap-2 border-t border-[var(--color-border)] pt-4">
                <Button variant="ghost" onClick={() => abandonBlock(block.id)}>
                  Abandonner
                </Button>
                <Button className="flex-1" onClick={() => finishBlock(block.id)}>
                  Terminé
                </Button>
              </div>
            )}

            {!alreadyCompleted && state?.phase === "rating" && (
              <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                <p className="text-sm font-semibold">Comment tu as trouvé l&apos;exercice ?</p>
                <div className="mt-2 grid grid-cols-5 gap-1">
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => submitBlockDifficulty(block.id, opt.value)}
                      className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-1 py-2 text-center text-[0.65rem] font-semibold leading-tight hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {state?.phase === "done" && state.reaction && (
              <BrianMessageCard
                category={state.reaction.category}
                text={state.reaction.text}
                deltas={state.reaction.deltas}
                className="mt-4 border-none bg-[var(--color-surface-alt)] p-3 shadow-none"
              />
            )}
          </Card>
        );
      })}

      {!alreadyCompleted && (
        <Card>
          <CardTitle>Comment c&apos;était, dans l&apos;ensemble ?</CardTitle>
          <CardSubtitle className="mt-1">Ton ressenti ajuste le programme de la semaine prochaine.</CardSubtitle>
          <div className="mt-3 flex justify-between gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setDifficulty(n)}
                className={`flex-1 rounded-[var(--radius-control)] border py-3 text-sm font-bold ${
                  difficulty === n
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
                    : "border-[var(--color-border)]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">1 = facile · 5 = très difficile</p>

          <textarea
            className="mt-4 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm"
            placeholder="Note de récupération (facultatif)"
            value={recoveryNote}
            onChange={(e) => setRecoveryNote(e.target.value)}
            maxLength={300}
          />

          <div className="mt-4 flex gap-2">
            <Button variant="ghost" onClick={skip} disabled={submitting}>
              Passer cette séance
            </Button>
            <Button className="flex-1" onClick={complete} disabled={!difficulty || submitting}>
              {submitting ? "..." : "Terminer la séance"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
