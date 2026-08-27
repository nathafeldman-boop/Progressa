"use client";

import { useState } from "react";
import { Equipment } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EQUIPMENT_EMOJI, EQUIPMENT_LABELS } from "@/lib/labels";

/**
 * Le matériel déclaré à l'inscription servait surtout à calibrer le tout
 * premier test — mais il détermine aussi, depuis, quels exercices sortent
 * dans l'entraînement ciblé (ex: pas de ballon coché = plus aucun exercice
 * de dribble/pied faible). Le matériel dispo évolue avec le temps, donc il
 * doit pouvoir se mettre à jour ici plutôt que rester figé à vie.
 */
export function EquipmentEditor({ initialEquipment }: { initialEquipment: Equipment[] }) {
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  function toggle(eq: Equipment) {
    setSaved(false);
    if (eq === "NONE") {
      setEquipment(["NONE"]);
      return;
    }
    const withoutNone = equipment.filter((v) => v !== "NONE");
    setEquipment(withoutNone.includes(eq) ? withoutNone.filter((v) => v !== eq) : [...withoutNone, eq]);
  }

  async function save() {
    setSaving(true);
    setError(false);
    try {
      const res = await fetch("/api/profile/equipment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipment: equipment.length > 0 ? equipment : ["NONE"] }),
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      setSaved(true);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {Object.values(Equipment).map((eq) => (
          <button key={eq} type="button" onClick={() => toggle(eq)}>
            <Chip
              className={
                equipment.includes(eq)
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
                  : ""
              }
            >
              {EQUIPMENT_EMOJI[eq]} {EQUIPMENT_LABELS[eq]}
            </Chip>
          </button>
        ))}
      </div>
      <Button onClick={save} disabled={saving} className="w-full">
        {saving ? "Enregistrement..." : saved ? "Enregistré ✓" : "Enregistrer"}
      </Button>
      {error && (
        <p className="text-center text-xs text-[var(--color-danger)]">
          Impossible d&apos;enregistrer pour l&apos;instant, réessaie.
        </p>
      )}
    </div>
  );
}
