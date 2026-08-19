import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { composeWelcomeMessage } from "@/lib/brian/messages";
import { CoachChat } from "@/components/coach/CoachChat";
import { BrianTip } from "@/components/brian/BrianTip";

export default async function CoachPage() {
  const user = await getCurrentInternalUser();
  if (!user) return null;

  const messages = await prisma.brianMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  const initialMessages = messages.length
    ? messages.map((m) => ({
        id: m.id,
        category: m.category,
        text: m.text,
        fromPlayer: m.fromPlayer,
        createdAt: m.createdAt.toISOString(),
      }))
    : [
        {
          id: "welcome",
          category: "WELCOME" as const,
          text: composeWelcomeMessage(user.firstName),
          createdAt: new Date().toISOString(),
        },
      ];

  return (
    <div className="mx-auto flex h-[calc(100dvh-8.5rem)] max-w-md flex-col p-4">
      <h1 className="mb-3 font-display text-2xl font-extrabold uppercase tracking-wide">Coach Brian</h1>
      <div className="mb-3">
        <BrianTip
          tipKey="coach-intro"
          text="Pose-moi n'importe quelle question sur ton entraînement — je réponds en fonction de tes vraies stats, pas de généralités."
        />
      </div>
      <CoachChat initialMessages={initialMessages} />
    </div>
  );
}
