"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { ConeTimer } from "@/components/tests/ConeTimer";
import { composeRestTip, composePersonalChatLockedMessage } from "@/lib/brian/messages";
import { MIN_PLAUSIBLE_SECONDS } from "@/lib/evaluation-tests";
import { elapsedSeconds, nowMs } from "@/lib/time";
import { EXERCISE_FRAMES } from "@/lib/exercises/exercise-frames";
import { ExerciseFrameViewer } from "@/components/exercises/ExerciseFrameViewer";
import { trackClick } from "@/lib/analytics/track";
import { getOrCreateAnonId } from "@/lib/onboarding/storage";
import { EstimateWizard } from "@/components/tests/EstimateWizard";

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
  axisLabel: string | null;
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

  const [screen, setScreen] = useState<"intro" | "estimateAlert" | "estimateForm" | "test" | "rest" | "done">(
    eligible.length > 0 ? "intro" : "done"
  );
  // Saisie manuelle ("estimer mon niveau"): un champ par épreuve éligible,
  // clé = testType. Volontairement optionnel champ par champ — comme
  // "Passer" dans le parcours chronométré, une épreuve non remplie n'est
  // simplement pas enregistrée plutôt que de bloquer tout l'écran.
  const [estimateValues, setEstimateValues] = useState<Record<string, string>>({});
  const [estimateSubmitting, setEstimateSubmitting] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  // Épreuves dont la saisie n'a pas pu être enregistrée (valeur hors bornes,
  // cooldown, etc.) — affiché après coup sur l'écran "done", jamais utilisé
  // pour bloquer la progression: une épreuve invalide ne doit pas faire
  // perdre les autres valeurs déjà valides du même formulaire.
  const [estimateSkipped, setEstimateSkipped] = useState<string[]>([]);
  const [testIndex, setTestIndex] = useState(0);
  const [timerPhase, setTimerPhase] = useState<"idle" | "running" | "stopped">("idle");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [frozenSeconds, setFrozenSeconds] = useState(0);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restStartedAt, setRestStartedAt] = useState<number | null>(null);
  // Résultats saisis pendant cette session — sert uniquement à afficher le
  // récap des épreuves déjà faites (checklist), jamais relu ailleurs.
  const [sessionScores, setSessionScores] = useState<Record<number, string>>({});
  // Distinct de `eligible.length > 0`: une fois les tests envoyés, le
  // router.refresh() qui suit renvoie des props où ces mêmes tests sont
  // maintenant tous verrouillés (cooldown démarré), donc `eligible` retombe
  // à 0 — sans ce flag, l'écran "done" bascule sur le message "rien à
  // passer" et renvoie vers /progression au lieu de révéler la carte, y
  // compris juste après le tout premier test d'un nouveau joueur.
  const [justFinishedSession, setJustFinishedSession] = useState(false);
  // Purement visuel: accordéon replié de la liste des épreuves sur l'écran d'intro.
  const [showEligibleList, setShowEligibleList] = useState(false);

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
    if (current) trackClick(getOrCreateAnonId(), "exercise_started", `/tests#${current.type}`);
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
      setJustFinishedSession(true);
      setScreen("done");
      trackClick(getOrCreateAnonId(), "test_completed", "/tests");
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
      trackClick(getOrCreateAnonId(), "exercise_completed", `/tests#${current.type}`);
      setSessionScores((prev) => ({ ...prev, [testIndex]: value }));
      goToNextTest();
    } finally {
      setSubmitting(false);
    }
  }

  // Abandonner en cours de route ne doit pas priver le joueur du moment
  // "révélation de carte" s'il a déjà validé au moins une épreuve réelle
  // cette session — sinon il atterrit directement sur le paywall sans avoir
  // jamais vu sa carte, ce qui casse le déclic émotionnel du funnel.
  function quit() {
    const hasAnyResult = Object.keys(sessionScores).length > 0;
    router.push(isFirstTime && hasAnyResult ? "/onboarding/carte" : "/dashboard");
  }

  // Envoie chaque épreuve saisie sur le même endpoint que le parcours
  // chronométré (/api/tests/submit) — aucune distinction en base ni à
  // l'affichage entre une valeur mesurée au chrono et une valeur tapée à la
  // main, exactement traité comme un test réel une fois enregistré.
  // Un seul appel, toutes les valeurs d'un coup — le wizard (EstimateWizard)
  // pilote sa propre navigation (form → analyse → révélation) via les props
  // `submitting`/`error`, cette fonction ne navigue plus elle-même.
  async function submitEstimates() {
    setEstimateSubmitting(true);
    setEstimateError(null);
    try {
      const skipped: string[] = [];
      let anySubmitted = false;
      for (const t of eligible) {
        const raw = estimateValues[t.type]?.trim();
        if (!raw) continue;
        const numeric = Number(raw.replace(",", "."));
        if (!numeric || numeric <= 0) continue;
        try {
          const res = await fetch("/api/tests/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ testType: t.type, value: numeric }),
          });
          if (res.ok) anySubmitted = true;
          else skipped.push(t.name);
        } catch {
          skipped.push(t.name);
        }
      }
      // Une épreuve qui échoue (valeur hors bornes, cooldown déclenché entre
      // le chargement de la page et la soumission...) ne doit jamais faire
      // perdre les autres épreuves déjà enregistrées avec succès dans cette
      // même validation — on continue toujours jusqu'au bout de la liste.
      setEstimateSkipped(skipped);
      if (!anySubmitted && skipped.length === eligible.length) {
        setEstimateError("Aucune valeur n'a pu être enregistrée — vérifie tes saisies et réessaie.");
        return;
      }
      trackClick(getOrCreateAnonId(), "test_completed", "/tests#estimate");
      setJustFinishedSession(true);
    } finally {
      setEstimateSubmitting(false);
    }
  }

  if (screen === "intro") {
    const introFacts = [
      { v: String(eligible.length), k: `test${eligible.length > 1 ? "s" : ""} guidé${eligible.length > 1 ? "s" : ""}` },
      { v: "~15", k: "minutes" },
      { v: "1", k: "carte joueur" },
    ];
    return (
      <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto [background:linear-gradient(180deg,#f4fbf6_0%,#ffffff_42%)] [padding-bottom:env(safe-area-inset-bottom)] [padding-top:env(safe-area-inset-top)]">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col p-6">
          <button type="button" onClick={quit} aria-label="Quitter les tests" className="self-start text-xl text-[var(--color-text-muted)]">
            ✕
          </button>

          <div className="relative mx-auto mt-3 h-[230px] w-[230px] shrink-0">
            <div className="ev-glow pointer-events-none absolute inset-1.5 rounded-full" style={{ background: "radial-gradient(circle, rgba(26,163,80,.18), transparent 68%)" }} />
            <div className="pointer-events-none absolute inset-[26px] rounded-full border border-[rgba(26,163,80,.22)]" />
            <div className="ev-float absolute inset-0">
              <BrianAvatar state="confident" size={230} />
            </div>
          </div>

          <div className="mt-3.5">
            <div className="inline-flex items-center gap-[7px] rounded-full bg-[var(--color-primary-soft)] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
              <span className="font-mono text-[9.5px] tracking-[0.16em] text-[var(--color-primary-strong)]">COACH BRIAN · PRÊT</span>
            </div>
            <h1 className="mt-3.5 font-display text-[52px] font-extrabold uppercase leading-[.92] text-[var(--color-text)]">
              Évalue
              <br />
              ton niveau
            </h1>
            <p className="mt-3 max-w-[19.5rem] text-[15.5px] leading-[1.55] text-[var(--color-text-muted)]">
              Coach Brian va analyser tes performances pour identifier tes points forts et tes axes de progression,
              {" "}
              {firstName}.
            </p>
          </div>

          <div className="mt-5 flex gap-2">
            {introFacts.map((f) => (
              <div
                key={f.k}
                className="flex-1 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3.5 shadow-[0_1px_2px_rgba(16,35,26,.04),0_6px_18px_rgba(16,35,26,.05)]"
              >
                <p className="font-display text-2xl font-extrabold leading-[.9] text-[var(--color-text)]">{f.v}</p>
                <p className="mt-1.5 text-[10.5px] text-[var(--color-text-muted)]">{f.k}</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowEligibleList((v) => !v)}
              className="text-sm font-semibold text-[var(--color-primary-strong)] underline"
            >
              {showEligibleList ? "Masquer" : `Voir les ${eligible.length} épreuves`}
            </button>
            {showEligibleList && (
              <div className="mt-2.5 flex flex-col gap-2">
                {eligible.map((t, i) => (
                  <div
                    key={t.type}
                    className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3.5 py-3"
                  >
                    <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] font-display text-base font-extrabold text-[var(--color-primary-strong)]">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--color-text)]">{t.name}</p>
                      <p className="mt-0.5 font-mono text-[0.65rem] text-[var(--color-text-muted)]">
                        AXE {t.axisLabel ?? "—"} · {t.unit.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {locked.length > 0 && (
              <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                {locked.length} test{locked.length > 1 ? "s" : ""} déjà passé{locked.length > 1 ? "s" : ""} récemment,
                revient plus tard.
              </p>
            )}
          </div>

          <div className="flex-1" />

          <button
            type="button"
            onClick={() => {
              trackClick(getOrCreateAnonId(), "test_estimate_started", "/tests");
              setScreen("estimateAlert");
            }}
            className="mt-5 flex h-[62px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[var(--color-primary)] font-display text-xl font-extrabold uppercase tracking-[0.04em] text-[var(--color-on-primary)] transition-transform active:scale-95"
            style={{ boxShadow: "0 18px 34px -12px rgba(26,163,80,.65)" }}
          >
            Commencer mon évaluation <span className="text-lg">→</span>
          </button>
          <button
            type="button"
            onClick={() => {
              trackClick(getOrCreateAnonId(), "test_started", "/tests");
              setScreen("test");
              resetTestState();
            }}
            className="mt-3 text-center text-sm font-semibold text-[var(--color-text-muted)]"
          >
            Plutôt faire le test chronométré
          </button>
        </div>
      </div>
    );
  }

  if (screen === "estimateAlert") {
    return (
      <div className="fixed inset-0 z-40 overflow-y-auto bg-[var(--color-bg)] [padding-top:env(safe-area-inset-top)] [padding-bottom:env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-md flex-col p-4">
          <button
            type="button"
            onClick={() => setScreen("intro")}
            aria-label="Annuler"
            className="self-start text-xl text-[var(--color-text-muted)]"
          >
            ✕
          </button>
          <div className="mt-4 flex flex-col items-center gap-4 text-center">
            <BrianAvatar state="confident" size={64} />
            <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide text-[var(--color-text)]">
              Comment ça marche
            </h1>
            <Card className="rounded-[24px] shadow-[0_1px_2px_rgba(16,35,26,.04),0_10px_28px_rgba(16,35,26,.07)] text-left text-sm leading-relaxed">
              <p>
                Au lieu de faire chaque épreuve maintenant, tu indiques toi-même tes meilleures performances (record
                de jonglages, temps de planche, etc.) — pratique si tu n&apos;as pas la place ou le temps de bouger
                tout de suite.
              </p>
              <p className="mt-3">
                Ta carte est calculée à partir de ces valeurs, exactement comme avec le test chronométré. Tu pourras
                refaire une vraie épreuve chronométrée plus tard pour l&apos;affiner.
              </p>
              <p className="mt-3 font-semibold text-[var(--color-text)]">
                Tu peux annuler et revenir au test chronométré à tout moment, avant de valider.
              </p>
            </Card>
            <div className="flex w-full gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setScreen("intro")}>
                Annuler
              </Button>
              <Button className="flex-1" onClick={() => setScreen("estimateForm")}>
                Continuer
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "estimateForm") {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-[var(--color-bg)]">
        <EstimateWizard
          eligible={eligible}
          estimateValues={estimateValues}
          onChange={(type, raw) => setEstimateValues((prev) => ({ ...prev, [type]: raw }))}
          onSubmit={() => {
            void submitEstimates();
          }}
          submitting={estimateSubmitting}
          error={estimateError}
          skipped={estimateSkipped}
          onExitToAlert={() => setScreen("estimateAlert")}
          onReveal={() => router.push(isFirstTime && justFinishedSession ? "/onboarding/carte" : "/progression")}
        />
      </div>
    );
  }

  if (screen === "rest") {
    const restElapsed = elapsedSeconds(restStartedAt) ?? 0;
    const remaining = Math.max(0, REST_SECONDS - restElapsed);
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-[#072a16] p-4 text-white [padding-top:calc(env(safe-area-inset-top)+1rem)] [padding-bottom:env(safe-area-inset-bottom)]">
        <button type="button" onClick={quit} aria-label="Quitter les tests" className="self-start text-xl text-white/60">
          ✕
        </button>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 text-center">
          <BrianAvatar state="encouraging" size={72} />
          <p className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-[#3ddc7f]">
            Récupération
          </p>
          <p className="font-display text-6xl font-extrabold tabular-nums">{remaining}s</p>
          <p className="max-w-xs text-sm text-white/85">{composeRestTip(testIndex)}</p>
          <p className="max-w-xs text-xs font-semibold text-white/60">{composePersonalChatLockedMessage("test")}</p>
          <button type="button" onClick={() => setScreen("test")} className="mt-2 text-sm font-semibold text-white/60">
            Passer la pause
          </button>
        </div>
      </div>
    );
  }

  if (screen === "done" || !current) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col justify-center bg-[var(--color-bg)] [padding-top:env(safe-area-inset-top)] [padding-bottom:env(safe-area-inset-bottom)]">
      <div className="mx-auto w-full max-w-md space-y-4 p-4 text-center">
        <BrianAvatar state="celebrating" size={88} className="mx-auto" />
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">
          {justFinishedSession ? "Tests terminés !" : "Rien à passer pour l'instant"}
        </h1>
        <p className="text-[var(--color-text)]">
          {justFinishedSession
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
        {estimateSkipped.length > 0 && (
          <Card className="text-left text-sm">
            <CardTitle className="text-sm">Non enregistré</CardTitle>
            <p className="mt-1 text-[var(--color-text-muted)]">
              {estimateSkipped.join(", ")} — vérifie la valeur saisie et réessaie plus tard depuis cette page.
            </p>
          </Card>
        )}
        <Button
          className="w-full"
          onClick={() => router.push(isFirstTime && justFinishedSession ? "/onboarding/carte" : "/progression")}
        >
          {isFirstTime && justFinishedSession ? "Découvrir ma carte" : "Voir ma carte"}
        </Button>
      </div>
      </div>
    );
  }

  // screen === "test"
  const liveSeconds = timerPhase === "running" ? elapsedSeconds(startedAt) ?? 0 : frozenSeconds;
  // Empêche d'arrêter le chrono avant un temps physiquement plausible (ex:
  // un sprint de 20m ne peut pas être fait en moins de ~2,3s) — sur les
  // tests concernés uniquement, voir MIN_PLAUSIBLE_SECONDS.
  const minPlausible = (MIN_PLAUSIBLE_SECONDS as Record<string, number>)[current.type] ?? 0;
  const remainingBeforeStop = timerPhase === "running" ? Math.max(0, Math.ceil(minPlausible - liveSeconds)) : 0;
  const frames = TEST_FRAMES_SLUG[current.type] ? EXERCISE_FRAMES[TEST_FRAMES_SLUG[current.type]!] : undefined;
  const showFrameIntro = !!frames && timerPhase === "idle";
  const showProtocol = !showFrameIntro && timerPhase === "idle";
  const progressPct = Math.round(((testIndex + (timerPhase === "stopped" ? 1 : 0)) / eligible.length) * 100);

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[#072a16] p-4 text-white [padding-top:calc(env(safe-area-inset-top)+1rem)] [padding-bottom:env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md">
        <button type="button" onClick={quit} aria-label="Quitter les tests" className="block text-xl text-white/60">
          ✕
        </button>
        <div className="mt-2 flex items-baseline justify-between">
          <p className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[#3ddc7f]">
            Épreuve {testIndex + 1}/{eligible.length}
          </p>
          <p className="font-mono text-[0.6rem] text-white/45">
            {isFirstTime ? "Carte en construction" : "Mise à jour de ta carte"}
          </p>
        </div>
        <div className="mt-3.5 h-1 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-[#3ddc7f] transition-[width] duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <h1 className="mt-6 font-display text-4xl font-extrabold uppercase leading-none">{current.name}</h1>
        <p className="mt-1.5 font-mono text-[0.625rem] text-white/50">MESURE EN {current.unit.toUpperCase()}</p>
        {current.lastValue != null && (
          <p className="mt-1 text-sm text-white/60">
            Ton record : {current.lastValue} {current.unit}
          </p>
        )}

        {showFrameIntro && (
          <div className="mt-5">
            <ExerciseFrameViewer sequence={frames} onReady={startTimer} />
            <button type="button" onClick={skipCurrentTest} className="mx-auto mt-3 block text-xs font-semibold text-white/50 underline">
              Passer ce test
            </button>
          </div>
        )}

        {showProtocol && (
          <div className="mt-5 rounded-[1.25rem] border border-white/15 bg-white/[0.07] p-4">
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-white/85">
              {current.protocol.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>
        )}

        {!showFrameIntro && (
          <div className="mt-6">
            <ConeTimer seconds={liveSeconds} running={timerPhase === "running"} />
          </div>
        )}

        {!showFrameIntro && (
          <div className="mt-6 flex flex-col gap-1.5">
            {eligible.map((t, i) => {
              const done = i < testIndex || (i === testIndex && timerPhase === "stopped");
              const isCurrent = i === testIndex && !done;
              return (
                <div key={t.type} className="flex items-center gap-2.5 text-[0.8rem]" style={{ color: done ? "#3ddc7f" : isCurrent ? "#fff" : "rgba(255,255,255,.4)" }}>
                  <span
                    className="h-[6px] w-[6px] shrink-0 rounded-full"
                    style={{ background: done ? "#3ddc7f" : isCurrent ? "#fff" : "rgba(255,255,255,.3)" }}
                  />
                  {t.name}
                  <span className="flex-1" />
                  <span className="font-mono text-[0.65rem]">{sessionScores[i] ? `${sessionScores[i]} ${t.unit}` : ""}</span>
                </div>
              );
            })}
          </div>
        )}

        {showFrameIntro ? null : timerPhase !== "stopped" ? (
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={skipCurrentTest}
              className="h-[58px] rounded-[var(--radius-control)] px-5 text-sm font-semibold text-white/60"
            >
              Passer
            </button>
            {timerPhase === "idle" ? (
              <Button className="flex-1" onClick={startTimer}>
                Lancer le chrono
              </Button>
            ) : (
              <Button className="flex-1" onClick={stopTimer} disabled={remainingBeforeStop > 0}>
                {remainingBeforeStop > 0 ? `Arrêter (encore ${remainingBeforeStop}s)` : "Arrêter"}
              </Button>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-3 rounded-[1.25rem] border border-white/15 bg-white/[0.07] p-4">
            <CardSubtitle className="text-white/70">Entre ton résultat ({current.unit})</CardSubtitle>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                className="w-28 rounded-[var(--radius-control)] border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40"
                placeholder={current.unit}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <Button onClick={submitResult} disabled={submitting} className="flex-1">
                {submitting ? "..." : "Valider"}
              </Button>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push("/coach")}
          className="mx-auto mt-5 block text-xs font-semibold text-white/50 underline"
        >
          Parler à Coach Brian
        </button>
      </div>
    </div>
  );
}
