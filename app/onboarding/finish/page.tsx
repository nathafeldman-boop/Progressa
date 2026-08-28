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

const GENERATION_STEP_MS = 1400;

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
  // Incrémenté à chaque fois que le cycle des étapes repart de zéro — sert
  // de clé React pour forcer le remontage (et donc le redémarrage) de
  // l'animation CSS de la jauge active, plutôt que de rester bloquée à 100%
  // une fois jouée une première fois.
  const [cycle, setCycle] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const timer = window.setInterval(() => {
      setStepIndex((i) => {
        const next = (i + 1) % GENERATION_STEPS.length;
        if (next === 0) setCycle((c) => c + 1);
        return next;
      });
    }, GENERATION_STEP_MS);
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
        <Card className="flex w-full max-w-xs flex-col items-center gap-4 p-8 text-center">
          {done ? <BrianAvatar state="celebrating" size={88} /> : <BrianJuggling width={140} />}
          <div>
            <CardTitle>{done ? "C'est parti !" : "Coach Brian prépare ton programme"}</CardTitle>
            {done && <CardSubtitle className="mt-2">Ton premier programme est prêt.</CardSubtitle>}
          </div>
          {!done && (
            <div className="w-full space-y-3" aria-hidden="true">
              {GENERATION_STEPS.map((label, i) => {
                const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "pending";
                return (
                  <div key={i} className="text-left">
                    <p
                      className="text-xs font-semibold transition-colors duration-300"
                      style={{ color: state === "pending" ? "var(--color-text-muted)" : "var(--color-text)" }}
                    >
                      {label}
                    </p>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                      <div
                        key={state === "active" ? `active-${cycle}` : state}
                        className={`h-full rounded-full bg-[var(--color-primary)] ${state === "active" ? "onboarding-gauge-fill" : ""}`}
                        style={{
                          width: state === "done" ? "100%" : state === "pending" ? "0%" : undefined,
                          animationDuration: state === "active" ? `${GENERATION_STEP_MS}ms` : undefined,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
