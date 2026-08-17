import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

/**
 * Synchronise la table User interne avec Supabase Auth. On ne dépend jamais
 * uniquement de l'id du provider: l'email est la clé de repli si l'id
 * externe change (migration de provider, compte fusionné, etc.).
 */
export async function syncInternalUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser?.email) return null;

  const firstName = (authUser.user_metadata?.first_name as string | undefined) || "Joueur";

  const existingByAuthId = await prisma.user.findUnique({ where: { externalAuthId: authUser.id } });
  if (existingByAuthId) return existingByAuthId;

  const existingByEmail = await prisma.user.findUnique({ where: { email: authUser.email } });
  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: { externalAuthId: authUser.id },
    });
  }

  return prisma.user.create({
    data: { externalAuthId: authUser.id, email: authUser.email, firstName },
  });
}

export async function getCurrentInternalUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;
  return prisma.user.findUnique({ where: { externalAuthId: authUser.id } });
}
