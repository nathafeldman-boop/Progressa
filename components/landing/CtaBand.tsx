import Link from "next/link";
import { Reveal } from "./reveal";
import { StadiumBackdrop } from "./decor";

export function CtaBand({ variant = "mid" }: { variant?: "mid" | "final" }) {
  const isFinal = variant === "final";

  return (
    <section className={`lp-section relative overflow-hidden ${isFinal ? "pb-24" : ""}`}>
      {isFinal && <StadiumBackdrop className="absolute inset-0" />}
      <div
        className="lp-glow-ring lp-pulse"
        style={{ width: isFinal ? 600 : 400, height: isFinal ? 600 : 400, top: "0%", left: "50%", transform: "translateX(-50%)" }}
      />

      <Reveal className="lp-container relative flex flex-col items-center gap-5 text-center">
        <h2 className={`lp-h2 ${isFinal ? "text-[2.6rem] md:text-[3.6rem]" : ""}`}>
          {isFinal ? "Prêt à construire ton joueur ?" : "Ton parcours peut commencer aujourd'hui."}
        </h2>
        <p className="max-w-md text-[var(--lp-text-muted)]">
          {isFinal
            ? "Commence ton parcours aujourd'hui."
            : "Commence gratuitement ton premier entraînement et découvre ton niveau de départ."}
        </p>
        <Link href="/onboarding" className={`lp-btn-primary ${isFinal ? "px-10 py-5 text-lg" : ""}`}>
          Commencer mon parcours
        </Link>
        {isFinal && (
          <p className="text-sm font-semibold text-[var(--lp-accent-strong)]">Premier entraînement gratuit</p>
        )}
      </Reveal>
    </section>
  );
}
