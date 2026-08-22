"use client";

import { useState } from "react";
import { Equipment } from "@prisma/client";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { EQUIPMENT_LABELS, EQUIPMENT_EMOJI } from "@/lib/labels";

const CHECKABLE_EQUIPMENT: Equipment[] = [
  Equipment.BALL,
  Equipment.CONES,
  Equipment.WALL,
  Equipment.STREET_PITCH,
  Equipment.RESISTANCE_BAND,
];

const LOCATIONS = ["Jardin / extérieur", "Salon / intérieur", "Terrain ou city-stade", "Ailleurs"];

/**
 * Toujours demandé avant de lancer une séance, quel que soit le programme:
 * le matériel réel du jour peut varier de ce qui est déclaré au profil
 * (plots oubliés, pas de mur dispo aujourd'hui...) — plutôt que de bloquer
 * ou d'ignorer le manque, on l'utilise pour proposer des remplacements
 * pendant la séance (voir ActiveExerciseScreen: substitution "pas de plots").
 */
export function PreSessionCheckIn({
  defaultEquipment,
  onConfirm,
}: {
  defaultEquipment: Equipment[];
  onConfirm: (context: { equipment: Equipment[]; solo: boolean }) => void;
}) {
  const [selected, setSelected] = useState<Set<Equipment>>(
    () => new Set(defaultEquipment.filter((e) => e !== Equipment.NONE))
  );
  const [location, setLocation] = useState<string | null>(null);
  const [solo, setSolo] = useState<boolean | null>(null);

  function toggle(eq: Equipment) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(eq)) next.delete(eq);
      else next.add(eq);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <div className="flex items-start gap-2">
        <BrianAvatar state="talking" size={40} />
        <p className="text-sm font-semibold text-[var(--color-text)]">
          Avant de commencer: qu&apos;est-ce que tu as sous la main aujourd&apos;hui ? J&apos;adapte la séance si besoin —
          jamais bloquant, juste plus précis.
        </p>
      </div>

      <Card>
        <CardTitle className="text-base">Ton matériel du jour</CardTitle>
        <CardSubtitle className="mt-0.5">Décoche ce que tu n&apos;as pas sous la main maintenant.</CardSubtitle>
        <div className="mt-3 flex flex-wrap gap-2">
          {CHECKABLE_EQUIPMENT.map((eq) => {
            const active = selected.has(eq);
            return (
              <button
                key={eq}
                type="button"
                onClick={() => toggle(eq)}
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                }`}
              >
                {EQUIPMENT_EMOJI[eq]} {EQUIPMENT_LABELS[eq]}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          Pas de plots ? Pas de problème — des chaussettes roulées, un sac ou une bouteille font l&apos;affaire, je te le
          rappellerai au bon moment.
        </p>
      </Card>

      <Card>
        <CardTitle className="text-base">Tu es seul ou avec quelqu&apos;un ?</CardTitle>
        <CardSubtitle className="mt-0.5">
          Certains exercices se font à deux — je les adapte ou te propose de les passer si tu es seul.
        </CardSubtitle>
        <div className="mt-3 flex gap-2">
          {[
            { value: true, label: "Seul(e)" },
            { value: false, label: "Avec un ami / partenaire" },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => setSolo(opt.value)}
              className={`flex-1 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                solo === opt.value
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle className="text-base">Où es-tu ?</CardTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocation((prev) => (prev === loc ? null : loc))}
              className={`rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                location === loc
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </Card>

      <Button className="w-full" onClick={() => onConfirm({ equipment: Array.from(selected), solo: solo ?? true })}>
        C&apos;est parti ⚡
      </Button>
    </div>
  );
}
