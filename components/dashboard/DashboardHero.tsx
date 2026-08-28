import Link from "next/link";
import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { Chip } from "@/components/ui/Chip";
import { nextRankProgress } from "@/lib/brian/stats-engine";

interface HeroSession {
  id: string;
  title: string;
  status: "PLANNED" | "COMPLETED" | "SKIPPED" | "ABANDONED";
  isMatchAdjacent: boolean;
}

interface HeroCardStats {
  overall: number;
  rankTier?: string;
}

/**
 * Bloc "Mission du jour" — premier élément de hiérarchie du dashboard
 * (Aujourd'hui → Entraîne-toi → Gagne → Progresse). Pensé pour donner
 * immédiatement envie de lancer la séance, pas pour ressembler à un
 * formulaire: dégradé vert premium, particules discrètes, CTA volumétrique,
 * Coach Brian dans un coin comme un vrai coach — pas une mascotte partout.
 */
export function DashboardHero({
  todaySession,
  cardStats,
  streakCount,
  hasProgram,
  firstName,
  isMatchDayToday,
}: {
  todaySession: HeroSession | null;
  cardStats: HeroCardStats | null;
  streakCount: number;
  hasProgram: boolean;
  firstName: string;
  isMatchDayToday: boolean;
}) {
  const progress = cardStats ? nextRankProgress(cardStats.overall) : null;
  const alreadyDone = todaySession?.status === "COMPLETED";

  return (
    <div
      className="relative overflow-hidden rounded-[1.75rem] p-5 text-white"
      style={{
        background: "linear-gradient(160deg, #22c55e 0%, #0e7a3c 60%, #072a16 130%)",
        boxShadow:
          "0 0 0 1px rgba(14,122,60,0.5), 0 30px 60px -18px rgba(6, 30, 16, 0.85), 0 10px 24px -10px rgba(14,122,60,0.55)",
      }}
    >
      <span aria-hidden className="hero-particle absolute left-8 top-12 h-1.5 w-1.5 rounded-full bg-white/50" style={{ animationDelay: "0s" }} />
      <span aria-hidden className="hero-particle absolute left-1/2 top-8 h-1 w-1 rounded-full bg-white/40" style={{ animationDelay: "1.3s" }} />
      <span aria-hidden className="hero-particle absolute right-12 top-16 h-2 w-2 rounded-full bg-white/30" style={{ animationDelay: "2.2s" }} />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(0deg,#fff_0,#fff_2px,transparent_2px,transparent_12px)]"
      />

      <div className="relative">
        <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-white/70">Aujourd&apos;hui</p>

        {!hasProgram ? (
          <>
            <h1 className="mt-1 font-display text-2xl font-extrabold uppercase leading-tight">
              Ton programme arrive
            </h1>
            <p className="mt-1 text-sm text-white/80">Complète ton profil pour débloquer ta première séance.</p>
          </>
        ) : !todaySession && isMatchDayToday ? (
          <>
            <h1 className="mt-1 font-display text-2xl font-extrabold uppercase leading-tight">
              Bon match{firstName ? `, ${firstName}` : ""} ! 🏆
            </h1>
            <p className="mt-1 text-sm text-white/80">
              Pas de séance aujourd&apos;hui — repos complet, tu gardes tes jambes fraîches pour le match.
            </p>
          </>
        ) : !todaySession ? (
          <>
            <h1 className="mt-1 font-display text-2xl font-extrabold uppercase leading-tight">Jour de repos</h1>
            <p className="mt-1 text-sm text-white/80">Pas de séance prévue aujourd&apos;hui — profites-en pour récupérer.</p>
          </>
        ) : (
          <>
            <h1 className="mt-1 font-display text-2xl font-extrabold uppercase leading-tight">{todaySession.title}</h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {todaySession.isMatchAdjacent && <Chip className="border-white/20 bg-white/10 text-white">🩹 Séance légère</Chip>}
              {alreadyDone && <Chip className="border-white/20 bg-white/10 text-white">✅ Terminée</Chip>}
            </div>
          </>
        )}

        {todaySession && (
          <Link
            href={`/seance/${todaySession.id}`}
            className="cta-primary mt-4 flex items-center justify-center rounded-[var(--radius-control)] px-5 py-3.5 font-display text-base font-extrabold uppercase tracking-wide"
          >
            {alreadyDone ? "Revoir ma séance" : "Commencer ma séance"}
          </Link>
        )}

        {cardStats && (
          <div className="mt-5 flex items-center gap-4 border-t border-white/15 pt-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold tabular-nums">{cardStats.overall}</span>
                <span className="text-[0.65rem] font-bold uppercase tracking-wide text-white/60">OVR</span>
                {streakCount > 0 && (
                  <span className="ml-auto text-xs font-bold text-white/80">🔥 {streakCount}</span>
                )}
              </div>
              {progress ? (
                <>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-white transition-[width]" style={{ width: `${progress.percent}%` }} />
                  </div>
                  <p className="mt-1 text-[0.65rem] font-semibold text-white/60">
                    {progress.pointsToGo} pts avant {progress.nextLabel}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-[0.65rem] font-semibold text-white/60">Rang maximum atteint</p>
              )}
            </div>
            <BrianAvatar state="motivated" size={44} className="shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}
