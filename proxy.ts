import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { checkRateLimit } from "@/lib/rate-limit";
import { detectInAppBrowser } from "@/lib/in-app-browser";

const OPEN_IN_BROWSER_PATH = "/ouvrir-dans-navigateur";
// Jamais réécrit vers l'écran "ouvre ton navigateur", même depuis un
// navigateur intégré: appels programmatiques (fetch côté client) et le
// flux OAuth déjà en cours ne doivent jamais recevoir du HTML à la place.
const IN_APP_BROWSER_EXEMPT_PREFIXES = ["/api/", "/auth/callback", OPEN_IN_BROWSER_PATH];

// Next.js 16 renamed the `middleware` file convention to `proxy`.
const PUBLIC_PREFIXES = [
  "/onboarding",
  "/inscription",
  "/connexion",
  "/auth/callback",
  "/api/track",
  "/api/affiliate",
  "/api/auth/send-code",
  "/api/webhooks",
  "/api/cron",
  "/affiliation",
  "/admin", // protégé par son propre secret, indépendant de Supabase
  "/api/admin",
  "/ressources",
  "/confidentialite",
  "/avis",
  "/tarifs",
  "/contact",
  "/cgu",
  "/cgv",
  "/mentions-legales",
  "/r/",
  "/carte/", // carte joueur partagée publiquement (mais pas /carte tout court, privé)
  OPEN_IN_BROWSER_PATH,
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

function denyToLogin(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/connexion";
  url.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function tooManyRequests(): NextResponse {
  return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": "60" } });
}

// Stripe/cron ne passent jamais par ici avec un trafic utilisateur — pas de
// limite sur ces routes (elles ont leur propre vérification de signature/secret).
const RATE_LIMIT_EXEMPT_PREFIXES = ["/api/webhooks", "/api/cron"];
// Endpoints qui coûtent réellement de l'argent par appel (LLM) ou sont des
// cibles de spam évidentes: limite plus stricte que le reste de l'API.
const STRICT_RATE_LIMIT_PREFIXES = ["/api/coach", "/api/track", "/api/auth"];

function rateLimitFor(pathname: string): { limit: number; windowMs: number } | null {
  if (!pathname.startsWith("/api/")) return null;
  if (RATE_LIMIT_EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))) return null;
  if (STRICT_RATE_LIMIT_PREFIXES.some((p) => pathname.startsWith(p))) return { limit: 20, windowMs: 60_000 };
  return { limit: 120, windowMs: 60_000 };
}

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // TikTok/Instagram/Facebook... webviews cassent souvent Google Sign-In et
  // parfois le paiement Stripe — un joueur venu d'un lien affilié ou d'un
  // post ne doit jamais découvrir ça au milieu du funnel. On sert l'écran
  // "ouvre ton navigateur" à la place de N'IMPORTE QUELLE page (LP, lien
  // d'affilié avec ?aff=..., etc.) sans changer l'URL affichée, pour que
  // tout continue normalement une fois ouvert dans un vrai navigateur.
  if (!IN_APP_BROWSER_EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))) {
    const { detected } = detectInAppBrowser(request.headers.get("user-agent"));
    if (detected) {
      const url = request.nextUrl.clone();
      url.pathname = OPEN_IN_BROWSER_PATH;
      return NextResponse.rewrite(url);
    }
  }

  const isPublic = isPublicRoute(pathname);

  const rule = rateLimitFor(request.nextUrl.pathname);
  if (rule) {
    const key = `${clientIp(request)}:${request.nextUrl.pathname}`;
    if (!checkRateLimit(key, rule.limit, rule.windowMs)) return tooManyRequests();
  }

  // Fail CLOSED, not open: public routes (marketing, webhooks, cron) stay
  // reachable no matter what, but a misconfigured or unreachable auth
  // backend must never turn a protected route public — it must deny access.
  if (!supabaseConfigured) {
    return isPublic ? NextResponse.next() : denyToLogin(request);
  }

  try {
    const { response, user } = await updateSession(request);
    if (!user && !isPublic) return denyToLogin(request);
    return response;
  } catch (err) {
    console.error("[proxy] Supabase session refresh failed — denying access to protected routes", err);
    return isPublic ? NextResponse.next() : denyToLogin(request);
  }
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/api/(.*)"],
};
