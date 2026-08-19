function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Chronomètre en forme de cône d'entraînement — le repère visuel du terrain plutôt qu'un widget générique. */
export function ConeTimer({ seconds, running }: { seconds: number; running: boolean }) {
  return (
    <div className="mx-auto flex flex-col items-center">
      <div
        className="relative flex items-end justify-center"
        style={{
          width: 148,
          height: 172,
          background: "linear-gradient(180deg, #fb923c, #ea580c)",
          clipPath: "polygon(46% 0%, 54% 0%, 88% 100%, 12% 100%)",
          boxShadow: running ? "0 0 24px -4px rgba(234,88,12,0.7)" : "0 6px 16px -6px rgba(0,0,0,0.3)",
          transition: "box-shadow 0.3s",
        }}
      >
        <div className="absolute inset-x-0 top-[38%] h-[14%] bg-white/90" />
        <div className="absolute inset-x-0 top-[64%] h-[10%] bg-white/90" />
        <p className="relative z-10 mb-3 font-display text-2xl font-extrabold tabular-nums text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]">
          {formatMmSs(seconds)}
        </p>
      </div>
    </div>
  );
}
