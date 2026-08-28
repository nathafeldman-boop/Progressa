import Link from "next/link";
import Image from "next/image";
import { UserMenu } from "@/components/auth/UserMenu";
import { BrianFab } from "@/components/brian/BrianFab";
import { BottomNav } from "@/components/nav/BottomNav";
import { InstallAppBanner } from "@/components/pwa/InstallAppBanner";
import { APP_NAME } from "@/lib/app-config";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentInternalUser();
  const latestBrianMessage = user
    ? await prisma.brianMessage.findFirst({
        where: { userId: user.id, fromPlayer: false },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      })
    : null;

  return (
    <div className="app-pitch-bg flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 py-3 backdrop-blur">
        <Link href="/dashboard" className="flex items-center gap-2 font-display text-lg font-extrabold uppercase tracking-wide">
          <Image src="/logo-mark.png" alt="" width={28} height={28} className="h-7 w-7" priority />
          {APP_NAME}
        </Link>
        <UserMenu />
      </header>

      <main className="flex-1 pb-20">{children}</main>

      <BrianFab latestBrianMessageAt={latestBrianMessage?.createdAt.toISOString() ?? null} />
      <InstallAppBanner />
      <BottomNav />
    </div>
  );
}
