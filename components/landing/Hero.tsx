import Link from "next/link";
import { StadiumBackdrop, PlayerSilhouette } from "./decor";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-0 md:pt-20">
      <StadiumBackdrop className="absolute inset-0" />
      <div
        className="lp-glow-ring lp-pulse"
        style={{ width: 420, height: 420, top: -140, left: -140 }}
      />

      <div className="lp-container relative grid gap-10 px-5 md:grid-cols-2 md:items-center md:gap-6 md:px-6">
        <div className="flex flex-col items-start gap-6 text-left">
          <span className="lp-eyebrow">
            <span aria-hidden>⚽</span> Ton parcours de joueur
          </span>

          <h1 className="lp-h2 text-[2.6rem] md:text-[3.4rem]">
            Construis ton joueur.
            <br />
            Progresse chaque jour.
          </h1>

          <p className="max-w-md text-base text-[var(--lp-text-muted)] md:text-lg">
            Progressa construit ton parcours d&apos;entraînement, mesure ta progression et fait évoluer ta carte de
            joueur — semaine après semaine.
          </p>

          <div className="flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link href="/onboarding" className="lp-btn-primary w-full sm:w-auto">
              Commencer mon parcours
            </Link>
            <a href="#comment-ca-marche" className="lp-btn-secondary w-full sm:w-auto">
              Voir comment ça marche
            </a>
          </div>

          <p className="text-sm font-semibold text-[var(--lp-accent-strong)]">
            Ton premier entraînement est gratuit
          </p>
        </div>

        <div className="relative mx-auto h-[320px] w-full max-w-xs md:h-[520px] md:max-w-none">
          <div
            className="lp-glow-ring"
            style={{ width: 320, height: 320, bottom: -60, right: -20 }}
          />
          <PlayerSilhouette className="lp-float relative z-10 h-full w-full drop-shadow-[0_24px_40px_rgba(16,35,26,0.18)]" />
        </div>
      </div>

      <div
        className="relative mt-4 h-16 w-full md:h-24"
        style={{ background: "linear-gradient(180deg, transparent, var(--lp-bg))" }}
        aria-hidden
      />
    </section>
  );
}
