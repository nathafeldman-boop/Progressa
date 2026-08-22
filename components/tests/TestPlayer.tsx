"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { BrianTip } from "@/components/brian/BrianTip";
import { ConeTimer } from "@/components/tests/ConeTimer";
import { composeTestFlowIntro } from "@/lib/brian/messages";
import { elapsedSeconds, nowMs } from "@/lib/time";
import { EXERCISE_FRAMES } from "@/lib/exercises/exercise-frames";
import { ExerciseFrameViewer } from "@/components/exercises/ExerciseFrameViewer";

/** Test d'évaluation -> même séquence de poses Coach Brian que l'exercice équivalent en séance, quand elle existe. */
const TEST_FRAMES_SLUG: Partial<Record<string, string>> = {
  JUGGLING: "jonglages-progressifs",
  PLANK: "gainage-planche-ventrale",
  TIR_PRECISION: "frappe-enroulee-cible",
  PASSE_PRECISION: "passes-mur-controle",
};

export interface TestFlowEntry {
  type: string;
  name: string;
  unit: string;
  lowerIsBetter: boolean;
  protocol: string[];
  lastValue: number | null;
  locked: boolean;
  eligibleAtLabel: string | null;
}

function useTicker(active: boolean) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [active]);
}

const REST_SECONDS = 30;

export function TestPlayer({
  tests,
  firstName,
  isFirstTime = false,
}: {
  tests: TestFlowEntry[];
  firstName: string;
  isFirstTime?: boolean;
}) {
  const router = useRouter();
  const eligible = tests.filter((t) => !t.locked);
  const locked = tests.filter((t) => t.locked);

  const [screen, setScreen] = useState<"intro" | "test" | "rest" | "done">(eligible.length > 0 ? "intro" : "done");
  const [testIndex, setTestIndex] = useState(0);
  const [timerPhase, setTimerPhase] = useState<"idle" | "running" | "stopped">("idle");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [frozenSeconds, setFrozenSeconds] = useState(0);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restStartedAt, setRestStartedAt] = useState<number | null>(null);

  useTicker(timerPhase === "running");
  const [, forceRestTick] = useState(0);

  // Décompte de la pause: un seul intervalle, qui bascule vers le test
  // suivant dès que le temps est écoulé.
  useEffect(() => {
    if (screen !== "rest" || restStartedAt == null) return;
    const id = window.setInterval(() => {
      const remaining = REST_SECONDS - (elapsedSeconds(restStartedAt) ?? 0);
      if (remaining <= 0) setScreen("test");
      else forceRestTick((t) => t + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [screen, restStartedAt]);

  const current = eligible[testIndex];

  function startTimer() {
    setTimerPhase("running");
    setStartedAt(nowMs());
  }

  function stopTimer() {
    if (!current) return;
    const elapsed = elapsedSeconds(startedAt) ?? 0;
    setFrozenSeconds(elapsed);
    setTimerPhase("stopped");
    if (current.unit === "secondes") setValue(String(elapsed));
  }

  function resetTestState() {
    setTimerPhase("idle");
    setStartedAt(null);
    setFrozenSeconds(0);
    setValue("");
    setError(null);
  }

  function goToNextTest() {
    if (testIndex + 1 >= eligible.length) {
      setScreen("done");
      router.refresh();
      return;
    }
    setTestIndex((i) => i + 1);
    resetTestState();
    setRestStartedAt(nowMs());
    setScreen("rest");
  }

  function skipCurrentTest() {
    goToNextTest();
  }

  async function submitResult() {
    if (!current) return;
    const numeric = Number(value.replace(",", "."));
    if (!numeric || numeric <= 0) {
      setError("Entre une valeur valide.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testType: current.type, value: numeric }),
      });
      if (!res.ok) {
        setError("Impossible d'enregistrer ce résultat.");
        return;
      }
      goToNextTest();
    } finally {
      setSubmitting(false);
    }
  }

  if (screen === "intro") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center space-y-4 p-4 text-center">
        <BrianAvatar state="talking" size={88} className="mx-auto" />
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Tests d&apos;évaluation</h1>
        <p className="text-[var(--color-text)]">{composeTestFlowIntro(firstName)}</p>
        <p className="text-sm text-[var(--color-text-muted)]">
          {eligible.length} test{eligible.length > 1 ? "s" : ""} à passer aujourd&apos;hui, un par un.
        </p>
        <Button
          className="w-full"
          onClick={() => {
            setScreen("test");
            resetTestState();
          }}
        >
          Commencer
        </Button>
        {locked.length > 0 && (
          <p className="text-xs text-[var(--color-text-muted)]">
            {locked.length} test{locked.length > 1 ? "s" : ""} déjà passé{locked.length > 1 ? "s" : ""} récemment,
            revient plus tard.
          </p>
        )}
      </div>
    );
  }

  if (screen === "rest") {
    const restElapsed = elapsedSeconds(restStartedAt) ?? 0;
    const remaining = Math.max(0, REST_SECONDS - restElapsed);
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center space-y-4 p-4 text-center">
        <BrianAvatar state="encouraging" size={72} />
        <p className="font-display text-lg font-bold uppercase tracking-wide">Récupération</p>
        <p className="font-display text-5xl font-extrabold tabular-nums text-[var(--color-primary-strong)]">
          {remaining}s
        </p>
        <Button variant="ghost" onClick={() => setScreen("test")}>
          Passer la pause
        </Button>
      </div>
    );
  }

  if (screen === "done" || !current) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center space-y-4 p-4 text-center">
        <BrianAvatar state="celebrating" size={88} className="mx-auto" />
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">
          {eligible.length > 0 ? "Tests terminés !" : "Rien à passer pour l'instant"}
        </h1>
        <p className="text-[var(--color-text)]">
          {eligible.length > 0
            ? "Tes stats sont mises à jour sur ta carte."
            : "Tu as déjà passé tes tests récemment — reviens quand ils se débloquent."}
        </p>
        {locked.length > 0 && (
          <Card className="text-left text-sm">
            <CardTitle className="text-sm">Prochains tests disponibles</CardTitle>
            <ul className="mt-2 space-y-1 text-[var(--color-text-muted)]">
              {locked.map((t) => (
                <li key={t.type}>
                  {t.name} — dès le {t.eligibleAtLabel}
                </li>
              ))}
            </ul>
          </Card>
        )}
        <Button
          className="w-full"
          onClick={() => router.push(isFirstTime && eligible.length > 0 ? "/onboarding/tour" : "/progression")}
        >
          {isFirstTime && eligible.length > 0 ? "Découvrir l'application" : "Voir ma carte"}
        </Button>
      </div>
    );
  }

  // screen === "test"
  const liveSeconds = timerPhase === "running" ? elapsedSeconds(startedAt) ?? 0 : frozenSeconds;
  const frames = TEST_FRAMES_SLUG[current.type] ? EXERCISE_FRAMES[TEST_FRAMES_SLUG[current.type]!] : undefined;
  const showFrameIntro = !!frames && timerPhase === "idle";

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Test {testIndex + 1}/{eligible.length}
        </p>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">{current.name}</h1>
        {current.lastValue != null && (
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Ton record : {current.lastValue} {current.unit}
          </p>
        )}
      </div>

      {showFrameIntro ? (
        <div>
          <ExerciseFrameViewer sequence={frames} onReady={startTimer} />
          <button
            type="button"
            onClick={skipCurrentTest}
            className="mx-auto mt-3 block text-xs font-semibold text-[var(--color-text-muted)] underline"
          >
            Passer ce test
          </button>
        </div>
      ) : (
        <>
          <BrianTip
            tipKey="tests-flow-intro"
            text="Lis les étapes, lance le chrono quand tu es prêt à commencer l'exercice, arrête-le à la fin et entre ton résultat."
          />

          <Card>
            <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-text)]">
              {current.protocol.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </Card>
        </>
      )}

      {!showFrameIntro && <ConeTimer seconds={liveSeconds} running={timerPhase === "running"} />}

      {showFrameIntro ? null : timerPhase !== "stopped" ? (
        <div className="flex gap-2">
          <Button variant="ghost" onClick={skipCurrentTest}>
            Passer
          </Button>
          {timerPhase === "idle" ? (
            <Button className="flex-1" onClick={startTimer}>
              Lancer le chrono
            </Button>
          ) : (
            <Button className="flex-1" onClick={stopTimer}>
              Arrêter
            </Button>
          )}
        </div>
      ) : (
        <Card className="space-y-3">
          <CardSubtitle>Entre ton résultat ({current.unit})</CardSubtitle>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              className="w-28 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
              placeholder={current.unit}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <Button onClick={submitResult} disabled={submitting} className="flex-1">
              {submitting ? "..." : "Valider"}
            </Button>
          </div>
          {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
        </Card>
      )}

      <button
        type="button"
        onClick={() => router.push("/coach")}
        className="mx-auto block text-xs font-semibold text-[var(--color-primary-strong)] underline"
      >
        Parler à Coach Brian
      </button>
    </div>
  );
}
