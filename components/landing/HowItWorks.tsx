import { Reveal } from "./reveal";
import { HowItWorksReel } from "./HowItWorksReel";

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="lp-section relative scroll-mt-16">
      <div className="lp-container">
        <Reveal className="mx-auto max-w-lg text-center">
          <span className="lp-eyebrow justify-center">Comment ça marche</span>
          <h2 className="lp-h2 mt-3">Quatre étapes. Zéro friction.</h2>
        </Reveal>

        <Reveal delayMs={100} className="mt-10">
          <HowItWorksReel />
        </Reveal>
      </div>
    </section>
  );
}
