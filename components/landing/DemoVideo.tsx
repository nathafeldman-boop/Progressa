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

        <Reveal delayMs={100} className="w-full max-w-xs">
          <div className="overflow-hidden rounded-[1.75rem] border border-[var(--lp-border-strong)] bg-white shadow-[0_30px_60px_-20px_rgba(16,35,26,0.35)]">
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
