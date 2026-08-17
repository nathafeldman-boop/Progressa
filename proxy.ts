import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renamed the `middleware` file convention to `proxy`.
const PUBLIC_PREFIXES = [
  "/onboarding",
  "/inscription",
  "/connexion",
  "/auth/callback",
  "/api/track",
  "/api/webhooks",
  "/api/cron",
  "/admin", // protégé par son propre secret, indépendant de Supabase
  "/api/admin",
  "/ressources",
  "/confidentialite",
  "/avis",
  "/r/",
  "/carte/", // carte joueur partagée publiquement (mais pas /carte tout court, privé)
];

function isPublicRoute(pathname: string): boolean {
  if (pathname === "/" || pathname === "/confidentialite" || pathname === "/avis") return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseConfigured) {
  console.warn(
    "[proxy] Supabase env vars are not set — authentication is DISABLED and all routes are being served unprotected. Set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY before going live."
  );
}

export async function proxy(request: NextRequest) {
  if (!supabaseConfigured) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  if (!user && !isPublicRoute(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/api/(.*)"],
};
