"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const ICON_INACTIVE = "#8b9a91";

function HomeIcon({ color }: { color: string }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9h5v-5h2v5h5v-9" />
    </svg>
  );
}

function ProgressIcon({ color }: { color: string }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19V14M10 19V9M16 19V12M20 19V5" />
    </svg>
  );
}

function TrophyIcon({ color }: { color: string }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4h10v3a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4.5A2.5 2.5 0 0 0 7 9" />
      <path d="M17 5h2.5A2.5 2.5 0 0 1 17 9" />
      <path d="M12 12v3" />
      <path d="M9 20h6l-.6-3H9.6L9 20Z" />
    </svg>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8.2" r="3.2" />
      <path d="M5 20c1.4-4 4-6.2 7-6.2s5.6 2.2 7 6.2" />
    </svg>
  );
}

function BallIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.2l3.4 2.5-1.3 4h-4.2l-1.3-4Z" fill="#fff" stroke="none" />
      <path d="M12 7.2V4.4M15.4 9.7l2.8-1M13.8 13.7l1.8 2.6M10.2 13.7l-1.8 2.6M8.6 9.7l-2.8-1" />
    </svg>
  );
}

interface TabDef {
  href: string;
  label: string;
  icon: (color: string) => ReactNode;
}

const TABS: TabDef[] = [
  { href: "/dashboard", label: "Accueil", icon: (c) => <HomeIcon color={c} /> },
  { href: "/progression", label: "Progrès", icon: (c) => <ProgressIcon color={c} /> },
];

const TABS_RIGHT: TabDef[] = [
  { href: "/classement", label: "Rang", icon: (c) => <TrophyIcon color={c} /> },
  { href: "/parametres", label: "Profil", icon: (c) => <ProfileIcon color={c} /> },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function TabLink({ href, label, icon, active }: TabDef & { active: boolean }) {
  const iconColor = active ? "var(--color-primary-strong)" : ICON_INACTIVE;
  return (
    <Link href={href} className="flex flex-1 flex-col items-center gap-[5px]">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ background: active ? "var(--color-primary-soft)" : "transparent" }}
      >
        {icon(iconColor)}
      </span>
      <span className="text-[9.5px] font-semibold" style={{ color: active ? "var(--color-text)" : ICON_INACTIVE }}>
        {label}
      </span>
    </Link>
  );
}

/**
 * Barre basse à 5 onglets (refonte design_handoff_progressa_ui) : Accueil ·
 * Progrès · Séance (bouton central surélevé) · Rang · Profil. Coach Brian
 * n'est plus un onglet — il vit sur le BrianFab (badge nouveau message
 * porté par ce composant maintenant) et la carte message du dashboard.
 */
export function BottomNav() {
  const pathname = usePathname();
  const sessionActive = isActive(pathname, "/seance");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex h-20 items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-surface)] px-2 pb-2 [padding-bottom:calc(env(safe-area-inset-bottom)+0.5rem)]">
      {TABS.map((tab) => (
        <TabLink key={tab.href} {...tab} active={isActive(pathname, tab.href)} />
      ))}

      {/* Pas de route /seance index (seulement /seance/[sessionId]) — la
          résolution "quelle séance aujourd'hui" reste centralisée dans
          app/(app)/dashboard/page.tsx, jamais dupliquée ici. */}
      <Link href="/dashboard" className="flex flex-1 flex-col items-center gap-[5px]" aria-label="Séance du jour">
        <span
          className="-mt-7 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[var(--color-primary)]"
          style={{ boxShadow: "0 10px 24px -8px rgba(26,163,80,.6)" }}
        >
          <BallIcon />
        </span>
        <span className="text-[9.5px] font-semibold" style={{ color: sessionActive ? "var(--color-text)" : ICON_INACTIVE }}>
          Séance
        </span>
      </Link>

      {TABS_RIGHT.map((tab) => (
        <TabLink key={tab.href} {...tab} active={isActive(pathname, tab.href)} />
      ))}
    </nav>
  );
}
