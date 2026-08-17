import Link from "next/link";
import { SignInForm } from "@/components/auth/SignInForm";

export default async function ConnexionPage({ searchParams }: PageProps<"/connexion">) {
  const params = await searchParams;
  const redirectParam = typeof params.redirect === "string" ? params.redirect : "/dashboard";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-surface-alt)] p-4">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Connexion</h1>
      <SignInForm redirectTo={redirectParam} />
      <p className="text-sm text-[var(--color-text-muted)]">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-[var(--color-accent)]">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
