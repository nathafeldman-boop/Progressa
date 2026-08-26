import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/app-config";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#faq", label: "FAQ" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/avis", label: "Avis" },
  { href: "/contact", label: "Contact" },
  { href: "/cgu", label: "CGU" },
  { href: "/cgv", label: "CGV" },
  { href: "/confidentialite", label: "Politique de confidentialité" },
  { href: "/mentions-legales", label: "Mentions légales" },
];

export function LandingFooter() {
  return (
    <footer className="relative border-t border-[var(--lp-border)] px-5 py-10 md:px-6">
      <div className="lp-container flex flex-col items-center gap-6 text-center">
        <span className="flex items-center gap-2 font-display text-xl font-extrabold uppercase tracking-wide">
          <Image src="/logo-mark.png" alt="" width={32} height={32} className="h-8 w-8" />
          {APP_NAME}
        </span>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-[var(--lp-text-muted)]">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-[var(--lp-text)]">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-[var(--lp-text-dim)]">
          © {new Date().getFullYear()} {APP_NAME}. Fait pour les joueurs qui veulent progresser.
        </p>
      </div>
    </footer>
  );
}
