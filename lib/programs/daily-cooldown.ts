const RESET_HOUR = 8;

/**
 * Régénération manuelle limitée à 1 fois par jour, débloquée à 8h — pas une
 * fenêtre glissante. Si la dernière régénération a eu lieu avant 8h
 * aujourd'hui, une nouvelle est déjà possible ; sinon il faut attendre 8h
 * demain.
 */
export function nextAllowedRegenAt(lastRegenAt: Date): Date {
  const boundary = new Date(lastRegenAt);
  boundary.setHours(RESET_HOUR, 0, 0, 0);
  if (lastRegenAt.getTime() >= boundary.getTime()) {
    boundary.setDate(boundary.getDate() + 1);
  }
  return boundary;
}

export function isDailyRegenAvailable(lastRegenAt: Date | null, now: Date = new Date()): boolean {
  if (!lastRegenAt) return true;
  return now.getTime() >= nextAllowedRegenAt(lastRegenAt).getTime();
}
