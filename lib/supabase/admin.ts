import { createClient } from "@supabase/supabase-js";

/**
 * Client avec la clé de service (secrète): utilisé uniquement côté serveur
 * pour des opérations d'administration (ex: suppression de compte RGPD).
 * Ne jamais exposer cette clé au client.
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
