import { AffiliateSignupForm } from "@/components/affiliate/AffiliateSignupForm";
import { APP_NAME } from "@/lib/app-config";

export default function AffiliationPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 p-4 py-10">
      <div className="text-center">
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Programme d&apos;affiliation</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Touche 80% de commission sur chaque joueur qui s&apos;abonne à {APP_NAME} grâce à ton lien, plus un bonus de
          50€ tous les 500€ de commissions cumulées.
        </p>
      </div>
      <AffiliateSignupForm />
      <p className="text-center text-xs text-[var(--color-text-muted)]">
        Les commissions deviennent payables ~5 jours après chaque paiement (délai de reversement Stripe).
      </p>
    </div>
  );
}
