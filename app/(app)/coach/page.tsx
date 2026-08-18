import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { composeWelcomeMessage } from "@/lib/brian/messages";
import { CoachChat } from "@/components/coach/CoachChat";

export default async function CoachPage() {
  const user = await getCurrentInternalUser();
  if (!user) return null;

  const messages = await prisma.brianMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  const initialMessages = messages.length
    ? messages.map((m) => ({ id: m.id, category: m.category, text: m.text, createdAt: m.createdAt.toISOString() }))
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
      <CoachChat initialMessages={initialMessages} />
    </div>
  );
}
