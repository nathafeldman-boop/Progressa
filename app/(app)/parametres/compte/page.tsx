import Link from "next/link";
import { getCurrentInternalUser } from "@/lib/auth";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { DeleteAccountButton } from "@/components/account/DeleteAccountButton";
import { ProfilePhotoUpload } from "@/components/account/ProfilePhotoUpload";

export default async function ComptePage() {
  const user = await getCurrentInternalUser();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Mon compte</h1>

      <Card>
        <ProfilePhotoUpload currentPhotoUrl={user.photoUrl} />
        <CardTitle className="mt-3 text-base">{user.firstName}</CardTitle>
        <CardSubtitle>{user.email}</CardSubtitle>
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
