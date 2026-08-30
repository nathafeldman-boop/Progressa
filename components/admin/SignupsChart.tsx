"use client";

import { useMemo, useRef, useState } from "react";
import type { SignupDayBucket } from "@/lib/admin/queries";

// Palette validée (node scripts/validate_palette.js "#1aa350,#2563a6" --mode
// light -> ALL CHECKS PASS, y compris la séparation CVD) — vert de marque
// pour Gratuit, bleu --color-info pour Premium. Un vert/or aurait été plus
// thématique (or = premium ailleurs dans l'app) mais échoue le contrôle
// daltonisme (ΔE 5.2, sous le plancher de 6).
const FREE_COLOR = "#1aa350";
const PREMIUM_COLOR = "#2563a6";

const WIDTH = 640;
const HEIGHT = 220;
const PAD_LEFT = 34;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 26;
const GAP_PX = 2; // séparateur entre les deux segments empilés (surface color)

function niceStep(roughStep: number): number {
  if (roughStep <= 0) return 1;
  const exponent = Math.floor(Math.log10(roughStep));
  const magnitude = Math.pow(10, exponent);
  const residual = roughStep / magnitude;
  const niceResidual = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10;
  return niceResidual * magnitude;
}

function computeTicks(maxValue: number, desiredCount = 4): number[] {
  if (maxValue <= 0) return [0, 1, 2, 3];
  const step = niceStep(maxValue / desiredCount);
  const ticks: number[] = [];
  for (let t = 0; t <= maxValue + step * 0.001; t += step) ticks.push(Math.round(t));
  return ticks;
}

function formatDayLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

export function SignupsChart({ data }: { data: SignupDayBucket[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const n = data.length;
  const innerWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const maxTotal = Math.max(1, ...data.map((d) => d.free + d.premium));
  const ticks = computeTicks(maxTotal);
  const yMax = ticks[ticks.length - 1];

  const xAt = (i: number) => PAD_LEFT + (n <= 1 ? innerWidth / 2 : (i / (n - 1)) * innerWidth);
  const yAt = (value: number) => PAD_TOP + innerHeight - (value / yMax) * innerHeight;

  const { freeTopPath, freeAreaPath, premiumTopPath, premiumAreaPath } = useMemo(() => {
    const baseline = yAt(0);
    const freeTopPts = data.map((d, i) => [xAt(i), yAt(d.free)] as const);
    const premiumBase = data.map((d, i) => [xAt(i), yAt(d.free) - GAP_PX] as const);
    const premiumTopPts = data.map((d, i) => [xAt(i), yAt(d.free + d.premium) - GAP_PX] as const);

    const line = (pts: readonly (readonly [number, number])[]) => pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");

    const freeTop = line(freeTopPts);
    const freeArea = `${line(freeTopPts)} L${xAt(n - 1)},${baseline} L${xAt(0)},${baseline} Z`;
    const premiumTop = line(premiumTopPts);
    const premiumArea = `${line(premiumTopPts)} L${xAt(n - 1)},${premiumBase[n - 1][1]} ${premiumBase
      .slice()
      .reverse()
      .map(([x, y]) => `L${x},${y}`)
      .join(" ")} Z`;

    return { freeTopPath: freeTop, freeAreaPath: freeArea, premiumTopPath: premiumTop, premiumAreaPath: premiumArea };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- xAt/yAt dépendent seulement de data.length et yMax, déjà dans les deps
  }, [data, n, yMax]);

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg || n === 0) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const ratio = n <= 1 ? 0 : (relX - PAD_LEFT) / innerWidth;
    const idx = Math.round(Math.min(Math.max(ratio, 0), 1) * (n - 1));
    setHoverIndex(idx);
  }

  const hovered = hoverIndex != null ? data[hoverIndex] : null;
  const hoverX = hoverIndex != null ? xAt(hoverIndex) : null;
  // Bascule le tooltip à gauche du curseur passé la moitié du graphe, pour
  // qu'il ne sorte jamais du cadre côté droit.
  const tooltipOnLeft = hoverX != null && hoverX > PAD_LEFT + innerWidth / 2;

  const lastFree = data[n - 1]?.free ?? 0;
  const lastPremium = data[n - 1]?.premium ?? 0;

  return (
    <div>
      <div className="mb-2 flex items-center gap-4 text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3 rounded-full" style={{ background: FREE_COLOR }} />
          Gratuit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3 rounded-full" style={{ background: PREMIUM_COLOR }} />
          Premium
        </span>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full touch-none"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
          role="img"
          aria-label="Inscriptions par jour, gratuit et premium"
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={yAt(t)} y2={yAt(t)} stroke="var(--color-border)" strokeWidth={1} />
              <text x={PAD_LEFT - 8} y={yAt(t)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="var(--color-text-muted)">
                {t}
              </text>
            </g>
          ))}

          <path d={freeAreaPath} fill={FREE_COLOR} fillOpacity={0.1} stroke="none" />
          <path d={premiumAreaPath} fill={PREMIUM_COLOR} fillOpacity={0.1} stroke="none" />
          <path d={freeTopPath} fill="none" stroke={FREE_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <path d={premiumTopPath} fill="none" stroke={PREMIUM_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {n > 0 && (
            <>
              <circle cx={xAt(n - 1)} cy={yAt(lastFree)} r={4} fill={FREE_COLOR} stroke="var(--color-surface)" strokeWidth={2} />
              <circle
                cx={xAt(n - 1)}
                cy={yAt(lastFree + lastPremium) - GAP_PX}
                r={4}
                fill={PREMIUM_COLOR}
                stroke="var(--color-surface)"
                strokeWidth={2}
              />
              <text x={xAt(n - 1) - 6} y={yAt(lastFree) - 8} textAnchor="end" fontSize={10} fontWeight={700} fill="var(--color-text)">
                {lastFree}
              </text>
              <text
                x={xAt(n - 1) - 6}
                y={yAt(lastFree + lastPremium) - GAP_PX - 8}
                textAnchor="end"
                fontSize={10}
                fontWeight={700}
                fill="var(--color-text)"
              >
                {lastPremium}
              </text>
            </>
          )}

          {n > 1 && (data.length <= 14 ? data : data.filter((_, i) => i % Math.ceil(n / 6) === 0)).map((d) => {
            const i = data.indexOf(d);
            return (
              <text key={d.date} x={xAt(i)} y={HEIGHT - 8} textAnchor="middle" fontSize={9} fill="var(--color-text-muted)">
                {formatDayLabel(d.date)}
              </text>
            );
          })}

          {hoverX != null && (
            <line x1={hoverX} x2={hoverX} y1={PAD_TOP} y2={PAD_TOP + innerHeight} stroke="var(--color-text-muted)" strokeWidth={1} strokeDasharray="3 3" />
          )}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute top-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-2 text-xs shadow-[var(--shadow-card)]"
            style={{
              left: `${((hoverX ?? 0) / WIDTH) * 100}%`,
              transform: tooltipOnLeft ? "translateX(calc(-100% - 8px))" : "translateX(8px)",
            }}
          >
            <p className="font-semibold text-[var(--color-text-muted)]">{formatDayLabel(hovered.date)}</p>
            <p className="mt-1 flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-2.5 rounded-full" style={{ background: FREE_COLOR }} />
              <span className="font-bold">{hovered.free}</span> gratuit
            </p>
            <p className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-2.5 rounded-full" style={{ background: PREMIUM_COLOR }} />
              <span className="font-bold">{hovered.premium}</span> premium
            </p>
          </div>
        )}
      </div>

      <details className="mt-2">
        <summary className="cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] underline">Voir en tableau</summary>
        <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[var(--color-surface-alt)]">
              <tr className="text-left text-[var(--color-text-muted)]">
                <th className="px-2 py-1.5">Jour</th>
                <th className="px-2 py-1.5">Gratuit</th>
                <th className="px-2 py-1.5">Premium</th>
              </tr>
            </thead>
            <tbody>
              {data
                .slice()
                .reverse()
                .map((d) => (
                  <tr key={d.date} className="border-t border-[var(--color-border)]">
                    <td className="px-2 py-1.5">{formatDayLabel(d.date)}</td>
                    <td className="px-2 py-1.5 tabular-nums">{d.free}</td>
                    <td className="px-2 py-1.5 tabular-nums">{d.premium}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
