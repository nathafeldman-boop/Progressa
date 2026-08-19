import Link from "next/link";
import Image from "next/image";
import { UserMenu } from "@/components/auth/UserMenu";
import { BrianFab } from "@/components/brian/BrianFab";
import { BrianAvatar, type BrianState } from "@/components/brian/BrianAvatar";
import { APP_NAME } from "@/lib/app-config";

/**
 * Une pose Coach Brian fixe par onglet (jamais d'emoji, jamais aléatoire —
 * toujours la même pose pour un même onglet).
 */
const NAV_ITEMS: { href: string; label: string; brianState: BrianState }[] = [
  { href: "/dashboard", label: "Séances", brianState: "motivated" },
  { href: "/coach", label: "Coach", brianState: "idle" },
  { href: "/progression", label: "Progression", brianState: "confident" },
  { href: "/parametres", label: "Réglages", brianState: "thinking" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
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

      <BrianFab />

      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-[var(--color-border)] bg-[var(--color-surface)] py-2 [padding-bottom:env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 px-2 py-1 text-xs font-semibold text-[var(--color-text-muted)]"
          >
            <BrianAvatar state={item.brianState} size={22} />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
