"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Equipment, Objective, Position, Weekday, type Country } from "@prisma/client";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getAgeCategory } from "@/lib/age-category";
import { COUNTRY_LABELS, FRANCE_LIGUES, getDistrictsForLigue, getNiveauxForCountry } from "@/lib/geo";
import { EQUIPMENT_EMOJI, EQUIPMENT_LABELS, OBJECTIVE_EMOJI, OBJECTIVE_LABELS, POSITION_LABELS, WEEKDAY_LABELS } from "@/lib/labels";
import { getOrCreateAnonId, loadOnboardingData, saveOnboardingData, setReferralCode } from "@/lib/onboarding/storage";
import { ONBOARDING_SCREEN_KEYS, type OnboardingData } from "@/lib/onboarding/types";
import { trackClick, trackOnboardingFunnel } from "@/lib/analytics/track";

const TOTAL_SCREENS = ONBOARDING_SCREEN_KEYS.length;

function fieldClass() {
  return "w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]";
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
        if (!data.levelLabel) return "Choisis ton niveau de jeu.";
        if (data.country === "FR" && (!data.ligue || !data.district)) return "Choisis ta ligue et ton district.";
        return null;
      }
      case "gabarit_rythme":
        return null;
      case "materiel":
        return data.equipment.length > 0 ? null : "Choisis au moins une option (ou \"Aucun matériel\").";
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
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-4">
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
          />
        )}
        {ONBOARDING_SCREEN_KEYS[step] === "poste" && (
          <ScreenPoste value={data.position} onChange={(v) => update("position", v)} />
        )}
        {ONBOARDING_SCREEN_KEYS[step] === "pays_niveau" && (
          <ScreenPaysNiveau
            country={data.country}
            ligue={data.ligue}
            district={data.district}
            levelLabel={data.levelLabel}
            onChangeCountry={(v) => setData((prev) => ({ ...prev, country: v, ligue: null, district: null, levelLabel: null }))}
            onChangeLigue={(v) => setData((prev) => ({ ...prev, ligue: v, district: null }))}
            onChangeDistrict={(v) => update("district", v)}
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
          <ScreenMateriel value={data.equipment} onChange={(v) => update("equipment", v)} />
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
  );
}

function ScreenPrenom({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <CardTitle>Comment tu t&apos;appelles ?</CardTitle>
      <CardSubtitle className="mt-1">On personnalise tout ton programme à partir d&apos;ici.</CardSubtitle>
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
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  categoryLabel: string | null;
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
      <CardTitle>Ton année de naissance ?</CardTitle>
      <CardSubtitle className="mt-1">Ça nous permet de calculer ta catégorie et d&apos;adapter les séances.</CardSubtitle>
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        className={`${fieldClass()} mt-6`}
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
      <CardTitle>Ton poste ?</CardTitle>
      <div className="mt-6 grid grid-cols-2 gap-2">
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
  ligue,
  district,
  levelLabel,
  onChangeCountry,
  onChangeLigue,
  onChangeDistrict,
  onChangeLevel,
}: {
  country: Country;
  ligue: string | null;
  district: string | null;
  levelLabel: string | null;
  onChangeCountry: (v: Country) => void;
  onChangeLigue: (v: string) => void;
  onChangeDistrict: (v: string) => void;
  onChangeLevel: (v: string) => void;
}) {
  const niveaux = getNiveauxForCountry(country);
  return (
    <div>
      <CardTitle>Ton pays et ton niveau ?</CardTitle>
      <div className="mt-6 flex flex-col gap-4">
        <select className={fieldClass()} value={country} onChange={(e) => onChangeCountry(e.target.value as Country)}>
          {Object.entries(COUNTRY_LABELS).map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>

        {country === "FR" && (
          <>
            <select className={fieldClass()} value={ligue ?? ""} onChange={(e) => onChangeLigue(e.target.value)}>
              <option value="">Choisis ta ligue régionale</option>
              {FRANCE_LIGUES.map((l) => (
                <option key={l.name} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
            {ligue && (
              <select className={fieldClass()} value={district ?? ""} onChange={(e) => onChangeDistrict(e.target.value)}>
                <option value="">Choisis ton district</option>
                {getDistrictsForLigue(ligue).map((d) => (
                  <option key={d} value={d}>
                    District de {d}
                  </option>
                ))}
              </select>
            )}
          </>
        )}

        <select className={fieldClass()} value={levelLabel ?? ""} onChange={(e) => onChangeLevel(e.target.value)}>
          <option value="">Choisis ton niveau de jeu</option>
          {niveaux.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
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
      <CardTitle>Ton gabarit et ton rythme</CardTitle>
      <CardSubtitle className="mt-1">Tout est facultatif — réponds à ce que tu sais.</CardSubtitle>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-[var(--color-text-muted)]">Taille (cm)</label>
          <input
            type="number"
            className={fieldClass()}
            value={heightCm ?? ""}
            onChange={(e) => onChangeHeight(e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-[var(--color-text-muted)]">Poids (kg)</label>
          <input
            type="number"
            className={fieldClass()}
            value={weightKg ?? ""}
            onChange={(e) => onChangeWeight(e.target.value ? Number(e.target.value) : null)}
          />
        </div>
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

function ScreenMateriel({ value, onChange }: { value: Equipment[]; onChange: (v: Equipment[]) => void }) {
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
      <CardTitle>Ton matériel disponible</CardTitle>
      <CardSubtitle className="mt-1">Sélectionne tout ce que tu as sous la main.</CardSubtitle>
      <div className="mt-6 flex flex-wrap gap-2">
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
      </div>
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
      <CardTitle>Ton objectif principal</CardTitle>
      <div className="mt-6 grid grid-cols-2 gap-2">
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
      <div className="text-4xl">🎉</div>
      <CardTitle className="mt-3 text-2xl">Ton profil est prêt, {data.firstName || "champion"} !</CardTitle>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
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
