import { Mistral } from "@mistralai/mistralai";

let cached: Mistral | null = null;

/**
 * Retourne le client Mistral, ou null si MISTRAL_API_KEY n'est pas
 * configurée (ex: environnement de dev sans clé). Les appelants doivent
 * gérer le cas null par un repli, jamais planter dessus.
 */
export function getMistralClient(): Mistral | null {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return null;
  if (!cached) cached = new Mistral({ apiKey });
  return cached;
}
