"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";

export interface SessionBlockView {
  id: string;
  phase: "WARMUP" | "MAIN" | "COOLDOWN";
  sets: number | null;
  reps: string | null;
  restSeconds: number | null;
  customInstruction: string;
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

  async function complete() {
    if (!difficulty) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficultyRating: difficulty, recoveryNote: recoveryNote || undefined }),
      });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
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
          </Card>
        );
      })}

      {!alreadyCompleted && (
        <Card>
          <CardTitle>Comment c&apos;était ?</CardTitle>
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
