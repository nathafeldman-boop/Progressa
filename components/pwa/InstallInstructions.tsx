"use client";

import { useState } from "react";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { APP_NAME } from "@/lib/app-config";
import { triggerInstallPrompt } from "@/lib/pwa/install-prompt";
import { useInstallPromptAvailable } from "@/lib/pwa/use-install-prompt";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

const ANDROID_STEPS = [
  `Tape sur le bouton "Installer" ci-dessous — ton téléphone affiche une fenêtre de confirmation.`,
  "Confirme, et l'icône Progressa apparaît directement sur ton écran d'accueil.",
  "Ouvre-la depuis cette icône: l'app se lance en plein écran, sans barre d'adresse, comme une vraie application.",
];

const ANDROID_STEPS_FALLBACK = [
  "Ouvre le menu de ton navigateur (les 3 points en haut à droite).",
  `Tape sur "Installer l'application" ou "Ajouter à l'écran d'accueil".`,
  "Confirme: l'icône Progressa apparaît sur ton écran d'accueil.",
];

const IOS_STEPS = [
  `Tape sur l'icône Partage ⬆️ en bas de Safari (ou en haut selon ton iPhone).`,
  `Fais défiler et tape sur "Sur l'écran d'accueil".`,
  `Tape sur "Ajouter" en haut à droite.`,
  "L'icône Progressa apparaît sur ton écran d'accueil — ouvre-la depuis là pour un accès en plein écran.",
];

export function InstallInstructions() {
  const promptAvailable = useInstallPromptAvailable();
  const [installed] = useState(() => isStandalone());

  async function install() {
    await triggerInstallPrompt();
  }

  if (installed) {
    return (
      <Card className="text-center">
        <CardTitle className="text-base">C&apos;est déjà fait ! 🎉</CardTitle>
        <CardSubtitle className="mt-1">Tu utilises {APP_NAME} depuis l&apos;app installée.</CardSubtitle>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle className="text-base">📱 Android / Chrome</CardTitle>
        {promptAvailable ? (
          <>
            <CardSubtitle className="mt-1">En un clic:</CardSubtitle>
            <Button className="mt-3 w-full" onClick={install}>
              Installer {APP_NAME}
            </Button>
          </>
        ) : (
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-[var(--color-text)]">
            {ANDROID_STEPS_FALLBACK.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        )}
        {promptAvailable && (
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-[var(--color-text-muted)]">
            {ANDROID_STEPS.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        )}
      </Card>

      <Card>
        <CardTitle className="text-base">🍎 iPhone / iPad (Safari)</CardTitle>
        <CardSubtitle className="mt-1">
          Apple ne permet pas d&apos;installer directement — ça se fait en 4 étapes rapides, uniquement depuis Safari.
        </CardSubtitle>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-[var(--color-text)]">
          {IOS_STEPS.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </Card>

      <p className="text-center text-xs text-[var(--color-text-muted)]">
        Une fois installée, l&apos;app fonctionne exactement pareil — c&apos;est juste plus rapide à ouvrir et en plein
        écran.
      </p>
    </div>
  );
}
