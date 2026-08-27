import { redirect } from "next/navigation";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { EquipmentEditor } from "@/components/parametres/EquipmentEditor";

export default async function MaterielPage() {
  const user = await getCurrentInternalUser();
  if (!user) redirect("/connexion");

  const profile = await prisma.playerProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Mon matériel</h1>

      <Card>
        <CardTitle className="text-base">Qu&apos;est-ce que tu as sous la main ?</CardTitle>
        <CardSubtitle className="mt-1">
          Ça change les exercices qu&apos;on te propose dans l&apos;entraînement ciblé (ex: sans ballon coché, pas de
          séances dribble ou pied faible) — mets à jour dès que ton matériel change.
        </CardSubtitle>
        <div className="mt-3">
          <EquipmentEditor initialEquipment={profile.equipment} />
        </div>
      </Card>
    </div>
  );
}
