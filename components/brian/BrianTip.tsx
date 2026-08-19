"use client";

import { useState } from "react";
import { BrianAvatar } from "./BrianAvatar";

/**
 * Petit tuto Coach Brian affiché une seule fois par emplacement (mémorisé
 * en localStorage via tipKey) — jamais répété une fois lu. Point de départ
 * du "tuto au premier clic sur chaque bouton important" : s'ajoute à un
 * nouvel écran/bouton en lui donnant une tipKey unique.
 */
export function BrianTip({ tipKey, text }: { tipKey: string; text: string }) {
  // Initialisation paresseuse (pas d'effet) pour éviter un rendu en cascade
  // — cf. le même pattern déjà établi ailleurs dans le code (OnboardingWizard).
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.localStorage.getItem(`brian-tip-${tipKey}`);
  });

  function dismiss() {
    window.localStorage.setItem(`brian-tip-${tipKey}`, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="flex items-start gap-2 rounded-[var(--radius-card)] border border-[var(--color-primary-soft)] bg-[var(--color-primary-soft)] p-3">
      <BrianAvatar state="talking" size={36} />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[var(--color-text)]">{text}</p>
        <button type="button" onClick={dismiss} className="mt-1 text-xs font-semibold text-[var(--color-primary-strong)] underline">
          Compris
        </button>
      </div>
    </div>
  );
}
