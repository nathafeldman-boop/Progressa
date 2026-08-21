/**
 * Rate limiting en mémoire, par instance serveur — pas de dépendance
 * externe (Redis/Upstash) à provisionner pour une première ligne de
 * défense. Fenêtre fixe, clé libre (IP, IP+route, userId...). Suffisant
 * pour éviter le spam grossier et les abus de coût (appels LLM) ; pas
 * une garantie exacte en cas de scaling horizontal multi-instance.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Purge occasionnelle des entrées expirées pour ne pas laisser grossir la
// Map indéfiniment avec des IP jamais revues.
let requestsSinceSweep = 0;
function sweepExpired(now: number) {
  requestsSinceSweep += 1;
  if (requestsSinceSweep < 500) return;
  requestsSinceSweep = 0;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Retourne true si la requête est autorisée, false si la limite est
 * dépassée pour cette clé sur la fenêtre en cours.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweepExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
