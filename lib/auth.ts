import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

/**
 * Synchronise la table User interne avec Clerk. On ne dépend jamais
 * uniquement de l'id Clerk: l'email est la clé de repli si l'id externe
 * change (migration de provider, compte fusionné, etc.).
 */
export async function syncInternalUser(): Promise<User | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const firstName = clerkUser.firstName || "Joueur";

  const existingByAuthId = await prisma.user.findUnique({ where: { externalAuthId: clerkUser.id } });
  if (existingByAuthId) return existingByAuthId;

  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: { externalAuthId: clerkUser.id },
    });
  }

  return prisma.user.create({
    data: { externalAuthId: clerkUser.id, email, firstName },
  });
}

export async function getCurrentInternalUser(): Promise<User | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  return prisma.user.findUnique({ where: { externalAuthId: clerkUser.id } });
}
