"use client";

import { useState } from "react";
import type { EvaluationTestType } from "@prisma/client";
import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { TEST_PROTOCOLS, VALUE_BOUNDS } from "@/lib/evaluation-tests";
import { BRIAN_STATE_FOR_TEST, COACH_LINE_FOR_TEST, DEFAULT_BRIAN_STATE, DEFAULT_COACH_LINE } from "@/lib/tests/estimate-copy";
import type { TestFlowEntry } from "@/components/tests/TestPlayer";

const NUMPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "del"] as const;
const MAX_DECIMAL_DIGITS = 2;
const MAX_SIGNIFICANT_DIGITS = 5;

/** Saisie au pavé custom: virgule seulement si le test l'accepte, jamais plus de 2 décimales ni 5 chiffres significatifs. */
function pressDigit(current: string, key: string, allowDecimal: boolean): string {
  if (key === "del") return current.slice(0, -1);
  if (key === ",") {
    if (!allowDecimal || !current.length || current.includes(",")) return current;
    return current + ",";
  }
  const commaIndex = current.indexOf(",");
  if (commaIndex >= 0 && current.length - commaIndex - 1 >= MAX_DECIMAL_DIGITS) return current;
  if (current.replace(",", "").length >= MAX_SIGNIFICANT_DIGITS) return current;
  return (current === "0" ? "" : current) + key;
}

interface Validity {
  ok: boolean;
  msg: string;
}

/** Miroir de VALUE_BOUNDS (lib/evaluation-tests.ts) — jamais de bornes redéclarées en dur. Le serveur reste juge final. */
function checkValidity(t: TestFlowEntry, raw: string): Validity {
  if (!raw.length || raw === ",") return { ok: false, msg: "" };
  const n = Number(raw.replace(",", "."));
  if (!Number.isFinite(n)) return { ok: false, msg: "" };
  const bounds = VALUE_BOUNDS[t.type as EvaluationTestType];
  if (!bounds) return { ok: true, msg: "Enregistré à l'étape suivante" };
  if (n < bounds.min) return { ok: false, msg: `Minimum accepté : ${bounds.min} ${t.unit}` };
  if (n > bounds.max) return { ok: false, msg: `Maximum accepté : ${bounds.max} ${t.unit}` };
  return { ok: true, msg: "Enregistré à l'étape suivante" };
}

export interface EstimateWizardProps {
  eligible: TestFlowEntry[];
  estimateValues: Record<string, string>;
  onChange: (type: string, raw: string) => void;
  /** Appelle submitEstimates({ navigate: false }) côté parent — une seule fois, toutes les valeurs d'un coup. */
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
  skipped: string[];
  /** Étape 0, retour: revient à l'écran "estimateAlert" du parent. */
  onExitToAlert: () => void;
  /** CTA de révélation: déclenche la navigation réelle (router.push) côté parent. */
  onReveal: () => void;
}

/**
 * Wizard "une statistique par écran" pour la saisie manuelle des tests
 * d'évaluation — présentationnel: tout le state serveur (estimateValues,
 * submitting, error, skipped) et l'appel réseau restent dans TestPlayer.
 * Voir design_handoff_progressa_ui/REFONTE_TEST_EVALUATION.md.
 */
export function EstimateWizard({
  eligible,
  estimateValues,
  onChange,
  onSubmit,
  submitting,
  error,
  skipped,
  onExitToAlert,
  onReveal,
}: EstimateWizardProps) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"form" | "analysis" | "reveal">("form");

  const t = eligible[step];
  const draft = estimateValues[t.type] ?? "";
  const allowDecimal = t.unit === "secondes";
  const validity = checkValidity(t, draft);
  const isLastStep = step === eligible.length - 1;

  function handleKey(key: string) {
    onChange(t.type, pressDigit(draft, key, allowDecimal));
  }

  function handleBack() {
    if (step === 0) onExitToAlert();
    else setStep((s) => s - 1);
  }

  function finishOrAdvance() {
    if (!isLastStep) {
      setStep((s) => s + 1);
      return;
    }
    setPhase("analysis");
    onSubmit();
  }

  function handleNext() {
    if (!validity.ok) return;
    finishOrAdvance();
  }

  function handleSkip() {
    onChange(t.type, "");
    finishOrAdvance();
  }

  if (phase === "form") {
    const brianState = BRIAN_STATE_FOR_TEST[t.type] ?? DEFAULT_BRIAN_STATE;
    const coachLine = COACH_LINE_FOR_TEST[t.type] ?? DEFAULT_COACH_LINE;
    const emoji = TEST_PROTOCOLS[t.type as EvaluationTestType]?.emoji ?? "📊";

    return (
      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6 [background:linear-gradient(180deg,#f4fbf6_0%,#ffffff_34%)] [padding-bottom:env(safe-area-inset-bottom)] [padding-top:calc(env(safe-area-inset-top)+3.5rem)]"
      >
        <div className="flex shrink-0 items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Retour"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[15px] text-[var(--color-text)]"
          >
            ‹
          </button>
          <p className="font-mono text-[9.5px] tracking-[0.18em] text-[var(--color-text-muted)]">ÉVALUATION DE TON NIVEAU</p>
          <p className="font-display text-[17px] font-extrabold tabular-nums text-[var(--color-text)]">
            {step + 1} / {eligible.length}
          </p>
        </div>

        <div className="mt-3 flex shrink-0 gap-[5px]">
          {eligible.map((seg, i) => (
            <div
              key={seg.type}
              className="h-[5px] flex-1 rounded-full transition-colors duration-300"
              style={{ background: i < step ? "var(--color-primary)" : i === step ? "#3ddc7f" : "#e6ebe7" }}
            />
          ))}
        </div>

        <div className="mt-5 flex shrink-0 items-center gap-[11px]">
          <div className="relative h-[52px] w-[52px] shrink-0">
            <BrianAvatar key={t.type} state={brianState} size={52} />
            <div className="ev-ring pointer-events-none absolute -inset-1 rounded-full border-2 border-[rgba(26,163,80,.4)]" />
          </div>
          <div className="flex-1 rounded-2xl rounded-bl-[5px] bg-[var(--color-primary-soft)] px-[15px] py-3 text-sm font-medium leading-[1.4] text-[var(--color-text)]">
            {coachLine}
          </div>
        </div>

        <div className="mt-[18px] shrink-0">
          <div className="flex items-center gap-[9px]">
            <span className="text-[20px]">{emoji}</span>
            <span className="font-mono text-[9.5px] tracking-[0.16em] text-[var(--color-primary-strong)]">AXE {t.axisLabel ?? "—"}</span>
          </div>
          <h1 className="mt-1.5 font-display text-[36px] font-extrabold uppercase leading-[.98] text-[var(--color-text)]">{t.name}</h1>
          {t.protocol[0] && (
            <p className="mt-1.5 line-clamp-2 max-w-[300px] text-[13.5px] leading-[1.45] text-[var(--color-text-muted)]">{t.protocol[0]}</p>
          )}
        </div>

        <div className="mt-4 shrink-0 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 pb-4 pt-[18px] text-center shadow-[0_1px_2px_rgba(16,35,26,.04),0_10px_28px_rgba(16,35,26,.07)]">
          <div className="flex items-end justify-center gap-[9px]">
            <div className="font-display text-[66px] font-extrabold leading-[.86] tabular-nums" style={{ color: draft.length ? "var(--color-text)" : "#c9d6ce" }}>
              {draft.length ? draft : "—"}
            </div>
            <div className="pb-2 font-display text-[18px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">{t.unit}</div>
          </div>
          <div
            className="mx-6 mt-3 h-[2px] rounded-full transition-colors duration-200"
            style={{ background: validity.ok ? "var(--color-primary)" : draft.length ? "#e8b4b0" : "#e6ebe7" }}
          />
          <p className="mt-2 min-h-[16px] text-[11.5px]" style={{ color: validity.ok ? "var(--color-primary-strong)" : "var(--color-danger)" }}>
            {validity.msg}
          </p>
        </div>

        <div className="min-h-[14px] flex-1" />

        <div className="grid shrink-0 grid-cols-3 gap-2">
          {NUMPAD_KEYS.map((k) => {
            const muted = k === "," && !allowDecimal;
            return (
              <button
                key={k}
                type="button"
                disabled={muted}
                onClick={() => handleKey(k)}
                className="flex h-[48px] items-center justify-center rounded-[14px] border font-display text-2xl font-extrabold transition-transform active:scale-95 disabled:active:scale-100"
                style={{
                  background: k === "del" ? "var(--color-surface-alt)" : muted ? "#fafbfa" : "var(--color-surface)",
                  color: muted ? "#c9d6ce" : k === "del" ? "var(--color-text-muted)" : "var(--color-text)",
                  borderColor: k === "del" ? "#e6ebe7" : "var(--color-border)",
                }}
              >
                {k === "del" ? "⌫" : k}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={!validity.ok}
          className="mt-2.5 flex h-[58px] shrink-0 items-center justify-center gap-2 rounded-2xl font-display text-xl font-extrabold uppercase tracking-[0.04em] transition-transform active:scale-95 disabled:active:scale-100"
          style={{
            background: validity.ok ? "var(--color-primary)" : "#eef2ef",
            color: validity.ok ? "var(--color-on-primary)" : "#a3b0a8",
            boxShadow: validity.ok ? "0 16px 32px -12px rgba(26,163,80,.65)" : "none",
          }}
        >
          {isLastStep ? "Terminer" : "Continuer"} <span className="text-lg">→</span>
        </button>

        <button type="button" onClick={handleSkip} className="mt-3 shrink-0 text-center text-xs font-semibold text-[var(--color-text-muted)] underline">
          Je ne connais pas cette valeur → passer
        </button>
      </div>
    );
  }

  if (phase === "analysis") {
    const analyzing = submitting;
    return (
      <div
        className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 pb-[34px] [background:linear-gradient(180deg,#f4fbf6_0%,#ffffff_46%)] [padding-bottom:env(safe-area-inset-bottom)] [padding-top:calc(env(safe-area-inset-top)+4.375rem)]"
      >
        <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--color-primary-soft)] px-3.5 py-[7px]">
          <span className="font-mono text-[9.5px] tracking-[0.16em] text-[var(--color-primary-strong)]">
            {analyzing ? "ANALYSE EN COURS" : error ? "ANALYSE INCOMPLÈTE" : "ANALYSE TERMINÉE ✅"}
          </span>
        </div>

        <div className="relative mt-6 h-[220px] w-[220px] shrink-0">
          <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(26,163,80,.16), transparent 68%)" }} />
          {analyzing && (
            <div
              className="ev-spin absolute inset-0 rounded-full border-2"
              style={{ borderColor: "var(--color-primary-soft)", borderTopColor: "var(--color-primary)" }}
            />
          )}
          <div className="ev-float absolute inset-[22px]">
            <BrianAvatar state={analyzing ? "thinking" : error ? "encouraging" : "celebrating"} size={176} />
          </div>
        </div>

        <div className="mt-5 shrink-0 text-center">
          <h1 className="font-display text-[40px] font-extrabold uppercase leading-none text-[var(--color-text)]">
            {analyzing ? "Je regarde ça…" : error ? "Je n'ai pas tout reçu" : "Analyse terminée ✅"}
          </h1>
          <p className="mt-3 max-w-[290px] text-[15.5px] leading-[1.55] text-[var(--color-text-muted)]">
            {analyzing
              ? "Je croise tes résultats avec les repères de ta catégorie d'âge."
              : error
                ? error
                : "J'ai toutes tes données. Je vais maintenant analyser ton profil."}
          </p>
        </div>

        <div className="mt-6 flex w-full flex-col gap-2">
          {eligible.map((row) => {
            const val = estimateValues[row.type];
            const wasSkipped = skipped.includes(row.name);
            const hasValue = !!val && !wasSkipped;
            return (
              <div
                key={row.type}
                className="flex items-center gap-3 rounded-2xl border px-[15px] py-3"
                style={{ background: hasValue ? "#f6fbf8" : "var(--color-surface)", borderColor: hasValue ? "#d9ece1" : "var(--color-border)" }}
              >
                <span className="text-[15px]">{TEST_PROTOCOLS[row.type as EvaluationTestType]?.emoji ?? "📊"}</span>
                <span className="flex-1 text-[13.5px] font-medium text-[var(--color-text)]">{row.name}</span>
                <span
                  className="font-mono text-[11px]"
                  style={{ color: wasSkipped ? "var(--color-text-muted)" : hasValue ? "var(--color-primary-strong)" : "#8b9a91" }}
                >
                  {wasSkipped ? "non enregistré" : hasValue ? `${val} ${row.unit}` : "—"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex-1" />

        <button
          type="button"
          disabled={analyzing}
          onClick={() => (error ? onSubmit() : setPhase("reveal"))}
          className="flex h-[60px] w-full shrink-0 items-center justify-center gap-2 rounded-2xl font-display text-xl font-extrabold uppercase tracking-[0.04em] transition-transform active:scale-95 disabled:active:scale-100"
          style={{
            background: analyzing ? "#eef2ef" : "var(--color-primary)",
            color: analyzing ? "#a3b0a8" : "var(--color-on-primary)",
            boxShadow: analyzing ? "none" : "0 16px 32px -12px rgba(26,163,80,.65)",
          }}
        >
          {analyzing ? "Analyse en cours…" : error ? "Réessayer" : "Voir le résultat"}
        </button>
      </div>
    );
  }

  // phase === "reveal"
  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 pb-[34px] text-white [padding-bottom:env(safe-area-inset-bottom)] [padding-top:calc(env(safe-area-inset-top)+4.125rem)]"
      style={{ background: "radial-gradient(520px 460px at 50% 34%, #123a24 0%, #0b1a12 62%, #071009 100%)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0, #fff 2px, transparent 2px, transparent 14px)" }}
      />
      <div
        className="ev-glow pointer-events-none absolute left-1/2 top-[200px] h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(61,220,127,.35), transparent 66%)" }}
      />

      <div className="relative inline-flex shrink-0 items-center gap-2 rounded-full border border-[rgba(61,220,127,.3)] bg-[rgba(61,220,127,.14)] px-3.5 py-[7px]">
        <span className="font-mono text-[9.5px] tracking-[0.18em] text-[#3ddc7f]">ANALYSE COMPLÈTE</span>
      </div>

      <div className="ev-pop relative mt-[30px] h-[262px] w-[186px] shrink-0">
        <div
          className="absolute inset-0 overflow-hidden rounded-t-[20px] border-2"
          style={{
            clipPath: "polygon(0% 0%,100% 0%,100% 88%,50% 100%,0% 88%)",
            background: "linear-gradient(165deg,#1c3d29,#0c1f15)",
            borderColor: "rgba(61,220,127,.55)",
            boxShadow: "0 26px 60px -18px rgba(61,220,127,.45)",
          }}
        >
          <div className="absolute inset-0" style={{ background: "radial-gradient(70% 45% at 50% 6%, rgba(61,220,127,.3), transparent 70%)" }} />
          <div
            className="ev-sheen absolute -top-10 -bottom-10 w-14 blur-[3px]"
            style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,.42),transparent)" }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
            <div className="font-display text-[64px] font-extrabold leading-[.8] tracking-[0.04em]" style={{ color: "rgba(61,220,127,.35)" }}>
              ?
            </div>
            <div className="font-mono text-[9px] tracking-[0.2em] text-white/40">OVR · 6 AXES</div>
          </div>
        </div>
      </div>

      <div className="relative mt-[26px] shrink-0 text-center">
        <h1 className="font-display text-[46px] font-extrabold uppercase leading-[.96] text-white">
          Ta carte
          <br />
          est prête. ⚡
        </h1>
        <p className="mt-3 max-w-[280px] text-[15px] leading-[1.55] text-white/68">
          Ton OVR, ton rang et tes 6 axes sont calculés. Reste à les découvrir.
        </p>
      </div>

      <div className="flex-1" />

      <button
        type="button"
        onClick={onReveal}
        className="relative flex h-[62px] w-full shrink-0 items-center justify-center gap-2.5 rounded-2xl bg-[#1aa350] font-display text-xl font-extrabold uppercase tracking-[0.04em] text-white transition-transform active:scale-95"
        style={{ boxShadow: "0 18px 40px -12px rgba(26,163,80,.8)" }}
      >
        Découvrir ma carte <span className="text-lg">→</span>
      </button>
    </div>
  );
}
