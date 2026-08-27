"use client";

import { useSyncExternalStore } from "react";
import { getInstallPromptSnapshot, subscribeInstallPrompt } from "./install-prompt";

function getServerSnapshot() {
  return false;
}

/** true dès qu'un prompt natif d'installation est disponible — partagé entre tous les composants (voir install-prompt.ts). */
export function useInstallPromptAvailable(): boolean {
  return useSyncExternalStore(subscribeInstallPrompt, () => getInstallPromptSnapshot() !== null, getServerSnapshot);
}
