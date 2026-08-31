import type { WeekdayActivityBucket } from "@/lib/admin/queries";
import { cn } from "@/lib/cn";

// Même vert de marque validé que SignupsChart.tsx (#1aa350) — une seule
// série ici (visiteurs distincts), pas besoin de légende ni de deuxième
// teinte: le titre de la section nomme déjà ce qui est montré.
const COLOR = "#1aa350";

export function WeekdayActivityChart({ data }: { data: WeekdayActivityBucket[] }) {
  const maxAvg = Math.max(0, ...data.map((d) => d.avgVisitors));
  const peak = data.reduce((best, d) => (d.avgVisitors > best.avgVisitors ? d : best), data[0]);

  return (
    <div>
      <div className="flex items-end justify-between gap-1.5" style={{ height: 130 }}>
        {data.map((d) => {
          const isPeak = maxAvg > 0 && d.weekday === peak.weekday;
          const heightPct = maxAvg > 0 ? Math.max((d.avgVisitors / maxAvg) * 100, 3) : 3;
          return (
            <div key={d.weekday} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-[10px] font-bold tabular-nums text-[var(--color-text)]">{d.avgVisitors.toFixed(1)}</span>
              <div className="flex w-full flex-1 items-end justify-center">
                <div
                  className="w-full max-w-[28px] rounded-t-[4px]"
                  style={{ height: `${heightPct}%`, background: COLOR, opacity: isPeak ? 1 : 0.5 }}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase",
                  isPeak ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"
                )}
              >
                {d.label.slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>

      {peak.avgVisitors > 0 && (
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          Pic d&apos;affluence : <span className="font-bold text-[var(--color-text)]">{peak.label}</span>, en moyenne{" "}
          {peak.avgVisitors.toFixed(1)} visiteurs distincts.
        </p>
      )}

      <details className="mt-2">
        <summary className="cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] underline">Voir en tableau</summary>
        <div className="mt-2 overflow-hidden rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-xs">
            <thead className="bg-[var(--color-surface-alt)]">
              <tr className="text-left text-[var(--color-text-muted)]">
                <th className="px-2 py-1.5">Jour</th>
                <th className="px-2 py-1.5">Visiteurs (moyenne)</th>
                <th className="px-2 py-1.5">Visiteurs (total période)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.weekday} className="border-t border-[var(--color-border)]">
                  <td className="px-2 py-1.5">{d.label}</td>
                  <td className="px-2 py-1.5 tabular-nums">{d.avgVisitors.toFixed(1)}</td>
                  <td className="px-2 py-1.5 tabular-nums">{d.totalVisitors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
