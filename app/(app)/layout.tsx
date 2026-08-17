import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { APP_NAME } from "@/lib/app-config";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Séances", emoji: "🏋️" },
  { href: "/tests", label: "Tests", emoji: "📊" },
  { href: "/carte", label: "Carte", emoji: "🃏" },
  { href: "/journal", label: "Journal", emoji: "📓" },
  { href: "/parametres", label: "Réglages", emoji: "⚙️" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 py-3 backdrop-blur">
        <Link href="/dashboard" className="font-display text-lg font-extrabold uppercase tracking-wide">
          {APP_NAME}
        </Link>
        <UserButton />
      </header>

      <main className="flex-1 pb-20">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-[var(--color-border)] bg-[var(--color-surface)] py-2 [padding-bottom:env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 px-2 py-1 text-xs font-semibold text-[var(--color-text-muted)]"
          >
            <span className="text-lg">{item.emoji}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
