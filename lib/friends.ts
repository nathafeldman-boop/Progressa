import { prisma } from "@/lib/prisma";

export type ConnectFriendsResult =
  | { status: "connected"; friendName: string }
  | { status: "already_friends"; friendName: string }
  | { status: "invalid_code" }
  | { status: "self" };

/**
 * Connecte deux joueurs déjà inscrits via le code personnel de l'un d'eux
 * (le même code/lien que celui du parrainage — un seul code à partager,
 * deux effets possibles selon que le destinataire a déjà un compte ou pas,
 * voir app/r/[code]/page.tsx). Symétrique: deux lignes Friendship créées
 * (A->B et B->A) pour que "mes amis" reste `where userId = moi`.
 */
export async function connectFriendsByCode(userId: string, code: string): Promise<ConnectFriendsResult> {
  const codeRow = await prisma.referralCode.findUnique({
    where: { code },
    include: { user: { select: { firstName: true } } },
  });
  if (!codeRow) return { status: "invalid_code" };
  if (codeRow.userId === userId) return { status: "self" };

  const friendId = codeRow.userId;
  const friendName = codeRow.user.firstName;

  const existing = await prisma.friendship.findUnique({
    where: { userId_friendId: { userId, friendId } },
  });
  if (existing) return { status: "already_friends", friendName };

  await prisma.$transaction([
    prisma.friendship.create({ data: { userId, friendId } }),
    prisma.friendship.create({ data: { userId: friendId, friendId: userId } }),
  ]);

  return { status: "connected", friendName };
}

export interface FriendEntry {
  userId: string;
  label: string;
  overall: number;
  isCurrentUser: boolean;
}

export async function getFriendsLeaderboard(userId: string): Promise<FriendEntry[]> {
  const friendships = await prisma.friendship.findMany({ where: { userId }, select: { friendId: true } });
  const ids = [userId, ...friendships.map((f) => f.friendId)];

  const cards = await prisma.playerCard.findMany({
    where: { userId: { in: ids } },
    include: { user: { select: { id: true, firstName: true } } },
  });

  return cards
    .map((c) => ({
      userId: c.userId,
      label: c.user.firstName,
      overall: typeof (c.stats as { overall?: number })?.overall === "number" ? (c.stats as { overall: number }).overall : 0,
      isCurrentUser: c.userId === userId,
    }))
    .sort((a, b) => b.overall - a.overall);
}
