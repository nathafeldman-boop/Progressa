"use client";

/**
 * Le navigateur ne déclenche "beforeinstallprompt" qu'UNE fois par
 * chargement de page — et Progressa est une SPA (navigation Next.js sans
 * rechargement). Si chaque composant (bandeau d'accueil, page réglages)
 * écoute l'événement séparément avec son propre useState, celui qui n'est
 * pas monté au moment où l'événement arrive ne le voit jamais: c'est
 * exactement pourquoi la page "Installer l'app" retombait sur les
 * instructions manuelles au lieu du vrai bouton, même sur un navigateur
 * qui supporte l'installation en un clic. Un seul listener, au niveau du
 * module (capturé dès le premier import, avant même le montage de tout
 * composant React), partagé par tous les consommateurs.
 */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let capturedEvent: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    capturedEvent = e as BeforeInstallPromptEvent;
    notify();
  });
}

export function getInstallPromptSnapshot(): BeforeInstallPromptEvent | null {
  return capturedEvent;
}

export function subscribeInstallPrompt(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/** Déclenche le vrai prompt natif d'installation — retourne le choix de l'utilisateur, ou null si aucun prompt n'est disponible (déjà installée, navigateur non compatible, ou pas encore capté). */
export async function triggerInstallPrompt(): Promise<"accepted" | "dismissed" | null> {
  if (!capturedEvent) return null;
  await capturedEvent.prompt();
  const { outcome } = await capturedEvent.userChoice;
  // Un event "beforeinstallprompt" ne peut être utilisé qu'une fois.
  capturedEvent = null;
  notify();
  return outcome;
}
