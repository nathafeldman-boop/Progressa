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
  "/tarifs",
  "/contact",
  "/cgu",
  "/mentions-legales",
  "/r/",
  "/carte/", // carte joueur partagée publiquement (mais pas /carte tout court, privé)
];

function isPublicRoute(pathname: string): boolean {
  if (pathname === "/" || pathname === "/confidentialite" || pathname === "/avis") return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isValidHttpUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const supabaseConfigured = isValidHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseConfigured) {
  console.warn(
    "[proxy] Supabase env vars are missing or malformed — authentication is DISABLED and all routes are being served unprotected. Set a valid NEXT_PUBLIC_SUPABASE_URL (e.g. https://xxxx.supabase.co) / NEXT_PUBLIC_SUPABASE_ANON_KEY before going live."
  );
}

export async function proxy(request: NextRequest) {
  if (!supabaseConfigured) {
    return NextResponse.next();
  }

  // Belt and suspenders: even with a well-formed URL, the Supabase SDK can
  // still throw for other misconfiguration (bad key, network issue). This
  // middleware runs on nearly every request, so it must never crash the
  // whole site over an auth check — fail open instead.
  try {
    const { response, user } = await updateSession(request);

    if (!user && !isPublicRoute(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/connexion";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    return response;
  } catch (err) {
    console.error("[proxy] Supabase session refresh failed — serving unprotected", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/api/(.*)"],
};
