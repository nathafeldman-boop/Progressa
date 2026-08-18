"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { BrianJuggling } from "@/components/brian/BrianJuggling";
import { clearOnboardingData, clearReferralCode, getReferralCode, loadOnboardingData } from "@/lib/onboarding/storage";

const GENERATION_STEPS = [
  "Analyse de ton profil...",
  "Sélection des exercices adaptés...",
  "Calibrage selon ton niveau...",
  "Organisation de ta semaine...",
];

/**
 * Étape charnière: le compte Clerk existe déjà (redirection après
 * inscription). On envoie le profil collecté en localStorage pour finaliser
 * la création — mais on ne bloque JAMAIS la redirection vers le dashboard
 * dessus, même si cet appel échoue (cf. section 6.1: rien de secondaire ne
 * doit bloquer l'accès à l'app).
 */
export default function OnboardingFinishPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const timer = window.setInterval(() => {
      setStepIndex((i) => (i + 1) % GENERATION_STEPS.length);
    }, 1400);
    return () => window.clearInterval(timer);
  }, [done]);

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const data = loadOnboardingData();
      const referralCode = getReferralCode();
      // otherEquipmentNote n'a pas sa propre colonne — on le fusionne dans
      // weakPointNote (seul champ de note libre côté backend) pour ne pas
      // perdre l'info sans avoir besoin d'une migration de schéma.
      const weakPointNote = [
        data.weakPointNote,
        data.otherEquipmentNote.trim() ? `Matériel supplémentaire : ${data.otherEquipmentNote.trim()}` : null,
      ]
        .filter(Boolean)
        .join(" — ");
      try {
        await fetch("/api/onboarding/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, weakPointNote, referralCode }),
        });
      } catch (err) {
        console.error("[onboarding/finish] completion call failed", err);
      } finally {
        if (!cancelled) {
          clearOnboardingData();
          clearReferralCode();
          setDone(true);
          router.replace("/onboarding/brian");
        }
      }
    }

    void finish();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="relative min-h-screen">
      <OnboardingBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          {done ? <BrianAvatar state="celebrating" size={88} /> : <BrianJuggling width={140} />}
          <div>
            <CardTitle>{done ? "C'est parti !" : "Coach Brian prépare ton programme"}</CardTitle>
            <CardSubtitle className="mt-2 transition-opacity duration-300">
              {done ? "Ton premier programme est prêt." : GENERATION_STEPS[stepIndex]}
            </CardSubtitle>
          </div>
          {!done && (
            <div className="flex gap-1.5" aria-hidden="true">
              {GENERATION_STEPS.map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
                  style={{
                    background: i === stepIndex ? "var(--color-primary)" : "var(--color-border)",
                  }}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
