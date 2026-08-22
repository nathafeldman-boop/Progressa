"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Equipment, type StatAxis } from "@prisma/client";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { MicroSurveyPrompt } from "@/components/session/MicroSurveyPrompt";
import { PreSessionCheckIn } from "@/components/session/PreSessionCheckIn";
import { BrianMessageCard } from "@/components/brian/BrianMessageCard";
import { BrianAvatar, type BrianState } from "@/components/brian/BrianAvatar";
import { BrianTip } from "@/components/brian/BrianTip";
import { PlayerCardView } from "@/components/card/PlayerCardView";
import type { PlayerCardStats } from "@/lib/player-card";
import { elapsedSeconds, nowMs } from "@/lib/time";
import { EXERCISE_VIDEO } from "@/lib/exercises/exercise-media";
import { EXERCISE_FRAMES } from "@/lib/exercises/exercise-frames";
import { ExerciseFrameViewer } from "@/components/exercises/ExerciseFrameViewer";
import { ExerciseFrameLoop } from "@/components/exercises/ExerciseFrameLoop";
import { EQUIPMENT_LABELS } from "@/lib/labels";

/** Re-render chaque seconde tant que `active` — sert au minuteur en direct. */
function useTicker(active: boolean) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [active]);
}

function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export interface SessionBlockView {
  id: string;
  phase: "WARMUP" | "MAIN" | "COOLDOWN";
  sets: number | null;
  reps: string | null;
  restSeconds: number | null;
  customInstruction: string;
  status: "PLANNED" | "COMPLETED" | "SKIPPED" | "ABANDONED";
  exercise: {
    slug: string;
    name: string;
    emoji: string;
    description: string;
    matchBenefit: string;
    steps: string[];
    commonMistakes: string[];
    easyVariant: string;
    hardVariant: string;
    durationMinutes: number;
    equipment: Equipment[];
    /** Meilleur temps déjà réalisé par le joueur sur cet exercice, toutes séances confondues — null si jamais fait. */
    personalBest: { seconds: number; feltDifficulty: string | null } | null;
  };
}

const PHASE_LABELS: Record<SessionBlockView["phase"], string> = {
  WARMUP: "Échauffement",
  MAIN: "Corps de séance",
  COOLDOWN: "Retour au calme",
};

const PHASE_BADGE_STYLE: Record<SessionBlockView["phase"], string> = {
  WARMUP: "bg-[#fb923c]/15 text-[#c2410c]",
  MAIN: "bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]",
  COOLDOWN: "bg-[#60a5fa]/15 text-[#1d4ed8]",
};

const DIFFICULTY_LABEL_FR: Record<string, string> = {
  VERY_EASY: "très facile",
  EASY: "facile",
  MEDIUM: "moyen",
  HARD: "difficile",
  VERY_HARD: "très difficile",
};

const DIFFICULTY_OPTIONS: { value: "VERY_EASY" | "EASY" | "MEDIUM" | "HARD" | "VERY_HARD"; label: string; color: string }[] = [
  { value: "VERY_EASY", label: "Très facile", color: "#1aa350" },
  { value: "EASY", label: "Facile", color: "#7cc576" },
  { value: "MEDIUM", label: "Moyen", color: "#e0b23f" },
  { value: "HARD", label: "Difficile", color: "#e08a3f" },
  { value: "VERY_HARD", label: "Très difficile", color: "#c23b3b" },
];

/** Le ressenti de difficulté ajuste directement la génération suivante — mis en valeur pour que le joueur prenne cette question au sérieux. */
function RatingCard({ onRate }: { onRate: (v: string) => void }) {
  return (
    <div className="mt-3 rounded-[var(--radius-card)] border-2 border-[var(--color-primary)] bg-[var(--color-primary-soft)] p-4">
      <div className="flex items-start gap-2">
        <BrianAvatar state="talking" size={36} />
        <p className="text-sm font-semibold text-[var(--color-text)]">
          Sois honnête sur ce ressenti — c&apos;est ce qui me permet d&apos;ajuster tes prochaines séances et de vraiment
          te faire progresser.
        </p>
      </div>
      <p className="mt-3 text-center text-sm font-extrabold uppercase tracking-wide text-[var(--color-primary-strong)]">
        Comment tu as trouvé l&apos;exercice ?
      </p>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {DIFFICULTY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onRate(opt.value)}
            className="rounded-[var(--radius-control)] px-1 py-2 text-center text-[0.65rem] font-bold leading-tight text-white"
            style={{ background: opt.color }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

type BlockPhaseState = "idle" | "active" | "rating" | "done";

interface BlockLocalState {
  phase: BlockPhaseState;
  startedAt: number | null;
  reaction: { category: string; text: string; deltas: Partial<Record<StatAxis, number>>; isPersonalRecord?: boolean } | null;
  /** L'utilisateur a vu le retour de Brian et appuyé sur "Suivant" — sans
   * ça, dès qu'un bloc passe à "done" on sauterait directement au suivant
   * sans jamais laisser le temps de lire la réaction. */
  advanced: boolean;
}

function initialStateFor(block: SessionBlockView): BlockLocalState {
  return {
    phase: block.status === "PLANNED" ? "idle" : "done",
    startedAt: null,
    reaction: null,
    advanced: block.status !== "PLANNED",
  };
}

const BRIAN_STATE_FOR_PHASE: Record<BlockPhaseState, BrianState> = {
  idle: "idle",
  active: "talking",
  rating: "talking",
  done: "encouraging",
};

export function SessionPlayer({
  sessionId,
  title,
  chips,
  blocks,
  alreadyCompleted,
  showPremiumBanner,
  defaultEquipment,
}: {
  sessionId: string;
  title: string;
  chips: string[];
  blocks: SessionBlockView[];
  alreadyCompleted: boolean;
  showPremiumBanner: boolean;
  defaultEquipment: Equipment[];
}) {
  const router = useRouter();
  // Toujours demandé avant la première séance, sauf en lecture seule
  // (séance déjà terminée qu'on ne fait que consulter).
  const [checkedIn, setCheckedIn] = useState(alreadyCompleted);
  const [todayEquipment, setTodayEquipment] = useState<Equipment[]>(defaultEquipment);
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
    if (data) updateBlock(blockId, { reaction: { ...data.brianMessage, deltas: data.deltas, isPersonalRecord: data.isPersonalRecord } });
  }

  function advanceToNext(blockId: string) {
    updateBlock(blockId, { advanced: true });
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
        question: "Comment as-tu connu Progressa ?",
        options: ["Un ami", "Réseaux sociaux", "Mon club", "Recherche Google", "Autre"],
      });
    } else if (showPremiumBanner && (totalCompleted === 2 || totalCompleted === 3)) {
      setPendingSurvey({
        surveyKey: "pourquoi_pas_premium",
        question: "Pourquoi Premium ne t'intéresse pas (pour l'instant) ?",
        options: ["Trop cher", "Je veux tester encore", "Pas convaincu par l'utilité", "Je dois y réfléchir"],
      });
    } else {
      goToDashboard();
    }
  }

  if (!checkedIn) {
    return (
      <PreSessionCheckIn
        defaultEquipment={defaultEquipment}
        onConfirm={(equipment) => {
          setTodayEquipment(equipment);
          setCheckedIn(true);
        }}
      />
    );
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

  // Vue historique (séance déjà terminée): liste classique, lecture seule.
  if (alreadyCompleted) {
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

        {blocks.map((block) => {
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
      </div>
    );
  }

  // Un exercice à la fois, plein écran — currentIndex pointe le premier
  // bloc pas encore terminé, ou pas encore "acquitté" (Brian pas encore lu).
  const currentIndex = blocks.findIndex((b) => {
    const s = blockStates[b.id];
    return s.phase !== "done" || !s.advanced;
  });

  if (currentIndex !== -1) {
    const block = blocks[currentIndex];
    return (
      <ActiveExerciseScreen
        key={block.id}
        block={block}
        index={currentIndex}
        total={blocks.length}
        state={blockStates[block.id]}
        todayEquipment={todayEquipment}
        variant={expandedVariant[block.id] ?? null}
        onSetVariant={(v) => setExpandedVariant((prev) => ({ ...prev, [block.id]: prev[block.id] === v ? null : v }))}
        onSkip={() => skipBlock(block.id)}
        onStart={() => startBlock(block.id)}
        onAbandon={() => abandonBlock(block.id)}
        onFinish={() => finishBlock(block.id)}
        onRate={(v) => submitBlockDifficulty(block.id, v)}
        onNext={() => advanceToNext(block.id)}
        onQuit={() => router.push("/dashboard")}
      />
    );
  }

  // Tous les exercices sont faits: ressenti global de la séance.
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
    </div>
  );
}

/**
 * Un exercice, plein écran (section 6.3: "un par un, avec minuteur et
 * visuel à côté de Coach Brian"). La zone visuelle est un emplacement prêt
 * à recevoir photo/vidéo de démonstration par exercice (pas encore fourni)
 * — l'emoji sert de repli en attendant.
 */
function ActiveExerciseScreen({
  block,
  index,
  total,
  state,
  todayEquipment,
  variant,
  onSetVariant,
  onSkip,
  onStart,
  onAbandon,
  onFinish,
  onRate,
  onNext,
  onQuit,
}: {
  block: SessionBlockView;
  index: number;
  total: number;
  state: BlockLocalState;
  todayEquipment: Equipment[];
  variant: "easy" | "hard" | null;
  onSetVariant: (v: "easy" | "hard") => void;
  onSkip: () => void;
  onStart: () => void;
  onAbandon: () => void;
  onFinish: () => void;
  onRate: (v: string) => void;
  onNext: () => void;
  onQuit: () => void;
}) {
  useTicker(state.phase === "active");
  const elapsed = state.phase === "active" ? (elapsedSeconds(state.startedAt) ?? 0) : 0;
  // Les poses Coach Brian générées par IA priment toujours quand elles
  // existent pour cet exercice — la vidéo Pexels ne sert que de repli pour
  // les exercices sans pose IA (voir scripts/videos/).
  const frames = EXERCISE_FRAMES[block.exercise.slug];
  // Les plots ne sont jamais un vrai blocage: si le joueur a dit ne pas en
  // avoir aujourd'hui (check-in avant séance) et que cet exercice en
  // utilise, on propose une substitution plutôt que de le laisser deviner.
  const needsSubstituteCones =
    block.exercise.equipment.includes(Equipment.CONES) && !todayEquipment.includes(Equipment.CONES);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[var(--color-bg)] [padding-top:env(safe-area-inset-top)] [padding-bottom:env(safe-area-inset-bottom)]">
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
        <button
          type="button"
          onClick={onQuit}
          aria-label="Quitter la séance"
          className="text-xl text-[var(--color-text-muted)]"
        >
          ✕
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wide ${PHASE_BADGE_STYLE[block.phase]}`}
            >
              {PHASE_LABELS[block.phase]}
            </span>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Exercice {index + 1}/{total}
            </p>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-[width]"
              style={{ width: `${((index + (state.phase === "done" ? 1 : 0)) / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {state.phase === "idle" && !frames && (
          <BrianTip
            tipKey="seance-exercice-intro"
            text="Un exercice à la fois, plein écran. Clique sur Commencer pour lancer le chrono, puis Terminé quand tu as fini — tu pourras noter la difficulté juste après."
          />
        )}
        {state.phase === "idle" && frames ? (
          <div className="mx-auto mt-3 w-full">
            <ExerciseFrameViewer sequence={frames} onReady={onStart} />
            <button
              type="button"
              onClick={onSkip}
              className="mx-auto mt-3 block text-xs font-semibold text-[var(--color-text-muted)] underline"
            >
              Passer cet exercice
            </button>
          </div>
        ) : (
          <div className="relative mx-auto mt-3 h-[62vh] min-h-[420px] w-full overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]">
            {frames ? (
              <ExerciseFrameLoop sequence={frames} />
            ) : EXERCISE_VIDEO[block.exercise.slug] ? (
              <video
                key={block.exercise.slug}
                poster={EXERCISE_VIDEO[block.exercise.slug]!.replace(/\.mp4$/, "-poster.jpg")}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src={EXERCISE_VIDEO[block.exercise.slug]!.replace(/\.mp4$/, ".webm")} type="video/webm" />
                <source src={EXERCISE_VIDEO[block.exercise.slug]} type="video/mp4" />
              </video>
            ) : (
              <div className="flex h-full items-center justify-center text-8xl">{block.exercise.emoji}</div>
            )}
            {!frames && EXERCISE_VIDEO[block.exercise.slug] && (
              <a
                href="https://www.pexels.com"
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-2 left-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white/80"
              >
                Vidéo : Pexels
              </a>
            )}
            <div className="absolute bottom-2 right-2">
              <BrianAvatar state={BRIAN_STATE_FOR_PHASE[state.phase]} size={56} className="ring-2 ring-[var(--color-surface)]" />
            </div>
            {state.phase === "active" && (
              <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-[var(--color-text)]/85 px-4 py-1.5 font-display text-2xl font-extrabold tabular-nums text-white">
                {formatMmSs(elapsed)}
              </div>
            )}
          </div>
        )}

        {state.phase === "rating" && <RatingCard onRate={onRate} />}

        <CardTitle className="mt-4 text-center text-xl">
          {block.exercise.emoji} {block.exercise.name}
        </CardTitle>
        <p className="mt-2 text-center text-sm text-[var(--color-text)]">{block.customInstruction}</p>
        <p className="mt-2 text-center text-xs italic text-[var(--color-text-muted)]">{block.exercise.matchBenefit}</p>
        {needsSubstituteCones && (
          <p className="mx-auto mt-2 max-w-xs text-center text-xs font-semibold text-[var(--color-primary-strong)]">
            💡 Pas de {EQUIPMENT_LABELS.CONES.toLowerCase()} ? Remplace-les par des chaussettes roulées, un sac ou une
            bouteille au sol.
          </p>
        )}

        {state.phase === "idle" && block.exercise.steps.length > 0 && (
          <Card className="mt-4 text-left">
            <CardSubtitle>Comment faire, étape par étape</CardSubtitle>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-[var(--color-text)]">
              {block.exercise.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </Card>
        )}

        <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm font-semibold text-[var(--color-text-muted)]">
          {block.sets && <span>{block.sets} séries</span>}
          {block.reps && <span>· {block.reps}</span>}
          {block.restSeconds ? <span>· {block.restSeconds}s repos</span> : null}
          <span>· ~{block.exercise.durationMinutes} min</span>
        </div>

        {block.exercise.personalBest && state.phase !== "done" && (
          <p className="mt-2 text-center text-xs font-semibold text-[var(--color-primary-strong)]">
            🏆 Ton record : {formatMmSs(block.exercise.personalBest.seconds)}
            {block.exercise.personalBest.feltDifficulty
              ? ` (${DIFFICULTY_LABEL_FR[block.exercise.personalBest.feltDifficulty] ?? block.exercise.personalBest.feltDifficulty})`
              : ""}{" "}
            — à toi de le battre.
          </p>
        )}

        <div className="mt-3 flex justify-center gap-2">
          <button type="button" onClick={() => onSetVariant("easy")} className="text-xs font-semibold text-[var(--color-primary-strong)] underline">
            Variante facile
          </button>
          <button type="button" onClick={() => onSetVariant("hard")} className="text-xs font-semibold text-[var(--color-primary-strong)] underline">
            Variante difficile
          </button>
        </div>
        {variant === "easy" && <p className="mt-2 text-center text-sm text-[var(--color-text-muted)]">{block.exercise.easyVariant}</p>}
        {variant === "hard" && <p className="mt-2 text-center text-sm text-[var(--color-text-muted)]">{block.exercise.hardVariant}</p>}

        {state.phase === "done" && state.reaction?.isPersonalRecord && (
          <div className="mt-5 animate-[pulse_1.6s_ease-in-out_2] rounded-[var(--radius-control)] border-2 border-[var(--color-primary)] bg-[var(--color-primary-soft)] p-3 text-center">
            <p className="font-display text-base font-extrabold uppercase tracking-wide text-[var(--color-primary-strong)]">
              🏆 Nouveau record personnel !
            </p>
          </div>
        )}

        {state.phase === "done" && state.reaction && (
          <BrianMessageCard
            category={state.reaction.category}
            text={state.reaction.text}
            deltas={state.reaction.deltas}
            className="mt-5 border-none bg-[var(--color-surface-alt)] p-3 shadow-none"
          />
        )}
      </div>

      <div className="border-t border-[var(--color-border)] p-4">
        {state.phase === "idle" && !frames && (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onSkip}>
              Passer
            </Button>
            <Button className="flex-1" onClick={onStart}>
              Commencer
            </Button>
          </div>
        )}
        {state.phase === "active" && (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onAbandon}>
              Abandonner
            </Button>
            <Button className="flex-1" onClick={onFinish}>
              Terminé
            </Button>
          </div>
        )}
        {state.phase === "done" && (
          <Button className="w-full" onClick={onNext}>
            {index + 1 < total ? "Suivant →" : "Continuer"}
          </Button>
        )}
      </div>
    </div>
  );
}
