"use client";

import { useMemo, useState } from "react";
import { Chip } from "@/components/ui/Chip";

function fieldClass() {
  return "w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]";
}

/**
 * Barre de recherche à suggestions: on tape, la liste se filtre en direct,
 * on touche une suggestion pour choisir — jamais de long menu déroulant natif.
 */
export function SuggestField({
  value,
  onChange,
  options,
  placeholder,
  maxSuggestions = 8,
}: {
  value: string | null;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
  maxSuggestions?: number;
}) {
  const [query, setQuery] = useState(value ?? "");
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
    return list.slice(0, maxSuggestions);
  }, [query, options, maxSuggestions]);

  function pick(v: string) {
    setQuery(v);
    onChange(v);
    setFocused(false);
  }

  return (
    <div>
      <input
        className={fieldClass()}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
      />
      {focused && suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestions.map((o) => (
            <button key={o} type="button" onMouseDown={() => pick(o)}>
              <Chip
                className={
                  value === o
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
                    : ""
                }
              >
                {o}
              </Chip>
            </button>
          ))}
        </div>
      )}
      {focused && suggestions.length === 0 && (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">Aucun résultat — vérifie l&apos;orthographe.</p>
      )}
    </div>
  );
}
