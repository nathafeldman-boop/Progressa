"use client";

import { useState } from "react";
import Link from "next/link";
import { triggerInstallPrompt } from "@/lib/pwa/install-prompt";
import { useInstallPromptAvailable } from "@/lib/pwa/use-install-prompt";

const DISMISS_KEY = "progressa_install_banner_dismissed_at";
const DISMISS_DAYS = 10;

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function isIos(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function wasDismissedRecently(): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (Number.isNaN(dismissedAt)) return false;
  return Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * Bandeau discret invitant à installer l'app — jamais bloquant, jamais
 * affiché si déjà installée ou si l'utilisateur l'a fermé récemment.
 * Android/Chrome: déclenche le prompt natif d'installation. iOS Safari
 * n'expose aucun prompt programmable, donc on renvoie vers le tuto pas à
 * pas (Partage → Sur l'écran d'accueil).
 */
export function InstallAppBanner() {
  const promptAvailable = useInstallPromptAvailable();
  const [ios] = useState(() => isIos());
  // Calculé une seule fois au montage: si déjà installée ou fermée
  // récemment, le bandeau reste caché pour toute la vie du composant (le
  // seul autre moyen de le refermer est le bouton "dismiss" ci-dessous).
  const [hiddenAtMount] = useState(() => isStandalone() || wasDismissedRecently());
  const [dismissed, setDismissed] = useState(false);

  // iOS n'a pas d'événement "beforeinstallprompt": si on doit montrer le
  // bandeau, on peut le savoir tout de suite. Android/Chrome attend l'event.
  const visible = !hiddenAtMount && !dismissed && (ios || promptAvailable);

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  }

  async function install() {
    await triggerInstallPrompt();
    setDismissed(true);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-[3.75rem] z-20 mx-auto max-w-md px-3">
      <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)]">
        <span className="text-2xl">📲</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[var(--color-text)]">Installe l&apos;app</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {ios ? "Accès direct depuis ton écran d'accueil, comme une vraie app." : "Plus rapide, plein écran, comme une vraie app."}
          </p>
        </div>
        {ios ? (
          <Link
            href="/parametres/installer-app"
            onClick={dismiss}
            className="shrink-0 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[var(--color-on-primary)]"
          >
            Comment faire
          </Link>
        ) : (
          <button
            type="button"
            onClick={install}
            className="shrink-0 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[var(--color-on-primary)]"
          >
            Installer
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fermer"
          className="shrink-0 text-lg text-[var(--color-text-muted)]"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
