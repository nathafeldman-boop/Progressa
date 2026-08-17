import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[640px] w-full sm:h-[700px] md:h-[820px]">
        <Image
          src="/hero/stadium-player.jpg"
          alt="Joueur de dos dans un stade, maillot numéro 10"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center] md:object-[70%_center]"
        />

        {/* La photo remplace le fond blanc en haut de page, puis se fond
            progressivement dans le reste de la landing (blanc dominant). */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, transparent 55%, var(--lp-bg) 96%)" }}
          aria-hidden
        />

        <div className="lp-container relative z-10 flex h-full items-end px-5 pb-14 sm:items-center sm:pb-0 md:px-6">
          <div className="flex max-w-lg flex-col items-start gap-5 text-left" style={{ textShadow: "0 2px 20px rgba(5,15,10,0.5)" }}>
            <span className="lp-eyebrow text-white/90">
              <span aria-hidden>⚽</span> Ton parcours de joueur
            </span>

            <h1 className="lp-h2 text-[2.3rem] text-white sm:text-[2.7rem] md:text-[3.3rem]">
              Construis ton joueur.
              <br />
              Progresse chaque jour.
            </h1>

            <p className="max-w-md text-base text-white/85 md:text-lg">
              Progressa construit ton parcours d&apos;entraînement, mesure ta progression et fait évoluer ta carte
              de joueur — semaine après semaine.
            </p>

            <div className="flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link href="/onboarding" className="lp-btn-primary w-full sm:w-auto sm:whitespace-nowrap">
                Commencer mon parcours
              </Link>
              <a
                href="#comment-ca-marche"
                className="lp-btn-secondary w-full border-white/30 bg-white/90 text-[var(--lp-text)] sm:w-auto sm:whitespace-nowrap"
              >
                Voir comment ça marche
              </a>
            </div>

            <p className="text-sm font-bold text-[#6bf0ab]">Ton premier entraînement est gratuit</p>
          </div>
        </div>
      </div>
    </section>
  );
}
