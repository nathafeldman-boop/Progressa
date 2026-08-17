import Link from "next/link";
import { getCurrentInternalUser } from "@/lib/auth";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { DeleteAccountButton } from "@/components/account/DeleteAccountButton";

export default async function ComptePage() {
  const user = await getCurrentInternalUser();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Mon compte</h1>

      <Card>
        <CardTitle className="text-base">{user.firstName}</CardTitle>
        <CardSubtitle>{user.email}</CardSubtitle>
        {user.isMinor && (
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Compte mineur — consentement parental {user.parentConsentAt ? "enregistré" : "non requis pour l'usage gratuit"}.
          </p>
        )}
      </Card>

      <Card>
        <CardTitle className="text-base">Confidentialité</CardTitle>
        <CardSubtitle className="mt-1">
          On ne collecte que le nécessaire, aucun tracking publicitaire. <Link href="/confidentialite" className="underline">Lire notre politique</Link>.
        </CardSubtitle>
      </Card>

      <div>
        <DeleteAccountButton />
      </div>
    </div>
  );
}
