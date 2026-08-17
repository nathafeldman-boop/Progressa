import Link from "next/link";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function InscriptionPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-surface-alt)] p-4">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Créer un compte</h1>
      <SignUpForm redirectTo="/onboarding/finish" />
      <p className="text-sm text-[var(--color-text-muted)]">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="font-semibold text-[var(--color-accent)]">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
