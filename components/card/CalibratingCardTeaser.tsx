import { STAT_SHORT_LABELS, STAT_AXES } from "@/lib/brian/types";

/**
 * Carte "à calibrer" montrée avant le tout premier test (section 2 du
 * cahier des charges carte joueur) — jamais un vrai PlayerCardStats
 * (aucune progression n'existe encore), juste une esquisse qui annonce ce
 * que la carte va devenir.
 */
export function CalibratingCardTeaser({ firstName }: { firstName: string }) {
  return (
    <div
      className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[1.75rem] border-2 border-dashed p-6 text-center"
      style={{ borderColor: "rgba(255,255,255,0.25)", background: "linear-gradient(165deg, #2a3530, #14201b)" }}
    >
      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-widest text-white/70">
        À calibrer
      </span>

      <p className="font-display mt-3 text-7xl font-extrabold leading-none text-white/25">?</p>
      <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/35">Note générale</p>

      <h2 className="font-display mt-4 text-xl font-extrabold uppercase tracking-wide text-white/80">{firstName}</h2>

      <div className="mt-5 grid grid-cols-3 gap-x-2 gap-y-3 border-t border-white/10 pt-4">
        {STAT_AXES.map((axis) => (
          <div key={axis}>
            <p className="font-display text-lg font-extrabold text-white/25">--</p>
            <p className="text-[0.6rem] font-bold uppercase tracking-widest text-white/30">{STAT_SHORT_LABELS[axis]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
