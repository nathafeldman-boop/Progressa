import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Suppression de compte en 1 clic (section 7): supprime la ligne User
 * interne — le `onDelete: Cascade` du schéma Prisma élimine automatiquement
 * toutes les données liées (profil, séances, tests, journal santé, avis,
 * parrainages...). Le compte Supabase Auth est supprimé ensuite, en
 * best-effort: la suppression des données internes est la partie
 * RGPD-critique et ne doit jamais être bloquée par un aléa côté fournisseur
 * d'auth.
 */
export async function DELETE() {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  await prisma.user.delete({ where: { id: user.id } });

  try {
    if (user.externalAuthId) {
      const admin = createAdminClient();
      await admin.auth.admin.deleteUser(user.externalAuthId);
    }
  } catch (err) {
    console.error("[account/delete] Supabase user deletion failed", err);
  }

  return NextResponse.json({ ok: true });
}
