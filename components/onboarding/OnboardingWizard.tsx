"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Equipment, Objective, Position, Weekday } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { DragSliderField } from "@/components/onboarding/DragSliderField";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { SuggestField } from "@/components/onboarding/SuggestField";
import { getAgeCategory } from "@/lib/age-category";
import {
  ALL_FRANCE_DEPARTMENTS,
  FRANCOPHONE_COUNTRIES,
  getLigueForDepartment,
  getNiveauxForCountry,
  getRegionsForCountry,
} from "@/lib/geo";
import { EQUIPMENT_EMOJI, EQUIPMENT_LABELS, OBJECTIVE_EMOJI, OBJECTIVE_LABELS, POSITION_LABELS, WEEKDAY_LABELS } from "@/lib/labels";
import {
  composeOnboardingBirthYear,
  composeOnboardingBodyRhythm,
  composeOnboardingCountryLevel,
  composeOnboardingEquipment,
  composeOnboardingIntro,
  composeOnboardingObjective,
  composeOnboardingPosition,
  composeOnboardingRevelation,
} from "@/lib/brian/messages";
import { getOrCreateAnonId, loadOnboardingData, saveOnboardingData, setReferralCode } from "@/lib/onboarding/storage";
import { ONBOARDING_SCREEN_KEYS, type OnboardingData } from "@/lib/onboarding/types";
import { trackClick, trackOnboardingFunnel } from "@/lib/analytics/track";

const TOTAL_SCREENS = ONBOARDING_SCREEN_KEYS.length;

function fieldClass() {
  return "w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]";
}

/** Chaque écran de l'onboarding est présenté par Brian, pas par un formulaire anonyme. */
function BrianAsks({ children, celebrating = false }: { children: ReactNode; celebrating?: boolean }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <BrianAvatar state={celebrating ? "celebrating" : "talking"} size={44} />
      <div className="min-w-0 flex-1 rounded-[var(--radius-card)] rounded-tl-sm border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-primary-strong)]">Coach Brian</p>
        <p className="mt-1 text-sm text-[var(--color-text)]">{children}</p>
      </div>
    </div>
  );
}

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  // Initialisation paresseuse plutôt qu'un effet: localStorage n'est lisible
  // que côté client, mais useState((..) => ..) s'exécute déjà lors du rendu
  // client (hydratation), donc pas besoin d'un effet + setState séparé.
  const [data, setData] = useState<OnboardingData>(() => loadOnboardingData());
  const [anonId] = useState<string>(() => getOrCreateAnonId());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setReferralCode(ref);
  }, []);

  useEffect(() => {
    trackOnboardingFunnel(anonId, step, ONBOARDING_SCREEN_KEYS[step], "VIEWED");
  }, [step, anonId]);

  function update<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function validateStep(): string | null {
    switch (ONBOARDING_SCREEN_KEYS[step]) {
      case "prenom":
        return data.firstName.trim().length >= 1 ? null : "Dis-nous comment t'appeler.";
      case "annee_naissance": {
        const year = data.birthYear;
        const currentYear = new Date().getFullYear();
        if (!year || year < currentYear - 70 || year > currentYear - 5) return "Indique une année de naissance valide.";
        return null;
      }
      case "poste":
        return data.position ? null : "Choisis ton poste.";
      case "pays_niveau": {
        if (!data.country) return "Choisis ton pays.";
        if (!data.levelLabel) return "Choisis ton niveau de jeu.";
        if (data.country === "France" && !data.district) return "Choisis ton département.";
        return null;
      }
      case "gabarit_rythme":
        return null;
      case "materiel":
        return data.equipment.length > 0 || data.otherEquipmentNote.trim().length > 0
          ? null
          : "Choisis au moins une option (ou \"Aucun matériel\").";
      case "objectif":
        return data.objective ? null : "Choisis ton objectif principal.";
      default:
        return null;
    }
  }

  function goNext() {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    saveOnboardingData(data);
    trackOnboardingFunnel(anonId, step, ONBOARDING_SCREEN_KEYS[step], "COMPLETED");
    setStep((s) => Math.min(s + 1, TOTAL_SCREENS - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  const ageCategory = useMemo(() => (data.birthYear ? getAgeCategory(data.birthYear) : null), [data.birthYear]);

  return (
    <div className="relative min-h-screen">
      <OnboardingBackground />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-4">
        <ProgressBar value={((step + 1) / TOTAL_SCREENS) * 100} />

      <Card className="p-6">
        {ONBOARDING_SCREEN_KEYS[step] === "prenom" && (
          <ScreenPrenom value={data.firstName} onChange={(v) => update("firstName", v)} />
        )}
        {ONBOARDING_SCREEN_KEYS[step] === "annee_naissance" && (
          <ScreenAnneeNaissance
            value={data.birthYear}
            onChange={(v) => update("birthYear", v)}
            categoryLabel={ageCategory?.label ?? null}
            firstName={data.firstName}
          />
        )}
        {ONBOARDING_SCREEN_KEYS[step] === "poste" && (
          <ScreenPoste value={data.position} onChange={(v) => update("position", v)} />
        )}
        {ONBOARDING_SCREEN_KEYS[step] === "pays_niveau" && (
          <ScreenPaysNiveau
            country={data.country}
            department={data.district}
            levelLabel={data.levelLabel}
            onChangeCountry={(v) => setData((prev) => ({ ...prev, country: v, ligue: null, district: null, levelLabel: null }))}
            onChangeDepartment={(v) =>
              setData((prev) => ({ ...prev, district: v, ligue: getLigueForDepartment(v) }))
            }
            onChangeLevel={(v) => update("levelLabel", v)}
          />
        )}
        {ONBOARDING_SCREEN_KEYS[step] === "gabarit_rythme" && (
          <ScreenGabaritRythme
            heightCm={data.heightCm}
            weightKg={data.weightKg}
            clubSessionsPerWeek={data.clubSessionsPerWeek}
            matchDay={data.matchDay}
            onChangeHeight={(v) => update("heightCm", v)}
            onChangeWeight={(v) => update("weightKg", v)}
            onChangeSessions={(v) => update("clubSessionsPerWeek", v)}
            onChangeMatchDay={(v) => update("matchDay", v)}
          />
        )}
        {ONBOARDING_SCREEN_KEYS[step] === "materiel" && (
          <ScreenMateriel
            value={data.equipment}
            onChange={(v) => update("equipment", v)}
            otherNote={data.otherEquipmentNote}
            onChangeOtherNote={(v) => update("otherEquipmentNote", v)}
          />
        )}
        {ONBOARDING_SCREEN_KEYS[step] === "objectif" && (
          <ScreenObjectif
            objective={data.objective}
            weakPointNote={data.weakPointNote}
            onChangeObjective={(v) => update("objective", v)}
            onChangeWeakPoint={(v) => update("weakPointNote", v)}
          />
        )}
        {ONBOARDING_SCREEN_KEYS[step] === "revelation" && (
          <ScreenRevelation data={data} ageCategoryLabel={ageCategory?.label ?? null} anonId={anonId} />
        )}

        {error && <p className="mt-4 text-sm font-semibold text-[var(--color-danger)]">{error}</p>}

        {ONBOARDING_SCREEN_KEYS[step] !== "revelation" && (
          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={goBack} disabled={step === 0}>
              Retour
            </Button>
            <Button onClick={goNext}>Continuer</Button>
          </div>
        )}
      </Card>
      </div>
    </div>
  );
}

function ScreenPrenom({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <BrianAsks>{composeOnboardingIntro()}</BrianAsks>
      <input
        autoFocus
        className={`${fieldClass()} mt-6`}
        placeholder="Ton prénom"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={40}
      />
    </div>
  );
}

function ScreenAnneeNaissance({
  value,
  onChange,
  categoryLabel,
  firstName,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  categoryLabel: string | null;
  firstName: string;
}) {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 70;
  const maxYear = currentYear - 5;
  const [query, setQuery] = useState(value ? String(value) : "");

  const suggestions = useMemo(() => {
    const digits = query.trim();
    const years: number[] = [];
    if (!digits) {
      // Pas de saisie: on propose d'abord la tranche la plus probable (joueurs jeunes).
      for (let y = Math.min(maxYear, currentYear - 6); y >= Math.max(minYear, currentYear - 19); y--) years.push(y);
      return years;
    }
    for (let y = maxYear; y >= minYear; y--) {
      if (String(y).startsWith(digits)) years.push(y);
    }
    return years.slice(0, 16);
  }, [query, currentYear, minYear, maxYear]);

  function pick(y: number) {
    setQuery(String(y));
    onChange(y);
  }

  function handleTyping(raw: string) {
    const digits = raw.replace(/[^0-9]/g, "").slice(0, 4);
    setQuery(digits);
    if (digits.length === 4) {
      const y = Number(digits);
      onChange(y >= minYear && y <= maxYear ? y : null);
    } else {
      onChange(null);
    }
  }

  return (
    <div>
      <BrianAsks>{composeOnboardingBirthYear(firstName)}</BrianAsks>
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        className={fieldClass()}
        placeholder="Tape pour filtrer, ex: 2010"
        value={query}
        onChange={(e) => handleTyping(e.target.value)}
      />
      {suggestions.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((y) => (
            <button key={y} type="button" onClick={() => pick(y)}>
              <Chip
                className={
                  value === y
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
                    : ""
                }
              >
                {y}
              </Chip>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">Aucune année ne correspond — vérifie les chiffres.</p>
      )}
      {categoryLabel && (
        <p className="mt-3 font-display text-sm font-bold uppercase tracking-wide text-[var(--color-primary-strong)]">
          Catégorie {categoryLabel}
        </p>
      )}
    </div>
  );
}

function ScreenPoste({ value, onChange }: { value: Position | null; onChange: (v: Position) => void }) {
  return (
    <div>
      <BrianAsks>{composeOnboardingPosition()}</BrianAsks>
      <div className="grid grid-cols-2 gap-2">
        {Object.values(Position).map((position) => (
          <button
            key={position}
            type="button"
            onClick={() => onChange(position)}
            className={`rounded-[var(--radius-control)] border px-3 py-3 text-sm font-semibold transition-colors ${
              value === position
                ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
            }`}
          >
            {POSITION_LABELS[position]}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScreenPaysNiveau({
  country,
  department,
  levelLabel,
  onChangeCountry,
  onChangeDepartment,
  onChangeLevel,
}: {
  country: string;
  department: string | null;
  levelLabel: string | null;
  onChangeCountry: (v: string) => void;
  onChangeDepartment: (v: string) => void;
  onChangeLevel: (v: string) => void;
}) {
  const niveaux = getNiveauxForCountry(country);
  const regions = getRegionsForCountry(country);

  return (
    <div>
      <BrianAsks>{composeOnboardingCountryLevel()}</BrianAsks>
      <div className="flex flex-col gap-4">
        <SuggestField value={country} onChange={onChangeCountry} options={FRANCOPHONE_COUNTRIES} placeholder="Cherche ton pays" />

        {country === "France" && (
          <SuggestField
            value={department}
            onChange={onChangeDepartment}
            options={ALL_FRANCE_DEPARTMENTS}
            placeholder="Cherche ton département"
          />
        )}

        {country !== "France" && regions.length > 0 && (
          <SuggestField
            value={department}
            onChange={onChangeDepartment}
            options={regions}
            placeholder="Cherche ta région (facultatif)"
          />
        )}

        <SuggestField value={levelLabel} onChange={onChangeLevel} options={niveaux} placeholder="Cherche ton niveau de jeu" />
      </div>
    </div>
  );
}

function ScreenGabaritRythme({
  heightCm,
  weightKg,
  clubSessionsPerWeek,
  matchDay,
  onChangeHeight,
  onChangeWeight,
  onChangeSessions,
  onChangeMatchDay,
}: {
  heightCm: number | null;
  weightKg: number | null;
  clubSessionsPerWeek: number | null;
  matchDay: Weekday | null;
  onChangeHeight: (v: number | null) => void;
  onChangeWeight: (v: number | null) => void;
  onChangeSessions: (v: number | null) => void;
  onChangeMatchDay: (v: Weekday | null) => void;
}) {
  return (
    <div>
      <BrianAsks>{composeOnboardingBodyRhythm()}</BrianAsks>
      <div className="grid grid-cols-2 gap-3">
        <DragSliderField
          label="Taille (cm)"
          unit="cm"
          value={heightCm}
          onChange={onChangeHeight}
          min={120}
          max={210}
          orientation="vertical"
        />
        <DragSliderField
          label="Poids (kg)"
          unit="kg"
          value={weightKg}
          onChange={onChangeWeight}
          min={25}
          max={110}
          orientation="horizontal"
        />
      </div>
      <div className="mt-4">
        <label className="mb-1 block text-xs font-semibold text-[var(--color-text-muted)]">
          Entraînements club par semaine
        </label>
        <input
          type="number"
          min={0}
          max={10}
          className={fieldClass()}
          value={clubSessionsPerWeek ?? ""}
          onChange={(e) => onChangeSessions(e.target.value ? Number(e.target.value) : null)}
        />
      </div>
      <div className="mt-4">
        <label className="mb-1 block text-xs font-semibold text-[var(--color-text-muted)]">Jour de match (éventuel)</label>
        <select className={fieldClass()} value={matchDay ?? ""} onChange={(e) => onChangeMatchDay((e.target.value || null) as Weekday | null)}>
          <option value="">Pas de jour fixe</option>
          {Object.values(Weekday).map((d) => (
            <option key={d} value={d}>
              {WEEKDAY_LABELS[d]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ScreenMateriel({
  value,
  onChange,
  otherNote,
  onChangeOtherNote,
}: {
  value: Equipment[];
  onChange: (v: Equipment[]) => void;
  otherNote: string;
  onChangeOtherNote: (v: string) => void;
}) {
  const [otherOpen, setOtherOpen] = useState(otherNote.trim().length > 0);

  function toggle(eq: Equipment) {
    if (eq === "NONE") {
      onChange(["NONE"] as Equipment[]);
      return;
    }
    const withoutNone = value.filter((v) => v !== "NONE");
    if (withoutNone.includes(eq)) {
      onChange(withoutNone.filter((v) => v !== eq));
    } else {
      onChange([...withoutNone, eq]);
    }
  }

  return (
    <div>
      <BrianAsks>{composeOnboardingEquipment()}</BrianAsks>
      <div className="flex flex-wrap gap-2">
        {Object.values(Equipment).map((eq) => (
          <button
            key={eq}
            type="button"
            onClick={() => toggle(eq)}
            className={value.includes(eq) ? "" : ""}
          >
            <Chip
              className={
                value.includes(eq)
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
                  : ""
              }
            >
              {EQUIPMENT_EMOJI[eq]} {EQUIPMENT_LABELS[eq]}
            </Chip>
          </button>
        ))}
        <button type="button" onClick={() => setOtherOpen((o) => !o)}>
          <Chip
            className={
              otherOpen
                ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
                : ""
            }
          >
            ➕ Autre
          </Chip>
        </button>
      </div>
      {otherOpen && (
        <div className="mt-4">
          <label className="mb-1 block text-xs font-semibold text-[var(--color-text-muted)]">
            Tu as autre chose ? Précise, ça nous aide à voir ce qu&apos;on a oublié.
          </label>
          <textarea
            autoFocus
            className={`${fieldClass()} min-h-16`}
            placeholder="ex: haies, échelle de rythme, sac lesté..."
            value={otherNote}
            onChange={(e) => onChangeOtherNote(e.target.value)}
            maxLength={140}
          />
        </div>
      )}
    </div>
  );
}

function ScreenObjectif({
  objective,
  weakPointNote,
  onChangeObjective,
  onChangeWeakPoint,
}: {
  objective: Objective | null;
  weakPointNote: string;
  onChangeObjective: (v: Objective) => void;
  onChangeWeakPoint: (v: string) => void;
}) {
  return (
    <div>
      <BrianAsks>{composeOnboardingObjective()}</BrianAsks>
      <div className="grid grid-cols-2 gap-2">
        {Object.values(Objective).map((obj) => (
          <button
            key={obj}
            type="button"
            onClick={() => onChangeObjective(obj)}
            className={`rounded-[var(--radius-control)] border px-3 py-3 text-sm font-semibold transition-colors ${
              objective === obj
                ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
            }`}
          >
            {OBJECTIVE_EMOJI[obj]} {OBJECTIVE_LABELS[obj]}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <label className="mb-1 block text-xs font-semibold text-[var(--color-text-muted)]">
          Un point faible que tu ressens ? (facultatif)
        </label>
        <textarea
          className={`${fieldClass()} min-h-20`}
          value={weakPointNote}
          onChange={(e) => onChangeWeakPoint(e.target.value)}
          maxLength={280}
        />
      </div>
    </div>
  );
}

function ScreenRevelation({
  data,
  ageCategoryLabel,
  anonId,
}: {
  data: OnboardingData;
  ageCategoryLabel: string | null;
  anonId: string;
}) {
  return (
    <div className="text-center">
      <BrianAsks celebrating>{composeOnboardingRevelation(data.firstName)}</BrianAsks>
      <div className="flex flex-wrap justify-center gap-2">
        {ageCategoryLabel && <Chip>{ageCategoryLabel}</Chip>}
        {data.position && <Chip>{POSITION_LABELS[data.position]}</Chip>}
        {data.objective && (
          <Chip>
            {OBJECTIVE_EMOJI[data.objective]} {OBJECTIVE_LABELS[data.objective]}
          </Chip>
        )}
      </div>
      <p className="mt-4 text-sm text-[var(--color-text-muted)]">
        Crée ton compte pour débloquer ton premier programme personnalisé.
      </p>
      <Link href="/inscription" className="mt-6 block">
        <Button
          className="w-full"
          onClick={() => {
            trackOnboardingFunnel(anonId, 7, "revelation", "COMPLETED");
            trackClick(anonId, "onboarding_create_account");
          }}
        >
          Créer mon compte
        </Button>
      </Link>
      <Link href="/connexion" className="mt-3 block text-sm font-semibold text-[var(--color-text-muted)] underline">
        J&apos;ai déjà un compte
      </Link>
    </div>
  );
}
