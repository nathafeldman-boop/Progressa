/** Isolé dans un utilitaire non-composant pour rester conforme à la règle
 * react-hooks/purity (pas d'appel direct à Date.now() dans le rendu). */
export function isInFuture(date: Date | null | undefined): boolean {
  return !!date && date.getTime() > Date.now();
}

export function elapsedSeconds(startedAt: number | null): number | null {
  return startedAt == null ? null : Math.round((Date.now() - startedAt) / 1000);
}

export function nowMs(): number {
  return Date.now();
}
