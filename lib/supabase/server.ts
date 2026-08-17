import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Client Supabase pour Server Components et Route Handlers. Retourne `null`
 * si les variables d'environnement ne sont pas configurées (même garde-fou
 * que proxy.ts) — les appelants doivent gérer ce cas sans planter, plutôt
 * que de laisser le SDK Supabase lever une exception non interceptée.
 */
export async function createClient() {
  // cookies() is called unconditionally, even when we're about to return
  // null below: it's what tells Next.js this render path is dynamic, so
  // pages using it never get statically prerendered at build time (when
  // env vars — and DATABASE_URL — aren't available anyway).
  const cookieStore = await cookies();
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appelé depuis un Server Component: le rafraîchissement de
          // session est déjà géré par le middleware (proxy.ts).
        }
      },
    },
  });
}
