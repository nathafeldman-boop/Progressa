/** Isolé dans un utilitaire non-composant pour rester conforme à la règle
 * react-hooks/purity (pas d'appel direct à Date.now() dans le rendu). */
export function isInFuture(date: Date | null | undefined): boolean {
  return !!date && date.getTime() > Date.now();
}
