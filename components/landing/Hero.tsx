import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[600px] w-full sm:h-[640px] md:h-[760px]">
        <Image
          src="/hero/stadium-player.jpg"
          alt="Joueur de dos dans un stade, maillot numéro 10"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center] md:object-[70%_center]"
        />

        <div className="lp-container relative z-10 flex h-full items-end px-5 pb-8 sm:items-center sm:pb-0 md:px-6">
          <div className="w-full max-w-md rounded-[1.5rem] border border-[var(--lp-border)] bg-[var(--lp-bg)]/95 p-6 shadow-[0_30px_60px_-20px_rgba(16,35,26,0.45)] backdrop-blur-sm sm:max-w-lg sm:p-7">
            <span className="lp-eyebrow">
              <span aria-hidden>⚽</span> Ton parcours de joueur
            </span>

            <h1 className="lp-h2 mt-3 text-[2.1rem] sm:text-[2.5rem] md:text-[2.9rem]">
              Construis ton joueur.
              <br />
              Progresse chaque jour.
            </h1>

            <p className="mt-4 text-base text-[var(--lp-text-muted)]">
              Progressa construit ton parcours d&apos;entraînement, mesure ta progression et fait évoluer ta carte
              de joueur — semaine après semaine.
            </p>

            <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link href="/onboarding" className="lp-btn-primary w-full sm:w-auto sm:whitespace-nowrap">
                Commencer mon parcours
              </Link>
              <a href="#comment-ca-marche" className="lp-btn-secondary w-full sm:w-auto sm:whitespace-nowrap">
                Voir comment ça marche
              </a>
            </div>

            <p className="mt-4 text-sm font-semibold text-[var(--lp-accent-strong)]">
              Ton premier entraînement est gratuit
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
