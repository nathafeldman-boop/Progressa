import Image from "next/image";

/** Terrain en fond, du début à la fin de l'onboarding (wizard + accueil Brian + écran de finalisation). */
export function OnboardingBackground() {
  return (
    <div className="fixed inset-0" aria-hidden>
      <Image src="/onboarding/pitch-bg.jpg" alt="" fill priority className="object-cover object-top" sizes="100vw" />
    </div>
  );
}
