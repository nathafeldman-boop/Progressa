import Link from "next/link";
import { BrianAvatar } from "@/components/brian/BrianAvatar";

interface LogEntry {
  id: string;
  title: string;
  completedAt: Date | null;
  difficultyRating: number | null;
}

/**
 * "Journal de bord": ce que le joueur a réellement accompli, mis en avant
 * comme point d'ancrage de la page plutôt que noyé en bas.
 */
export function TrainingLog({ entries }: { entries: LogEntry[] }) {
  return (
    <div className="rounded-[var(--radius-card)] border-2 border-[var(--color-primary)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-primary-strong)]">
          Journal de bord
        </p>
        <Link href="/journal" className="text-xs font-semibold text-[var(--color-primary-strong)] underline">
          Tout voir
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="mt-3 flex items-center gap-3">
          <BrianAvatar state="idle" size={36} />
          <p className="text-sm text-[var(--color-text-muted)]">
            Aucune séance terminée pour l&apos;instant — ton activité apparaîtra ici.
          </p>
        </div>
      ) : (
        <ul className="mt-3 space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 border-l-2 border-[var(--color-primary-soft)] pl-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--color-text)]">{entry.title}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {entry.completedAt?.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) ?? ""}
                  {entry.difficultyRating != null && ` · ressenti ${entry.difficultyRating}/5`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link href="/journal" className="mt-4 block text-center text-sm font-semibold text-[var(--color-primary-strong)]">
        Check-in, blessures, matchs, objectifs →
      </Link>
    </div>
  );
}
