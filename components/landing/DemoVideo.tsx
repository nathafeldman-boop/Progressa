import { Reveal } from "./reveal";

/** Démo vidéo réelle de l'app (tableau de bord, démonstration Coach Brian pose par pose, carte joueur) — pas un mockup. */
export function DemoVideo() {
  return (
    <section className="lp-section relative overflow-hidden">
      <div className="lp-floodlights" />
      <div className="lp-container relative flex flex-col items-center gap-8 text-center">
        <Reveal className="max-w-xl">
          <span className="lp-eyebrow justify-center">En vidéo</span>
          <h2 className="lp-h2 mt-3">Vois Progressa en action.</h2>
          <p className="mx-auto mt-3 max-w-md text-[var(--lp-text-muted)]">
            Le tableau de bord, la démonstration Coach Brian pose par pose, ta carte qui évolue — en 20 secondes.
          </p>
        </Reveal>

        <Reveal delayMs={100} className="relative w-full max-w-[280px]">
          <div className="relative overflow-hidden rounded-[2.5rem] border-[6px] border-[#10231a] bg-[#10231a] shadow-[0_30px_60px_-20px_rgba(16,35,26,0.45)]">
            <div className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-xl bg-[#10231a]" />
            <video
              className="block w-full"
              poster="/landing/demo-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src="/landing/demo.webm" type="video/webm" />
              <source src="/landing/demo.mp4" type="video/mp4" />
            </video>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
