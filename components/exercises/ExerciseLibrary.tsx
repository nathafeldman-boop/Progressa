"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ExerciseCategory } from "@prisma/client";
import { Card, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { EXERCISE_FRAMES } from "@/lib/exercises/exercise-frames";

export interface LibraryEntry {
  slug: string;
  name: string;
  emoji: string;
  category: ExerciseCategory;
  description: string;
  matchBenefit: string;
  steps: string[];
  commonMistakes: string[];
  easyVariant: string;
  hardVariant: string;
  durationMinutes: number;
  locked: boolean;
  lockReason: "premium" | "equipment" | null;
}

const CATEGORY_ORDER: ExerciseCategory[] = ["TECHNIQUE", "STRENGTH", "EXPLOSIVENESS", "CARDIO", "PREVENTION", "GOALKEEPER"];

const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  TECHNIQUE: "Technique",
  STRENGTH: "Renforcement",
  EXPLOSIVENESS: "Vitesse & explosivité",
  CARDIO: "Cardio",
  PREVENTION: "Prévention & récupération",
  GOALKEEPER: "Gardien de but",
};

function ExerciseThumb({ slug, emoji }: { slug: string; emoji: string }) {
  const firstPose = EXERCISE_FRAMES[slug]?.poses[0];
  if (firstPose) {
    return (
      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
        <Image src={firstPose.image} alt="" fill sizes="44px" className="object-cover" unoptimized />
      </span>
    );
  }
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-xl">
      {emoji}
    </span>
  );
}

function LockBadge({ reason }: { reason: "premium" | "equipment" }) {
  return (
    <span className="inline-block rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
      {reason === "premium" ? "Premium" : "Matériel requis"}
    </span>
  );
}

function ExerciseRow({ entry }: { entry: LibraryEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)]/70 bg-[var(--color-surface)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <ExerciseThumb slug={entry.slug} emoji={entry.emoji} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold uppercase tracking-wide text-[var(--color-text)]">{entry.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[var(--color-text-muted)]">~{entry.durationMinutes} min</span>
            {entry.lockReason && <LockBadge reason={entry.lockReason} />}
          </div>
        </div>
        <span className="shrink-0 text-[var(--color-text-muted)]">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-[var(--color-border)]/70 p-3 pt-3">
          <p className="text-sm text-[var(--color-text)]">{entry.description}</p>
          <p className="text-xs italic text-[var(--color-text-muted)]">{entry.matchBenefit}</p>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">Étapes</p>
            <ol className="mt-1 list-decimal space-y-1 pl-4 text-sm text-[var(--color-text)]">
              {entry.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="font-bold uppercase tracking-wide text-[var(--color-text-muted)]">Plus facile</p>
              <p className="mt-1 text-[var(--color-text)]">{entry.easyVariant}</p>
            </div>
            <div>
              <p className="font-bold uppercase tracking-wide text-[var(--color-text-muted)]">Plus dur</p>
              <p className="mt-1 text-[var(--color-text)]">{entry.hardVariant}</p>
            </div>
          </div>
          {entry.locked && (
            <Link
              href={entry.lockReason === "premium" ? "/parametres/abonnement" : "/parametres/compte"}
              className="block text-center text-xs font-semibold text-[var(--color-primary-strong)] underline"
            >
              {entry.lockReason === "premium" ? "Débloquer avec Premium" : "Indiquer ton matériel dans les réglages"}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function CategorySection({ category, entries }: { category: ExerciseCategory; entries: LibraryEntry[] }) {
  const [expanded, setExpanded] = useState(false);
  const unlockedCount = entries.filter((e) => !e.locked).length;

  return (
    <Card>
      <button type="button" onClick={() => setExpanded((e) => !e)} className="flex w-full items-center justify-between text-left">
        <div>
          <CardTitle className="text-base">{CATEGORY_LABELS[category]}</CardTitle>
          <CardSubtitle className="mt-0.5">
            {unlockedCount}/{entries.length} exercice{entries.length > 1 ? "s" : ""} débloqué{unlockedCount > 1 ? "s" : ""}
          </CardSubtitle>
        </div>
        <span className="text-xl text-[var(--color-text-muted)]">{expanded ? "−" : "+"}</span>
      </button>
      {expanded && (
        <div className="mt-3 space-y-2">
          {entries.map((entry) => (
            <ExerciseRow key={entry.slug} entry={entry} />
          ))}
        </div>
      )}
    </Card>
  );
}

export function ExerciseLibrary({ entries }: { entries: LibraryEntry[] }) {
  const byCategory = new Map<ExerciseCategory, LibraryEntry[]>();
  for (const entry of entries) {
    const list = byCategory.get(entry.category) ?? [];
    list.push(entry);
    byCategory.set(entry.category, list);
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-4 pb-10">
      <div>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Bibliothèque d&apos;exercices</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {entries.length} exercices classés par catégorie. Tape sur une catégorie pour l&apos;ouvrir, puis sur un
          exercice pour voir le détail.
        </p>
      </div>

      {CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((category) => (
        <CategorySection key={category} category={category} entries={byCategory.get(category)!} />
      ))}
    </div>
  );
}
