import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Next.js 16 renamed the `middleware` file convention to `proxy`. Clerk's
// handler is still a standard Next middleware function under the hood, so
// it's simply re-exported here as `proxy`.
const isPublicRoute = createRouteMatcher([
  "/",
  "/onboarding(.*)",
  "/inscription(.*)",
  "/connexion(.*)",
  "/api/track",
  "/api/webhooks(.*)",
  "/api/cron(.*)",
  "/admin(.*)", // protégé par son propre secret, indépendant de Clerk
  "/api/admin(.*)",
  "/ressources(.*)",
  "/confidentialite",
  "/avis",
  "/r/(.*)",
  "/carte/(.*)", // carte joueur partagée publiquement
]);

// clerkMiddleware() throws synchronously if NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
// is unset, which would otherwise take down EVERY route (including public
// ones) the moment this file is loaded — a single missing env var
// shouldn't 500 the whole site before Clerk is even configured. Fail open
// instead: skip auth enforcement and log loudly, so the app stays
// browsable while secrets are being set up.
const clerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkConfigured) {
  console.warn(
    "[proxy] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set — authentication is DISABLED and all routes are being served unprotected. Set Clerk env vars before going live."
  );
}

export const proxy = clerkConfigured
  ? clerkMiddleware(async (auth, req) => {
      if (!isPublicRoute(req)) {
        await auth.protect();
      }
    })
  : () => NextResponse.next();

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/api/(.*)"],
};
