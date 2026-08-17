"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { clearOnboardingData, clearReferralCode, getReferralCode, loadOnboardingData } from "@/lib/onboarding/storage";

/**
 * Étape charnière: le compte Clerk existe déjà (redirection après
 * inscription). On envoie le profil collecté en localStorage pour finaliser
 * la création — mais on ne bloque JAMAIS la redirection vers le dashboard
 * dessus, même si cet appel échoue (cf. section 6.1: rien de secondaire ne
 * doit bloquer l'accès à l'app).
 */
export default function OnboardingFinishPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Finalisation de ton profil...");

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const data = loadOnboardingData();
      const referralCode = getReferralCode();
      try {
        await fetch("/api/onboarding/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, referralCode }),
        });
      } catch (err) {
        console.error("[onboarding/finish] completion call failed", err);
      } finally {
        if (!cancelled) {
          clearOnboardingData();
          clearReferralCode();
          setStatus("C'est parti !");
          router.replace("/dashboard");
        }
      }
    }

    void finish();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="p-8 text-center">
        <CardTitle>{status}</CardTitle>
        <CardSubtitle className="mt-2">On prépare ton premier programme.</CardSubtitle>
      </Card>
    </div>
  );
}
